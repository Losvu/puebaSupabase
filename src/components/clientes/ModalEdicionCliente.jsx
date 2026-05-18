import React, { useState } from "react";
import { Modal, Form, Button } from "react-bootstrap";

const ModalEdicionCliente = ({ mostrarModalEdicion, setMostrarModalEdicion, clienteEditar, setClienteEditar, setToast, supabase, cargarClientes }) => {
  const [cargando, setCargando] = useState(false);

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setClienteEditar({ ...clienteEditar, [name]: value });
  };

  const actualizarCliente = async () => {
    setCargando(true);
    const { error } = await supabase
      .from("clientes")
      .update({ nombre: clienteEditar.nombre, apellido: clienteEditar.apellido, celular: clienteEditar.celular })
      .eq("id_cliente", clienteEditar.id_cliente);

    if (error) {
      setToast({ mostrar: true, mensaje: "Error al actualizar.", tipo: "error" });
    } else {
      setToast({ mostrar: true, mensaje: "Cliente actualizado con éxito.", tipo: "exito" });
      setMostrarModalEdicion(false);
      cargarClientes();
    }
    setCargando(false);
  };

  return (
    <Modal show={mostrarModalEdicion} onHide={() => setMostrarModalEdicion(false)} centered>
      <Modal.Header closeButton><Modal.Title>Editar Cliente</Modal.Title></Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3"><Form.Label>Nombre</Form.Label>
            <Form.Control name="nombre" value={clienteEditar.nombre} onChange={manejarCambio} />
          </Form.Group>
          <Form.Group className="mb-3"><Form.Label>Apellido</Form.Label>
            <Form.Control name="apellido" value={clienteEditar.apellido} onChange={manejarCambio} />
          </Form.Group>
          <Form.Group className="mb-3"><Form.Label>Celular</Form.Label>
            <Form.Control name="celular" value={clienteEditar.celular} onChange={manejarCambio} />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setMostrarModalEdicion(false)}>Cancelar</Button>
        <Button variant="primary" onClick={actualizarCliente} disabled={cargando}>
          {cargando ? "Actualizando..." : "Guardar Cambios"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalEdicionCliente;