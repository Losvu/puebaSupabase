import React, { useEffect, useState } from "react";
import { Container, Row, Col, Button, Spinner, Alert } from "react-bootstrap";
import { supabase } from "../database/supabaseconfig";
import NotificacionOperacion from "../NotificacionOperacion";
import CuadroBusquedas from "../busquedas/CuadroBusquedas";
import TablaPermisos from "../permisos/TablaPermisos";
import TarjetaPermisos from "../permisos/TarjetaPermisos";
import ModalEdicionPermisos from "../permisos/ModalEdicionPermisos";

const Permisos = () => {
  const [roles, setRoles] = useState([]);
  const [rolesFiltrados, setRolesFiltrados] = useState([]);
  const [textoBusqueda, setTextoBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);
  const [rolEditar, setRolEditar] = useState(null);
  const [toast, setToast] = useState({ mostrar: false, mensaje: "", tipo: "" });

  const cargarRoles = async () => {
    try {
      setCargando(true);
      const { data, error } = await supabase
        .from("permisos")
        .select("*")
        .order("rol", { ascending: true });

      if (error) throw error;

      setRoles(data || []);
      setRolesFiltrados(data || []);
    } catch (err) {
      setToast({ mostrar: true, mensaje: "Error al cargar permisos", tipo: "error" });
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarRoles();
  }, []);

  // Filtrado
  useEffect(() => {
    if (!textoBusqueda.trim()) {
      setRolesFiltrados(roles);
    } else {
      const texto = textoBusqueda.toLowerCase();
      const filtrados = roles.filter(r => 
        r.rol.toLowerCase().includes(texto) || 
        (r.descripcion || "").toLowerCase().includes(texto)
      );
      setRolesFiltrados(filtrados);
    }
  }, [textoBusqueda, roles]);

  const abrirModalEdicion = (rol) => {
    setRolEditar({ ...rol });
    setMostrarModalEdicion(true);
  };

  const actualizarPermisos = async () => {
    if (!rolEditar) return;

    try {
      const { error } = await supabase
        .from("permisos")
        .update({ permisos: rolEditar.permisos })
        .eq("id_permiso", rolEditar.id_permiso);

      if (error) throw error;

      await cargarRoles();
      setMostrarModalEdicion(false);
      setToast({
        mostrar: true,
        mensaje: `Permisos de ${rolEditar.rol} actualizados correctamente`,
        tipo: "exito"
      });
    } catch (err) {
      setToast({ mostrar: true, mensaje: "Error al actualizar permisos", tipo: "error" });
    }
  };

  return (
    <Container className="mt-3">
      <Row className="align-items-center mb-3">
        <Col>
          <h3><i className="bi bi-shield-lock-fill me-2"></i>Gestión de Permisos</h3>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={6}>
          <CuadroBusquedas
            textoBusqueda={textoBusqueda}
            manejarCambioBusqueda={(e) => setTextoBusqueda(e.target.value)}
          />
        </Col>
      </Row>

      {cargando ? (
        <Row className="text-center my-5">
          <Col>
            <Spinner animation="border" variant="primary" />
            <p className="mt-3">Cargando permisos...</p>
          </Col>
        </Row>
      ) : (
        <Row>
          <Col xs={12} className="d-lg-none">
            <TarjetaPermisos 
              roles={rolesFiltrados} 
              abrirModalEdicion={abrirModalEdicion} 
            />
          </Col>
          <Col lg={12} className="d-none d-lg-block">
            <TablaPermisos 
              roles={rolesFiltrados} 
              abrirModalEdicion={abrirModalEdicion} 
            />
          </Col>
        </Row>
      )}

      <ModalEdicionPermisos
        mostrar={mostrarModalEdicion}
        setMostrar={setMostrarModalEdicion}
        rolEditar={rolEditar}
        setRolEditar={setRolEditar}
        guardarCambios={actualizarPermisos}
      />

      <NotificacionOperacion
        mostrar={toast.mostrar}
        mensaje={toast.mensaje}
        tipo={toast.tipo}
        onCerrar={() => setToast({ ...toast, mostrar: false })}
      />
    </Container>
  );
};

export default Permisos;