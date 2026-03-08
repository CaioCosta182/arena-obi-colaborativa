import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';

export function defineCustomBlocks() {
  Blockly.Blocks['obi_mover'] = {
    init: function () {
      this.appendDummyInput().appendField("Mover o personagem");
      this.appendValueInput("PASSOS").setCheck("Number").appendField("passos:");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(230);
    }
  };
  Blockly.Blocks['obi_se_parede'] = {
    init: function () {
      this.appendDummyInput().appendField("Se encontrar a parede");
      this.appendStatementInput("FAZER").setCheck(null).appendField("faça:");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(210);
    }
  };
  Blockly.Blocks['obi_cor'] = {
    init: function () {
      this.appendDummyInput()
          .appendField("Mudar cor para")
          .appendField(new Blockly.FieldDropdown([
            ["Vermelho", "RED"], ["Verde", "GREEN"], ["Azul", "BLUE"]
          ]), "COR_PERSONAGEM");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(160);
    }
  };
}

export function defineCustomGenerators() {
  // @ts-ignore
  javascriptGenerator.forBlock['obi_mover'] = function(block: Blockly.Block, generator: any) {
    const passos = generator.valueToCode(block, 'PASSOS', generator.ORDER_ATOMIC) || '0';
    return `personagem.mover(${passos});\n`;
  };
  // @ts-ignore
  javascriptGenerator.forBlock['obi_se_parede'] = function(block: Blockly.Block, generator: any) {
    const codigoInterno = generator.statementToCode(block, 'FAZER');
    return `if (personagem.bateuNaParede()) {\n${codigoInterno}}\n`;
  };
  // @ts-ignore
  javascriptGenerator.forBlock['obi_cor'] = function(block: Blockly.Block) {
    const corSelecionada = block.getFieldValue('COR_PERSONAGEM');
    return `personagem.mudarCor('${corSelecionada}');\n`;
  };
}
