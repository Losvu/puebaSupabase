import React from "react";
import { Navigate } from "react-router-dom";
// IMPORTACIÓN DE TU NUEVO HOOK DE AUTENTICACIÓN
import { useAuth } from "../../context/AuthContext";

const RutaProtegida = ({ children }) => {
  const { usuario, cargando } = useAuth();

  // Mostrar indicador de carga mientras se verifica la sesión en Supabase
  if (cargando) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "80vh" }}
      >
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-3 text-muted">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  // Si hay un usuario cargado en el contexto, le permite ver el componente, si no va al login
  return usuario ? children : <Navigate to="/login" replace />;
};

export default RutaProtegida;