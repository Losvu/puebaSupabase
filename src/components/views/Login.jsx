import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FormularioLogin from "../login/FormularioLogin";
import { useAuth } from "../../context/AuthContext";

const Login = () => {
  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);

  const navegar = useNavigate();
  const { login } = useAuth();

  const iniciarSesion = async () => {
    if (!usuario || !contrasena) {
      setError("Por favor ingresa usuario y contraseña");
      return;
    }

    setCargando(true);
    setError(null);

    try {
      await login(usuario, contrasena);
      navegar("/");
    } catch (err) {
      console.error(err);
      setError("Usuario o contraseña incorrectos");
    } finally {
      setCargando(false);
    }
  };

  // Redirigir si ya está logueado
  useEffect(() => {
    const usuarioGuardado = localStorage.getItem("usuario-supabase");
    if (usuarioGuardado) {
      navegar("/");
    }
  }, [navegar]);

  const estiloContenedor = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #FFDEE9, #B5FFFC)",
    overflow: "hidden",
    padding: "20px",
  };

  return (
    <div style={estiloContenedor}>
      <FormularioLogin
        usuario={usuario}
        contrasena={contrasena}
        error={error}
        setUsuario={setUsuario}
        setContrasena={setContrasena}
        iniciarSesion={iniciarSesion}
        cargando={cargando}
      />
    </div>
  );
};

export default Login;