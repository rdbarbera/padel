import React from 'react';

const MatchHistory = ({ matches }) => {
  return (
    <div className="match-history">
      <h2>Historial de Partidos</h2>
      <table>
        <thead>
          <tr>
            <th>Partido</th>
            <th>Resultado</th>
          </tr>
        </thead>
        <tbody>
          {matches.map((match, index) => (
            <tr key={index}>
              <td>{`${match.team1} vs ${match.team2}`}</td>
              <td>{match.result === "win" ? `${match.team1} gana` : match.result === "loss" ? `${match.team2} gana` : "Empate"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MatchHistory; 