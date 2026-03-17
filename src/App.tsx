import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import BlocklyWorkspace, { type MetricasQuestao, type Equipamento } from './components/BlocklyWorkspace';
import AdminPanel from './components/AdminPanel';
import Leaderboard from './components/Leaderboard';
import { obiQuestions, type NivelOBI, type QuestaoOBI } from './data/obiQuestions';

type Tela = 'home' | 'adminLogin' | 'login' | 'lobby' | 'arena' | 'podio' | 'admin' | 'auditorio';

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
  
  const [metricasGlobais, setMetricasGlobais] = useState({ 
    errosP1Totais: 0, errosP2Totais: 0, tempoTotal: 0, testesTotais: 0, trocasTempoTotais: 0, blocosTotais: 0, granular: [] as any[] 
  });

  const [inventario, setInventario] = useState<Equipamento[]>([]);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminCreds.user === 'admin' && adminCreds.pass === 'IFMG2026') {
      setTelaAtual('admin');
      setAdminCreds({ user: '', pass: '' }); 
    } else { alert("❌ Credenciais incorretas!"); }
  };

  const handleLoginPilotos = (e: React.FormEvent) => {
    e.preventDefault();
    if (pilotos.p1.trim() && pilotos.p2.trim()) setTelaAtual('lobby');
    else alert("Por favor, preencham o nome dos dois Pilotos!");
  };

  const iniciarMaratona = (nivelEscolhido: NivelOBI) => {
    const questoesDoNivel = bancoQuestoes.filter(q => q.nivel === nivelEscolhido);
    if (questoesDoNivel.length === 0) return alert("Nenhuma questão cadastrada!");

    const embaralhadas = [...questoesDoNivel].sort(() => Math.random() - 0.5);
    setQuestoesSessao(embaralhadas);
    setIndiceAtual(0);
    setMetricasGlobais({ errosP1Totais: 0, errosP2Totais: 0, tempoTotal: 0, testesTotais: 0, trocasTempoTotais: 0, blocosTotais: 0, granular: [] });
    setInventario([]); 
    setTelaAtual('arena');
  };

  const gerarEquipamento = (erros: number, index: number): Equipamento => {
    const tipo = index % 5; 
    let tier: 'L' | 'E' | 'R' | 'U' | 'C' = 'C';
    let emoji = '';
    let nome = '';

    if (erros === 0) tier = 'L';
    else if (erros === 1) tier = 'E';
    else if (erros === 2) tier = 'R';
    else if (erros === 3) tier = 'U';
    else tier = 'C';

    if (tipo === 0) { 
      if (tier === 'L') { emoji = '🗡️'; nome = 'Espada Flamejante'; }
      if (tier === 'E') { emoji = '⚔️'; nome = 'Espada de Aço Real'; }
      if (tier === 'R') { emoji = '🔪'; nome = 'Adaga de Bronze'; }
      if (tier === 'U') { emoji = '🪓'; nome = 'Machado Lascado'; }
      if (tier === 'C') { emoji = '🪵'; nome = 'Pedaço de Pau'; }
    } else if (tipo === 1) { 
      if (tier === 'L') { emoji = '🐉'; nome = 'Armadura Dracônica'; }
      if (tier === 'E') { emoji = '🥋'; nome = 'Quimono do Mestre'; }
      if (tier === 'R') { emoji = '🧥'; nome = 'Casaco de Couro'; }
      if (tier === 'U') { emoji = '👕'; nome = 'Camiseta Gasta'; }
      if (tier === 'C') { emoji = '🎽'; nome = 'Farrapos'; }
    } else if (tipo === 2) { 
      if (tier === 'L') { emoji = '🪽'; nome = 'Botas de Hermes'; }
      if (tier === 'E') { emoji = '🥾'; nome = 'Botas de Combate'; }
      if (tier === 'R') { emoji = '👞'; nome = 'Sapatos Resistentes'; }
      if (tier === 'U') { emoji = '👟'; nome = 'Tênis Furado'; }
      if (tier === 'C') { emoji = '🧦'; nome = 'Meias Sujas'; }
    } else if (tipo === 3) { 
      if (tier === 'L') { emoji = '👑'; nome = 'Coroa da Sabedoria'; }
      if (tier === 'E') { emoji = '🪖'; nome = 'Elmo de Batalha'; }
      if (tier === 'R') { emoji = '🤠'; nome = 'Chapéu de Aventureiro'; }
      if (tier === 'U') { emoji = '🧢'; nome = 'Boné Desbotado'; }
      if (tier === 'C') { emoji = '👒'; nome = 'Chapéu de Palha Velho'; }
    } else { 
      if (tier === 'L') { emoji = '💠'; nome = 'Égide de Luz'; }
      if (tier === 'E') { emoji = '🛡️'; nome = 'Escudo Templário'; }
      if (tier === 'R') { emoji = '🚪'; nome = 'Porta de Madeira'; }
      if (tier === 'U') { emoji = '🥘'; nome = 'Tampa de Panela'; }
      if (tier === 'C') { emoji = '🗞️'; nome = 'Jornal Dobrado'; }
    }
    return { nome, emoji, tier };
  };

  const avancarQuestao = (m: MetricasQuestao) => {
    const errosTotaisQuestao = m.errosP1 + m.errosP2;
    const novoItem = gerarEquipamento(errosTotaisQuestao, indiceAtual);
    setInventario(prev => [...prev, novoItem]);

    setMetricasGlobais(prev => ({
      errosP1Totais: prev.errosP1Totais + m.errosP1,
      errosP2Totais: prev.errosP2Totais + m.errosP2,
      tempoTotal: prev.tempoTotal + m.tempo,
      testesTotais: prev.testesTotais + m.testes, 
      trocasTempoTotais: prev.trocasTempoTotais + m.trocasTempo,
      blocosTotais: prev.blocosTotais + m.blocos,
      granular: [...prev.granular, { id: questoesSessao[indiceAtual].id, err: errosTotaisQuestao, t: m.tempo, test: m.testes, sw_t: m.trocasTempo, blk: m.blocos }]
    }));

    if (indiceAtual + 1 < questoesSessao.length) setIndiceAtual(prev => prev + 1);
    else setTelaAtual('podio'); 
  };

  const formatarTempo = (segundos: number) => {
    const m = Math.floor(segundos / 60);
    const s = segundos % 60;
    return `${m}m ${s}s`;
  };

  if (telaAtual === 'home') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold text-blue-600 mb-4 drop-shadow-sm">Arena OBI Colaborativa</h1>
          <p className="text-xl text-slate-500 max-w-xl mx-auto">Plataforma de Pair Programming gamificada para preparação de competições.</p>
        </div>
        
        {/* NOVA DISPOSIÇÃO DE 3 BOTÕES NA HOME */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
          
          <button onClick={() => setTelaAtual('login')} className="flex flex-col items-center justify-center p-10 bg-blue-600 text-white rounded-3xl shadow-xl transition-transform hover:-translate-y-2 hover:shadow-2xl cursor-pointer group">
            <span className="text-6xl mb-4 group-hover:scale-110 transition-transform">🎮</span>
            <h2 className="text-2xl font-bold mb-2">Entrar na Arena</h2>
            <p className="text-blue-100 text-center text-sm">Espaço para os alunos resolverem os desafios offline.</p>
          </button>
          
          <button onClick={() => setTelaAtual('adminLogin')} className="flex flex-col items-center justify-center p-10 bg-slate-800 text-white rounded-3xl shadow-xl transition-transform hover:-translate-y-2 hover:shadow-2xl cursor-pointer group">
            <span className="text-6xl mb-4 group-hover:scale-110 transition-transform">👨‍🏫</span>
            <h2 className="text-2xl font-bold mb-2">Área do Professor</h2>
            <p className="text-slate-300 text-center text-sm">Gestão de questões e Scanner de Resultados.</p>
          </button>

          {/* NOVO BOTÃO PARA O TELÃO */}
          <button onClick={() => setTelaAtual('auditorio')} className="flex flex-col items-center justify-center p-10 bg-gradient-to-br from-indigo-600 to-purple-700 text-white rounded-3xl shadow-xl transition-transform hover:-translate-y-2 hover:shadow-2xl cursor-pointer group relative overflow-hidden">
            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity"></div>
            <span className="text-6xl mb-4 group-hover:scale-110 transition-transform drop-shadow-lg">📺</span>
            <h2 className="text-2xl font-bold mb-2 text-center leading-tight">Telão do Auditório</h2>
            <p className="text-indigo-100 text-center text-sm">Placar ao vivo das equipas conectado à nuvem.</p>
          </button>

        </div>
      </div>
    );
  }

  // --- O RESTO DO APP FICA EXATAMENTE IGUAL ---
  if (telaAtual === 'adminLogin') {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-800 p-4">
        <form onSubmit={handleAdminLogin} className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
          <div className="mb-6 text-center"><span className="text-4xl block mb-2">🔒</span><h1 className="text-2xl font-extrabold text-slate-800">Acesso Restrito</h1></div>
          <div className="mb-4"><label className="mb-1 block text-sm font-bold text-slate-700">Usuário</label><input type="text" value={adminCreds.user} onChange={e => setAdminCreds({...adminCreds, user: e.target.value})} className="w-full rounded-lg border-2 border-slate-200 p-3 focus:border-indigo-500 focus:outline-none" placeholder="ex: admin" autoFocus /></div>
          <div className="mb-8"><label className="mb-1 block text-sm font-bold text-slate-700">Senha</label><input type="password" value={adminCreds.pass} onChange={e => setAdminCreds({...adminCreds, pass: e.target.value})} className="w-full rounded-lg border-2 border-slate-200 p-3 focus:border-indigo-500 focus:outline-none" placeholder="••••••••" /></div>
          <button type="submit" className="w-full mb-3 cursor-pointer rounded-xl bg-indigo-600 py-4 font-bold text-white transition-transform hover:bg-indigo-700 active:scale-95">Autenticar</button><button type="button" onClick={() => setTelaAtual('home')} className="w-full py-3 font-bold text-slate-500 hover:text-slate-800">Voltar para o Início</button>
        </form>
      </div>
    );
  }

  if (telaAtual === 'admin') {
    return <AdminPanel bancoAtual={bancoQuestoes} onAtualizarBanco={(novoBanco) => setBancoQuestoes(novoBanco)} onSair={() => setTelaAtual('home')} />;
  }

  // AQUI RENDERIZAMOS O NOVO COMPONENTE DO TELÃO
  if (telaAtual === 'auditorio') {
    return <Leaderboard onVoltar={() => setTelaAtual('home')} />;
  }

  if (telaAtual === 'login') {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 p-4">
        <form onSubmit={handleLoginPilotos} className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
          <div className="mb-6 text-center"><h1 className="text-3xl font-extrabold text-blue-600">Arena OBI</h1><p className="text-slate-500">Identificação da Dupla</p></div>
          <div className="mb-4"><label className="mb-1 block text-sm font-bold text-slate-700">Piloto 1</label><input type="text" value={pilotos.p1} onChange={e => setPilotos({...pilotos, p1: e.target.value})} className="w-full rounded-lg border-2 border-slate-200 p-3 focus:border-blue-500 focus:outline-none" placeholder="Nome do primeiro aluno" /></div>
          <div className="mb-8"><label className="mb-1 block text-sm font-bold text-slate-700">Piloto 2</label><input type="text" value={pilotos.p2} onChange={e => setPilotos({...pilotos, p2: e.target.value})} className="w-full rounded-lg border-2 border-slate-200 p-3 focus:border-blue-500 focus:outline-none" placeholder="Nome do segundo aluno" /></div>
          <button type="submit" className="w-full mb-3 cursor-pointer rounded-xl bg-blue-600 py-4 font-bold text-white transition-transform hover:scale-105 active:scale-95">Entrar no Laboratório 🚀</button><button type="button" onClick={() => setTelaAtual('home')} className="w-full py-3 font-bold text-slate-500 hover:text-slate-800">Voltar</button>
        </form>
      </div>
    );
  }

  if (telaAtual === 'lobby') {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-slate-50 p-4">
        <header className="mb-10 text-center"><h1 className="mb-2 text-4xl font-extrabold text-blue-600">Escolham o Nível</h1><p className="text-lg text-slate-600">Olá, <span className="font-bold text-indigo-600">{pilotos.p1}</span> e <span className="font-bold text-indigo-600">{pilotos.p2}</span>!</p></header>
        <main className="grid w-full max-w-4xl grid-cols-1 gap-6 md:grid-cols-3">
          <button onClick={() => iniciarMaratona('Iniciação Nível 1')} className="bg-green-500 hover:-translate-y-2 flex cursor-pointer flex-col items-center rounded-2xl p-8 text-center text-white shadow-lg transition-transform"><h2 className="mb-2 text-2xl font-bold">Iniciação Nível 1</h2></button>
          <button onClick={() => iniciarMaratona('Iniciação Nível 2')} className="bg-blue-500 hover:-translate-y-2 flex cursor-pointer flex-col items-center rounded-2xl p-8 text-center text-white shadow-lg transition-transform"><h2 className="mb-2 text-2xl font-bold">Iniciação Nível 2</h2></button>
          <button onClick={() => iniciarMaratona('Programação Júnior')} className="bg-purple-500 hover:-translate-y-2 flex cursor-pointer flex-col items-center rounded-2xl p-8 text-center text-white shadow-lg transition-transform"><h2 className="mb-2 text-2xl font-bold">Programação Júnior</h2></button>
        </main>
      </div>
    );
  }

  if (telaAtual === 'arena') {
    return (
      <div className="h-screen w-screen bg-slate-50 p-4">
        <main className="mx-auto flex h-full w-full max-w-6xl flex-col overflow-hidden rounded-xl border-4 border-slate-200 bg-white shadow-lg">
          <BlocklyWorkspace questao={questoesSessao[indiceAtual]} onVoltar={() => setTelaAtual('lobby')} onProxima={avancarQuestao} progresso={`${indiceAtual + 1}/${questoesSessao.length}`} inventario={inventario} pilotos={pilotos} />
        </main>
      </div>
    );
  }

  if (telaAtual === 'podio') {
    const totalErros = metricasGlobais.errosP1Totais + metricasGlobais.errosP2Totais;
    const dadosQR = JSON.stringify({ p1: pilotos.p1, p2: pilotos.p2, lvl: questoesSessao[0].nivel, t_seg: metricasGlobais.tempoTotal, err: totalErros, err_p: [metricasGlobais.errosP1Totais, metricasGlobais.errosP2Totais], test: metricasGlobais.testesTotais, sw_t: metricasGlobais.trocasTempoTotais, blk: metricasGlobais.blocosTotais, q: metricasGlobais.granular });
    
    let tituloMestre = "Aventureiros do Código"; let corTitulo = "text-slate-500";
    if (totalErros === 0) { tituloMestre = "👑 DEUSES DO CÓDIGO 👑"; corTitulo = "text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]"; } 
    else if (totalErros <= 2) { tituloMestre = "🌟 LENDAS DO CÓDIGO 🌟"; corTitulo = "text-purple-600 drop-shadow-[0_0_8px_rgba(147,51,234,0.5)]"; } 
    else if (totalErros <= 5) { tituloMestre = "⚔️ GUERREIROS DO CÓDIGO ⚔️"; corTitulo = "text-blue-600"; }

    const mediaBlocos = metricasGlobais.blocosTotais / questoesSessao.length;
    let feedbackBlocos = "Excelente otimização! Vocês conseguiram criar um código enxuto e direto.";
    let corFeedbackBlocos = "text-emerald-600";
    if (mediaBlocos >= 7) { feedbackBlocos = "Dica: É possível melhorar! Tente usar menos blocos combinando operações matemáticas ou usando laços de repetição (Loops)."; corFeedbackBlocos = "text-orange-500"; }

    return (
      <div className="flex h-screen items-center justify-center bg-slate-800 p-4">
        <div className="flex w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl">
          <div className="flex flex-col items-center justify-center bg-blue-50 p-10 w-5/12 border-r border-blue-100">
            <h3 className="mb-6 text-xl font-bold text-blue-900 text-center">Mostrem isto ao Professor! 📱</h3>
            <div className="rounded-xl border-4 border-white shadow-md bg-white p-2"><QRCodeSVG value={dadosQR} size={220} level="M" /></div>
            <p className="mt-4 text-xs font-mono text-slate-500 text-center max-w-[200px] break-words">Dados de pesquisa CSCL gerados</p>
          </div>
          <div className="p-8 w-7/12 flex flex-col justify-center bg-white overflow-y-auto">
            <div className="text-center mb-6"><h1 className={`text-3xl font-extrabold mb-1 uppercase tracking-widest ${corTitulo}`}>{tituloMestre}</h1><p className="text-slate-600"><span className="font-bold text-indigo-600">{pilotos.p1}</span> e <span className="font-bold text-indigo-600">{pilotos.p2}</span> finalizaram a run!</p></div>
            <div className="mb-6"><h4 className="font-bold text-slate-400 mb-2 uppercase text-xs tracking-wider border-b pb-1">Inventário Conquistado</h4><div className="flex flex-wrap gap-2">
              {inventario.map((item, i) => {
                const tierColor = item.tier === 'L' ? 'text-yellow-600' : item.tier === 'E' ? 'text-purple-600' : item.tier === 'R' ? 'text-blue-600' : item.tier === 'U' ? 'text-green-600' : 'text-slate-500';
                const tierBg = item.tier === 'L' ? 'bg-yellow-50 border-yellow-200' : item.tier === 'E' ? 'bg-purple-50 border-purple-200' : item.tier === 'R' ? 'bg-blue-50 border-blue-200' : item.tier === 'U' ? 'bg-green-50 border-green-200' : 'bg-slate-100 border-slate-200';
                const tierName = item.tier === 'L' ? 'Lendário' : item.tier === 'E' ? 'Épico' : item.tier === 'R' ? 'Raro' : item.tier === 'U' ? 'Incomum' : 'Comum';
                return (
                  <div key={i} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${tierBg} flex-1 min-w-[140px]`}>
                    <span className="text-xl">{item.emoji}</span>
                    <div className="flex flex-col"><span className="text-xs font-bold text-slate-800 leading-tight">{item.nome}</span><span className={`text-[9px] uppercase font-extrabold tracking-wider ${tierColor}`}>{tierName}</span></div>
                  </div>
                );
              })}
            </div></div>
            <div className="space-y-3 mb-6 text-sm bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex flex-col border-b pb-2"><div className="flex justify-between"><span className="text-slate-500">Complexidade do Código:</span><span className="font-bold text-purple-600">{metricasGlobais.blocosTotais} Blocos Usados</span></div><span className={`text-xs mt-1 italic ${corFeedbackBlocos}`}>{feedbackBlocos}</span></div>
              <div className="flex flex-col border-b pb-2"><div className="flex justify-between"><span className="text-slate-500">Erros de Submissão (WA):</span><span className="font-bold text-red-500">Total: {totalErros}</span></div><div className="flex justify-end gap-2 text-xs font-mono mt-1 text-slate-400"><span className={metricasGlobais.errosP1Totais > 0 ? "text-red-400 font-bold" : ""}>{pilotos.p1}: {metricasGlobais.errosP1Totais}</span> | <span className={metricasGlobais.errosP2Totais > 0 ? "text-red-400 font-bold" : ""}>{pilotos.p2}: {metricasGlobais.errosP2Totais}</span></div></div>
              <div className="flex justify-between border-b pb-2"><span className="text-slate-500">Tentativas Rápidas (Testes):</span><span className="font-bold text-slate-800">{metricasGlobais.testesTotais}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Tempo de Resolução:</span><span className="font-bold text-emerald-600">{formatarTempo(metricasGlobais.tempoTotal)}</span></div>
            </div>
            <button onClick={() => { setPilotos({ p1: '', p2: '' }); setTelaAtual('home'); }} className="w-full rounded-xl bg-slate-800 py-3 font-bold text-white transition-transform hover:bg-slate-900 active:scale-95">Nova Sessão</button>
          </div>
        </div>
      </div>
    );
  }
  return null;
}
