import React, { useEffect, useState } from "react";
import { Container, Row, Col, Button, Spinner, Alert } from "react-bootstrap";
import { supabase } from "../database/supabaseconfig";
import NotificacionOperacion from "../NotificacionOperacion";
import CuadroBusquedas from "../busquedas/CuadroBusquedas";
import ModalRegistroProducto from "../productos/ModalRegistroProducto";
import ModalEdicionProducto from "../productos/ModalEdicionProducto";
import ModalEliminacionProducto from "../productos/ModalEliminacionProducto";
import TarjetaProducto from "../productos/TarjetasProductos";

const Productos = () => {
  // --- ESTADOS DE DATOS ---
  const [productos, setProductos] = useState([]);
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [textoBusqueda, setTextoBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [deshabilitado, setDeshabilitado] = useState(false); // Para el botón de actualizar

  // --- ESTADOS DE MODALES Y UI ---
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);
  const [mostrarModalEliminacion, setMostrarModalEliminacion] = useState(false);
  const [toast, setToast] = useState({ mostrar: false, mensaje: "", tipo: "" });

  // --- ESTADOS DE OBJETOS ---
  const [nuevoProducto, setNuevoProducto] = useState({
    nombre_producto: "",
    descripcion_producto: "",
    categoria_producto: "",
    precio_venta: "",
    archivo: null,
  });

  const [productoEditar, setProductoEditar] = useState({
    id_producto: null,
    nombre_producto: "",
    precio_venta: "",
    categoria_producto: "",
    descripcion_producto: "",
    url_imagen: "",
    archivo: null,
  });

  const [productoAEliminar, setProductoAEliminar] = useState(null);

  // --- FUNCIONES DE CARGA ---
  const cargarProductos = async () => {
    try {
      setCargando(true);
      const { data, error } = await supabase
        .from("productos")
        .select("*")
        .order("id_producto", { ascending: true });
      if (error) throw error;
      setProductos(data || []);
      setProductosFiltrados(data || []);
    } catch (err) {
      console.error("Error al cargar productos:", err.message);
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
      return nombre.includes(textoLower) || descripcion.includes(textoLower);
    });
    setProductosFiltrados(filtrados);
  }, [textoBusqueda, productos]);

  // --- HANDLERS REGISTRO ---
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

  // --- HANDLERS EDICIÓN ---
  const abrirModalEdicion = (producto) => {
    setProductoEditar({
      ...producto,
      archivo: null,
    });
    setMostrarModalEdicion(true);
  };

  const manejoCambioInputEdicion = (e) => {
    const { name, value } = e.target;
    setProductoEditar((prev) => ({ ...prev, [name]: value }));
  };

  const manejoCambioArchivoActualizar = (e) => {
    const archivo = e.target.files[0];
    if (archivo && archivo.type.startsWith("image/")) {
      setProductoEditar((prev) => ({ ...prev, archivo }));
    }
  };

  // --- OPERACIONES CRUD (Supabase) ---
  const agregarProducto = async () => {
    try {
      if (!nuevoProducto.nombre_producto || !nuevoProducto.categoria_producto || !nuevoProducto.precio_venta || !nuevoProducto.archivo) {
        setToast({ mostrar: true, mensaje: "Campos obligatorios faltantes", tipo: "advertencia" });
        return;
      }
      const nombreArchivo = `${Date.now()}_${nuevoProducto.archivo.name}`;
      await supabase.storage.from("imagenes_productos").upload(nombreArchivo, nuevoProducto.archivo);
      const { data: urlData } = supabase.storage.from("imagenes_productos").getPublicUrl(nombreArchivo);

      const { error } = await supabase.from("productos").insert([{
        nombre_producto: nuevoProducto.nombre_producto,
        descripcion_producto: nuevoProducto.descripcion_producto || null,
        categoria_producto: nuevoProducto.categoria_producto,
        precio_venta: parseFloat(nuevoProducto.precio_venta),
        url_imagen: urlData.publicUrl,
      }]);

      if (error) throw error;
      setToast({ mostrar: true, mensaje: "Producto registrado", tipo: "exito" });
      setMostrarModal(false);
      cargarProductos();
    } catch (err) {
      setToast({ mostrar: true, mensaje: "Error al registrar", tipo: "error" });
    }
  };

  const actualizarProducto = async () => {
    try {
      if (
        !productoEditar.nombre_producto.trim() ||
        !productoEditar.categoria_producto ||
        !productoEditar.precio_venta
      ) {
        setToast({
          mostrar: true,
          mensaje: "Completa los campos obligatorios",
          tipo: "advertencia",
        });
        return;
      }

      setMostrarModalEdicion(false);

      let datosActualizados = {
        nombre_producto: productoEditar.nombre_producto,
        descripcion_producto: productoEditar.descripcion_producto || null,
        categoria_producto: productoEditar.categoria_producto,
        precio_venta: parseFloat(productoEditar.precio_venta),
        url_imagen: productoEditar.url_imagen,
      };

      if (productoEditar.archivo) {
        const nombreArchivo = `${Date.now()}_${productoEditar.archivo.name}`;

        const { error: uploadError } = await supabase.storage
          .from("imagenes_productos")
          .upload(nombreArchivo, productoEditar.archivo);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("imagenes_productos")
          .getPublicUrl(nombreArchivo);

        datosActualizados.url_imagen = urlData.publicUrl;

        if (productoEditar.url_imagen) {
          const nombreAnterior = productoEditar.url_imagen.split("/").pop().split("?")[0];
          await supabase.storage.from("imagenes_productos").remove([nombreAnterior]).catch(() => { });
        }
      }

      const { error } = await supabase
        .from("productos")
        .update(datosActualizados)
        .eq("id_producto", productoEditar.id_producto);

      if (error) throw error;

      await cargarProductos();

      setProductoEditar({
        id_producto: "",
        nombre_producto: "",
        descripcion_producto: "",
        categoria_producto: "",
        precio_venta: "",
        url_imagen: "",
        archivo: null,
      });

      setToast({ mostrar: true, mensaje: "Producto actualizado correctamente", tipo: "exito" });

    } catch (err) {
      console.error("Error al actualizar:", err);
      setToast({ mostrar: true, mensaje: "Error al actualizar producto", tipo: "error" });
    }
  };

  const abrirModalEliminacion = (producto) => {
    setProductoAEliminar(producto);
    setMostrarModalEliminacion(true);
  };

  const eliminarProducto = async () => {
    try {
      const { error } = await supabase.from("productos").delete().eq("id_producto", productoAEliminar.id_producto);
      if (error) throw error;
      setToast({ mostrar: true, mensaje: "Producto eliminado", tipo: "exito" });
      setMostrarModalEliminacion(false);
      cargarProductos();
    } catch (err) {
      setToast({ mostrar: true, mensaje: "Error al eliminar", tipo: "error" });
    }
  };

  return (
    <Container className="mt-5">
      <Row className="align-items-center mb-4">
        <Col>
         <Col>......</Col>
          <Col>......</Col>
          <h3><i className="bi-bag-heart-fill me-2"></i> Productos</h3>
        </Col>
        <Col className="text-end">
          <Button onClick={() => setMostrarModal(true)}>Nuevo Producto</Button>
        </Col>
      </Row>

      <Col xs={12} md={12} lg={12}>
        {/* Spinner de carga de productos */}
        {cargando && (
          <div className="text-center my-5">
            <Spinner animation="border" variant="success" size="lg" />
            <p className="mt-3 text-muted">Cargando productos...</p>
          </div>
        )}

      </Col>

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

      {/* Cambia TarjetasProductos por TarjetaProducto */}
      {!cargando && productosFiltrados.length > 0 && (
        <TarjetaProducto
          productos={productosFiltrados}
          abrirModalEdicion={abrirModalEdicion}
          abrirModalEliminacion={abrirModalEliminacion}
        />
      )}

      {/* --- MODALES --- */}
      <ModalRegistroProducto
        mostrarModal={mostrarModal}
        setMostrarModal={setMostrarModal}
        nuevoProducto={nuevoProducto}
        manejoCambioInput={manejoCambioInput}
        manejoCambioArchivo={manejoCambioArchivo}
        agregarProducto={agregarProducto}
        categorias={categorias}
      />

      <ModalEdicionProducto
        mostrarModalEdicion={mostrarModalEdicion}
        setMostrarModalEdicion={setMostrarModalEdicion}
        productoEditar={productoEditar}
        manejoCambioInputEdicion={manejoCambioInputEdicion}
        manejoCambioArchivoActualizar={manejoCambioArchivoActualizar}
        actualizarProducto={actualizarProducto}
        categorias={categorias}
      />

      <ModalEliminacionProducto
        mostrarModalEliminacion={mostrarModalEliminacion}
        setMostrarModalEliminacion={setMostrarModalEliminacion}
        productoEliminar={productoAEliminar}
        eliminarProducto={eliminarProducto}
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