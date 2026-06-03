import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../database/supabaseconfig';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [usuario, setUsuario] = useState(null);
    const [permisos, setPermisos] = useState({});
    const [cargando, setCargando] = useState(true);

    // 1. Usamos useCallback para que la función sea estable y no provoque ejecuciones infinitas
    const cargarPermisosDelUsuario = useCallback(async (userEmail, isMounted) => {
        if (!userEmail) return;
        
        try {
            localStorage.setItem("usuario-supabase", userEmail);

            // Consulta 1: Buscar tipo de empleado
            const { data: empleadoData, error: empleadoError } = await supabase
                .from('empleados')
                .select('tipo_empleado')
                .eq('email', userEmail) 
                .maybeSingle();

            if (empleadoError) throw empleadoError;
            if (!isMounted) return; 

            if (empleadoData && empleadoData.tipo_empleado) {
                // Consulta 2: Buscar el mapa JSONB de permisos
                const { data: permisosData, error: permisosError } = await supabase
                    .from('permisos')
                    .select('permisos')
                    .eq('rol', empleadoData.tipo_empleado.trim().toLowerCase()) 
                    .maybeSingle();

                if (permisosError) throw permisosError;

                if (isMounted && permisosData && permisosData.permisos) {
                    // Control estricto: Solo actualizamos si el string JSON cambió
                    setPermisos((prev) => {
                        if (JSON.stringify(prev) === JSON.stringify(permisosData.permisos)) {
                            return prev; // Mismo objeto, evita re-render redundante
                        }
                        return permisosData.permisos;
                    });
                }
            }
        } catch (error) {
            if (error.message?.includes('AbortError') || error.name === 'AbortError') return;
            console.error("Error cargando permisos:", error);
            if (isMounted) setPermisos({});
        }
    }, []);

    useEffect(() => {
        let isMounted = true;

        // La regla de oro con Supabase v2+: onAuthStateChange ya se dispara automáticamente
        // con el estado inicial en el momento en que te suscribes. No hace falta meter un getSession() manual.
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!isMounted) return;

            // Log de control por si necesitas debuggear en la consola
            console.log(`[AuthContext] Evento: ${event}`, session?.user?.email || 'Sin sesión');

            if (session && session.user) {
                // Control estricto del usuario para no romper el estado si es el mismo
                setUsuario((prevUser) => {
                    if (prevUser?.id === session.user.id) return prevUser;
                    return session.user;
                });
                
                await cargarPermisosDelUsuario(session.user.email, isMounted);
            } else {
                setUsuario(null);
                setPermisos({});
                localStorage.removeItem("usuario-supabase");
            }
            
            // Apagamos la carga una vez procesado el evento inicial o cualquier cambio legítimo
            if (isMounted) setCargando(false);
        });

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, [cargarPermisosDelUsuario]);

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
            {cargando ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f8f9fa' }}>
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Cargando...</span>
                    </div>
                </div>
            ) : (
                children
            )}
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