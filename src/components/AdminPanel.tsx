import React, { useState } from 'react';
import { type QuestaoOBI, type NivelOBI } from '../data/obiQuestions';

interface AdminProps {
  bancoAtual: QuestaoOBI[];
  onAtualizarBanco: (novoBanco: QuestaoOBI[]) => void;
  onSair: () => void;
}

export default function AdminPanel({ bancoAtual, onAtualizarBanco, onSair }: AdminProps) {
  const [urlSync, setUrlSync] = useState('');

  // 1. Exportar para Pendrive (Offline)
  const handleExportar = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(bancoAtual, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = "arena_questoes.json";
    a.click();
  };

  // 2. Importar do Pendrive (Offline)
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

  // 3. Sincronizar da Nuvem (Online)
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

  return (
    <div className="flex h-screen items-center justify-center bg-slate-800 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-2xl">
        <div className="mb-6 flex items-center justify-between border-b pb-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800">Painel do Professor</h1>
            <p className="text-slate-500">Gerenciador de Questões ({bancoAtual.length} cadastradas)</p>
          </div>
          <button onClick={onSair} className="rounded-lg bg-slate-200 px-4 py-2 font-bold text-slate-700 hover:bg-slate-300">Sair</button>
        </div>

        {/* Módulo Offline */}
        <div className="mb-8 rounded-xl bg-slate-50 p-6 border border-slate-200">
          <h2 className="mb-4 text-xl font-bold text-slate-700">🔌 Modo Pendrive (Offline)</h2>
          <div className="flex gap-4">
            <button onClick={handleExportar} className="flex-1 rounded-lg bg-indigo-600 py-3 font-bold text-white shadow hover:bg-indigo-700">
              📥 Baixar JSON
            </button>
            <label className="flex-1 cursor-pointer rounded-lg bg-emerald-600 py-3 text-center font-bold text-white shadow hover:bg-emerald-700">
              📤 Importar JSON
              <input type="file" accept=".json" className="hidden" onChange={handleImportar} />
            </label>
          </div>
        </div>

        {/* Módulo Online */}
        <div className="rounded-xl bg-blue-50 p-6 border border-blue-200">
          <h2 className="mb-4 text-xl font-bold text-blue-900">☁️ Sincronização em Nuvem (Online)</h2>
          <p className="mb-2 text-sm text-blue-700">Atualize todas as máquinas usando um link central (ex: GitHub Raw).</p>
          <div className="flex gap-2">
            <input 
              type="url" 
              placeholder="https://meuservidor.com/questoes.json" 
              value={urlSync}
              onChange={(e) => setUrlSync(e.target.value)}
              className="flex-1 rounded-lg border border-blue-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button onClick={handleSyncOnline} className="rounded-lg bg-blue-600 px-6 font-bold text-white hover:bg-blue-700">
              Sincronizar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
