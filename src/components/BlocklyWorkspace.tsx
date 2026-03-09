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

export default function BlocklyWorkspace({ questao, onVoltar, onProxima, progresso }: WorkspaceProps) {
  const blocklyDiv = useRef<HTMLDivElement>(null);
  const workspace = useRef<Blockly.WorkspaceSvg | null>(null);
  const [feedback, setFeedback] = useState<string>('');
  const [acertou, setAcertou] = useState<boolean>(false);

  useEffect(() => {
    if (blocklyDiv.current && !workspace.current) {
      workspace.current = Blockly.inject(blocklyDiv.current, {
        toolbox: toolboxInfo,
        trashcan: true,
        move: { scrollbars: true, drag: true, wheel: true },
      });
    }
  }, []);

  // Força a limpeza dos blocos sempre que a Questão (prop) muda
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
    setFeedback('Rodando no Juiz...');

    const worker = new Worker(new URL('../workers/judgeWorker.ts', import.meta.url), { type: 'module' });
    
    const timeoutId = setTimeout(() => {
      worker.terminate();
      setFeedback('⏳ Tempo Esgotado! Cuidado com repetições infinitas.');
    }, 2000);

    worker.onmessage = (e) => {
      clearTimeout(timeoutId);
      setFeedback(e.data.message);
      if (e.data.status === 'AC') {
        setAcertou(true); // Troca o botão verde pelo azul de "Próxima"
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

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-blue-200 bg-blue-100 p-4 shadow-sm">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
            {questao.nivel} • Questão {progresso}
          </span>
          <h2 className="mb-1 text-xl font-bold text-blue-900">{questao.titulo}</h2>
          <p className="text-blue-800">{questao.descricao}</p>
        </div>
        <button onClick={onVoltar} className="rounded-lg bg-slate-200 px-4 py-2 font-semibold text-slate-700 transition-colors hover:bg-slate-300">
          Sair da Arena
        </button>
      </div>
      
      <div ref={blocklyDiv} className="relative w-full flex-1" />
      
      <div className="flex items-center justify-between border-t border-slate-300 bg-slate-100 p-4">
        <div className="max-w-[70%] text-lg font-bold text-slate-700">
          Juiz Offline: <span className={feedback.includes('🎉') ? 'text-green-600' : 'text-red-500'}>{feedback}</span>
        </div>
        
        {acertou ? (
          <button onClick={onProxima} className="cursor-pointer rounded-lg bg-blue-600 px-8 py-3 font-bold text-white shadow-md transition-all hover:scale-105 hover:bg-blue-700 active:scale-95 animate-pulse">
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
