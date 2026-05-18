import { supabase } from "../database/supabaseconfig";
import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Spinner, Alert } from "react-bootstrap";

// Importación de componentes adaptados (debes crearlos siguiendo esta lógica)
import ModalRegistroCliente from "../clientes/ModalRegistroCliente";
import NotificacionOperacion from "../NotificacionOperacion";
import TablaClientes from "../clientes/TablaClientes";
import TarjetaCliente from "../clientes/TarjetaCliente";
import ModalEdicionCliente from "../clientes/ModalEdicionCliente";
import ModalEliminacionCliente from "../clientes/ModalEliminacionCliente";

import CuadroBusquedas from "../busquedas/CuadroBusquedas";
import Paginacion from "../ordenamiento/paginacion";

const Clientes = () => {
  const [toast, setToast] = useState({ mostrar: false, mensaje: "", tipo: "" });
  const [mostrarModal, setMostrarModal] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarModalEliminacion, setMostrarModalEliminacion] = useState(false);
  const [clienteAEliminar, setClienteAEliminar] = useState(null);
  const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);

  const [textoBusqueda, setTextoBusqueda] = useState("");
  const [clientesFiltrados, setClientesFiltrados] = useState([]);
  const [registrosPorPagina, establecerRegistrosPorPagina] = useState(5);
  const [paginaActual, establecerPaginaActual] = useState(1);

  // Estado para nuevo cliente (Siguiendo tu esquema de BD)
  const [nuevoCliente, setNuevoCliente] = useState({
    nombre: "",
    apellido: "",
    celular: "",
  });

  // Estado para editar cliente
  const [clienteEditar, setClienteEditar] = useState({
    id_cliente: "",
    nombre: "",
    apellido: "",
    celular: "",
  });

  const clientesPaginados = clientesFiltrados.slice(
    (paginaActual - 1) * registrosPorPagina,
    paginaActual * registrosPorPagina
  );

  useEffect(() => {
    cargarClientes();
  }, []);

  useEffect(() => {
    if (!textoBusqueda.trim()) {
      setClientesFiltrados(clientes);
    } else {
      const textoLower = textoBusqueda.toLowerCase().trim();
      const filtrados = clientes.filter(
        (cli) =>
          cli.nombre.toLowerCase().includes(textoLower) ||
          cli.apellido.toLowerCase().includes(textoLower) ||
          cli.celular.includes(textoLower)
      );
      setClientesFiltrados(filtrados);
    }
  }, [textoBusqueda, clientes]);

  const manejarBusqueda = (e) => {
    setTextoBusqueda(e.target.value);
    establecerPaginaActual(1); // Reiniciar a página 1 al buscar
  };

  const cargarClientes = async () => {
    try {
      setCargando(true);
      const { data, error } = await supabase
        .from("clientes")
        .select("*")
        .order("id_cliente", { ascending: true });

      if (error) {
        console.error("Error al cargar clientes:", error.message);
        setToast({ mostrar: true, mensaje: "Error al cargar clientes.", tipo: "error" });
        return;
      }
      setClientes(data || []);
    } catch (err) {
      console.error("Excepción al cargar clientes:", err.message);
      setToast({ mostrar: true, mensaje: "Error inesperado.", tipo: "error" });
    } finally {
      setCargando(false);
    }
  };

  const abrirModalEdicion = (cliente) => {
    setClienteEditar({
      id_cliente: cliente.id_cliente,
      nombre: cliente.nombre,
      apellido: cliente.apellido,
      celular: cliente.celular,
    });
    setMostrarModalEdicion(true);
  };

  const abrirModalEliminacion = (cliente) => {
    setClienteAEliminar(cliente);
    setMostrarModalEliminacion(true);
  };

  const manejoCambioInput = (e) => {
    const { name, value } = e.target;
    setNuevoCliente((prev) => ({ ...prev, [name]: value }));
  };

  const agregarCliente = async () => {
    try {
      if (!nuevoCliente.nombre.trim() || !nuevoCliente.apellido.trim() || !nuevoCliente.celular.trim()) {
        setToast({ mostrar: true, mensaje: "Todos los campos son obligatorios.", tipo: "advertencia" });
        return;
      }

      const { error } = await supabase.from("clientes").insert([
        {
          nombre: nuevoCliente.nombre,
          apellido: nuevoCliente.apellido,
          celular: nuevoCliente.celular,
        },
      ]);

      if (error) {
        setToast({ mostrar: true, mensaje: "Error al registrar cliente.", tipo: "error" });
        return;
      }

      setToast({
        mostrar: true,
        mensaje: `Cliente "${nuevoCliente.nombre}" registrado con éxito.`,
        tipo: "exito",
      });
      setNuevoCliente({ nombre: "", apellido: "", celular: "" });
      setMostrarModal(false);
      cargarClientes();
    } catch (err) {
      setToast({ mostrar: true, mensaje: "Error inesperado al registrar.", tipo: "error" });
    }
  };

  return (
    <Container className="pt-5 mt-5">
      <Row className="align-items-center mb-3">
        <Col xs={9} sm={7} md={7} lg={7} className="d-flex align-items-center">
          <h3 className="mb-0">
            <i className="bi bi-people-fill me-2"></i> Clientes
          </h3>
        </Col>
        <Col xs={3} sm={5} md={5} lg={5} className="text-end">
          <Button onClick={() => setMostrarModal(true)} size="md" variant="primary">
            <i className="bi bi-person-plus-fill"></i>
            <span className="d-none d-sm-inline ms-2">Nuevo Cliente</span>
          </Button>
        </Col>
      </Row>

      <hr />

      <Row className="mb-4">
        <Col md={6} lg={5}>
          <CuadroBusquedas
            textoBusqueda={textoBusqueda}
            manejarCambioBusqueda={manejarBusqueda}
            placeholder="Buscar por nombre, apellido o celular..."
          />
        </Col>
      </Row>

      {!cargando && textoBusqueda.trim() && clientesFiltrados.length === 0 && (
        <Alert variant="info" className="text-center">
          No se encontraron clientes que coincidan con "{textoBusqueda}".
        </Alert>
      )}

      {cargando && (
        <div className="text-center my-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-muted">Cargando clientes...</p>
        </div>
      )}

      {!cargando && clientesFiltrados.length > 0 && (
        <Row>
          <Col xs={12} className="d-lg-none">
            <TarjetaCliente
              clientes={clientesPaginados}
              abrirModalEdicion={abrirModalEdicion}
              abrirModalEliminacion={abrirModalEliminacion}
            />
          </Col>
          <Col lg={12} className="d-none d-lg-block">
            <TablaClientes
              clientes={clientesPaginados}
              abrirModalEdicion={abrirModalEdicion}
              abrirModalEliminacion={abrirModalEliminacion}
            />
          </Col>
        </Row>
      )}

      <ModalRegistroCliente
        mostrarModal={mostrarModal}
        setMostrarModal={setMostrarModal}
        nuevoCliente={nuevoCliente}
        manejoCambioInput={manejoCambioInput}
        agregarCliente={agregarCliente}
      />

      <ModalEdicionCliente
        mostrarModalEdicion={mostrarModalEdicion}
        setMostrarModalEdicion={setMostrarModalEdicion}
        clienteEditar={clienteEditar}
        setClienteEditar={setClienteEditar}
        setToast={setToast}
        supabase={supabase}
        cargarClientes={cargarClientes}
      />

      <ModalEliminacionCliente
        mostrarModalEliminacion={mostrarModalEliminacion}
        setMostrarModalEliminacion={setMostrarModalEliminacion}
        cliente={clienteAEliminar}
        supabase={supabase}
        setToast={setToast}
        cargarClientes={cargarClientes}
      />

      {clientesFiltrados.length > 0 && (
        <Paginacion
          registrosPorPagina={registrosPorPagina}
          totalRegistros={clientesFiltrados.length}
          paginaActual={paginaActual}
          establecerPaginaActual={establecerPaginaActual}
          establecerRegistrosPorPagina={establecerRegistrosPorPagina}
        />
      )}

      <NotificacionOperacion
        mostrar={toast.mostrar}
        mensaje={toast.mensaje}
        tipo={toast.tipo}
        onCerrar={() => setToast({ ...toast, mostrar: false })}
      />
    </Container>
  );
};

export default Clientes;