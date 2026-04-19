import { useState } from "react";
import CommissionVieCollective from "./CommVieCollective";
import AdminPage from "./AdminPage";
import Parametres from "./Parametres";
import "./css/App.css";

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
    if (pageActive === "administrateurs") return "Administrateurs de l'OGEC";
    if (pageActive === "profil") return "Mon Profil";
    const commission = commissions.find((c) => c.id === pageActive);
    return commission ? commission.nom : "Page inconnue";
  };

  const renderPage = () => {
    if (pageActive === "vie-collective") {
      return (
        <CommissionVieCollective onRetour={() => setPageActive("accueil")} />
      );
    }

    if (pageActive === "administrateurs") {
      return <AdminPage onRetour={() => setPageActive("accueil")} />;
    }

    if (pageActive === "profil") {
      return (
        <div style={{ padding: 24 }}>
          <h2>Mon Profil</h2>
          <p>Fonctionnalité à venir.</p>
        </div>
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

        <div className="navbar-right">
          <Parametres onNavigate={setPageActive} />
        </div>
      </nav>

      <div className="page-content">{renderPage()}</div>
    </div>
  );
}

export default App;
