import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import HamburgerMenu from "./HamburgerMenu";
import "./App.css";

function Home() {
  const [partidos, setPartidos] = useState([]);
  const [puntajesTotales, setPuntajesTotales] = useState([]);

  useEffect(() => {
    // Obtener partidos con el ganador (si existe)
    axios
      .get("http://localhost:3001/api/partidos")
      .then((response) => setPartidos(response.data))
      .catch((error) => console.error("Error al obtener los partidos:", error));

    // Obtener puntajes totales de los equipos
    axios
      .get("http://localhost:3001/api/equipos")
      .then((response) => setPuntajesTotales(response.data))
      .catch((error) => console.error("Error al obtener puntajes:", error));
  }, []);

  return (
    <div className="app-container">
      <HamburgerMenu />
      <h1>Mini Torneo</h1>

      {/* Mostrar puntajes totales */}
      <div className="total-scores">
        <h2>Puntaje Total por Equipo</h2>
        {puntajesTotales
          .sort((a, b) => b.total_puntos - a.total_puntos) // Ordenar por puntajes de mayor a menor
          .map((equipo) => (
            <p key={equipo.nombre}>
              {equipo.nombre}: {equipo.total_puntos} puntos
            </p>
          ))}
      </div>

      {/* Lista de partidos */}
      <div className="schedule-container">
        {partidos.map((partido) => (
          <div key={partido.id} className="match-card">
            <h2>Partido {partido.id}</h2>
            <p>{partido.team1_name} vs {partido.team2_name}</p>
            {partido.ganador ? (
              <p className="winner-text">Ganador: {partido.ganador}</p>
            ) : null}

            <Link
              to={`/detalle/${partido.id}`}
              state={{
                equipos: `${partido.team1_name} vs ${partido.team2_name}`,
              }}
            >
              <button
                className={`match-button ${
                  partido.ganador ? "disabled-button" : "active-button"
                }`}
                disabled={!!partido.ganador}
              >
                {partido.ganador ? "Finalizado" : "Ver Detalle"}
              </button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
