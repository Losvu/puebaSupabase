import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Spinner, Form, Button } from "react-bootstrap";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import { supabase } from "../database/supabaseconfig";
import * as XLSX from "xlsx";

// Constantes fuera del componente para evitar re-renderizados innecesarios
const COLORES = ["#5e26b2", "#39ff95", "#ff6bc6", "#8b46ff", "#00d4ff", "#ffd93d"];

const Inicio = () => {
  const [cargando, setCargando] = useState(true);
  const [fechaDesde, setFechaDesde] = useState(
    new Date().toLocaleDateString("en-CA", { timeZone: "America/Managua" })
  );
  const [fechaHasta, setFechaHasta] = useState(
    new Date().toLocaleDateString("en-CA", { timeZone: "America/Managua" })
  );
  const [estadisticas, setEstadisticas] = useState({
    totalVentas: 0,
    ventasEfectivo: 0,
    ventasTarjeta: 0,
    productosVendidos: 0,
    montoProductos: 0,
    cantidadVentas: 0,
    ventasPorHora: [],
    ventasPorCategoria: []
  });

  // 1. Cargar datos desde Supabase
  const cargarDatos = async (desde, hasta) => {
    try {
      setCargando(true);
      const inicioRango = `${desde} 00:00:00`;
      const finRango = `${hasta} 23:59:59`;
      
      const { data: ventas, error } = await supabase
        .from("ventas")
        .select("id_venta, total, fecha_venta, metodo_pago")
        .gte("fecha_venta", inicioRango)
        .lte("fecha_venta", finRango);

      if (error) throw error;

      const idsVentas = ventas?.map(v => v.id_venta) || [];
      let productosVendidos = 0;
      let montoProductos = 0;
      let ventasPorCategoria = [];

      if (idsVentas.length > 0) {
        const { data: detalles } = await supabase
          .from("detalles_ventas")
          .select(`
            cantidad, 
            subtotal,
            productos (
              nombre_producto,
              categorias (nombre_categoria)
            )
          `)
          .in("id_venta", idsVentas);

        detalles?.forEach(d => {
          productosVendidos += d.cantidad || 0;
          montoProductos += d.subtotal || 0;

          const categoria = d.productos?.categorias?.nombre_categoria || "Sin categoría";
          const existente = ventasPorCategoria.find(c => c.name === categoria);

          if (existente) {
            existente.value += d.subtotal || 0;
          } else {
            ventasPorCategoria.push({ name: categoria, value: d.subtotal || 0 });
          }
        });

        ventasPorCategoria.sort((a, b) => b.value - a.value);
      }

      const totalVentas = ventas?.reduce((sum, v) => sum + (v.total || 0), 0) || 0;
      const ventasEfectivo = ventas?.filter(v => v.metodo_pago === "efectivo")
        .reduce((sum, v) => sum + (v.total || 0), 0) || 0;
      const ventasTarjeta = ventas?.filter(v => v.metodo_pago === "tarjeta")
        .reduce((sum, v) => sum + (v.total || 0), 0) || 0;

      const horaMap = Array(24).fill(0);
      ventas?.forEach(venta => {
        if (!venta.fecha_venta) return;
        const hora = new Date(venta.fecha_venta).getHours();
        if (hora >= 0 && hora < 24) horaMap[hora] += venta.total || 0;
      });

      const ventasPorHora = [];
      let acumulado = 0;
      for (let h = 8; h <= 22; h++) {
        acumulado += horaMap[h];
        ventasPorHora.push({
          hora: `${h.toString().padStart(2, "0")}:00`,
          total: Math.round(acumulado)
        });
      }

      setEstadisticas({
        totalVentas,
        ventasEfectivo,
        ventasTarjeta,
        productosVendidos,
        montoProductos,
        cantidadVentas: ventas?.length || 0,
        ventasPorHora,
        ventasPorCategoria
      });
    } catch (err) {
      console.error("Error al cargar estadísticas:", err);
    } finally {
      setCargando(false);
    }
  };

  // 2. Descargar Reporte Excel
  const descargarExcel = async () => {
    try {
      setCargando(true);
      const inicioRango = `${fechaDesde} 00:00:00`;
      const finRango = `${fechaHasta} 23:59:59`;

      const { data: ventas, error: errorVentas } = await supabase
        .from("ventas")
        .select(`id_venta, fecha_venta, total, metodo_pago, id_empleado, id_cliente`)
        .gte("fecha_venta", inicioRango)
        .lte("fecha_venta", finRango)
        .order("fecha_venta", { ascending: false });

      if (errorVentas) throw errorVentas;

      const idsVentas = ventas?.map(v => v.id_venta) || [];
      let detallesVenta = [];

      if (idsVentas.length > 0) {
        const { data: detalles, error: errorDetalles } = await supabase
          .from("detalles_ventas")
          .select(`
            id_detalle, id_venta, cantidad, precio_unitario, subtotal, id_producto,
            productos (nombre_producto, categorias (nombre_categoria))
          `)
          .in("id_venta", idsVentas)
          .order("id_venta");

        if (errorDetalles) console.error("Error en detalles:", errorDetalles);
        else detallesVenta = detalles || [];
      }

      const wb = XLSX.utils.book_new();

      if (ventas && ventas.length > 0) {
        const wsVentas = XLSX.utils.json_to_sheet(ventas);
        XLSX.utils.book_append_sheet(wb, wsVentas, "Ventas");
      } else {
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([{ Mensaje: "No hay ventas en este rango" }]), "Ventas");
      }

      if (detallesVenta && detallesVenta.length > 0) {
        const wsDetalles = XLSX.utils.json_to_sheet(detallesVenta);
        XLSX.utils.book_append_sheet(wb, wsDetalles, "Detalles_Ventas");
      } else {
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([{ Mensaje: "No hay detalles de ventas" }]), "Detalles_Ventas");
      }

      XLSX.writeFile(wb, `Reporte_Ventas_${fechaDesde}_a_${fechaHasta}.xlsx`);
    } catch (err) {
      console.error("Error generando Excel:", err);
      alert("Error al generar el Excel. Revisa la consola.");
    } finally {
      setCargando(false);
    }
  };

  // 3. Efectos de React (Hooks siempre arriba de los retornos de JSX)
  useEffect(() => {
    cargarDatos(fechaDesde, fechaHasta);
  }, [fechaDesde, fechaHasta]);

  // Retorno condicional para la carga
  if (cargando) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" variant="primary" size="lg" />
        <p className="mt-3">Cargando estadísticas...</p>
      </Container>
    );
  }

  // Retorno principal de la interfaz
  return (
    <Container className="mt-4">
      {/* Encabezado */}
      <div className="mb-4">
        <h2><i className="bi bi-house-fill me-2"></i> Dashboard</h2>
        <h6 className="text-muted">Estadísticas del Negocio</h6>
      </div>

      {/* Filtros de Fecha y Botón de Excel */}
      <Row className="mb-4 align-items-end">
        <Col xs={12} sm={4} md={3} className="mb-3 mb-sm-0">
          <Form.Group>
            <Form.Label className="fw-bold">Desde</Form.Label>
            <Form.Control type="date" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} />
          </Form.Group>
        </Col>
        <Col xs={12} sm={4} md={3} className="mb-3 mb-sm-0">
          <Form.Group>
            <Form.Label className="fw-bold">Hasta</Form.Label>
            <Form.Control type="date" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} />
          </Form.Group>
        </Col>
        <Col xs={12} sm={4} md={3}>
          <Button variant="success" onClick={descargarExcel} className="w-100">
            <i className="bi bi-file-earmark-excel me-2"></i>
            Descargar Excel
          </Button>
        </Col>
      </Row>

      {/* Tarjetas Informativas */}
      <Row className="g-4 mb-4">
        <Col xs={12} sm={6} lg={3}>
          <Card className="h-100 text-white shadow border-0" style={{ background: "linear-gradient(135deg, #28a745, #34ce57)" }}>
            <Card.Body>
              <h5>Ventas Totales</h5>
              <h2>C$ {estadisticas.totalVentas.toFixed(2)}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <Card className="h-100 text-white shadow border-0" style={{ background: "linear-gradient(135deg, #0166d3, #3399ff)" }}>
            <Card.Body>
              <h5>Efectivo</h5>
              <h2>C$ {estadisticas.ventasEfectivo.toFixed(2)}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <Card className="h-100 text-white shadow border-0" style={{ background: "linear-gradient(135deg, #5ea5f1, #94c0ec)" }}>
            <Card.Body>
              <h5>Tarjeta</h5>
              <h2>C$ {estadisticas.ventasTarjeta.toFixed(2)}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <Card className="h-100 text-white shadow border-0" style={{ background: "linear-gradient(135deg, #e27d01, #ffa500)" }}>
            <Card.Body>
              <h5>Productos Vendidos</h5>
              <h2>{estadisticas.productosVendidos}</h2>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Gráficos */}
      <Row className="g-4 mb-5">
        {/* Gráfico de Líneas */}
        <Col xs={12} lg={8}>
          <Card className="shadow border-0">
            <Card.Body>
              <h5 className="mb-3 fw-bold">Ventas por Hora</h5>
              <ResponsiveContainer width="100%" height={360}>
                <LineChart data={estadisticas.ventasPorHora}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hora" />
                  <YAxis tickFormatter={(v) => `C$${v}`} />
                  <Tooltip formatter={(v) => [`C$ ${v}`, "Monto"]} />
                  <Line type="monotone" dataKey="total" stroke="#5e26b2" strokeWidth={4} dot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>

        {/* Gráfico de Pastel */}
        <Col xs={12} lg={4}>
          <Card className="shadow border-0">
            <Card.Body>
              <h5 className="mb-3 fw-bold">Ventas por Categoría</h5>
              <ResponsiveContainer width="100%" height={360}>
                <PieChart>
                  <Pie
                    data={estadisticas.ventasPorCategoria.length > 0 ? estadisticas.ventasPorCategoria : [{ name: "Sin datos", value: 1 }]}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={110}
                    label
                  >
                    {estadisticas.ventasPorCategoria.map((_, i) => (
                      <Cell key={`cell-${i}`} fill={COLORES[i % COLORES.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => `C$ ${v}`} />
                </PieChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Inicio;