import React, { useState, useEffect } from "react";
import "./Equipos.css";
import axios from "axios";

function Equipos() {
  const [equipos, setEquipos] = useState([]);
  const [nombre, setNombre] = useState("");
  const [editandoId, setEditandoId] = useState(null); // ID del equipo en edición
  const [nombreEditado, setNombreEditado] = useState(""); // Nuevo nombre temporal
  const [puntosEditados, setPuntosEditados] = useState(0); // Puntaje temporal

  // Función para obtener equipos del backend
  const fetchEquipos = async () => {
    try {
      const response = await axios.get("https://padel-backend-one.vercel.app/api/equipos");
      setEquipos(response.data); // Actualizar el estado local
    } catch (error) {
      console.error("Error al obtener equipos:", error);
    }
  };

  useEffect(() => {
    fetchEquipos();
  }, []);

  // Agregar un nuevo equipo
  const agregarEquipo = async () => {
    if (nombre.trim() === "") {
      alert("El nombre del equipo no puede estar vacío.");
      return;
    }

    try {
      await axios.post("https://padel-backend-one.vercel.app/api/equipos", { nombre });
      fetchEquipos(); // Actualizar la lista
      setNombre(""); // Limpiar el input
    } catch (error) {
      console.error("Error al agregar equipo:", error);
    }
  };

  // Eliminar un equipo
  const eliminarEquipo = async (id) => {
    try {
      await axios.delete(`https://padel-backend-one.vercel.app/api/equipos/${id}`);
      fetchEquipos(); // Actualizar la lista
    } catch (error) {
      console.error("Error al eliminar equipo:", error);
    }
  };

  // Activar modo edición
  const activarEdicion = (id, nombreActual, totalPuntos) => {
    setEditandoId(id);
    setNombreEditado(nombreActual);
    setPuntosEditados(totalPuntos);
  };

  // Guardar cambios del equipo editado
  const guardarEdicion = async (id) => {
    if (nombreEditado.trim() === "") {
      alert("El nombre no puede estar vacío.");
      return;
    }

    try {
      await axios.put(`https://padel-backend-one.vercel.app/api/equipos/${id}`, {
        nombre: nombreEditado,
        total_puntos: puntosEditados,
      });
      setEditandoId(null); // Salir del modo edición
      fetchEquipos(); // Volver a cargar los equipos actualizados
    } catch (error) {
      console.error("Error al actualizar el equipo:", error);
    }
  };

  return (
    <div className="equipos-container">
      <button className="back-button" onClick={() => window.history.back()}>
        &#8592; Volver
      </button>
      <h1>Mantenedor de Equipos</h1>

      {/* Formulario para agregar equipos */}
      <div className="form-group">
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Nombre del equipo"
        />
        <button onClick={agregarEquipo}>Agregar Equipo</button>
      </div>

      {/* Lista de equipos */}
      <ul className="equipos-list">
        {equipos.map((equipo) => (
          <li key={equipo.id} className="equipo-item">
            {editandoId === equipo.id ? (
              <>
                <div className="edit-section">
                  <input
                    type="text"
                    className="edit-name"
                    value={nombreEditado}
                    onChange={(e) => setNombreEditado(e.target.value)}
                    placeholder="Nombre del equipo"
                  />
                  <div className="edit-points">
                    <span>Puntos:</span>
                    <button
                      className="button-points"
                      onClick={() =>
                        setPuntosEditados((prev) => Math.max(prev - 1, 0))
                      }
                    >
                      -
                    </button>
                    <span>{puntosEditados}</span>
                    <button
                      className="button-points"
                      onClick={() => setPuntosEditados((prev) => prev + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
                <button className="guardar-button" onClick={() => guardarEdicion(equipo.id)}>
                  Guardar
                </button>
                <button className="cancelar-button" onClick={() => setEditandoId(null)}>
                  Cancelar
                </button>
              </>
            ) : (
              <>
                <div className="equipo-info">
                  <span>{equipo.nombre}</span>
                  <span className="puntaje">Puntos: {equipo.total_puntos}</span>
                </div>
                <div className="button-group">
                  <button
                    className="edit-button"
                    onClick={() =>
                      activarEdicion(equipo.id, equipo.nombre, equipo.total_puntos)
                    }
                  >
                    Modificar
                  </button>
                  <button
                    className="delete-button"
                    onClick={() => eliminarEquipo(equipo.id)}
                  >
                    Eliminar
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Equipos;
