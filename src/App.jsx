// import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Encabezado from './components/navegacion/Encabezado';
import RutaProtegida from "./components/rutas/RutaProtegida";

import Inicio from './components/views/Inicio';
import Categorias from "./components/views/Categorias";
import Catalogo from "./components/views/Catalogo";
import Productos from "./components/views/Productos";
import Login from "./components/views/Login";
import Pagina404 from "./components/views/Pagina404";
import Empleados from "./components/views/Empleados";
import Clientes from './components/views/clientes';
import Permisos from "./components/views/Permisos";

import "./App.css";

const App = () => {
  return (
    <AuthProvider> {/* <-- MUY IMPORTANTE: Envuelve toda tu app aquí */}
      <Router>
        <Encabezado />

        <main className="container mt-4">
          <Routes>
            {/* Ruta Pública: Login */}
            <Route path="/login" element={<Login />} />

            {/* Ruta Pública: Catálogo */}
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
            
            <Route path="/empleados" element={
              <RutaProtegida>
                <Empleados />
              </RutaProtegida>
            } />
            
            <Route path="/clientes" element={
              <RutaProtegida>
                <Clientes />
              </RutaProtegida>
            } />
            
            <Route path="/permisos" element={
              <RutaProtegida>
                <Permisos />
              </RutaProtegida>
            } />

            {/* Ruta para manejar errores 404 */}
            <Route path="*" element={<Pagina404 />} />
          </Routes>
        </main>
      </Router>
    </AuthProvider>
  );
};

export default App;