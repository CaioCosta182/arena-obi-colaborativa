import { useState } from 'react';
import BlocklyWorkspace from './components/BlocklyWorkspace';
import { obiQuestions, type NivelOBI, type QuestaoOBI } from './data/obiQuestions';

export default function App() {
  const [questoesSessao, setQuestoesSessao] = useState<QuestaoOBI[]>([]);
  const [indiceAtual, setIndiceAtual] = useState<number>(0);

  const iniciarMaratona = (nivelEscolhido: NivelOBI) => {
    const questoesDoNivel = obiQuestions.filter(q => q.nivel === nivelEscolhido);
    
    if (questoesDoNivel.length === 0) {
      alert("Ainda não há questões cadastradas para este nível!");
      return;
    }

    // O espalhamento [...] garante que o React veja como uma lista nova
    const embaralhadas = [...questoesDoNivel].sort(() => Math.random() - 0.5);
    setQuestoesSessao(embaralhadas);
    setIndiceAtual(0);
  };

  const avancarQuestao = () => {
    // Usamos a referência de estado mais segura do React
    if (indiceAtual + 1 < questoesSessao.length) {
      setIndiceAtual(prevIndice => prevIndice + 1);
    } else {
      alert("🏆 PARABÉNS! Vocês zeraram todas as questões deste nível!");
      setQuestoesSessao([]); // Fim de jogo, volta pro Lobby
      setIndiceAtual(0);
    }
  };

  if (questoesSessao.length > 0) {
    return (
      <div className="h-screen w-screen bg-slate-50 p-4">
        <main className="mx-auto flex h-full w-full max-w-6xl flex-col overflow-hidden rounded-xl border-4 border-slate-200 bg-white shadow-lg">
          <BlocklyWorkspace 
            questao={questoesSessao[indiceAtual]} 
            onVoltar={() => setQuestoesSessao([])} 
            onProxima={avancarQuestao}
            progresso={`${indiceAtual + 1}/${questoesSessao.length}`}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-slate-50 p-4">
      <header className="mb-10 text-center">
        <h1 className="mb-4 text-5xl font-extrabold text-blue-600 drop-shadow-sm">Arena OBI Colaborativa</h1>
        <p className="max-w-2xl text-xl text-slate-600">
          Selecione o nível da maratona. O sistema sorteará um desafio oficial para a dupla resolver em par.
        </p>
      </header>
      
      <main className="grid w-full max-w-4xl grid-cols-1 gap-6 md:grid-cols-3">
        <NivelCard titulo="Iniciação Nível 1" desc="1º ao 3º ano do Ensino Fundamental" cor="bg-green-500 hover:bg-green-600" onClick={() => iniciarMaratona('Iniciação Nível 1')} />
        <NivelCard titulo="Iniciação Nível 2" desc="4º ao 5º ano do Ensino Fundamental" cor="bg-blue-500 hover:bg-blue-600" onClick={() => iniciarMaratona('Iniciação Nível 2')} />
        <NivelCard titulo="Programação Júnior" desc="6º ao 9º ano do Ensino Fundamental" cor="bg-purple-500 hover:bg-purple-600" onClick={() => iniciarMaratona('Programação Júnior')} />
      </main>
    </div>
  );
}

function NivelCard({ titulo, desc, cor, onClick }: { titulo: string, desc: string, cor: string, onClick: () => void }) {
  return (
    <button onClick={onClick} className={`${cor} flex cursor-pointer flex-col items-center rounded-2xl p-8 text-center text-white shadow-lg transition-transform hover:-translate-y-2`}>
      <h2 className="mb-2 text-2xl font-bold">{titulo}</h2>
      <p className="text-sm text-white/80">{desc}</p>
    </button>
  );
}
