import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Note: StrictMode removed to avoid Leaflet double-mount issues in development.
// Leaflet's imperative DOM manipulation is incompatible with React 18 StrictMode
// double-invocation of effects in development mode.
createRoot(document.getElementById('root')).render(<App />)
