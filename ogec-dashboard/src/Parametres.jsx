import { useState, useRef, useEffect } from "react";
import "./css/Parametres.css";

function Parametres({ onNavigate }) {
  const [ouvert, setOuvert] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ouvert && menuRef.current && !menuRef.current.contains(e.target)) {
        setOuvert(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ouvert]);

  const handleNav = (page) => {
    setOuvert(false);
    onNavigate(page);
  };

  return (
    <div className="parametres-wrapper" ref={menuRef}>
      <button
        className="parametres-toggle"
        onClick={() => setOuvert((v) => !v)}
        title="Paramètres"
      >
        ⚙️
      </button>

      {ouvert && (
        <div className="parametres-dropdown">
          <button
            className="parametres-dropdown-item"
            onClick={() => handleNav("profil")}
          >
            Mon Profil
          </button>
          <div className="parametres-dropdown-separator" />
          <button
            className="parametres-dropdown-item"
            onClick={() => handleNav("administrateurs")}
          >
            Administrateurs de l'OGEC
          </button>
        </div>
      )}
    </div>
  );
}

export default Parametres;
