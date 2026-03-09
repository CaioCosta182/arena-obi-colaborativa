import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';

export function defineCustomBlocks() {
  // Nossos blocos gamificados originais
  Blockly.Blocks['obi_mover'] = {
    init: function () {
      this.appendDummyInput().appendField("Mover o personagem");
      this.appendValueInput("PASSOS").setCheck("Number").appendField("passos:");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(230);
    }
  };
  Blockly.Blocks['obi_cor'] = {
    init: function () {
      this.appendDummyInput().appendField("Mudar cor para")
        .appendField(new Blockly.FieldDropdown([["Vermelho", "RED"], ["Verde", "GREEN"], ["Azul", "BLUE"]]), "COR_PERSONAGEM");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(160);
    }
  };

  // NOVO BLOCO: Imprimir Resultado (Para cálculos clássicos da OBI)
  Blockly.Blocks['obi_imprimir'] = {
    init: function () {
      this.appendValueInput("VALOR")
        .appendField("Imprimir resultado:");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(290); // Roxo para destacar
      this.setTooltip("Imprime um número ou texto no console do Juiz.");
    }
  };
}

export function defineCustomGenerators() {
  // @ts-ignore
  javascriptGenerator.forBlock['obi_mover'] = function (block: Blockly.Block, generator: any) {
    const passos = generator.valueToCode(block, 'PASSOS', generator.ORDER_ATOMIC) || '0';
    return `personagem.mover(${passos});\n`;
  };
  // @ts-ignore
  javascriptGenerator.forBlock['obi_cor'] = function (block: Blockly.Block) {
    const corSelecionada = block.getFieldValue('COR_PERSONAGEM');
    return `personagem.mudarCor('${corSelecionada}');\n`;
  };

  // GERADOR DO NOVO BLOCO
  // @ts-ignore
  javascriptGenerator.forBlock['obi_imprimir'] = function (block: Blockly.Block, generator: any) {
    const valor = generator.valueToCode(block, 'VALOR', generator.ORDER_ATOMIC) || "''";
    return `imprimir(${valor});\n`;
  };
}