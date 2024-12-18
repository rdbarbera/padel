import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./HamburgerMenu.css";

function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="hamburger-menu">
      <button className="hamburger-icon" onClick={toggleMenu}>
        ☰
      </button>
      {isOpen && (
        <div className="menu-dropdown">
          <Link to="/equipos" onClick={toggleMenu}>
            Modificar Equipos
          </Link>
          <Link to="/partidos" onClick={toggleMenu}>
            Modificar Partidos
          </Link>
        </div>
      )}
    </div>
  );
}

export default HamburgerMenu;
