import React, { useState, useEffect, useCallback } from "react";
import { Card, Row, Col, Spinner, Button } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";

const TarjetaProducto = ({
  productos,
  abrirModalEdicion,
  abrirModalEliminacion
}) => {
  const [cargando, setCargando] = useState(true);
  const [idTarjetaActiva, setIdTarjetaActiva] = useState(null);

  const manejarTeclaEscape = useCallback((evento) => {
    if (evento.key === "Escape") setIdTarjetaActiva(null);
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", manejarTeclaEscape);
    return () => window.removeEventListener("keydown", manejarTeclaEscape);
  }, [manejarTeclaEscape]);

  const alternarTarjetaActiva = (id) => {
    setIdTarjetaActiva((anterior) => (anterior === id ? null : id));
  };

  useEffect(() => {
    setCargando(!(productos && productos.length > 0));
  }, [productos]);

  return (
    <>
      {cargando ? (
        <div className="text-center my-5">
          <h5>Cargando productos...</h5>
          <Spinner animation="border" variant="success" role="status" />
        </div>
      ) : (
        <div>
          {productos.map((producto) => {
            const tarjetaActiva = idTarjetaActiva === producto.id_producto;

            return (
              <Card
                key={producto.id_producto}
                className="mb-3 border-0 rounded-3 shadow-sm w-100 tarjeta-categoria-contenedor"
                onClick={() => alternarTarjetaActiva(producto.id_producto)}
                tabIndex={0}
                onKeyDown={(evento) => {
                  if (evento.key === "Enter" || evento.key === " ") {
                    evento.preventDefault();
                    alternarTarjetaActiva(producto.id_producto);
                  }
                }}
                aria-label={`Producto ${producto.nombre_producto}`}
              >
                <Card.Body
                  className={`p-2 tarjeta-categoria-cuerpo ${
                    tarjetaActiva
                      ? "tarjeta-categoria-cuerpo-activo"
                      : "tarjeta-categoria-cuerpo-inactivo"
                  }`}
                >
                  <Row className="align-items-center gx-3">
                    {/* Sección de Imagen o Icono */}
                    <Col xs={2} className="px-2">
                      <div className="bg-light d-flex align-items-center justify-content-center rounded tarjeta-categoria-placeholder-imagen" style={{ overflow: 'hidden' }}>
                        {producto.url_imagen ? (
                          <img 
                            src={producto.url_imagen} 
                            alt={producto.nombre_producto} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                          />
                        ) : (
                          <i className="bi bi-box text-muted fs-3"></i>
                        )}
                      </div>
                    </Col>

                    {/* Información del Producto */}
                    <Col xs={5} className="text-start">
                      <div className="fw-semibold text-truncate">
                        {producto.nombre_producto}
                      </div>
                      <div className="small text-muted text-truncate">
                        Precio: ${producto.precio_venta}
                      </div>
                    </Col>

                    <Col
                      xs={5}
                      className="d-flex flex-column align-items-end justify-content-center text-end"
                    >
                      <div className="fw-semibold small">Disponible</div>
                    </Col>
                  </Row>
                </Card.Body>

                {/* Capa de botones (Edición/Eliminación) */}
                {tarjetaActiva && (
                  <div
                    role="dialog"
                    aria-modal="true"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIdTarjetaActiva(null);
                    }}
                    className="tarjeta-categoria-capa"
                  >
                    <div
                      className="d-flex gap-2 tarjeta-categoria-botones-capa"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        variant="outline-warning"
                        size="sm"
                        onClick={() => {
                          abrirModalEdicion(producto);
                          setIdTarjetaActiva(null);
                        }}
                        aria-label={`Editar ${producto.nombre_producto}`}
                      >
                        <i className="bi bi-pencil"></i>
                      </Button>

                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => {
                          abrirModalEliminacion(producto);
                          setIdTarjetaActiva(null);
                        }}
                        aria-label={`Eliminar ${producto.nombre_producto}`}
                      >
                        <i className="bi bi-trash"></i>
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
};

export default TarjetaProducto;