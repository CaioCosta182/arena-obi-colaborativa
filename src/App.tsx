function App() {
  return (
    <div className="flex h-screen flex-col items-center justify-center p-4">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-blue-600">Arena OBI Colaborativa</h1>
        <p className="mt-2 text-slate-600">Carregando a área de trabalho...</p>
      </header>

      {/* Aqui será injetado o Google Blockly no próximo passo */}
      <main className="w-full max-w-5xl flex-1 rounded-xl border-4 border-slate-200 bg-white shadow-lg">
      </main>
    </div>
  )
}

export default App