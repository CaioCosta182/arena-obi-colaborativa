import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import BlocklyWorkspace from './components/BlocklyWorkspace';
import AdminPanel from './components/AdminPanel';
import { obiQuestions, type NivelOBI, type QuestaoOBI } from './data/obiQuestions';

type Tela = 'home' | 'adminLogin' | 'login' | 'lobby' | 'arena' | 'podio' | 'admin';

export default function App() {
  const [telaAtual, setTelaAtual] = useState<Tela>('home');
  
  const [bancoQuestoes, setBancoQuestoes] = useState<QuestaoOBI[]>(() => {
    const salvas = localStorage.getItem('arena_obi_db');
    return salvas ? JSON.parse(salvas) : obiQuestions;
  });

  useEffect(() => {
    localStorage.setItem('arena_obi_db', JSON.stringify(bancoQuestoes));
  }, [bancoQuestoes]);

  const [adminCreds, setAdminCreds] = useState({ user: '', pass: '' });
  const [pilotos, setPilotos] = useState({ p1: '', p2: '' });
  const [questoesSessao, setQuestoesSessao] = useState<QuestaoOBI[]>([]);
  const [indiceAtual, setIndiceAtual] = useState<number>(0);
  const [metricasGlobais, setMetricasGlobais] = useState({ erros: 0, tempoTotal: 0 });

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminCreds.user === 'admin' && adminCreds.pass === 'IFMG2026') {
      setTelaAtual('admin');
      setAdminCreds({ user: '', pass: '' }); 
    } else {
      alert("❌ Credenciais incorretas! Acesso negado.");
    }
  };

  const handleLoginPilotos = (e: React.FormEvent) => {
    e.preventDefault();
    // AQUI ESTAVA O ERRO! Corrigido de "pilots.p2" para "pilotos.p2"
    if (pilotos.p1.trim() && pilotos.p2.trim()) {
      setTelaAtual('lobby');
    } else {
      alert("Por favor, preencham o nome dos dois Pilotos!");
    }
  };

  const iniciarMaratona = (nivelEscolhido: NivelOBI) => {
    const questoesDoNivel = bancoQuestoes.filter(q => q.nivel === nivelEscolhido);
    if (questoesDoNivel.length === 0) return alert("Nenhuma questão cadastrada para este nível!");

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
      setTelaAtual('podio'); 
    }
  };

  const formatarTempo = (segundos: number) => {
    const m = Math.floor(segundos / 60);
    const s = segundos % 60;
    return `${m}m ${s}s`;
  };

  if (telaAtual === 'home') {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-slate-50 p-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold text-blue-600 mb-4 drop-shadow-sm">Arena OBI Colaborativa</h1>
          <p className="text-xl text-slate-500 max-w-xl mx-auto">Plataforma de Pair Programming gamificada para preparação de competições.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
          <button onClick={() => setTelaAtual('login')} className="flex flex-col items-center p-12 bg-blue-600 text-white rounded-3xl shadow-xl transition-transform hover:-translate-y-2 hover:shadow-2xl cursor-pointer">
            <span className="text-6xl mb-4">🎮</span>
            <h2 className="text-3xl font-bold mb-2">Entrar na Arena</h2>
            <p className="text-blue-100 text-center">Espaço para os alunos e competidores</p>
          </button>

          <button onClick={() => setTelaAtual('adminLogin')} className="flex flex-col items-center p-12 bg-slate-800 text-white rounded-3xl shadow-xl transition-transform hover:-translate-y-2 hover:shadow-2xl cursor-pointer">
            <span className="text-6xl mb-4">👨‍🏫</span>
            <h2 className="text-3xl font-bold mb-2">Área do Professor</h2>
            <p className="text-slate-300 text-center">Gestão de questões e sincronização</p>
          </button>
        </div>
      </div>
    );
  }

  if (telaAtual === 'adminLogin') {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-800 p-4">
        <form onSubmit={handleAdminLogin} className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
          <div className="mb-6 text-center">
            <span className="text-4xl block mb-2">🔒</span>
            <h1 className="text-2xl font-extrabold text-slate-800">Acesso Restrito</h1>
          </div>
          <div className="mb-4">
            <label className="mb-1 block text-sm font-bold text-slate-700">Usuário</label>
            <input type="text" value={adminCreds.user} onChange={e => setAdminCreds({...adminCreds, user: e.target.value})} className="w-full rounded-lg border-2 border-slate-200 p-3 focus:border-indigo-500 focus:outline-none" placeholder="ex: admin" autoFocus />
          </div>
          <div className="mb-8">
            <label className="mb-1 block text-sm font-bold text-slate-700">Senha</label>
            <input type="password" value={adminCreds.pass} onChange={e => setAdminCreds({...adminCreds, pass: e.target.value})} className="w-full rounded-lg border-2 border-slate-200 p-3 focus:border-indigo-500 focus:outline-none" placeholder="••••••••" />
          </div>
          <button type="submit" className="w-full mb-3 cursor-pointer rounded-xl bg-indigo-600 py-4 font-bold text-white transition-transform hover:bg-indigo-700 active:scale-95">
            Autenticar
          </button>
          <button type="button" onClick={() => setTelaAtual('home')} className="w-full py-3 font-bold text-slate-500 hover:text-slate-800">
            Voltar para o Início
          </button>
        </form>
      </div>
    );
  }

  if (telaAtual === 'admin') {
    return (
      <AdminPanel 
        bancoAtual={bancoQuestoes} 
        onAtualizarBanco={(novoBanco) => setBancoQuestoes(novoBanco)}
        onSair={() => setTelaAtual('home')}
      />
    );
  }

  if (telaAtual === 'login') {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 p-4">
        <form onSubmit={handleLoginPilotos} className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
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
          <button type="submit" className="w-full mb-3 cursor-pointer rounded-xl bg-blue-600 py-4 font-bold text-white transition-transform hover:scale-105 active:scale-95">
            Entrar no Laboratório 🚀
          </button>
          <button type="button" onClick={() => setTelaAtual('home')} className="w-full py-3 font-bold text-slate-500 hover:text-slate-800">
            Voltar
          </button>
        </form>
      </div>
    );
  }

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
          </button>
          <button onClick={() => iniciarMaratona('Iniciação Nível 2')} className="bg-blue-500 hover:-translate-y-2 flex cursor-pointer flex-col items-center rounded-2xl p-8 text-center text-white shadow-lg transition-transform">
            <h2 className="mb-2 text-2xl font-bold">Iniciação Nível 2</h2>
          </button>
          <button onClick={() => iniciarMaratona('Programação Júnior')} className="bg-purple-500 hover:-translate-y-2 flex cursor-pointer flex-col items-center rounded-2xl p-8 text-center text-white shadow-lg transition-transform">
            <h2 className="mb-2 text-2xl font-bold">Programação Júnior</h2>
          </button>
        </main>
      </div>
    );
  }

  if (telaAtual === 'arena') {
    return (
      <div className="h-screen w-screen bg-slate-50 p-4">
        <main className="mx-auto flex h-full w-full max-w-6xl flex-col overflow-hidden rounded-xl border-4 border-slate-200 bg-white shadow-lg">
          <BlocklyWorkspace 
            questao={questoesSessao[indiceAtual]} 
            onVoltar={() => setTelaAtual('lobby')} 
            onProxima={avancarQuestao}
            progresso={`${indiceAtual + 1}/${questoesSessao.length}`}
            baloes={indiceAtual} 
          />
        </main>
      </div>
    );
  }

  if (telaAtual === 'podio') {
    const dadosQR = JSON.stringify({ p1: pilotos.p1, p2: pilotos.p2, acertos: questoesSessao.length, erros: metricasGlobais.erros, t: metricasGlobais.tempoTotal });
    return (
      <div className="flex h-screen items-center justify-center bg-slate-800 p-4">
        <div className="flex w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl">
          <div className="flex flex-col items-center justify-center bg-blue-50 p-10 w-1/2">
            <h3 className="mb-6 text-xl font-bold text-blue-900 text-center">Mostrem isto ao Professor! 📱</h3>
            <div className="rounded-xl border-4 border-white shadow-md bg-white p-2">
              <QRCodeSVG value={dadosQR} size={200} level="M" />
            </div>
          </div>
          <div className="p-10 w-1/2 flex flex-col justify-center">
            <h1 className="text-4xl font-extrabold text-slate-800 mb-2">🏆 Parabéns!</h1>
            <p className="text-lg text-slate-600 mb-8"><span className="font-bold">{pilotos.p1}</span> e <span className="font-bold">{pilotos.p2}</span> finalizaram!</p>
            <div className="space-y-4 mb-8">
              <div className="flex justify-between border-b pb-2"><span className="text-slate-500">Erros de Submissão:</span><span className="font-bold text-red-500">{metricasGlobais.erros}</span></div>
              <div className="flex justify-between border-b pb-2"><span className="text-slate-500">Tempo Total:</span><span className="font-bold text-slate-800">{formatarTempo(metricasGlobais.tempoTotal)}</span></div>
            </div>
            <button onClick={() => { setPilotos({ p1: '', p2: '' }); setTelaAtual('home'); }} className="w-full rounded-xl bg-slate-800 py-4 font-bold text-white transition-transform hover:bg-slate-900 active:scale-95">Nova Sessão</button>
          </div>
        </div>
      </div>
    );
  }
  return null;
}
