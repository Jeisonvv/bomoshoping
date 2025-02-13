import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'normalize.css'; // Normaliza los estilos globales

import App from './App'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
  
)
