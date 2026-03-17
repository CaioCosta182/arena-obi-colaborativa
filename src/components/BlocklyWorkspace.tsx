import { useEffect, useRef, useState } from 'react';
import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';
import * as ptBr from 'blockly/msg/pt-br';
import { defineCustomBlocks, defineCustomGenerators } from './customBlocks';
import { type QuestaoOBI } from '../data/obiQuestions';

Blockly.setLocale(ptBr as any);
defineCustomBlocks();
defineCustomGenerators();

const toolboxInfo = {
  kind: 'categoryToolbox',
  contents: [
    { kind: 'category', name: 'Ações OBI', colour: '230', contents: [{ kind: 'block', type: 'obi_mover' }, { kind: 'block', type: 'obi_cor' }, { kind: 'block', type: 'obi_imprimir' }] },
    { kind: 'category', name: 'Lógica', colour: '210', contents: [{ kind: 'block', type: 'controls_if' }, { kind: 'block', type: 'logic_compare' }, { kind: 'block', type: 'logic_operation' }] },
    { kind: 'category', name: 'Matemática', colour: '230', contents: [{ kind: 'block', type: 'math_number' }, { kind: 'block', type: 'math_arithmetic' }, { kind: 'block', type: 'math_modulo' }] },
    { kind: 'category', name: 'Repetições', colour: '120', contents: [{ kind: 'block', type: 'controls_whileUntil' }, { kind: 'block', type: 'controls_repeat_ext' }] },
    { kind: 'category', name: 'Listas / Vetores', colour: '260', contents: [{ kind: 'block', type: 'lists_create_with' }, { kind: 'block', type: 'lists_getIndex' }, { kind: 'block', type: 'lists_length' }, { kind: 'block', type: 'lists_sort' }] },
    { kind: 'category', name: 'Variáveis', colour: '330', custom: 'VARIABLE' }
  ],
};

export interface MetricasQuestao {
  erros: number;
  tempo: number;
  testes: number;
  trocasTempo: number;
  blocos: number; 
}

export interface Equipamento {
  nome: string;
  emoji: string;
  tier: 'L' | 'E' | 'R' | 'U' | 'C';
}

interface WorkspaceProps {
  questao: QuestaoOBI;
  onVoltar: () => void;
  onProxima: (metricas: MetricasQuestao) => void;
  progresso: string;
  inventario: Equipamento[];
  pilotos: { p1: string; p2: string };
}

const TEMPO_TURNO = 600; 

export default function BlocklyWorkspace({ questao, onVoltar, onProxima, progresso, inventario, pilotos }: WorkspaceProps) {
  const blocklyDiv = useRef<HTMLDivElement>(null);
  const workspace = useRef<Blockly.WorkspaceSvg | null>(null);
  const [feedback, setFeedback] = useState<string>('');
  const [acertou, setAcertou] = useState<boolean>(false);
  
  const [tempoRestante, setTempoRestante] = useState<number>(TEMPO_TURNO);
  const [pilotoAtual, setPilotoAtual] = useState<number>(1);
  const [motivoTroca, setMotivoTroca] = useState<'tempo' | 'acerto' | null>(null);

  const [erros, setErros] = useState<number>(0);
  const [tempoGasto, setTempoGasto] = useState<number>(0);
  const [testesFeitos, setTestesFeitos] = useState<number>(0);
  const [trocasTempo, setTrocasTempo] = useState<number>(0);

  useEffect(() => {
    if (blocklyDiv.current && !workspace.current) {
      workspace.current = Blockly.inject(blocklyDiv.current, {
        toolbox: toolboxInfo,
        trashcan: true,
        move: { scrollbars: true, drag: true, wheel: true },
      });
    }
  }, []);

  useEffect(() => {
    if (motivoTroca || acertou) return;
    const timer = setInterval(() => {
      setTempoRestante((prev) => {
        if (prev <= 1) {
          setMotivoTroca('tempo');
          return 0;
        }
        return prev - 1;
      });
      setTempoGasto((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [motivoTroca, acertou]);

  useEffect(() => {
    setFeedback('');
    setAcertou(false);
    setErros(0);
    setTempoGasto(0);
    setTestesFeitos(0);
    setTrocasTempo(0);
    if (workspace.current) {
      workspace.current.clear();
    }
  }, [questao]);

  const handleTestarCodigo = () => {
    if (!workspace.current) return;
    setTestesFeitos(prev => prev + 1);
    
    const code = javascriptGenerator.workspaceToCode(workspace.current);
    setFeedback('A processar no Juiz...');

    const worker = new Worker(new URL('../workers/judgeWorker.ts', import.meta.url), { type: 'module' });
    
    const timeoutId = setTimeout(() => {
      worker.terminate();
      setFeedback('⏳ Tempo Esgotado! Cuidado com ciclos infinitos.');
      setErros(e => e + 1);
    }, 2000);

    worker.onmessage = (e) => {
      clearTimeout(timeoutId);
      setFeedback(e.data.message);
      if (e.data.status === 'AC') {
        setAcertou(true); 
      } else {
        setAcertou(false);
        setErros(err => err + 1);
      }
      worker.terminate(); 
    };

    worker.onerror = () => {
      clearTimeout(timeoutId);
      setFeedback('⚠️ Erro crítico.');
      setErros(err => err + 1);
      worker.terminate();
    };

    worker.postMessage({ code: code, outputEsperado: questao.output_esperado });
  };

  const handleConfirmarTroca = () => {
    setPilotoAtual(prev => prev === 1 ? 2 : 1);
    setTempoRestante(TEMPO_TURNO);
    
    if (motivoTroca === 'tempo') setTrocasTempo(prev => prev + 1);
    
    if (motivoTroca === 'acerto') {
      const blocosUsados = workspace.current ? workspace.current.getAllBlocks(false).length : 0;
      onProxima({ erros, tempo: tempoGasto, testes: testesFeitos, trocasTempo, blocos: blocosUsados });
    }
    setMotivoTroca(null);
  };

  const formatarTempo = (segundos: number) => {
    const m = Math.floor(segundos / 60);
    const s = segundos % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const nomePilotoQueSai = pilotoAtual === 1 ? pilotos.p1 : pilotos.p2;
  const nomePilotoQueEntra = pilotoAtual === 1 ? pilotos.p2 : pilotos.p1;

  return (
    <div className="flex h-full flex-col relative">
      {motivoTroca && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm">
          <div className="flex max-w-md flex-col items-center rounded-2xl bg-white p-8 text-center shadow-2xl">
            <div className={`mb-4 text-6xl ${motivoTroca === 'tempo' ? 'animate-spin' : 'animate-bounce'}`}>
              {motivoTroca === 'tempo' ? '⏳' : (erros === 0 ? '✨' : '🏆')}
            </div>
            <h2 className="mb-2 text-3xl font-extrabold text-slate-800">
              {motivoTroca === 'tempo' ? 'Tempo Esgotado!' : (erros === 0 ? 'Acerto Perfeito!' : 'Desafio Concluído!')}
            </h2>
            <p className="mb-6 text-lg text-slate-600">
              {motivoTroca === 'tempo' 
                ? `Os 10 minutos de ${nomePilotoQueSai} acabaram! É a vez de ${nomePilotoQueEntra} assumir os controles.`
                : (erros === 0 
                    ? `Incrível, ${pilotos.p1} e ${pilotos.p2}! Resolução de primeira. Vocês garantiram um equipamento LENDÁRIO!`
                    : `Bom trabalho, dupla! Cliquem para resgatar o loot e passar o controle para ${nomePilotoQueEntra}.`)}
            </p>
            <button onClick={handleConfirmarTroca} className="w-full cursor-pointer rounded-xl bg-indigo-600 px-6 py-4 text-xl font-bold text-white shadow-lg transition-transform hover:scale-105 hover:bg-indigo-700 active:scale-95">
              ✅ Confirmar e Avançar!
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between border-b border-blue-200 bg-blue-100 p-4 shadow-sm">
        <div className="flex-1">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
            {questao.nivel} • Questão {progresso}
          </span>
          <h2 className="mb-1 text-xl font-bold text-blue-900">{questao.titulo}</h2>
          <p className="text-sm text-blue-800">{questao.descricao}</p>
        </div>

        <div className="mx-6 flex flex-col items-center rounded-xl bg-white p-2 shadow-sm border border-slate-200 min-w-[120px]">
          <span className="text-[10px] font-bold uppercase text-slate-400 mb-1">Avatar da Dupla</span>
          <div className="flex gap-2 text-2xl">
            
            {/* AVATAR BASE COM TOOLTIP */}
            <div className="relative group cursor-help">
              <span>🧍</span>
              <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 flex flex-col items-center w-max bg-slate-800 text-white px-2 py-1 rounded shadow-lg">
                <span className="text-xs font-bold text-slate-300">Iniciante</span>
              </div>
            </div>

            {/* EQUIPAMENTOS COM TOOLTIP ESTILIZADO */}
            {inventario.map((item, i) => {
              const glow = item.tier === 'L' ? 'drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]' : item.tier === 'E' ? 'drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]' : '';
              const tierName = item.tier === 'L' ? 'Lendário' : item.tier === 'E' ? 'Épico' : item.tier === 'R' ? 'Raro' : item.tier === 'U' ? 'Incomum' : 'Comum';
              const tierColor = item.tier === 'L' ? 'text-yellow-400' : item.tier === 'E' ? 'text-purple-400' : item.tier === 'R' ? 'text-blue-400' : item.tier === 'U' ? 'text-green-400' : 'text-slate-400';
              
              return (
                <div key={i} className="relative group cursor-help">
                  <span className={glow}>{item.emoji}</span>
                  {/* BALÃO DO TOOLTIP */}
                  <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 flex flex-col items-center w-max bg-slate-800 text-white px-3 py-1.5 rounded-lg shadow-xl border border-slate-700">
                    <span className="text-sm font-bold leading-tight">{item.nome}</span>
                    <span className={`text-[10px] uppercase tracking-wider font-bold ${tierColor}`}>{tierName}</span>
                    <div className="absolute bottom-[100%] left-1/2 -translate-x-1/2 border-4 border-transparent border-b-slate-700"></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mx-4 flex flex-col items-center rounded-lg border border-blue-200 bg-white p-2 shadow-inner">
          <span className="text-[10px] font-bold uppercase text-slate-500">A programar agora</span>
          <div className="flex items-center gap-3">
            <span className={`text-sm font-extrabold truncate max-w-[100px] ${pilotoAtual === 1 ? 'text-indigo-600' : 'text-slate-300'}`} title={pilotos.p1}>👦 {pilotos.p1}</span>
            <div className={`flex w-24 items-center justify-center rounded-full px-2 py-1 font-mono font-bold text-white transition-colors ${tempoRestante <= 30 ? 'bg-red-500 animate-pulse' : 'bg-slate-800'}`}>
              ⏱️ {formatarTempo(tempoRestante)}
            </div>
            <span className={`text-sm font-extrabold truncate max-w-[100px] ${pilotoAtual === 2 ? 'text-indigo-600' : 'text-slate-300'}`} title={pilotos.p2}>👧 {pilotos.p2}</span>
          </div>
        </div>

        <button onClick={onVoltar} className="cursor-pointer rounded-lg bg-slate-200 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-300">Sair</button>
      </div>
      
      <div ref={blocklyDiv} className="relative w-full flex-1" />
      
      <div className="flex items-center justify-between border-t border-slate-300 bg-slate-100 p-4">
        <div className="max-w-[70%] text-lg font-bold text-slate-700">
          Juiz Offline: <span className={feedback.includes('🎉') ? 'text-green-600' : 'text-red-500'}>{feedback}</span>
        </div>
        
        {acertou ? (
          <button onClick={() => setMotivoTroca('acerto')} className="cursor-pointer rounded-lg bg-blue-600 px-8 py-3 font-bold text-white shadow-md hover:scale-105 hover:bg-blue-700 active:scale-95 animate-pulse">
            Resgatar Loot ⏭️
          </button>
        ) : (
          <button onClick={handleTestarCodigo} className="cursor-pointer rounded-lg bg-green-600 px-8 py-3 font-bold text-white shadow-md hover:scale-105 hover:bg-green-700 active:scale-95">
            ▶️ Testar Código
          </button>
        )}
      </div>
    </div>
  );
}
