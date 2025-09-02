// client/src/main.jsx (Updated)
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { ThemeProvider } from './components/theme-provider' // <-- IMPORT
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme"> {/* <-- WRAPPER */}
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
)