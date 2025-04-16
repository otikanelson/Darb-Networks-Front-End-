// src/main.jsx - Updated to include Bootstrap CSS
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { initializeApp } from './Services/AppInitializer.js'

initializeApp();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)