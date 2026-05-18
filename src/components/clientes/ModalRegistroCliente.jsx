import React, { useState } from "react";
import { Modal, Form, Button } from "react-bootstrap";

const ModalRegistroCliente = ({
  mostrarModal,
  setMostrarModal,
  nuevoCliente,
  manejoCambioInput,
  agregarCliente,
}) => {
  const [deshabilitado, setDeshabilitado] = useState(false);

  const handleRegistrar = async () => {
    if (deshabilitado) return;
    setDeshabilitado(true);
    await agregarCliente();
    setDeshabilitado(false);
  };

  const formularioInvalido = !nuevoCliente.nombre.trim() || !nuevoCliente.apellido.trim() || !nuevoCliente.celular.trim();

  return (
    <Modal show={mostrarModal} onHide={() => setMostrarModal(false)} backdrop="static" keyboard={false} centered>
      <Modal.Header closeButton>
        <Modal.Title><i className="bi bi-person-plus me-2"></i>Registrar Cliente</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Nombre</Form.Label>
            <Form.Control type="text" name="nombre" value={nuevoCliente.nombre} onChange={manejoCambioInput} placeholder="Ej: Juan" />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Apellido</Form.Label>
            <Form.Control type="text" name="apellido" value={nuevoCliente.apellido} onChange={manejoCambioInput} placeholder="Ej: Pérez" />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Celular / Teléfono</Form.Label>
            <Form.Control type="text" name="celular" value={nuevoCliente.celular} onChange={manejoCambioInput} placeholder="Ej: 88888888" />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setMostrarModal(false)}>Cancelar</Button>
        <Button variant="primary" onClick={handleRegistrar} disabled={formularioInvalido || deshabilitado}>
          {deshabilitado ? "Guardando..." : "Guardar Cliente"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalRegistroCliente;