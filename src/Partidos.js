import React, { useState, useEffect } from "react";
import "./Partidos.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Partidos() {
  const [partidos, setPartidos] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [partidoEditado, setPartidoEditado] = useState(null);
  const [formCrear, setFormCrear] = useState(false);
  const [restablecerTiempo, setRestablecerTiempo] = useState(false);
  const [nuevoPartido, setNuevoPartido] = useState({
    team1_id: "",
    team2_id: "",
  });

  const puntosPadel = [0, 15, 30, 40];
  const navigate = useNavigate();

  useEffect(() => {
    fetchPartidos();
    fetchEquipos();
  }, []);

  const fetchPartidos = async () => {
    const res = await axios.get("https://padel-backend-one.vercel.app/api/partidos");
    const partidosConvertidos = res.data.map((partido) => ({
      ...partido,
      team1_points: puntosPadel[partido.team1_points],
      team2_points: puntosPadel[partido.team2_points],
    }));
    setPartidos(partidosConvertidos);
  };

  const fetchEquipos = async () => {
    const res = await axios.get("https://padel-backend-one.vercel.app/api/equipos");
    setEquipos(res.data);
  };

  const agregarPartido = async () => {
    if (!nuevoPartido.team1_id || !nuevoPartido.team2_id) {
      alert("Debes seleccionar ambos equipos");
      return;
    }
    await axios.post("https://padel-backend-one.vercel.app/api/partidos", nuevoPartido);
    setFormCrear(false);
    setNuevoPartido({ team1_id: "", team2_id: "" });
    fetchPartidos();
  };

  const eliminarPartido = async (id) => {
    const confirmacion = window.confirm("¿Estás seguro de que deseas eliminar este partido?");
    if (confirmacion) {
      await axios.delete(`https://padel-backend-one.vercel.app/api/partidos/${id}`);
      fetchPartidos();
    }
  };

  const iniciarEdicion = (partido) => {
    setPartidoEditado({ ...partido });
    setRestablecerTiempo(false); // Reiniciar checkbox
  };

  const cancelarEdicion = () => {
    setPartidoEditado(null);
    setRestablecerTiempo(false);
  };

  const guardarEdicion = async () => {
    const data = {
      ...partidoEditado,
      team1_points: puntosPadel.indexOf(partidoEditado.team1_points),
      team2_points: puntosPadel.indexOf(partidoEditado.team2_points),
      ...(restablecerTiempo ? { start_time: null, end_time: null } : {}),
    };
    await axios.put(`https://padel-backend-one.vercel.app/api/partidos/${partidoEditado.id}`, data);
    setPartidoEditado(null);
    fetchPartidos();
  };

  const handleIncrementPuntos = (field) => {
    const currentValue = partidoEditado[field];
    const nextIndex = puntosPadel.indexOf(currentValue) + 1;
    if (nextIndex < puntosPadel.length) {
      setPartidoEditado({ ...partidoEditado, [field]: puntosPadel[nextIndex] });
    }
  };

  const handleDecrementPuntos = (field) => {
    const currentValue = partidoEditado[field];
    const prevIndex = puntosPadel.indexOf(currentValue) - 1;
    if (prevIndex >= 0) {
      setPartidoEditado({ ...partidoEditado, [field]: puntosPadel[prevIndex] });
    }
  };

  const handleIncrement = (field, max) => {
    if (partidoEditado[field] < max) {
      setPartidoEditado({ ...partidoEditado, [field]: partidoEditado[field] + 1 });
    }
  };

  const handleDecrement = (field) => {
    if (partidoEditado[field] > 0) {
      setPartidoEditado({ ...partidoEditado, [field]: partidoEditado[field] - 1 });
    }
  };

  return (
    <div className="partidos-container">
      {/* Botón de Volver */}
      <button className="volver-button" onClick={() => navigate(-1)}>
        ← Volver
      </button>

      <h1>Mantenedor de Partidos</h1>
      <button
        onClick={() => setFormCrear(!formCrear)}
        className="agregar-button"
      >
        {formCrear ? "Cerrar Formulario" : "Agregar Partido"}
      </button>

      {formCrear && (
        <div className="form-crear">
          <h4>Crear Nuevo Partido</h4>
          <select
            value={nuevoPartido.team1_id}
            onChange={(e) =>
              setNuevoPartido({ ...nuevoPartido, team1_id: e.target.value })
            }
          >
            <option value="">Seleccionar Equipo 1</option>
            {equipos.map((equipo) => (
              <option key={equipo.id} value={equipo.id}>
                {equipo.nombre}
              </option>
            ))}
          </select>
          <select
            value={nuevoPartido.team2_id}
            onChange={(e) =>
              setNuevoPartido({ ...nuevoPartido, team2_id: e.target.value })
            }
          >
            <option value="">Seleccionar Equipo 2</option>
            {equipos.map((equipo) => (
              <option key={equipo.id} value={equipo.id}>
                {equipo.nombre}
              </option>
            ))}
          </select>
          <button onClick={agregarPartido} className="guardar-button">
            Guardar
          </button>
        </div>
      )}

      <ul className="partidos-list">
        {partidos.map((partido) => (
          <li key={partido.id} className="partido-card">
            <div className="partido-info">
              <div>
                <h3>
                  {partido.team1_name} vs {partido.team2_name}
                </h3>
                <p>Ganador: {partido.ganador || "No definido"}</p>
              </div>
              <div>
                <button
                  onClick={() => iniciarEdicion(partido)}
                  className="edit-button"
                >
                  Editar
                </button>
                <button
                  onClick={() => eliminarPartido(partido.id)}
                  className="delete-button"
                >
                  Eliminar
                </button>
              </div>
            </div>

            {partidoEditado && partidoEditado.id === partido.id && (
              <div className="form-edit">
                <h4>Editar Partido</h4>
                <label>Equipo 1</label>
                <select
                  value={partidoEditado.team1_id}
                  onChange={(e) =>
                    setPartidoEditado({ ...partidoEditado, team1_id: e.target.value })
                  }
                >
                  {equipos.map((equipo) => (
                    <option key={equipo.id} value={equipo.id}>
                      {equipo.nombre}
                    </option>
                  ))}
                </select>
                <div className="puntos-games">
                  <div>
                    <label>Puntos</label>
                    <div className="increment-decrement">
                      <button onClick={() => handleDecrementPuntos("team1_points")}>-</button>
                      <span>{partidoEditado.team1_points}</span>
                      <button onClick={() => handleIncrementPuntos("team1_points")}>+</button>
                    </div>
                  </div>
                  <div>
                    <label>Juegos</label>
                    <div className="increment-decrement">
                      <button onClick={() => handleDecrement("team1_games")}>-</button>
                      <span>{partidoEditado.team1_games}</span>
                      <button onClick={() => handleIncrement("team1_games", 4)}>+</button>
                    </div>
                  </div>
                </div>

                <label>Equipo 2</label>
                <select
                  value={partidoEditado.team2_id}
                  onChange={(e) =>
                    setPartidoEditado({ ...partidoEditado, team2_id: e.target.value })
                  }
                >
                  {equipos.map((equipo) => (
                    <option key={equipo.id} value={equipo.id}>
                      {equipo.nombre}
                    </option>
                  ))}
                </select>
                <div className="puntos-games">
                  <div>
                    <label>Puntos</label>
                    <div className="increment-decrement">
                      <button onClick={() => handleDecrementPuntos("team2_points")}>-</button>
                      <span>{partidoEditado.team2_points}</span>
                      <button onClick={() => handleIncrementPuntos("team2_points")}>+</button>
                    </div>
                  </div>
                  <div>
                    <label>Juegos</label>
                    <div className="increment-decrement">
                      <button onClick={() => handleDecrement("team2_games")}>-</button>
                      <span>{partidoEditado.team2_games}</span>
                      <button onClick={() => handleIncrement("team2_games", 4)}>+</button>
                    </div>
                  </div>
                </div>

                <label>
                  <input
                    type="checkbox"
                    checked={restablecerTiempo}
                    onChange={() => setRestablecerTiempo(!restablecerTiempo)}
                  />
                  Restablecer Tiempo
                </label>

                <div className="form-buttons">
                  <button onClick={guardarEdicion} className="guardar-button">
                    Guardar
                  </button>
                  <button onClick={cancelarEdicion} className="cancelar-button">
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>

      
    </div>
  );
}

export default Partidos;
