import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// React.StrictMode removido para evitar duplicação de eventos no Google Blockly (Fix da Engrenagem)
createRoot(document.getElementById('root')!).render(
  <App />
)
