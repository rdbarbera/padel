import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import HamburgerMenu from "./HamburgerMenu";
import "./App.css";

function Home() {
  const [partidos, setPartidos] = useState([]);
  const [puntajesTotales, setPuntajesTotales] = useState([]);
  const [podio, setPodio] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtener partidos con el ganador (si existe)
        const partidosResponse = await axios.get("https://padel-backend-one.vercel.app/api/partidos");
        setPartidos(partidosResponse.data);

        // Calcular puntos, games y diferencias
        const equiposResponse = await axios.get("https://padel-backend-one.vercel.app/api/equipos");
        const equiposConPuntajes = equiposResponse.data.map((equipo) => {
          let puntosTotales = 0;
          let gamesTotales = 0;
          let puntosTotalesPartidos = 0;

          partidosResponse.data.forEach((partido) => {
            if (partido.team1_id === equipo.id) {
              if (partido.ganador === partido.team1_name) puntosTotales += 2;
              else if (partido.ganador === "Empate") puntosTotales += 1;

              gamesTotales += partido.team1_games;
              puntosTotalesPartidos += partido.team1_points;
            } else if (partido.team2_id === equipo.id) {
              if (partido.ganador === partido.team2_name) puntosTotales += 2;
              else if (partido.ganador === "Empate") puntosTotales += 1;

              gamesTotales += partido.team2_games;
              puntosTotalesPartidos += partido.team2_points;
            }
          });

          return {
            ...equipo,
            total_puntos: puntosTotales,
            total_games: gamesTotales,
            total_puntos_partidos: puntosTotalesPartidos,
          };
        });

        setPuntajesTotales(
          equiposConPuntajes.sort((a, b) => b.total_puntos - a.total_puntos)
        );

        // Verificar si todos los partidos están finalizados
        const todosFinalizados = partidosResponse.data.every((partido) => partido.ganador);
        if (todosFinalizados) {
          const podioOrdenado = equiposConPuntajes
            .sort((a, b) =>
              b.total_puntos - a.total_puntos ||
              b.total_games - a.total_games ||
              b.total_puntos_partidos - a.total_puntos_partidos
            )
            .slice(0, 3);
          setPodio(podioOrdenado);
        } else {
          setPodio([]);
        }
      } catch (error) {
        console.error("Error al obtener los datos:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="app-container">
      <HamburgerMenu />
      <h1>Mini Torneo</h1>

     {/* Mostrar el podio */}
    {podio.length > 0 && (
      <div className="podio">
        <h2>Podio del Torneo</h2>
        <ol>
          {podio.map((equipo, index) => (
            <li key={equipo.id}>
              <span className="position">{index + 1}° 🏆</span> 
              {equipo.nombre} - {equipo.total_puntos} puntos
            </li>
          ))}
        </ol>
      </div>
    )}


      {/* Mostrar puntajes totales */}
      <div className="total-scores">
        <h2>Puntaje Total por Equipo</h2>
        {puntajesTotales.map((equipo) => (
          <div key={equipo.id} className="equipo-detail">
            <p>
              <strong>{equipo.nombre}</strong>: {equipo.total_puntos} puntos
            </p>
            
          </div>
        ))}
      </div>

      {/* Lista de partidos */}
      <div className="schedule-container">
        {partidos.map((partido) => (
          <div key={partido.id} className="match-card">
            <h2>Partido {partido.id}</h2>
            <p>
              {partido.team1_name} vs {partido.team2_name}
            </p>
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
