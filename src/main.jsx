import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { LangProvider } from './i18n'
import App from './App'
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <LangProvider>
        <App />
      </LangProvider>
    </HashRouter>
  </React.StrictMode>,
)
