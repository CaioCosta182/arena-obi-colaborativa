import { useEffect, useRef } from 'react';
import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';
import * as ptBr from 'blockly/msg/pt-br';
import { defineCustomBlocks, defineCustomGenerators } from './customBlocks';

Blockly.setLocale(ptBr as any);
defineCustomBlocks();
defineCustomGenerators();

const toolboxInfo = {
  kind: 'categoryToolbox',
  contents: [
    {
      kind: 'category',
      name: 'Ações OBI',
      colour: '230',
      contents: [
        { kind: 'block', type: 'obi_mover' },
        { kind: 'block', type: 'obi_se_parede' },
        { kind: 'block', type: 'obi_cor' },
      ],
    },
    {
      kind: 'category',
      name: 'Lógica',
      colour: '210',
      contents: [
        { kind: 'block', type: 'controls_if' },
        { kind: 'block', type: 'controls_repeat_ext' },
      ],
    },
    {
      kind: 'category',
      name: 'Matemática',
      colour: '230',
      contents: [
        { kind: 'block', type: 'math_number' },
      ],
    }
  ],
};

export default function BlocklyWorkspace() {
  const blocklyDiv = useRef<HTMLDivElement>(null);
  const workspace = useRef<Blockly.WorkspaceSvg | null>(null);

  useEffect(() => {
    if (blocklyDiv.current && !workspace.current) {
      workspace.current = Blockly.inject(blocklyDiv.current, {
        toolbox: toolboxInfo,
        trashcan: true,
        move: { scrollbars: true, drag: true, wheel: true },
      });

      workspace.current.addChangeListener((event) => {
        if (event.type !== Blockly.Events.UI) {
          const code = javascriptGenerator.workspaceToCode(workspace.current!);
          console.log("=== Código Gerado ===");
          console.log(code);
        }
      });
    }
  }, []);

  return <div ref={blocklyDiv} className="h-full w-full rounded-lg" />;
}
