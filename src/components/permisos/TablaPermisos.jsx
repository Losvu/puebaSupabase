import React from "react";
import { Table, Button, Badge } from "react-bootstrap";

const TablaPermisos = ({ roles, abrirModalEdicion }) => {
  return (
    <Table striped hover responsive>
      <thead>
        <tr>
          <th>Rol</th>
          <th>Descripción</th>
          <th className="text-center">Cantidad de Permisos</th>
          <th className="text-center">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {roles.map((rol) => (
          <tr key={rol.id_permiso}>
            <td><strong>{rol.rol}</strong></td>
            <td>{rol.descripcion || "-"}</td>
            <td className="text-center">
              <Badge bg="info">
                {Object.keys(rol.permisos || {}).length} permisos
              </Badge>
            </td>
            <td className="text-center">
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => abrirModalEdicion(rol)}
              >
                <i className="bi bi-pencil me-1"></i>Editar Permisos
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default TablaPermisos;