import { useState } from "react";
import CommissionVieCollective from "./CommVieCollective";
import "./App.css";

function App() {
  const [pageActive, setPageActive] = useState("accueil");

  const commissions = [
    { nom: "Commission Vie Collective", id: "vie-collective" },
    { nom: "Commission du Personnel", id: null },
    { nom: "Commission Finance", id: null },
    { nom: "Commission Sécurité, Hygiène et Réglementation", id: null },
    { nom: "Commission Restauration et Périscolaire", id: null },
    { nom: "Commission Vie Scolaire", id: null },
    { nom: "Commission Vie Extérieure", id: null },
  ];

  const getTitrePage = () => {
    if (pageActive === "accueil") return "Accueil";
    const commission = commissions.find((c) => c.id === pageActive);
    return commission ? commission.nom : "Page inconnue";
  };

  const renderPage = () => {
    if (pageActive === "vie-collective") {
      return (
        <CommissionVieCollective onRetour={() => setPageActive("accueil")} />
      );
    }

    return (
      <div className="grille">
        {commissions.map((commission, index) => (
          <div
            key={index}
            className="carte"
            onClick={() => commission.id && setPageActive(commission.id)}
            style={{ cursor: commission.id ? "pointer" : "default" }}
          >
            {commission.nom}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="dashboard">
      {/* Barre de navigation */}
      <nav className="navbar">
        <div className="navbar-left">
          <span
            className="navbar-logo"
            onClick={() => setPageActive("accueil")}
            style={{ cursor: "pointer" }}
          >
            🏫 PLANOGEC
          </span>
        </div>

        <div className="navbar-center">
          <span className="navbar-breadcrumb">
            {pageActive !== "accueil" && (
              <>
                <span
                  className="navbar-breadcrumb-link"
                  onClick={() => setPageActive("accueil")}
                >
                  Accueil
                </span>
                <span className="navbar-separator"> › </span>
              </>
            )}
            <span className="navbar-current">{getTitrePage()}</span>
          </span>
        </div>

        <div className="navbar-right" />
      </nav>

      {/* Contenu de la page */}
      <div className="page-content">{renderPage()}</div>
    </div>
  );
}

export default App;
