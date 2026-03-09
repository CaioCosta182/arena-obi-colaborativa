self.onmessage = (e: MessageEvent) => {
  const { code, outputEsperado } = e.data;
  let logsExecucao: string[] = [];

  try {
    const sandboxCode = `
      const personagem = {
        mover: (passos) => { logsExecucao.push('moveu ' + passos + ' passos'); },
        mudarCor: (cor) => { logsExecucao.push('cor ' + cor); }
      };
      
      // NOVA FUNÇÃO: Captura cálculos exatos
      const imprimir = (valor) => { logsExecucao.push(String(valor)); };
      
      ${code}
    `;

    const userFunction = new Function('logsExecucao', sandboxCode);
    userFunction(logsExecucao);

    const resultadoFinal = logsExecucao.join(',');

    if (resultadoFinal === outputEsperado) {
      self.postMessage({ status: 'AC', message: '🎉 Resposta Correta! Você passou no teste.' });
    } else {
      self.postMessage({ status: 'WA', message: `❌ Resposta Errada. Esperado: [${outputEsperado}], mas fez: [${resultadoFinal || 'nada'}]` });
    }
  } catch (error: any) {
    self.postMessage({ status: 'ERROR', message: '⚠️ Erro no código: ' + error.message });
  }
};