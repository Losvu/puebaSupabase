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
                // CORRECCIÓN: Ahora pasamos también el email
                await cargarPermisosDelUsuario(session.user.id, session.user.email);
            }
            setCargando(false);
        };

        obtenerSesionInicial();

        // Escuchar cambios en el estado de autenticación (Login / Logout)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session) {
                setUsuario(session.user);
                // CORRECCIÓN: Ahora pasamos también el email
                await cargarPermisosDelUsuario(session.user.id, session.user.email);
            } else {
                setUsuario(null);
                setPermisos({});
                localStorage.removeItem("usuario-supabase");
            }
            setCargando(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    // Función interna para buscar el tipo de empleado y descargar su mapa de permisos JSONB de Supabase
    const cargarPermisosDelUsuario = async (userId, userEmail) => {
        try {
            // Guardamos el correo en el localStorage tal y como lo requiere tu sistema/guía
            localStorage.setItem("usuario-supabase", userEmail);

            // Buscamos en 'empleados' usando 'tipo_empleado' en lugar de 'rol'
            const { data: empleadoData, error: empleadoError } = await supabase
                .from('empleados')
                .select('tipo_empleado')
                .eq('id_auth', userId) 
                .single();

            if (empleadoError) throw empleadoError;

            // Si encontramos el empleado y tiene asignado un tipo_empleado
            if (empleadoData && empleadoData.tipo_empleado) {
                
                // Buscamos los permisos de ese tipo de empleado en la tabla 'permisos'
                const { data: permisosData, error: permisosError } = await supabase
                    .from('permisos')
                    .select('permisos')
                    // Comparamos el rol de la tabla permisos con el tipo_empleado obtenido
                    .eq('rol', empleadoData.tipo_empleado.toLowerCase()) 
                    .single();

                if (permisosError) throw permisosError;

                if (permisosData) {
                    // Guardamos el objeto JSON con los booleanos (ver_inicio, ver_productos, etc.)
                    setPermisos(permisosData.permisos);
                }
            }
        } catch (error) {
            console.error("Error cargando el tipo_empleado/permisos en AuthContext:", error);
            // Si hay error, limpiamos los permisos por seguridad
            setPermisos({});
        }
    };

    // Función mágica que te pide el punto 9 de tu guía
    const tienePermiso = (nombrePermiso) => {
        // Si no hay permisos cargados aún, denegar por defecto
        if (!permisos) return false;
        // Retorna verdadero si el permiso existe y está marcado como true
        return !!permisos[nombrePermiso];
    };

    // CORRECCIÓN: Función de inicio de sesión agregada
    const login = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });
        
        if (error) throw error;
        return data;
    };

    // Función de cierre de sesión
    const logout = async () => {
        await supabase.auth.signOut();
    };

    // CORRECCIÓN: Agregando 'login' al contexto de retorno
    return (
        <AuthContext.Provider value={{ usuario, permisos, tienePermiso, login, logout }}>
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