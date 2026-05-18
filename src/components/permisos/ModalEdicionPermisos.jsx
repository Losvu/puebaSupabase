import React from "react";
import { Modal, Form, Button, Row, Col, Badge } from "react-bootstrap";

const ModalEdicionPermisos = ({
  mostrar,
  setMostrar,
  rolEditar,
  setRolEditar,
  guardarCambios
}) => {
  const actualizarSwitch = (permisoKey, valor) => {
    setRolEditar(prev => ({
      ...prev,
      permisos: {
        ...prev.permisos,
        [permisoKey]: valor
      }
    }));
  };

  if (!rolEditar) return null;

  return (
    <Modal show={mostrar} onHide={() => setMostrar(false)} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          Editar Permisos - <Badge bg="primary">{rolEditar.rol}</Badge>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="text-muted">{rolEditar.descripcion}</p>

        <Row>
          {Object.keys(rolEditar.permisos || {}).map((key) => (
            <Col md={6} key={key} className="mb-3">
              <Form.Check
                type="switch"
                id={`permiso-${key}`}
                label={key.replace(/_/g, " ").toUpperCase()}
                checked={!!rolEditar.permisos[key]}
                onChange={(e) => actualizarSwitch(key, e.target.checked)}
              />
            </Col>
          ))}
        </Row>

        {Object.keys(rolEditar.permisos || {}).length === 0 && (
          <p className="text-center text-muted">No hay permisos definidos para este rol.</p>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setMostrar(false)}>
          Cancelar
        </Button>
        <Button variant="success" onClick={guardarCambios}>
          Guardar Cambios
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalEdicionPermisos;