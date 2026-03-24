import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, Nav, Navbar, Offcanvas } from 'react-bootstrap';
import { supabase } from "../../database/supabaseconfig";

// Asegúrate de que la ruta a tu logo sea correcta
import logo from "../../assets/react.svg"; 

const Encabezado = () => {
    const [mostrarMenu, setMostrarMenu] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Handlers
    const manejarToggle = () => setMostrarMenu(!mostrarMenu);

    const manejarNavegacion = (ruta) => {
        navigate(ruta);
        setMostrarMenu(false);
    };

    const cerrarSesion = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;

            localStorage.removeItem("usuario-supabase");
            setMostrarMenu(false);
            navigate("/login");
        } catch (err) {
            console.error("Error cerrando sesión:", err.message);
        }
    };

    // Lógica para detectar rutas y permisos
    const esLogin = location.pathname === "/login";
    const esCatalogo = location.pathname === "/catalogo" && localStorage.getItem("usuario-supabase") === null;

    // Definición del contenido del menú según el contexto
    let contenidoMenu;

    if (esLogin) {
        contenidoMenu = (
            <Nav className="ms-auto pe-2">
                <Nav.Link
                    onClick={() => manejarNavegacion("/login")}
                    className={mostrarMenu ? "color-texto-marca" : "text-white"}
                >
                    <i className="bi-person-fill-lock me-2"></i> Iniciar sesión
                </Nav.Link>
            </Nav>
        );
    } else if (esCatalogo) {
        contenidoMenu = (
            <Nav className="ms-auto pe-2">
                <Nav.Link
                    onClick={() => manejarNavegacion("/catalogo")}
                    className={mostrarMenu ? "color-texto-marca" : "text-white"}
                >
                    <i className="bi-images me-2"></i> <strong>Catálogo</strong>
                </Nav.Link>
            </Nav>
        );
    } else {
        // Menú para usuarios autenticados
        contenidoMenu = (
            <>
                <Nav className="ms-auto pe-2">
                    <Nav.Link
                        onClick={() => manejarNavegacion("/")}
                        className={mostrarMenu ? "color-texto-marca" : "text-white"}
                    >
                        {mostrarMenu && <i className="bi-house-fill me-2"></i>}
                        <strong>Inicio</strong>
                    </Nav.Link>

                    <Nav.Link
                        onClick={() => manejarNavegacion("/categorias")}
                        className={mostrarMenu ? "color-texto-marca" : "text-white"}
                    >
                        {mostrarMenu && <i className="bi-bookmark-fill me-2"></i>}
                        <strong>Categorías</strong>
                    </Nav.Link>

                    <Nav.Link
                        onClick={() => manejarNavegacion("/productos")}
                        className={mostrarMenu ? "color-texto-marca" : "text-white"}
                    >
                        {mostrarMenu && <i className="bi-bag-heart-fill me-2"></i>}
                        <strong>Productos</strong>
                    </Nav.Link>

                    <Nav.Link
                        onClick={() => manejarNavegacion("/catalogo")}
                        className={mostrarMenu ? "color-texto-marca" : "text-white"}
                    >
                        {mostrarMenu && <i className="bi-images me-2"></i>}
                        <strong>Catálogo</strong>
                    </Nav.Link>

                    <hr className="text-white d-md-none" />

                    {/* Ícono de cerrar sesión rápido (solo visible si el menú está cerrado) */}
                    {!mostrarMenu && (
                        <Nav.Link onClick={cerrarSesion} className="text-white">
                            <i className="bi-box-arrow-right me-2"></i>
                        </Nav.Link>
                    )}
                </Nav>

                {/* Info de usuario dentro del Offcanvas (solo si mostrarMenu es true) */}
                {mostrarMenu && (
                    <div className="mt-3 p-3 rounded bg-light text-dark">
                        <p className="mb-2 text-truncate">
                            <i className="bi-envelope-fill me-2"></i>
                            {localStorage.getItem("usuario-supabase")?.toLowerCase() || "Usuario"}
                        </p>
                        <button
                            className="btn btn-outline-danger mt-3 w-100"
                            onClick={cerrarSesion}
                        >
                            <i className="bi-box-arrow-right me-2"></i> Cerrar sesión
                        </button>
                    </div>
                )}
            </>
        );
    }

    return (
        <Navbar expand="md" fixed="top" className="color-navbar shadow-lg" variant="dark">
            <Container>
                <Navbar.Brand
                    onClick={() => manejarNavegacion(esCatalogo ? "/catalogo" : "/")}
                    className="text-white fw-bold d-flex align-items-center"
                    style={{ cursor: "pointer" }}
                >
                    <img
                        alt="Logo"
                        src={logo}
                        width="45"
                        height="45"
                        className="d-inline-block me-2"
                    />
                    <h4 className="mb-0">Discosa</h4>
                </Navbar.Brand>

                {/* Botón del menú (Toggle) - Se oculta en el login */}
                {!esLogin && (
                    <Navbar.Toggle
                        aria-controls="menu-offcanvas"
                        onClick={manejarToggle}
                    />
                )}

                <Navbar.Offcanvas
                    id="menu-offcanvas"
                    placement="end"
                    show={mostrarMenu}
                    onHide={() => setMostrarMenu(false)}
                >
                    <Offcanvas.Header closeButton>
                        <Offcanvas.Title>Menú Discosa</Offcanvas.Title>
                    </Offcanvas.Header>
                    <Offcanvas.Body>
                        {contenidoMenu}
                    </Offcanvas.Body>
                </Navbar.Offcanvas>
            </Container>
        </Navbar>
    );
};

export default Encabezado;