import React from "react";
import { Table, Button } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";

const TablaCategorias = ({
  categorias,
  abrirModalEdicion,
  abrirModalEliminacion
}) => {
  // Si no hay categorías, mostramos un mensaje amigable en lugar de un spinner 
  // (porque el spinner principal ya lo maneja el componente padre)
  if (!categorias || categorias.length === 0) {
    return (
      <div className="text-center my-4">
        <p className="text-muted">No se encontraron categorías registradas.</p>
      </div>
    );
  }

  return (
    <Table striped borderless hover responsive size="sm">
      <thead>
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th className="d-none d-md-table-cell">Descripción</th>
          <th className="text-center">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {categorias.map((categoria) => (
          <tr key={categoria.id_categoria}>
            <td>{categoria.id_categoria}</td>
            <td>{categoria.nombre_categoria}</td>
            <td className="d-none d-md-table-cell">
              {categoria.descripcion_categoria}
            </td>
            <td className="text-center">
              <Button
                variant="outline-warning"
                size="sm"
                className="m-1"
                onClick={() => abrirModalEdicion(categoria)}
              >
                <i className="bi bi-pencil"></i>
              </Button>

              <Button
                variant="outline-danger"
                size="sm"
                onClick={() => abrirModalEliminacion(categoria)}
              >
                <i className="bi bi-trash"></i>
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default TablaCategorias;