import React, { useState, useEffect, useRef } from 'react';
import { type QuestaoOBI } from '../data/obiQuestions';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { salvarResultadoEquipa, type ResultadoEquipa } from '../lib/firebase';

interface AdminProps {
  bancoAtual: QuestaoOBI[];
  onAtualizarBanco: (novoBanco: QuestaoOBI[]) => void;
  onSair: () => void;
}

export default function AdminPanel({ bancoAtual, onAtualizarBanco, onSair }: AdminProps) {
  const [abaAtiva, setAbaAtiva] = useState<'sincronizacao' | 'banco' | 'scanner'>('sincronizacao');
  
  const [urlSync, setUrlSync] = useState('');
  const [questaoEditando, setQuestaoEditando] = useState<QuestaoOBI | null>(null);
  const [mensagemScan, setMensagemScan] = useState<string | null>(null);

  // ==========================================
  // 1. LÓGICA DE IMPORT/EXPORT (INTACTA)
  // ==========================================
  const handleExportar = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(bancoAtual, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = "arena_questoes.json";
    a.click();
  };

  const handleImportar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        onAtualizarBanco(json);
        alert('✅ Banco atualizado com sucesso via Pendrive!');
      } catch (err) {
        alert('❌ Erro ao ler o arquivo JSON.');
      }
    };
    reader.readAsText(file);
  };

  const handleSyncOnline = async () => {
    if (!urlSync) return alert('Cole o link do JSON primeiro!');
    try {
      const response = await fetch(urlSync);
      const json = await response.json();
      onAtualizarBanco(json);
      alert('☁️ Banco atualizado da nuvem com sucesso!');
    } catch (error) {
      alert('❌ Erro ao buscar da nuvem. Verifique a internet e o link.');
    }
  };

  // ==========================================
  // 2. LÓGICA DE EDIÇÃO DO BANCO
  // ==========================================
  const deletarQuestao = (id: string) => {
    if (window.confirm("Tem a certeza que deseja eliminar esta questão?")) {
      const novoBanco = bancoAtual.filter(q => q.id !== id);
      onAtualizarBanco(novoBanco);
    }
  };

  const salvarEdicao = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questaoEditando) return;
    const novoBanco = bancoAtual.map(q => q.id === questaoEditando.id ? questaoEditando : q);
    onAtualizarBanco(novoBanco);
    setQuestaoEditando(null);
    alert('✅ Questão atualizada!');
  };

  // ==========================================
  // 3. LÓGICA DO SCANNER DO FIREBASE (CORRIGIDA PARA REACT 18)
  // ==========================================
  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;
    let timerId: NodeJS.Timeout;

    if (abaAtiva === 'scanner') {
      // O delay garante que a div <div id="reader"> já foi renderizada no DOM
      timerId = setTimeout(() => {
        const elementoReader = document.getElementById("reader");
        if (!elementoReader) return; // Segurança extra

        scanner = new Html5QrcodeScanner("reader", { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          rememberLastUsedCamera: true // Tenta usar a câmara traseira por padrão
        }, false);

        scanner.render(
          async (textoDecodificado) => {
            try {
              if (scanner) scanner.pause();
              const dadosParsed: ResultadoEquipa = JSON.parse(textoDecodificado);
              setMensagemScan(`A processar os dados de ${dadosParsed.p1} e ${dadosParsed.p2}...`);
              
              const sucesso = await salvarResultadoEquipa(dadosParsed);
              
              if (sucesso) {
                  setMensagemScan(`✅ Sucesso! O resultado de ${dadosParsed.p1} e ${dadosParsed.p2} foi sincronizado!`);
              } else {
                  setMensagemScan(`❌ Erro ao gravar na nuvem. Verifique o Firebase.`);
              }

              setTimeout(() => {
                  setMensagemScan(null);
                  if (scanner) scanner.resume();
              }, 3500);

            } catch (e) {
              setMensagemScan("⚠️ Este QR Code não é válido para a Arena.");
              setTimeout(() => { 
                setMensagemScan(null); 
                if (scanner) scanner.resume(); 
              }, 3000);
            }
          },
          (erro) => { /* Silenciar erros de procura de frames vazios */ }
        );
      }, 150); // 150 milissegundos é o suficiente para o React terminar de pintar a tela
    }

    return () => {
      clearTimeout(timerId);
      if (scanner) {
        scanner.clear().catch(erro => console.error("Falha ao desligar câmara", erro));
      }
    };
  }, [abaAtiva]);

  return (
    <div className="flex h-screen w-full bg-slate-900">
      
      {/* MENU LATERAL */}
      <aside className="w-72 bg-slate-800 shadow-2xl flex flex-col p-6 border-r border-slate-700 z-10">
        <h2 className="text-xl font-extrabold text-white mb-8">Menu do Professor</h2>
        
        <div className="flex flex-col gap-3 flex-1">
          <button onClick={() => setAbaAtiva('sincronizacao')} className={`p-4 text-left font-bold rounded-xl transition-all ${abaAtiva === 'sincronizacao' ? 'bg-indigo-600 text-white shadow-lg scale-105' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>🔄 Importação e Nuvem</button>
          <button onClick={() => { setAbaAtiva('banco'); setQuestaoEditando(null); }} className={`p-4 text-left font-bold rounded-xl transition-all ${abaAtiva === 'banco' ? 'bg-indigo-600 text-white shadow-lg scale-105' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>📚 Visualizar Banco <span className="float-right bg-slate-800 px-2 py-0.5 rounded-full text-xs">{bancoAtual.length}</span></button>
          <button onClick={() => setAbaAtiva('scanner')} className={`p-4 text-left font-bold rounded-xl transition-all ${abaAtiva === 'scanner' ? 'bg-indigo-600 text-white shadow-lg scale-105' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>📸 Scanner de Turma</button>
        </div>

        <button onClick={onSair} className="rounded-xl bg-red-600/20 text-red-400 border border-red-500/30 px-4 py-3 font-bold hover:bg-red-600 hover:text-white transition-colors">Sair do Painel</button>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <main className="flex-1 flex items-start justify-center p-10 overflow-y-auto">
        
        {abaAtiva === 'sincronizacao' && (
          <div className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-2xl mt-4">
            <div className="mb-6 flex items-center justify-between border-b pb-4">
              <div><h1 className="text-3xl font-extrabold text-slate-800">Painel do Professor</h1><p className="text-slate-500">Gerenciador de Questões ({bancoAtual.length} cadastradas)</p></div>
            </div>

            <div className="mb-8 rounded-xl bg-slate-50 p-6 border border-slate-200">
              <h2 className="mb-4 text-xl font-bold text-slate-700">🔌 Modo Pendrive (Offline)</h2>
              <div className="flex gap-4">
                <button onClick={handleExportar} className="flex-1 rounded-lg bg-indigo-600 py-3 font-bold text-white shadow hover:bg-indigo-700 cursor-pointer">📥 Baixar JSON</button>
                <label className="flex-1 cursor-pointer rounded-lg bg-emerald-600 py-3 text-center font-bold text-white shadow hover:bg-emerald-700">📤 Importar JSON<input type="file" accept=".json" className="hidden" onChange={handleImportar} /></label>
              </div>
            </div>

            <div className="rounded-xl bg-blue-50 p-6 border border-blue-200">
              <h2 className="mb-4 text-xl font-bold text-blue-900">☁️ Sincronização em Nuvem (Online)</h2>
              <p className="mb-2 text-sm text-blue-700">Atualize todas as máquinas usando um link central (ex: GitHub Raw).</p>
              <div className="flex gap-2">
                <input type="url" placeholder="https://meuservidor.com/questoes.json" value={urlSync} onChange={(e) => setUrlSync(e.target.value)} className="flex-1 rounded-lg border border-blue-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <button onClick={handleSyncOnline} className="rounded-lg bg-blue-600 px-6 font-bold text-white hover:bg-blue-700 cursor-pointer">Sincronizar</button>
              </div>
            </div>
          </div>
        )}

        {abaAtiva === 'banco' && (
          <div className="w-full max-w-4xl rounded-2xl bg-white p-8 shadow-2xl mt-4">
            <h2 className="text-3xl font-extrabold text-slate-800 mb-6 border-b pb-4">Banco de Questões</h2>
            
            {questaoEditando ? (
              <form onSubmit={salvarEdicao} className="flex flex-col gap-4 bg-slate-50 p-6 rounded-xl border border-slate-200">
                <h3 className="text-lg font-bold text-indigo-700 mb-2">Modo de Edição</h3>
                <input type="text" value={questaoEditando.titulo} onChange={e => setQuestaoEditando({...questaoEditando, titulo: e.target.value})} className="border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Título da Questão" required />
                <textarea value={questaoEditando.descricao} onChange={e => setQuestaoEditando({...questaoEditando, descricao: e.target.value})} className="border border-slate-300 p-3 rounded-lg min-h-[120px] focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Descrição e História" required />
                <input type="text" value={questaoEditando.output_esperado} onChange={e => setQuestaoEditando({...questaoEditando, output_esperado: e.target.value})} className="border border-slate-300 p-3 rounded-lg font-mono focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Output Esperado (Juiz)" required />
                <select value={questaoEditando.nivel} onChange={e => setQuestaoEditando({...questaoEditando, nivel: e.target.value as any})} className="border border-slate-300 p-3 rounded-lg font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none">
                  <option value="Iniciação Nível 1">Iniciação Nível 1</option>
                  <option value="Iniciação Nível 2">Iniciação Nível 2</option>
                  <option value="Programação Júnior">Programação Júnior</option>
                </select>
                <div className="flex gap-4 mt-4">
                  <button type="submit" className="flex-1 bg-green-600 text-white py-3 rounded-lg font-bold shadow hover:bg-green-700 cursor-pointer">💾 Salvar Alterações</button>
                  <button type="button" onClick={() => setQuestaoEditando(null)} className="flex-1 bg-slate-400 text-white py-3 rounded-lg font-bold shadow hover:bg-slate-500 cursor-pointer">❌ Cancelar</button>
                </div>
              </form>
            ) : (
              <div className="flex flex-col gap-4 max-h-[65vh] overflow-y-auto pr-2 custom-scrollbar">
                {bancoAtual.length === 0 && <p className="text-center text-slate-500 py-10 font-bold">O banco está vazio. Importe um ficheiro JSON.</p>}
                {bancoAtual.map(q => (
                  <div key={q.id} className="border border-slate-200 p-5 rounded-xl bg-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-indigo-300 transition-colors">
                    <div className="flex-1">
                      <span className="text-xs font-black text-indigo-600 uppercase tracking-wider bg-indigo-100 px-2 py-1 rounded">{q.nivel}</span>
                      <h3 className="font-extrabold text-xl text-slate-800 mt-2">{q.titulo}</h3>
                      <p className="text-sm text-slate-600 mt-1 line-clamp-2">{q.descricao}</p>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                      <button onClick={() => setQuestaoEditando(q)} className="flex-1 md:flex-none bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-bold hover:bg-blue-200 cursor-pointer transition-colors">✏️ Editar</button>
                      <button onClick={() => deletarQuestao(q.id)} className="flex-1 md:flex-none bg-red-100 text-red-700 px-4 py-2 rounded-lg font-bold hover:bg-red-200 cursor-pointer transition-colors">🗑️ Eliminar</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {abaAtiva === 'scanner' && (
          <div className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-2xl mt-4 flex flex-col items-center">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-extrabold text-slate-800 mb-2">Recolha de Resultados</h2>
              <p className="text-slate-600">Aponte a câmara para o ecrã dos alunos para extrair a métrica e enviar ao Telão.</p>
            </div>

            {mensagemScan && (
              <div className={`mb-6 p-4 rounded-xl w-full text-center font-bold text-lg shadow-sm animate-pulse ${mensagemScan.includes('Sucesso') ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-yellow-100 text-yellow-800 border border-yellow-300'}`}>
                {mensagemScan}
              </div>
            )}

            <div className="w-full bg-slate-50 p-4 rounded-3xl shadow-inner border-4 border-slate-200 overflow-hidden min-h-[300px] flex items-center justify-center relative">
              {/* O leitor vai ser montado aqui dentro de forma segura */}
              <div id="reader" className="w-full rounded-xl overflow-hidden"></div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
