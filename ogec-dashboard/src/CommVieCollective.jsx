import { useState, useEffect } from "react";
import EvenementDetails from "./EvenementDetails";

const COMMISSION_ID = 1;

function CommissionVieCollective({ onRetour }) {
  const [evenements, setEvenements] = useState([]);
  const [formulaireVisible, setFormulaireVisible] = useState(false);
  const [evenementActif, setEvenementActif] = useState(null);
  const [responsables, setResponsables] = useState([]);
  const [nouvelEvenement, setNouvelEvenement] = useState({
    nom: "",
    date: "",
    responsable_id: "",
    lieu: "",
    participants: "",
  });

  useEffect(() => {
    fetch(`http://localhost:3001/commissions/${COMMISSION_ID}/evenements`)
      .then((res) => res.json())
      .then((data) => setEvenements(data));

    fetch("http://localhost:3001/responsables")
      .then((res) => res.json())
      .then((data) => setResponsables(data));
  }, []);

  const handleAjouter = () => {
    if (nouvelEvenement.nom.trim() === "") return;
    fetch("http://localhost:3001/evenements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...nouvelEvenement,
        participants: nouvelEvenement.participants
          .split(",")
          .map((p) => p.trim())
          .filter((p) => p !== ""),
        commission_id: COMMISSION_ID,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setEvenements([...evenements, { ...nouvelEvenement, id: data.id }]);
        setNouvelEvenement({
          nom: "",
          date: "",
          responsable_id: "",
          lieu: "",
          participants: "",
        });
        setFormulaireVisible(false);
      });
  };

  const handleModifier = (evenementModifie) => {
    fetch(`http://localhost:3001/evenements/${evenementModifie.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(evenementModifie),
    }).then(() => {
      const nouveauxEvenements = [...evenements];
      nouveauxEvenements[evenementActif] = evenementModifie;
      setEvenements(nouveauxEvenements);
    });
  };

  if (evenementActif !== null) {
    return (
      <EvenementDetails
        evenement={evenements[evenementActif]}
        onRetour={() => setEvenementActif(null)}
        onModifier={handleModifier}
        responsables={responsables}
      />
    );
  }

  return (
    <div className="dashboard">
      <button className="bouton-retour" onClick={onRetour}>
        ←
      </button>
      <header className="header"></header>

      <div className="grille">
        {evenements.map((evt, index) => (
          <div
            key={evt.id}
            className="carte"
            onClick={() => setEvenementActif(index)}
          >
            {evt.nom}
          </div>
        ))}
        <div
          className="carte carte-ajout"
          onClick={() => setFormulaireVisible(true)}
        >
          +
        </div>
      </div>

      {formulaireVisible && (
        <div className="overlay">
          <div className="formulaire">
            <h2>Nouvel événement</h2>

            <label>Nom</label>
            <input
              type="text"
              value={nouvelEvenement.nom}
              onChange={(e) =>
                setNouvelEvenement({ ...nouvelEvenement, nom: e.target.value })
              }
            />

            <label>Date</label>
            <input
              type="date"
              value={nouvelEvenement.date}
              onChange={(e) =>
                setNouvelEvenement({ ...nouvelEvenement, date: e.target.value })
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
              <option value="">— Choisir un responsable —</option>
              {responsables.map((r) => (
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
                setNouvelEvenement({ ...nouvelEvenement, lieu: e.target.value })
              }
            />

            <label>Participants</label>
            <input
              type="text"
              placeholder="Ex : Alice, Bob, Claire"
              value={nouvelEvenement.participants}
              onChange={(e) =>
                setNouvelEvenement({
                  ...nouvelEvenement,
                  participants: e.target.value,
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
