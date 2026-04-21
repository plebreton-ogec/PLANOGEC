import { useState } from "react";
import CommissionVieCollective from "./CommVieCollective";
import AdminPage from "./AdminPage";
import Parametres from "./Parametres";
import "./css/App.css";

const commissions = [
  {
    nom: "Commission Vie Collective",
    id: "vie-collective",
    icon: "🤝",
    accent: "blue",
  },
  { nom: "Commission du Personnel", id: null, icon: "👥", accent: "green" },
  { nom: "Commission Finance", id: null, icon: "💰", accent: "yellow" },
  {
    nom: "Commission Sécurité, Hygiène et Réglementation",
    id: null,
    icon: "🛡️",
    accent: "red",
  },
  {
    nom: "Commission Restauration et Périscolaire",
    id: null,
    icon: "🍽️",
    accent: "blue",
  },
  { nom: "Commission Vie Scolaire", id: null, icon: "📚", accent: "green" },
  { nom: "Commission Vie Extérieure", id: null, icon: "🌍", accent: "yellow" },
];

function App() {
  const [pageActive, setPageActive] = useState("accueil");

  const getTitrePage = () => {
    if (pageActive === "accueil") return "Accueil";
    if (pageActive === "administrateurs") return "Administrateurs de l'OGEC";
    if (pageActive === "profil") return "Mon Profil";
    const commission = commissions.find((c) => c.id === pageActive);
    return commission ? commission.nom : "Page inconnue";
  };

  const renderPage = () => {
    if (pageActive === "vie-collective")
      return (
        <CommissionVieCollective onRetour={() => setPageActive("accueil")} />
      );

    if (pageActive === "administrateurs")
      return <AdminPage onRetour={() => setPageActive("accueil")} />;

    if (pageActive === "profil")
      return (
        <div style={{ padding: 24 }}>
          <h2>Mon Profil</h2>
          <p>Fonctionnalité à venir.</p>
        </div>
      );

    return (
      <>
        <p className="section-label">Commissions</p>
        <div className="grille-commissions">
          {commissions.map((commission, index) => (
            <div
              key={index}
              className={`carte carte--${commission.accent}`}
              onClick={() => commission.id && setPageActive(commission.id)}
              style={{ cursor: commission.id ? "pointer" : "default" }}
            >
              <div className={`carte-icon carte-icon--${commission.accent}`}>
                {commission.icon}
              </div>
              <div className="carte-nom">{commission.nom}</div>
            </div>
          ))}

          {/* 8e carte : logo OGEC */}
          <div className="carte carte-logo">
            <img src="/logo-ogec.png" alt="Logo OGEC" className="logo-ogec" />
          </div>
        </div>
      </>
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
            <span className="navbar-dots">
              <span className="dot dot--blue" />
              <span className="dot dot--green" />
              <span className="dot dot--yellow" />
              <span className="dot dot--red" />
            </span>
            PLANOGEC
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
