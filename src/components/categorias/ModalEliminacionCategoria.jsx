import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";

const ModalEliminacionCategoria = ({
  mostrarModalEliminacion,
  setMostrarModalEliminacion,
  eliminarCategoria, // Esta es la función que viene del padre
  categoria, // Esta es la prop con los datos
  supabase,
  setToast,
  cargarCategorias,
}) => {
  const [deshabilitado, setDeshabilitado] = useState(false);

  const handleEliminar = async () => {
    if (deshabilitado || !categoria) return;
    setDeshabilitado(true);
    await ejecutarEliminacion();
    setDeshabilitado(false);
  };

  const ejecutarEliminacion = async () => {
    try {
      const { error } = await supabase
        .from("categorias")
        .delete()
        .eq("id_categoria", categoria.id_categoria);

      if (error) {
        console.error("Error al eliminar categoría:", error.message);
        setToast({
          mostrar: true,
          mensaje: `Error al eliminar la categoría ${categoria.nombre_categoria}.`,
          tipo: "error",
        });
        return;
      }

      setMostrarModalEliminacion(false);
      await cargarCategorias();
      setToast({
        mostrar: true,
        mensaje: `Categoría ${categoria.nombre_categoria} eliminada exitosamente.`,
        tipo: "exito",
      });
    } catch (err) {
      setToast({
        mostrar: true,
        mensaje: "Error inesperado al eliminar categoría.",
        tipo: "error",
      });
      console.error("Excepción al eliminar categoría:", err.message);
    }
  };

  return (
    <Modal
      show={mostrarModalEliminacion}
      onHide={() => setMostrarModalEliminacion(false)}
      backdrop="static"
      keyboard={false}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>Confirmar Eliminación</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        ¿Estás seguro de que deseas eliminar la categoría "
        <strong>{categoria?.nombre_categoria}</strong>"?
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={() => setMostrarModalEliminacion(false)}
        >
          Cancelar
        </Button>
        <Button
          variant="danger"
          onClick={handleEliminar}
          disabled={deshabilitado}
        >
          Eliminar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalEliminacionCategoria;