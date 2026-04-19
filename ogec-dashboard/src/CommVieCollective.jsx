import { useState, useEffect } from "react";
import EvenementDetails from "./EvenementDetails";
import "./css/CommVieCollective.css";

const COMMISSION_ID = 1;

function CommissionVieCollective({ onRetour }) {
  const [evenements, setEvenements] = useState([]);
  const [formulaireVisible, setFormulaireVisible] = useState(false);
  const [evenementActif, setEvenementActif] = useState(null);
  const [administrateurs, setAdministrateurs] = useState([]);
  const [pageArchives, setPageArchives] = useState(false);

  const [modeCreation, setModeCreation] = useState("manuel");
  const [modeleSelectionne, setModeleSelectionne] = useState("");

  const [nouvelEvenement, setNouvelEvenement] = useState({
    nom: "",
    date: "",
    responsable_id: "",
    lieu: "",
    public: "",
  });

  const chargerEvenements = () => {
    fetch(`http://localhost:3001/commissions/${COMMISSION_ID}/evenements`)
      .then((res) => res.json())
      .then((data) => setEvenements(data));
  };

  useEffect(() => {
    chargerEvenements();

    fetch("http://localhost:3001/administrateurs")
      .then((res) => res.json())
      .then((data) => setAdministrateurs(data));
  }, []);

  const aujourd_hui = new Date().toISOString().split("T")[0];
  const evenementsActifs = evenements.filter((e) => e.date >= aujourd_hui);
  const evenementsArchives = evenements.filter((e) => e.date < aujourd_hui);

  const handleAjouter = () => {
    if (nouvelEvenement.nom.trim() === "") return;

    fetch("http://localhost:3001/evenements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...nouvelEvenement,
        responsable_id: nouvelEvenement.responsable_id
          ? Number(nouvelEvenement.responsable_id)
          : null,
        public: nouvelEvenement.public
          .split(",")
          .map((p) => p.trim())
          .filter((p) => p !== ""),
        commission_id: COMMISSION_ID,
      }),
    })
      .then((res) => res.json())
      .then(() => {
        chargerEvenements();
        setNouvelEvenement({
          nom: "",
          date: "",
          responsable_id: "",
          lieu: "",
          public: "",
        });
        setModeCreation("manuel");
        setModeleSelectionne("");
        setFormulaireVisible(false);
      });
  };

  const handleModifier = (evenementModifie) => {
    fetch(`http://localhost:3001/evenements/${evenementModifie.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...evenementModifie,
        responsable_id: evenementModifie.responsable_id
          ? Number(evenementModifie.responsable_id)
          : null,
      }),
    }).then(() => {
      return fetch(
        `http://localhost:3001/commissions/${COMMISSION_ID}/evenements`,
      )
        .then((res) => res.json())
        .then((data) => setEvenements(data));
    });
  };

  if (evenementActif !== null) {
    return (
      <EvenementDetails
        evenement={evenements.find((e) => e.id === evenementActif)}
        onRetour={() => {
          chargerEvenements();
          setEvenementActif(null);
        }}
        onModifier={handleModifier}
        administrateurs={administrateurs}
      />
    );
  }

  if (pageArchives) {
    return (
      <div className="dashboard">
        <button
          className="bouton-retour"
          onClick={() => setPageArchives(false)}
        >
          ←
        </button>
        <h2>Archives</h2>
        <div className="archives-liste">
          {[...evenementsArchives]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .map((evenement) => (
              <div
                key={evenement.id}
                className="archive-item"
                onClick={() => setEvenementActif(evenement.id)}
              >
                <span className="archive-nom">{evenement.nom}</span>
                <span className="archive-date">{evenement.date}</span>
              </div>
            ))}
          {evenementsArchives.length === 0 && (
            <span>Aucun événement archivé.</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <button className="bouton-retour" onClick={onRetour}>
        ←
      </button>

      <div className="grille">
        {[...evenementsActifs]
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .map((evenement) => (
            <div
              key={evenement.id}
              className="carte"
              onClick={() => setEvenementActif(evenement.id)}
            >
              <div className="carte-titre">{evenement.nom}</div>
              <div className="carte-date">{evenement.date}</div>
              <div className="carte-respo">{evenement.responsable}</div>
            </div>
          ))}

        <div
          className="carte carte-ajout"
          onClick={() => {
            setFormulaireVisible(true);
            setModeCreation("manuel");
            setModeleSelectionne("");
          }}
        >
          +
        </div>
      </div>

      <div className="lien-archives" onClick={() => setPageArchives(true)}>
        Archives ›››
      </div>

      {formulaireVisible && (
        <div className="overlay">
          <div className="formulaire">
            <h2>Nouvel événement</h2>

            {/* Mode création */}
            <label>Mode de création</label>
            <select
              value={modeCreation}
              onChange={(e) => setModeCreation(e.target.value)}
            >
              <option value="manuel">Nouvel événement</option>
              <option value="modele">À partir d’un événement existant</option>
            </select>

            {/* Choix modèle */}
            {modeCreation === "modele" && (
              <>
                <label>Choisir un événement modèle</label>
                <select
                  value={modeleSelectionne}
                  onChange={(e) => {
                    const id = e.target.value;
                    setModeleSelectionne(id);

                    const modele = evenements.find(
                      (evenement) => String(evenement.id) === id,
                    );

                    if (modele) {
                      setNouvelEvenement({
                        nom: modele.nom || "",
                        date: modele.date || "",
                        responsable_id: modele.responsable_id
                          ? String(modele.responsable_id)
                          : "",
                        lieu: modele.lieu || "",
                        public: Array.isArray(modele.public)
                          ? modele.public.join(", ")
                          : modele.public || "",
                      });
                    }
                  }}
                >
                  <option value="">— Choisir —</option>
                  {evenements.map((evenement) => (
                    <option key={evenement.id} value={evenement.id}>
                      {evenement.nom}{" "}
                      {evenement.date
                        ? ` - ${evenement.date.split("-")[0]}`
                        : ""}
                    </option>
                  ))}
                </select>
              </>
            )}

            <label>Nom</label>
            <input
              type="text"
              value={nouvelEvenement.nom}
              onChange={(e) =>
                setNouvelEvenement({
                  ...nouvelEvenement,
                  nom: e.target.value,
                })
              }
            />

            <label>Date</label>
            <input
              type="date"
              value={nouvelEvenement.date}
              onChange={(e) =>
                setNouvelEvenement({
                  ...nouvelEvenement,
                  date: e.target.value,
                })
              }
            />

            <label>Responsable</label>
            <select
              value={nouvelEvenement.responsable_id}
              onChange={(e) =>
                setNouvelEvenement({
                  ...nouvelEvenement,
                  responsable_id: e.target.value,
                })
              }
            >
              <option value="">— Choisir un administrateur —</option>
              {administrateurs.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.prenom} {r.nom} — {r.commission_nom}
                </option>
              ))}
            </select>

            <label>Lieu</label>
            <input
              type="text"
              value={nouvelEvenement.lieu}
              onChange={(e) =>
                setNouvelEvenement({
                  ...nouvelEvenement,
                  lieu: e.target.value,
                })
              }
            />

            <label> Public </label>
            <input
              type="text"
              value={nouvelEvenement.public}
              onChange={(e) =>
                setNouvelEvenement({
                  ...nouvelEvenement,
                  public: e.target.value,
                })
              }
            />

            <div className="formulaire-boutons">
              <button onClick={handleAjouter}>Créer</button>
              <button onClick={() => setFormulaireVisible(false)}>
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CommissionVieCollective;
