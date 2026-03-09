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

interface WorkspaceProps {
  questao: QuestaoOBI;
  onVoltar: () => void;
  onProxima: () => void;
  progresso: string;
}

// 10 minutos em segundos
const TEMPO_TURNO = 600; 

export default function BlocklyWorkspace({ questao, onVoltar, onProxima, progresso }: WorkspaceProps) {
  const blocklyDiv = useRef<HTMLDivElement>(null);
  const workspace = useRef<Blockly.WorkspaceSvg | null>(null);
  const [feedback, setFeedback] = useState<string>('');
  const [acertou, setAcertou] = useState<boolean>(false);
  
  const [tempoRestante, setTempoRestante] = useState<number>(TEMPO_TURNO);
  const [pilotoAtual, setPilotoAtual] = useState<number>(1);
  
  // Define a razão pela qual o ecrã foi bloqueado
  const [motivoTroca, setMotivoTroca] = useState<'tempo' | 'acerto' | null>(null);

  useEffect(() => {
    if (blocklyDiv.current && !workspace.current) {
      workspace.current = Blockly.inject(blocklyDiv.current, {
        toolbox: toolboxInfo,
        trashcan: true,
        move: { scrollbars: true, drag: true, wheel: true },
      });
    }
  }, []);

  // Cronómetro
  useEffect(() => {
    // Pára o relógio se estiverem na janela de troca ou se já acertaram
    if (motivoTroca || acertou) return;

    const timer = setInterval(() => {
      setTempoRestante((prev) => {
        if (prev <= 1) {
          setMotivoTroca('tempo'); // Gatilho 1: 10 Minutos esgotados
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [motivoTroca, acertou]);

  // Limpeza visual ao avançar de nível
  useEffect(() => {
    setFeedback('');
    setAcertou(false);
    if (workspace.current) {
      workspace.current.clear();
    }
  }, [questao]);

  const handleTestarCodigo = () => {
    if (!workspace.current) return;
    const code = javascriptGenerator.workspaceToCode(workspace.current);
    setFeedback('A processar no Juiz...');

    const worker = new Worker(new URL('../workers/judgeWorker.ts', import.meta.url), { type: 'module' });
    
    const timeoutId = setTimeout(() => {
      worker.terminate();
      setFeedback('⏳ Tempo Esgotado! Cuidado com ciclos infinitos.');
    }, 2000);

    worker.onmessage = (e) => {
      clearTimeout(timeoutId);
      setFeedback(e.data.message);
      if (e.data.status === 'AC') {
        setAcertou(true); // Permite ver o botão de Próxima Questão
      } else {
        setAcertou(false);
      }
      worker.terminate(); 
    };

    worker.onerror = () => {
      clearTimeout(timeoutId);
      setFeedback('⚠️ Erro crítico.');
      worker.terminate();
    };

    worker.postMessage({ code: code, outputEsperado: questao.output_esperado });
  };

  // Função central que efetiva a troca física dos alunos
  const handleConfirmarTroca = () => {
    setPilotoAtual(prev => prev === 1 ? 2 : 1);
    setTempoRestante(TEMPO_TURNO);
    
    // Se a troca for porque acertaram, ao clicar no botão o jogo avança
    if (motivoTroca === 'acerto') {
      onProxima();
    }
    setMotivoTroca(null);
  };

  const formatarTempo = (segundos: number) => {
    const m = Math.floor(segundos / 60);
    const s = segundos % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex h-full flex-col relative">
      
      {/* MODAL INTELIGENTE DE REVEZAMENTO */}
      {motivoTroca && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm">
          <div className="flex max-w-md flex-col items-center rounded-2xl bg-white p-8 text-center shadow-2xl">
            <div className={`mb-4 text-6xl ${motivoTroca === 'tempo' ? 'animate-spin' : 'animate-bounce'}`}>
              {motivoTroca === 'tempo' ? '⏳' : '🏆'}
            </div>
            <h2 className="mb-2 text-3xl font-extrabold text-slate-800">
              {motivoTroca === 'tempo' ? 'Tempo Esgotado!' : 'Desafio Concluído!'}
            </h2>
            <p className="mb-6 text-lg text-slate-600">
              {motivoTroca === 'tempo' 
                ? 'Os 10 minutos acabaram! É altura de trocarem de papéis. Quem estava com o rato agora ajuda a pensar, e quem dava as ideias assume o controlo.'
                : 'Excelente trabalho de equipa! Antes de passarem para a próxima questão, troquem de lugar para garantir que ambos praticam a codificação.'}
            </p>
            <button 
              onClick={handleConfirmarTroca}
              className="w-full cursor-pointer rounded-xl bg-indigo-600 px-6 py-4 text-xl font-bold text-white shadow-lg transition-transform hover:scale-105 hover:bg-indigo-700 active:scale-95"
            >
              ✅ Já trocámos de lugar!
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

        {/* Painel do Cronómetro */}
        <div className="mx-4 flex flex-col items-center rounded-lg border border-blue-200 bg-white p-2 shadow-inner">
          <span className="text-[10px] font-bold uppercase text-slate-500">A programar agora</span>
          <div className="flex items-center gap-3">
            <span className={`text-sm font-extrabold ${pilotoAtual === 1 ? 'text-indigo-600' : 'text-slate-300'}`}>👦 Piloto 1</span>
            <div className={`flex w-24 items-center justify-center rounded-full px-2 py-1 font-mono font-bold text-white transition-colors ${tempoRestante <= 30 ? 'bg-red-500 animate-pulse' : 'bg-slate-800'}`}>
              ⏱️ {formatarTempo(tempoRestante)}
            </div>
            <span className={`text-sm font-extrabold ${pilotoAtual === 2 ? 'text-indigo-600' : 'text-slate-300'}`}>👧 Piloto 2</span>
          </div>
        </div>

        <button onClick={onVoltar} className="cursor-pointer rounded-lg bg-slate-200 px-4 py-2 font-semibold text-slate-700 transition-colors hover:bg-slate-300">
          Sair da Arena
        </button>
      </div>
      
      <div ref={blocklyDiv} className="relative w-full flex-1" />
      
      <div className="flex items-center justify-between border-t border-slate-300 bg-slate-100 p-4">
        <div className="max-w-[70%] text-lg font-bold text-slate-700">
          Juiz Offline: <span className={feedback.includes('🎉') ? 'text-green-600' : 'text-red-500'}>{feedback}</span>
        </div>
        
        {/* Gatilho 2: Clicar para ir para a próxima questão */}
        {acertou ? (
          <button onClick={() => setMotivoTroca('acerto')} className="cursor-pointer rounded-lg bg-blue-600 px-8 py-3 font-bold text-white shadow-md transition-all hover:scale-105 hover:bg-blue-700 active:scale-95 animate-pulse">
            Próxima Questão ⏭️
          </button>
        ) : (
          <button onClick={handleTestarCodigo} className="cursor-pointer rounded-lg bg-green-600 px-8 py-3 font-bold text-white shadow-md transition-all hover:scale-105 hover:bg-green-700 active:scale-95">
            ▶️ Testar Código
          </button>
        )}
      </div>
    </div>
  );
}
