import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";

const ModalEliminacionProducto = ({
  mostrarModalEliminacion,
  setMostrarModalEliminacion,
  eliminarProducto, // Esta es la función que viene del padre
  productoEliminar, // Esta es la prop con los datos
  supabase,
  setToast,
  cargarProductos,
}) => {
const [deshabilitado, setDeshabilitado] = useState(false);

const handleEliminarProducto = async () => {
    if (deshabilitado) return;
    setDeshabilitado(true);
    await eliminarProducto(); // Función que hace la petición DELETE
    setDeshabilitado(false);
};

return (
    <Modal
        show={mostrarModalEliminacion}
        onHide={() => setMostrarModalEliminacion(false)}
        centered
        backdrop="static"
    >
        <Modal.Header closeButton>
            <Modal.Title>Confirmar Eliminación</Modal.Title>
        </Modal.Header>

        <Modal.Body>
            ¿Estás seguro de que deseas eliminar el producto: 
            <strong> {productoEliminar?.nombre_producto}</strong>?
            <br />
            <small className="text-danger">Esta acción no se puede deshacer.</small>
        </Modal.Body>

        <Modal.Footer>
            <Button 
                variant="secondary" 
                onClick={() => setMostrarModalEliminacion(false)}
                disabled={deshabilitado}
            >
                Cancelar
            </Button>
            <Button 
                variant="danger" 
                onClick={handleEliminarProducto} 
                disabled={deshabilitado}
            >
                {deshabilitado ? 'Eliminando...' : 'Eliminar Producto'}
            </Button>
        </Modal.Footer>
    </Modal>
);
};

export default ModalEliminacionProducto;