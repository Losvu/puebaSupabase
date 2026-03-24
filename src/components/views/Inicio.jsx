import React from "react"; // { useEffect, useState }
import { Container, Row, Col } from "react-bootstrap";

const Inicio = () => {
    return (
        <Container className="mt-3">
            <Row className="align-items-center">
                <Col>
                    <h2><i className="bi-house-fill me-2"></i> Inicio</h2>
                </Col>
            </Row>
        </Container>
    );
};

export default Inicio;