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
  const [elapsedTime, setElapsedTime] = useState(1201); // Contador de tiempo en segundos
  const [startTime, setStartTime] = useState(null);
  const [team1_id, setTeam1Id] = useState(null);
  const [team2_id, setTeam2Id] = useState(null);
  const [equipo1, equipo2] = equipos.split(" vs ");
  const PUNTOS = ["0", "15", "30", "40", "Ventaja"];

  // En el useEffect para obtener los detalles del partido
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
      setTeam1Id(response.data.team1_id);
      setTeam2Id(response.data.team2_id);
      
      setHistory(response.data.history || []);
      setStartTime(response.data.start_time ? new Date(response.data.start_time) : null); // Guardar la hora de inicio o null
      setLoading(false);
    })
    .catch((error) => {
      console.error("Error al obtener los datos:", error);
      setLoading(false);
    });
}, [id]);

  // Contador de tiempo
  useEffect(() => {
    const timer = setInterval(() => {
      if (startTime) {
        const currentTime = new Date();
        const elapsedSeconds = Math.floor((currentTime - startTime) / 1000);
        setElapsedTime(1200 - elapsedSeconds); // Calcular el tiempo restante
      }
    }, 1000);

    if (startTime && elapsedTime <= 0 && !winner) {
      finalizarPartidoPorTiempo();
    }

    return () => clearInterval(timer);
  }, [startTime, elapsedTime, winner]);

  // Inicializar el tiempo en el backend al iniciar el partido
  const iniciarPartido = () => {
    axios.post(`https://padel-backend-one.vercel.app/api/partidos/${id}/iniciar`, {
      start_time: new Date().toISOString(),
    }).then(response => {
      setStartTime(new Date(response.data.start_time)); // Guardar la hora de inicio
    }).catch(error => {
      console.error("Error al iniciar el partido:", error);
    });
  };

  const actualizarBackend = (updatedPoints, updatedGames, updatedHistory) => {
    axios.put(`https://padel-backend-one.vercel.app/api/partidos/${id}`, {
      team1_name: equipo1,
      team2_name: equipo2,
      team1_id: team1_id,
      team2_id: team2_id,
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
      if (points.team1 > points.team2) {
        ganador = equipo1;
      } else if (points.team2 > points.team1) {
        ganador = equipo2;
      } else {
        ganador = "Empate";
      }
    }

    setWinner(ganador);
    
    // Llamar al método del servidor para actualizar el tiempo de finalización
    axios.put(`https://padel-backend-one.vercel.app/api/partidos/${id}/tiempo`)
      .then(response => {
        console.log(response.data.message);
      })
      .catch(error => {
        console.error("Error al actualizar el tiempo de finalización:", error);
      });

    
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
      <p className="time-counter">Tiempo: {elapsedTime < 1201 ? formatTime(elapsedTime) : ""}</p>

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

      {!winner && !startTime && (
        <div className="button-group">
          <button onClick={iniciarPartido}>Iniciar Partido</button>
        </div>
      )}

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
