import React from "react";
import { Table, Button } from "react-bootstrap";

const TablaClientes = ({ clientes, abrirModalEdicion, abrirModalEliminacion }) => {
  return (
    <Table hover responsive className="shadow-sm">
      <thead className="table-dark">
        <tr>
          <th>ID</th>
          <th>Nombre Completo</th>
          <th>Celular</th>
          <th>Fecha Registro</th>
          <th className="text-center">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {clientes.map((cli) => (
          <tr key={cli.id_cliente}>
            <td>{cli.id_cliente}</td>
            <td>{cli.nombre} {cli.apellido}</td>
            <td>{cli.celular}</td>
            <td>{new Date(cli.fecha_registro).toLocaleDateString()}</td>
            <td className="text-center">
              <Button variant="outline-primary" size="sm" className="me-2" onClick={() => abrirModalEdicion(cli)}>
                <i className="bi bi-pencil"></i>
              </Button>
              <Button variant="outline-danger" size="sm" onClick={() => abrirModalEliminacion(cli)}>
                <i className="bi bi-trash"></i>
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default TablaClientes;