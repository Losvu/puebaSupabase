import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../database/supabaseconfig';

// 1. Crear el contexto independiente
const AuthContext = createContext();

// 2. Crear el Proveedor (Provider) que envolverá la aplicación
export const AuthProvider = ({ children }) => {
    const [usuario, setUsuario] = useState(null);
    const [permisos, setPermisos] = useState({});
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        // Comprobar si hay una sesión activa al cargar la app
        const obtenerSesionInicial = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                setUsuario(session.user);
                await cargarPermisosDelUsuario(session.user.id);
            }
            setCargando(false);
        };

        obtenerSesionInicial();

        // Escuchar cambios en el estado de autenticación (Login / Logout)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session) {
                setUsuario(session.user);
                await cargarPermisosDelUsuario(session.user.id);
            } else {
                setUsuario(null);
                setPermisos({});
                localStorage.removeItem("usuario-supabase");
            }
            setCargando(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    // Función para buscar en Supabase qué permisos tiene el rol del usuario actual
    const cargarPermisosDelUsuario = async (userId) => {
        try {
            // Nota: Aquí se asume que tienes una tabla de 'perfiles' o 'empleados' 
            // que relaciona al userId con su 'rol'. Cambia esto según tu base de datos.
            const { data: usuarioData, error: userError } = await supabase
                .from('empleados') 
                .select('rol, correo')
                .eq('id_auth', userId) // O el campo con el que enlaces a Supabase Auth
                .single();

            if (usuarioData && usuarioData.rol) {
                // Guardar correo en localStorage como pide tu guía
                localStorage.setItem("usuario-supabase", usuarioData.correo);

                // Buscar los permisos de ese rol en la tabla que creaste en el punto 5
                const { data: permisosData, error: permError } = await supabase
                    .from('permisos')
                    .select('permisos')
                    .eq('rol', usuarioData.rol.toLowerCase())
                    .single();

                if (permisosData) {
                    setPermisos(permisosData.permisos);
                }
            }
        } catch (error) {
            console.error("Error al cargar los permisos del contexto:", error);
        }
    };

    // Función mágica que te pide el punto 9 de tu guía
    const tienePermiso = (nombrePermiso) => {
        // Si no hay permisos cargados aún, denegar por defecto
        if (!permisos) return false;
        // Retorna verdadero si el permiso existe y está marcado como true
        return !!permisos[nombrePermiso];
    };

    // Función de cierre de sesión
    const logout = async () => {
        await supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider value={{ usuario, permisos, tienePermiso, logout }}>
            {!cargando && children}
        </AuthContext.Provider>
    );
};

// 3. Crear el Hook personalizado para usarlo fácilmente (Punto 6 y 7 de tu guía)
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth debe ser utilizado dentro de un AuthProvider");
    }
    return context;
};