import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./App.css";

function MatchDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const equipos = location.state?.equipos || "Equipo 1 vs Equipo 2";

  const [points, setPoints] = useState({ team1: 0, team2: 0 });
  const [games, setGames] = useState({ team1: 0, team2: 0 });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [winner, setWinner] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0); // Contador de tiempo en segundos

  const [equipo1, equipo2] = equipos.split(" vs ");
  const PUNTOS = ["0", "15", "30", "40", "Ventaja"];

  useEffect(() => {
    axios
      .get(`https://padel-backend-one.vercel.app/api/partidos/${id}`)
      .then((response) => {
        setPoints({
          team1: response.data.team1_points,
          team2: response.data.team2_points,
        });
        setGames({
          team1: response.data.team1_games,
          team2: response.data.team2_games,
        });
        setHistory(response.data.history || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error al obtener los datos:", error);
        setLoading(false);
      });
  }, [id]);

  //TODO: El tiempo tiene que inciarse y guardarse en la db por si se reinicia la pagina o abre alguien mas
  
  // Contador de tiempo
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    if (elapsedTime >= 12000 && !winner) {
      finalizarPartidoPorTiempo();
    }

    return () => clearInterval(timer);
  }, [elapsedTime, winner]);

  const actualizarBackend = (updatedPoints, updatedGames, updatedHistory) => {
    axios.put(`https://padel-backend-one.vercel.app/api/partidos/${id}`, {
      team1_name: equipo1,
      team2_name: equipo2,
      team1_points: updatedPoints.team1,
      team2_points: updatedPoints.team2,
      team1_games: updatedGames.team1,
      team2_games: updatedGames.team2,
      history: updatedHistory,
    });
  };

  const registrarHistorial = () => {
    const nuevoHistorial = [
      ...history,
      { points: { ...points }, games: { ...games }, time: elapsedTime },
    ];
    setHistory(nuevoHistorial);
    return nuevoHistorial;
  };

  const deshacerUltimoCambio = () => {
    if (history.length > 0) {
      const ultimoEstado = history.pop();
      setPoints(ultimoEstado.points);
      setGames(ultimoEstado.games);
      const nuevoHistorial = [...history];
      setHistory(nuevoHistorial);
      actualizarBackend(ultimoEstado.points, ultimoEstado.games, nuevoHistorial);
    }
  };

  const sumarPunto = (team) => {
    const nuevoHistorial = registrarHistorial();
    const otroTeam = team === "team1" ? "team2" : "team1";
    const nuevosPuntos = { ...points };

    if (nuevosPuntos[team] === 3 && nuevosPuntos[otroTeam] < 3) {
      sumarJuego(team, nuevoHistorial);
      return;
    } else if (nuevosPuntos[team] === 3 && nuevosPuntos[otroTeam] === 3) {
      nuevosPuntos[team] = 4;
    } else if (nuevosPuntos[team] === 3 && nuevosPuntos[otroTeam] === 4) {
      nuevosPuntos[team] = 3;
      nuevosPuntos[otroTeam] = 3;
    } else if (nuevosPuntos[team] === 4) {
      sumarJuego(team, nuevoHistorial);
      return;
    } else if (nuevosPuntos[team] < 3) {
      nuevosPuntos[team] += 1;
    }

    setPoints(nuevosPuntos);
    actualizarBackend(nuevosPuntos, games, nuevoHistorial);
  };

  const sumarJuego = (team, historial) => {
    const nuevosJuegos = { ...games };
    nuevosJuegos[team] += 1;

    const puntosReiniciados = { team1: 0, team2: 0 };
    setPoints(puntosReiniciados);
    setGames(nuevosJuegos);

    if (nuevosJuegos[team] === 4) {
      setWinner(team === "team1" ? equipo1 : equipo2);
    }

    actualizarBackend(puntosReiniciados, nuevosJuegos, historial);
  };

  const finalizarPartidoPorTiempo = () => {
    let ganador = "";
    if (games.team1 > games.team2) {
      ganador = equipo1;
    } else if (games.team2 > games.team1) {
      ganador = equipo2;
    } else {
      ganador = "Empate - decidir manualmente";
    }

    setWinner(ganador);
    //TODO: Actualizar en backend quien gano el partido
    alert(`¡Tiempo agotado! ${ganador} ha ganado el partido.`);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  if (loading) return <div className="match-container">Cargando...</div>;

  return (
    <div className="match-container">
      {winner && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>¡{winner} ha ganado el partido!</h2>
            <button onClick={() => navigate("/")}>Cerrar</button>
          </div>
        </div>
      )}

      <h1 className="match-title">Partido {id}</h1>
      <h2 className="team-names">{equipos}</h2>
      <p className="time-counter">Tiempo: {formatTime(elapsedTime)}</p>

      <div className="score-board">
        <div className="team">
          <h3 className="team-name">{equipo1}</h3>
          <p className="team-score">Puntos: {PUNTOS[points.team1]}</p>
        </div>
        <div className="team">
          <h3 className="team-name">{equipo2}</h3>
          <p className="team-score">Puntos: {PUNTOS[points.team2]}</p>
        </div>
      </div>

      {!winner && (
        <div className="button-group">
          <button onClick={() => sumarPunto("team1")}>+1 {equipo1}</button>
          <button onClick={() => sumarPunto("team2")}>+1 {equipo2}</button>
        </div>
      )}
<div className="button-group">
        <button onClick={deshacerUltimoCambio} className="undo-button">
          Deshacer
        </button>
      </div>
      <div className="games-board">
        <div className="team-games">
          <h3>Juegos ganados por {equipo1}</h3>
          <p>{games.team1}</p>
        </div>
        <div className="team-games">
          <h3>Juegos ganados por {equipo2}</h3>
          <p>{games.team2}</p>
        </div>
      </div>

      <div className="button-group">
        <button onClick={() => navigate("/")} className="back-button">
          Volver
        </button>
      </div>
    </div>
  );
}

export default MatchDetail;