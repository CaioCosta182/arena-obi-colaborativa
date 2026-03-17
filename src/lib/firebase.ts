import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, Timestamp } from 'firebase/firestore';

// A sua configuração do Firebase (substitua com as suas chaves reais mais tarde)
const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_PROJETO.firebaseapp.com",
  projectId: "SEU_PROJETO",
  storageBucket: "SEU_PROJETO.appspot.com",
  messagingSenderId: "SEU_SENDER_ID",
  appId: "SEU_APP_ID"
};

// Inicializa a aplicação Firebase
const app = initializeApp(firebaseConfig);

// Inicializa e exporta o serviço de Base de Dados (Firestore)
export const db = getFirestore(app);

// Tipagem exata baseada no JSON gerado pelo seu QR Code
export interface ResultadoEquipa {
  id?: string; // ID gerado pelo Firebase
  p1: string;
  p2: string;
  lvl: string;
  t_seg: number;
  err: number;
  err_p: [number, number];
  test: number;
  sw_t: number;
  blk: number;
  q: Array<{
    id: string;
    err: number;
    t: number;
    test: number;
    sw_t: number;
    blk: number;
  }>;
  timestamp?: any; // Para registarmos o momento exato da leitura do QR Code
}

// FUNÇÃO 1: Usada pelo Scanner do Professor para enviar o QR Code para a nuvem
export const salvarResultadoEquipa = async (dados: ResultadoEquipa) => {
  try {
    const docRef = await addDoc(collection(db, 'resultados_maratona'), {
      ...dados,
      timestamp: Timestamp.now()
    });
    console.log("Sucesso! Resultado guardado com o ID: ", docRef.id);
    return true;
  } catch (erro) {
    console.error("Erro ao guardar o resultado: ", erro);
    return false;
  }
};

// FUNÇÃO 2: Usada pelo Auditório para atualizar o Placar automaticamente
export const escutarRankingTempoReal = (callback: (resultados: ResultadoEquipa[]) => void) => {
  // A magia da OBI: Ordena primeiro por MENOS ERROS, e em caso de empate, MENOS TEMPO.
  const q = query(collection(db, 'resultados_maratona'), orderBy('err', 'asc'), orderBy('t_seg', 'asc'));
  
  // O 'onSnapshot' é o que faz os dados atualizarem sozinhos no ecrã sem precisar de fazer F5
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const resultados: ResultadoEquipa[] = [];
    querySnapshot.forEach((doc) => {
      resultados.push({ id: doc.id, ...doc.data() } as ResultadoEquipa);
    });
    callback(resultados);
  });

  // Retornamos a função para podermos "desligar" a escuta quando mudarmos de ecrã
  return unsubscribe;
};
