import BlocklyWorkspace from './components/BlocklyWorkspace';

function App() {
  return (
    <div className="flex h-screen flex-col items-center justify-center p-4">
      <header className="mb-4 text-center">
        <h1 className="text-4xl font-bold text-blue-600">Arena OBI Colaborativa</h1>
        <p className="mt-2 text-slate-600">Arraste os blocos para resolver o desafio!</p>
      </header>

      <main className="w-full max-w-5xl flex-1 overflow-hidden rounded-xl border-4 border-slate-200 bg-white shadow-lg">
        <BlocklyWorkspace />
      </main>
    </div>
  )
}

export default App