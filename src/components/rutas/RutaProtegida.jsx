import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import Encabezado from '../navegacion/Encabezado'; // Ajusta la ruta según tu carpeta

const RutaProtegida = () => {
    // 1. Verificamos si existe el usuario en el localStorage
    const usuarioGuardado = localStorage.getItem("usuario-supabase");

    // 2. Si NO hay usuario, redirigimos al login
    if (!usuarioGuardado) {
        return <Navigate to="/login" replace />;
    }

    // 3. Si hay usuario, mostramos el Encabezado y el contenido de la ruta (Outlet)
    return (
        <>
            <Encabezado />
            <div className="container mt-4">
                {/* Outlet renderiza el componente hijo definido en App.jsx */}
                <Outlet />
            </div>
        </>
    );
};

export default RutaProtegida;