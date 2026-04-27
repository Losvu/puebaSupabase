import React, { useEffect, useState } from "react";
import { Container, Row, Col, Button, Table, Spinner, Alert } from "react-bootstrap";
import { supabase } from "../database/supabaseconfig";
import NotificacionOperacion from "../NotificacionOperacion";
import CuadroBusquedas from "../busquedas/CuadroBusquedas";
import ModalRegistroProducto from "../productos/ModalRegistroProducto";

const Productos = () => {
  // --- ESTADOS ---
  const [productos, setProductos] = useState([]);
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [textoBusqueda, setTextoBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);

  const [mostrarModal, setMostrarModal] = useState(false);
  const [toast, setToast] = useState({ mostrar: false, mensaje: "", tipo: "" });

  const [nuevoProducto, setNuevoProducto] = useState({
    nombre_producto: "",
    descripcion_producto: "",
    categoria_producto: "",
    precio_venta: "",
    archivo: null,
  });

  // --- FUNCIONES DE CARGA ---
  const cargarProductos = async () => {
    try {
      setCargando(true);
      const { data, error } = await supabase.from("productos").select("*");
      if (error) throw error;
      setProductos(data || []);
      setProductosFiltrados(data || []);
    } catch (err) {
      console.error("Error al cargar productos:", err);
    } finally {
      setCargando(false);
    }
  };

  const cargarCategorias = async () => {
    try {
      const { data, error } = await supabase
        .from("categorias")
        .select("*")
        .order("id_categoria", { ascending: true });
      if (error) throw error;
      setCategorias(data || []);
    } catch (err) {
      console.error("Error al cargar categorías:", err);
    }
  };

  // --- EFECTOS ---
  useEffect(() => {
    cargarCategorias();
    cargarProductos();
  }, []);

  useEffect(() => {
    const textoLower = textoBusqueda.toLowerCase().trim();
    const filtrados = productos.filter((prod) => {
      const nombre = prod.nombre_producto?.toLowerCase() || "";
      const descripcion = prod.descripcion_producto?.toLowerCase() || "";
      const precio = prod.precio_venta?.toString() || "";
      return nombre.includes(textoLower) || descripcion.includes(textoLower) || precio.includes(textoLower);
    });
    setProductosFiltrados(filtrados);
  }, [textoBusqueda, productos]);

  // --- HANDLERS ---
  const manejoCambioInput = (e) => {
    const { name, value } = e.target;
    setNuevoProducto((prev) => ({ ...prev, [name]: value }));
  };

  const manejoCambioArchivo = (e) => {
    const archivo = e.target.files[0];
    if (archivo && archivo.type.startsWith("image/")) {
      setNuevoProducto((prev) => ({ ...prev, archivo }));
    } else {
      alert("Selecciona una imagen válida");
    }
  };

  const agregarProducto = async () => {
    try {
      if (!nuevoProducto.nombre_producto || !nuevoProducto.categoria_producto || !nuevoProducto.precio_venta || !nuevoProducto.archivo) {
        setToast({ mostrar: true, mensaje: "Campos obligatorios faltantes", tipo: "advertencia" });
        return;
      }

      const nombreArchivo = `${Date.now()}_${nuevoProducto.archivo.name}`;
      const { error: uploadError } = await supabase.storage.from("imagenes_productos").upload(nombreArchivo, nuevoProducto.archivo);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("imagenes_productos").getPublicUrl(nombreArchivo);
      
      const { error } = await supabase.from("productos").insert([{
        nombre_producto: nuevoProducto.nombre_producto,
        descripcion_producto: nuevoProducto.descripcion_producto || null,
        categoria_producto: nuevoProducto.categoria_producto,
        precio_venta: parseFloat(nuevoProducto.precio_venta),
        url_imagen: urlData.publicUrl,
      }]);

      if (error) throw error;

      setNuevoProducto({ nombre_producto: "", descripcion_producto: "", categoria_producto: "", precio_venta: "", archivo: null });
      setToast({ mostrar: true, mensaje: "Producto registrado correctamente", tipo: "exito" });
      setMostrarModal(false);
      cargarProductos(); // Recarga la lista
    } catch (err) {
      setToast({ mostrar: true, mensaje: "Error al registrar", tipo: "error" });
    }
  };

  return (
<Container className="mt-5"> 
  <Row className="align-items-center mb-4">
        <Col>
          <h3><i className="bi-bag-heart-fill me-2"></i> Productos</h3>
        </Col>
        <Col className="text-end">
          <Button onClick={() => setMostrarModal(true)}>Nuevo Producto</Button>
        </Col>  
      </Row>

      <hr />

      <Row className="mb-4">
        <Col md={6}>
          <CuadroBusquedas
            textoBusqueda={textoBusqueda}
            manejarCambioBusqueda={(e) => setTextoBusqueda(e.target.value)}
            placeholder="Buscar productos..."
          />
        </Col>
      </Row>

      {/* --- LISTADO DE PRODUCTOS --- */}
      {cargando ? (
        <div className="text-center"><Spinner animation="border" /></div>
      ) : productosFiltrados.length === 0 ? (
        <Alert variant="info">No hay productos para mostrar.</Alert>
      ) : (
        <Table responsive striped bordered hover>
          <thead>
            <tr>
              <th>Imagen</th>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Precio</th>
            </tr>
          </thead>
          <tbody>
            {productosFiltrados.map((prod) => (
              <tr key={prod.id_producto}>
                <td><img src={prod.url_imagen} alt={prod.nombre_producto} style={{ width: "50px" }} /></td>
                <td>{prod.nombre_producto}</td>
                <td>{prod.descripcion_producto}</td>
                <td>${prod.precio_venta}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <ModalRegistroProducto
        mostrarModal={mostrarModal}
        setMostrarModal={setMostrarModal}
        nuevoProducto={nuevoProducto}
        manejoCambioInput={manejoCambioInput}
        manejoCambioArchivo={manejoCambioArchivo}
        agregarProducto={agregarProducto}
        categorias={categorias}
      />

      <NotificacionOperacion
        mostrar={toast.mostrar}
        mensaje={toast.mensaje}
        tipo={toast.tipo}
        onCerrar={() => setToast({ ...toast, mostrar: false })}
      />
    </Container>
  );
};

export default Productos;