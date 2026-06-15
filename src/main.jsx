import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css';
import './index.css'
import App from './App.jsx'

// Limpieza de emergencia: Destrabar sesiones expiradas de Supabase
// Se ejecuta antes de que React monte la aplicación.
if (typeof window !== 'undefined') {
  Object.keys(localStorage).forEach(key => {
    // Busca específicamente las llaves de autenticación de Supabase
    if (key.startsWith('sb-') && key.endsWith('-auth-token')) {
      try {
        const token = JSON.parse(localStorage.getItem(key));
        // Si el token existe pero ya expiró (la fecha actual es mayor a expires_at)
        if (token && token.expires_at && token.expires_at < (Date.now() / 1000)) {
           console.warn("Token de Supabase expirado detectado. Limpiando sesión...");
           localStorage.removeItem(key);
        }
      } catch(e) {
        // Ignoramos silenciosamente si algo no se pudo parsear
      }
    }
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)