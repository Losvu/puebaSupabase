import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../database/supabaseconfig';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [usuario, setUsuario] = useState(null);
    const [permisos, setPermisos] = useState({});
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        // Bandera mágica para controlar la estabilidad
        let isMounted = true; 

        const inicializarAuth = async () => {
            try {
                // 1. Obtener la sesión actual de golpe
                const { data: { session } } = await supabase.auth.getSession();
                
                if (!isMounted) return;

                if (session && session.user) {
                    setUsuario(session.user);
                    // Cargamos los permisos pasando la bandera de control
                    await cargarPermisosDelUsuario(session.user.email, isMounted);
                } else {
                    setUsuario(null);
                    setPermisos({});
                }
            } catch (error) {
                console.error("Error inicializando auth:", error);
            } finally {
                if (isMounted) setCargando(false);
            }
        };

        inicializarAuth();

        // 2. Escuchar cambios de sesión reales (Login / Logout / Token refrescado)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!isMounted) return;

            if (session && session.user) {
                setUsuario(session.user);
                await cargarPermisosDelUsuario(session.user.email, isMounted);
            } else {
                setUsuario(null);
                setPermisos({});
                localStorage.removeItem("usuario-supabase");
            }
            setCargando(false);
        });

        // Limpieza: cuando React destruye/remonta el componente, desactivamos la bandera
        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, []);

    // Pasamos 'isMounted' para asegurarnos de no actualizar estados si el componente mutó
    const cargarPermisosDelUsuario = async (userEmail, isMounted = true) => {
        if (!userEmail) return;
        
        try {
            localStorage.setItem("usuario-supabase", userEmail);

            // Consulta 1: Buscar empleado
            const { data: empleadoData, error: empleadoError } = await supabase
                .from('empleados')
                .select('tipo_empleado')
                .eq('email', userEmail) 
                .maybeSingle();

            if (empleadoError) throw empleadoError;

            // Si el componente se desmontó en medio de la consulta de red, frenamos aquí
            if (!isMounted) return; 

            if (empleadoData && empleadoData.tipo_empleado) {
                // Consulta 2: Buscar sus permisos por rol
                const { data: permisosData, error: permisosError } = await supabase
                    .from('permisos')
                    .select('permisos')
                    .eq('rol', empleadoData.tipo_empleado.trim().toLowerCase()) 
                    .maybeSingle();

                if (permisosError) throw permisosError;

                // Si todo está en orden y el componente sigue vivo, guardamos
                if (isMounted && permisosData && permisosData.permisos) {
                    setPermisos(permisosData.permisos);
                }
            }
        } catch (error) {
            // Ignoramos los AbortError silenciosos de la consola para mantenerla limpia
            if (error.message?.includes('AbortError') || error.name === 'AbortError') return;
            
            console.error("Error en base de datos cargando permisos:", error);
            if (isMounted) setPermisos({});
        }
    };

    const tienePermiso = (nombrePermiso) => {
        if (!permisos) return false;
        return !!permisos[nombrePermiso];
    };

    const login = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        return data;
    };

    const logout = async () => {
        await supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider value={{ usuario, permisos, tienePermiso, login, logout }}>
            {!cargando && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth debe ser utilizado dentro de un AuthProvider");
    }
    return context;
};