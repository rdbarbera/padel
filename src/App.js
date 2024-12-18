import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Home";
import MatchDetail from "./MatchDetail";
import Equipos from "./Equipos";
import Partidos from "./Partidos";
document.documentElement.lang = "es-ES";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/detalle/:id" element={<MatchDetail />} />
        <Route path="/equipos" element={<Equipos />} />
        <Route path="/partidos" element={<Partidos />} />
        <Route path="*" element={<h2 style={{ textAlign: "center" }}>Página no encontrada</h2>} />
      </Routes>
    </Router>
  );
}

export default App;

