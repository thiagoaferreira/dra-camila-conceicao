/* Entry da pagina /consultas. O nome NAO pode ser consultas.tsx: o disco do macOS ignora
   maiusculas e o arquivo colidiria com o componente Consultas.tsx. */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Consultas from './Consultas.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Consultas />
  </StrictMode>,
)
