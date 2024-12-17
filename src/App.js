import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Home";
import MatchDetail from "./MatchDetail";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/detalle/:id" element={<MatchDetail />} />
        <Route path="*" element={<h2 style={{ textAlign: "center" }}>Página no encontrada</h2>} />
      </Routes>
    </Router>
  );
}

export default App;
