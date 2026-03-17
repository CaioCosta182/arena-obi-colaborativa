import { useState, useEffect } from 'react';
import { escutarRankingTempoReal, type ResultadoEquipa } from '../lib/firebase';

export default function Leaderboard({ onVoltar }: { onVoltar: () => void }) {
  const [ranking, setRanking] = useState<ResultadoEquipa[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    // Liga o "ouvido" ao Firebase. Qualquer QR Code lido pelo professor atualiza isto na hora!
    const cancelarEscuta = escutarRankingTempoReal((dados) => {
      setRanking(dados);
      setCarregando(false);
    });

    return () => cancelarEscuta();
  }, []);

  const formatarTempo = (segundos: number) => {
    const m = Math.floor(segundos / 60);
    const s = segundos % 60;
    return `${m}m ${s}s`;
  };

  const calcularTitulo = (erros: number) => {
    if (erros === 0) return { titulo: "👑 DEUSES DO CÓDIGO", cor: "text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]" };
    if (erros <= 2) return { titulo: "🌟 LENDAS", cor: "text-purple-400" };
    if (erros <= 5) return { titulo: "⚔️ GUERREIROS", cor: "text-blue-400" };
    return { titulo: "🛡️ AVENTUREIROS", cor: "text-slate-400" };
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-900 text-white font-sans overflow-hidden">
      
      {/* CABEÇALHO ÉPICO PARA O PROJETOR */}
      <header className="relative flex items-center justify-between bg-slate-950 p-8 shadow-2xl border-b border-slate-800 z-10">
        <div className="flex items-center gap-4">
          <div className="text-5xl animate-pulse">🏆</div>
          <div>
            <h1 className="text-4xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 uppercase">
              Ranking Oficial
            </h1>
            <p className="text-slate-400 font-mono mt-1">Arena OBI Colaborativa • Transmissão ao Vivo</p>
          </div>
        </div>
        <button onClick={onVoltar} className="cursor-pointer rounded-xl bg-slate-800 border border-slate-700 px-6 py-3 font-bold text-slate-300 hover:bg-slate-700 hover:text-white transition-all">
          Sair do Telão
        </button>
      </header>

      {/* ÁREA DA TABELA */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          
          {carregando ? (
            <div className="flex flex-col items-center justify-center py-32 opacity-50">
              <div className="text-6xl animate-spin mb-6">⏳</div>
              <h2 className="text-2xl font-bold font-mono">A aguardar dados do Laboratório...</h2>
            </div>
          ) : ranking.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 opacity-50">
              <div className="text-7xl mb-6 grayscale">📊</div>
              <h2 className="text-2xl font-bold font-mono">Nenhuma equipa avaliada ainda.</h2>
              <p className="text-slate-400 mt-2">O professor precisa de usar o Scanner no primeiro QR Code.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {/* CABEÇALHO DA TABELA */}
              <div className="grid grid-cols-12 gap-4 px-6 py-3 text-xs font-black uppercase tracking-widest text-slate-500 border-b border-slate-700">
                <div className="col-span-1 text-center">Posição</div>
                <div className="col-span-4">Dupla de Pilotos</div>
                <div className="col-span-3">Classificação (Tier)</div>
                <div className="col-span-2 text-center">Erros (WA)</div>
                <div className="col-span-2 text-right">Tempo Total</div>
              </div>

              {/* LISTA DE EQUIPAS */}
              {ranking.map((equipa, index) => {
                const isTop3 = index < 3;
                const { titulo, cor } = calcularTitulo(equipa.err);
                
                return (
                  <div 
                    key={equipa.id || index} 
                    className={`grid grid-cols-12 gap-4 items-center px-6 py-5 rounded-2xl border transition-all transform hover:scale-[1.01] ${
                      index === 0 ? 'bg-gradient-to-r from-yellow-900/40 to-slate-800 border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.2)]' :
                      index === 1 ? 'bg-gradient-to-r from-slate-600/40 to-slate-800 border-slate-400/50' :
                      index === 2 ? 'bg-gradient-to-r from-orange-900/40 to-slate-800 border-orange-700/50' :
                      'bg-slate-800/50 border-slate-700/50 hover:bg-slate-800'
                    }`}
                  >
                    {/* POSIÇÃO */}
                    <div className="col-span-1 flex justify-center">
                      <span className={`text-3xl font-black ${index === 0 ? 'text-yellow-400' : index === 1 ? 'text-slate-300' : index === 2 ? 'text-orange-500' : 'text-slate-600'}`}>
                        {index + 1}º
                      </span>
                    </div>

                    {/* NOMES */}
                    <div className="col-span-4 flex flex-col">
                      <span className={`text-xl font-extrabold ${isTop3 ? 'text-white' : 'text-slate-300'}`}>
                        {equipa.p1} <span className="text-slate-600 font-normal">&amp;</span> {equipa.p2}
                      </span>
                      <span className="text-xs font-mono text-indigo-400 mt-1 uppercase tracking-wider">{equipa.lvl}</span>
                    </div>

                    {/* TÍTULO RPG */}
                    <div className="col-span-3 flex items-center">
                      <span className={`font-black tracking-widest text-sm ${cor}`}>
                        {titulo}
                      </span>
                    </div>

                    {/* ERROS COM DETALHE */}
                    <div className="col-span-2 flex flex-col items-center justify-center">
                      <span className={`text-2xl font-black ${equipa.err === 0 ? 'text-emerald-400' : equipa.err > 5 ? 'text-red-400' : 'text-yellow-400'}`}>
                        {equipa.err}
                      </span>
                      {equipa.err > 0 && (
                        <span className="text-[10px] text-slate-500 font-mono mt-1">
                          (P1: {equipa.err_p[0]} | P2: {equipa.err_p[1]})
                        </span>
                      )}
                    </div>

                    {/* TEMPO */}
                    <div className="col-span-2 flex justify-end">
                      <span className="text-xl font-mono font-bold text-slate-300 bg-slate-900/50 px-3 py-1 rounded-lg border border-slate-700">
                        ⏱️ {formatarTempo(equipa.t_seg)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
