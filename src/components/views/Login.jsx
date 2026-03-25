import { Container, Row, Col } from "react-bootstrap";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FormularioLogin from "../productos/FormularioLogin";
import { supabase } from "../database/supabaseconfig";

// 1. Definimos el estilo del fondo fuera del componente para que no se redefine en cada render
const estiloContenedor = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #FFDEE9 0%, #B5FFFC 100%)",
    overflow: "hidden",
    padding: "20px",
};

const Login = () => {
    const [usuario, setUsuario] = useState("");
    const [contrasena, setContrasena] = useState("");
    const [error, setError] = useState(null);
    const navegar = useNavigate();

    useEffect(() => {
        const usuarioGuardado = localStorage.getItem("usuario-supabase");
        if (usuarioGuardado) {
            navegar("/");
        }
    }, [navegar]);

    const iniciarSesion = async () => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: usuario,
                password: contrasena,
            });

            if (error) {
                setError("Usuario o contraseña incorrectos");
                return;
            }

            if (data.user) {
                localStorage.setItem("usuario-supabase", usuario);
                navegar("/");
            }
        } catch (err) {
            setError("Error al conectar con el servidor");
            console.error("Error en la solicitud:", err);
        }
    };

    return (
        // 2. Aplicamos el div con el estilo de fondo
        <div style={estiloContenedor}>
            <Container>
                <Row className="justify-content-center">
                    <Col xs={12} md={6} lg={4} className="d-flex flex-column align-items-center">
                        <h2 className="mb-4 text-dark">
                            <i className="bi-house-fill me-2"></i> Login
                        </h2>
                        
                        <FormularioLogin 
                            usuario={usuario}
                            contrasena={contrasena}
                            error={error}
                            setUsuario={setUsuario}
                            setContrasena={setContrasena}
                            iniciarSesion={iniciarSesion}
                        />
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default Login;