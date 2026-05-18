import React from "react";
import { Card, Button, Badge, Row, Col } from "react-bootstrap";

const TarjetaPermisos = ({ roles, abrirModalEdicion }) => {
  return (
    <>
      {roles.map((rol) => (
        <Card key={rol.id_permiso} className="mb-3 shadow-sm">
          <Card.Body>
            <Row className="align-items-center">
              <Col>
                <h5 className="mb-1">{rol.rol}</h5>
                <small className="text-muted">{rol.descripcion}</small>
              </Col>
              <Col xs="auto">
                <Badge bg="info">
                  {Object.keys(rol.permisos || {}).length}
                </Badge>
              </Col>
            </Row>

            <Button
              variant="outline-primary"
              className="w-100 mt-3"
              onClick={() => abrirModalEdicion(rol)}
            >
              <i className="bi bi-pencil me-2"></i>Editar Permisos
            </Button>
          </Card.Body>
        </Card>
      ))}
    </>
  );
};

export default TarjetaPermisos;