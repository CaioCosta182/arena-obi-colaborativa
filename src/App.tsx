import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import BlocklyWorkspace from './components/BlocklyWorkspace';
import { obiQuestions, type NivelOBI, type QuestaoOBI } from './data/obiQuestions';

type Tela = 'login' | 'lobby' | 'arena' | 'podio';

export default function App() {
  const [telaAtual, setTelaAtual] = useState<Tela>('login');
  const [pilotos, setPilotos] = useState({ p1: '', p2: '' });
  const [questoesSessao, setQuestoesSessao] = useState<QuestaoOBI[]>([]);
  const [indiceAtual, setIndiceAtual] = useState<number>(0);
  
  // Acumulador de métricas da dupla
  const [metricasGlobais, setMetricasGlobais] = useState({ erros: 0, tempoTotal: 0 });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pilotos.p1.trim() && pilotos.p2.trim()) {
      setTelaAtual('lobby');
    } else {
      alert("Por favor, preencham o nome dos dois Pilotos!");
    }
  };

  const iniciarMaratona = (nivelEscolhido: NivelOBI) => {
    const questoesDoNivel = obiQuestions.filter(q => q.nivel === nivelEscolhido);
    if (questoesDoNivel.length === 0) return alert("Nenhuma questão neste nível!");

    const embaralhadas = [...questoesDoNivel].sort(() => Math.random() - 0.5);
    setQuestoesSessao(embaralhadas);
    setIndiceAtual(0);
    setMetricasGlobais({ erros: 0, tempoTotal: 0 });
    setTelaAtual('arena');
  };

  const avancarQuestao = (errosNaQuestao: number, tempoNaQuestao: number) => {
    setMetricasGlobais(prev => ({
      erros: prev.erros + errosNaQuestao,
      tempoTotal: prev.tempoTotal + tempoNaQuestao
    }));

    if (indiceAtual + 1 < questoesSessao.length) {
      setIndiceAtual(prev => prev + 1);
    } else {
      setTelaAtual('podio'); // Nível concluído!
    }
  };

  const resetarSessao = () => {
    setPilotos({ p1: '', p2: '' });
    setTelaAtual('login');
  };

  const formatarTempo = (segundos: number) => {
    const m = Math.floor(segundos / 60);
    const s = segundos % 60;
    return `${m}m ${s}s`;
  };

  // --- TELA 1: LOGIN ---
  if (telaAtual === 'login') {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 p-4">
        <form onSubmit={handleLogin} className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-extrabold text-blue-600">Arena OBI</h1>
            <p className="text-slate-500">Identificação da Dupla</p>
          </div>
          <div className="mb-4">
            <label className="mb-1 block text-sm font-bold text-slate-700">Piloto 1</label>
            <input type="text" value={pilotos.p1} onChange={e => setPilotos({...pilotos, p1: e.target.value})} className="w-full rounded-lg border-2 border-slate-200 p-3 focus:border-blue-500 focus:outline-none" placeholder="Nome do primeiro aluno" />
          </div>
          <div className="mb-8">
            <label className="mb-1 block text-sm font-bold text-slate-700">Piloto 2</label>
            <input type="text" value={pilotos.p2} onChange={e => setPilotos({...pilotos, p2: e.target.value})} className="w-full rounded-lg border-2 border-slate-200 p-3 focus:border-blue-500 focus:outline-none" placeholder="Nome do segundo aluno" />
          </div>
          <button type="submit" className="w-full cursor-pointer rounded-xl bg-blue-600 py-4 font-bold text-white transition-transform hover:scale-105 active:scale-95">
            Entrar no Laboratório 🚀
          </button>
        </form>
      </div>
    );
  }

  // --- TELA 2: LOBBY DE NÍVEIS ---
  if (telaAtual === 'lobby') {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-slate-50 p-4">
        <header className="mb-10 text-center">
          <h1 className="mb-2 text-4xl font-extrabold text-blue-600">Escolham o Nível</h1>
          <p className="text-lg text-slate-600">Olá, <span className="font-bold text-indigo-600">{pilotos.p1}</span> e <span className="font-bold text-indigo-600">{pilotos.p2}</span>!</p>
        </header>
        <main className="grid w-full max-w-4xl grid-cols-1 gap-6 md:grid-cols-3">
          <button onClick={() => iniciarMaratona('Iniciação Nível 1')} className="bg-green-500 hover:-translate-y-2 flex cursor-pointer flex-col items-center rounded-2xl p-8 text-center text-white shadow-lg transition-transform">
            <h2 className="mb-2 text-2xl font-bold">Iniciação Nível 1</h2>
            <p className="text-sm text-white/80">1º ao 3º ano</p>
          </button>
          <button onClick={() => iniciarMaratona('Iniciação Nível 2')} className="bg-blue-500 hover:-translate-y-2 flex cursor-pointer flex-col items-center rounded-2xl p-8 text-center text-white shadow-lg transition-transform">
            <h2 className="mb-2 text-2xl font-bold">Iniciação Nível 2</h2>
            <p className="text-sm text-white/80">4º ao 5º ano</p>
          </button>
          <button onClick={() => iniciarMaratona('Programação Júnior')} className="bg-purple-500 hover:-translate-y-2 flex cursor-pointer flex-col items-center rounded-2xl p-8 text-center text-white shadow-lg transition-transform">
            <h2 className="mb-2 text-2xl font-bold">Programação Júnior</h2>
            <p className="text-sm text-white/80">6º ao 9º ano</p>
          </button>
        </main>
      </div>
    );
  }

  // --- TELA 3: ARENA (BLOCKLY) ---
  if (telaAtual === 'arena') {
    return (
      <div className="h-screen w-screen bg-slate-50 p-4">
        <main className="mx-auto flex h-full w-full max-w-6xl flex-col overflow-hidden rounded-xl border-4 border-slate-200 bg-white shadow-lg">
          <BlocklyWorkspace 
            questao={questoesSessao[indiceAtual]} 
            onVoltar={() => setTelaAtual('lobby')} 
            onProxima={avancarQuestao}
            progresso={`${indiceAtual + 1}/${questoesSessao.length}`}
          />
        </main>
      </div>
    );
  }

  // --- TELA 4: PÓDIO E QR CODE ---
  if (telaAtual === 'podio') {
    // Monta os dados que o Professor vai ler com o telemóvel
    const dadosQR = JSON.stringify({
      nivel: questoesSessao[0].nivel,
      p1: pilotos.p1,
      p2: pilotos.p2,
      acertos: questoesSessao.length,
      erros: metricasGlobais.erros,
      tempo_seg: metricasGlobais.tempoTotal
    });

    return (
      <div className="flex h-screen items-center justify-center bg-slate-800 p-4">
        <div className="flex w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl">
          {/* Painel do QR Code */}
          <div className="flex flex-col items-center justify-center bg-blue-50 p-10 w-1/2">
            <h3 className="mb-6 text-xl font-bold text-blue-900 text-center">Mostrem isto ao Professor! 📱</h3>
            <div className="rounded-xl border-4 border-white shadow-md bg-white p-2">
              <QRCodeSVG value={dadosQR} size={200} level="M" />
            </div>
            <p className="mt-4 text-sm text-slate-500 text-center">Código de recolha offline</p>
          </div>
          
          {/* Painel de Estatísticas */}
          <div className="p-10 w-1/2 flex flex-col justify-center">
            <h1 className="text-4xl font-extrabold text-slate-800 mb-2">🏆 Parabéns!</h1>
            <p className="text-lg text-slate-600 mb-8"><span className="font-bold">{pilotos.p1}</span> e <span className="font-bold">{pilotos.p2}</span> finalizaram a maratona.</p>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Questões Resolvidas:</span>
                <span className="font-bold text-slate-800">{questoesSessao.length}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Erros de Submissão:</span>
                <span className="font-bold text-red-500">{metricasGlobais.erros}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Tempo Total:</span>
                <span className="font-bold text-slate-800">{formatarTempo(metricasGlobais.tempoTotal)}</span>
              </div>
            </div>

            <button onClick={resetarSessao} className="w-full rounded-xl bg-slate-800 py-4 font-bold text-white transition-transform hover:bg-slate-900 active:scale-95">
              Nova Sessão
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
