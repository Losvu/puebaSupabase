import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";

const ModalEliminacionCliente = ({ mostrarModalEliminacion, setMostrarModalEliminacion, cliente, supabase, setToast, cargarClientes }) => {
  const [cargando, setCargando] = useState(false);

  const eliminarCliente = async () => {
    setCargando(true);
    const { error } = await supabase.from("clientes").delete().eq("id_cliente", cliente.id_cliente);
    if (error) {
      setToast({ mostrar: true, mensaje: "No se pudo eliminar el cliente.", tipo: "error" });
    } else {
      setToast({ mostrar: true, mensaje: "Cliente eliminado.", tipo: "exito" });
      cargarClientes();
      setMostrarModalEliminacion(false);
    }
    setCargando(false);
  };

  return (
    <Modal show={mostrarModalEliminacion} onHide={() => setMostrarModalEliminacion(false)} centered>
      <Modal.Header closeButton><Modal.Title>Confirmar Eliminación</Modal.Title></Modal.Header>
      <Modal.Body>
        ¿Estás seguro de que deseas eliminar a <strong>{cliente?.nombre} {cliente?.apellido}</strong>? Esta acción no se puede deshacer.
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setMostrarModalEliminacion(false)}>Cancelar</Button>
        <Button variant="danger" onClick={eliminarCliente} disabled={cargando}>
          {cargando ? "Eliminando..." : "Eliminar Permanentemente"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalEliminacionCliente;