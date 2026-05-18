import React from "react";
import { Card, Row, Col, Button } from "react-bootstrap";

const TarjetaCliente = ({ clientes, abrirModalEdicion, abrirModalEliminacion }) => {
  return (
    <Row>
      {clientes.map((cli) => (
        <Col xs={12} key={cli.id_cliente} className="mb-3">
          <Card className="shadow-sm border-start border-primary border-4 h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div className="flex-grow-1">
                  {/* Nombre y Apellido */}
                  <h5 className="mb-1 text-capitalize">
                    {cli.nombre} {cli.apellido}
                  </h5>
                  
                  {/* Celular: Usamos div en lugar de p para evitar errores de anidamiento futuro */}
                  <div className="text-muted mb-2 small d-flex align-items-center">
                    <i className="bi bi-telephone-fill me-2 text-primary"></i>
                    {cli.celular || "Sin número"}
                  </div>
                  
                  {/* Fecha de Registro */}
                  <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                    <i className="bi bi-calendar3 me-2"></i>
                    <strong>Registrado:</strong> {cli.fecha_registro ? new Date(cli.fecha_registro).toLocaleDateString() : 'N/A'}
                  </div>
                </div>

                {/* Botones de Acción */}
                <div className="d-flex flex-column ms-3">
                  <Button 
                    variant="outline-primary" 
                    size="sm" 
                    className="mb-2 border-0" 
                    onClick={() => abrirModalEdicion(cli)}
                    title="Editar Cliente"
                  >
                    <i className="bi bi-pencil-square fs-5"></i>
                  </Button>
                  <Button 
                    variant="outline-danger" 
                    size="sm" 
                    className="border-0" 
                    onClick={() => abrirModalEliminacion(cli)}
                    title="Eliminar Cliente"
                  >
                    <i className="bi bi-trash3 fs-5"></i>
                  </Button>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default TarjetaCliente;