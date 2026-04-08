import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import Encabezado from '../navegacion/Encabezado';

const RutaProtegida = ({ children }) => {
  // Verifica si el usuario está autenticado usando localStorage
  const estaLogueado = !!localStorage.getItem("usuario-supabase");

  // Log para depuración
  console.log("Usuario autenticado:", estaLogueado);

  // Si está autenticado,redirige a la página de login
  return estaLogueado ? children : <Navigate to="/login" replace />;
};

export default RutaProtegida;