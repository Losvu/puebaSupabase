// import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Encabezado from "./components/navegacion/Encabezado";
import RutaProtegida from "./components/rutas/RutaProtegida";

import Inicio from './components/views/Inicio';
import Categorias from "./components/views/Categorias";
import Catalogo from "./components/views/Catalogo";
import Productos from "./components/views/Productos";
import Login from "./components/views/Login";
import Pagina404 from "./components/views/Pagina404";

import "./App.css";

const App = () => {
  return (
    <Router>
      {/*...*/}
      <Encabezado />

      <main className="container mt-4">
        <Routes>
          {/* Ruta Pública: Login */}
          <Route path="/login" element={<Login />} />

          {/* Ruta Pública: Catálogo (según tu captura anterior, esta no estaba protegida) */}
          <Route path="/catalogo" element={<Catalogo />} />

          {/* Rutas Protegidas: Requieren estar logueado */}
          <Route path="/" element={
            <RutaProtegida>
              <Inicio />
            </RutaProtegida>
          } />
          
          <Route path="/categorias" element={
            <RutaProtegida>
              <Categorias />
            </RutaProtegida>
          } />

          <Route path="/productos" element={
            <RutaProtegida>
              <Productos />
            </RutaProtegida>
          } />

          {/* Ruta para manejar errores 404 */}
          <Route path="*" element={<Pagina404 />} />
        </Routes>
      </main>
    </Router>
  );
};

export default App;