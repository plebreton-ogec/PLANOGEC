import { useState, useEffect } from "react";
import TacheDetails from "./TacheDetails";

function formaterDate(date) {
  if (!date) return "Non renseignée";
  const [annee, mois, jour] = date.split("-");
  return `${jour}/${mois}/${annee}`;
}

function EvenementDetails({ evenement, onRetour, onModifier }) {
  const [modeEdition, setModeEdition] = useState(false);
  const [form, setForm] = useState({ ...evenement });
  const [taches, setTaches] = useState([]);
  const [formulaireTacheVisible, setFormulaireTacheVisible] = useState(false);
  const [nouvelleTache, setNouvelleTache] = useState({
    nom: "",
    responsables: "",
    delai: "",
  });
  const [tacheActive, setTacheActive] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:3001/evenements/${evenement.id}/taches`)
      .then((res) => res.json())
      .then((data) =>
        setTaches(
          data.map((t) => ({
            ...t,
            responsables: Array.isArray(t.responsables)
              ? t.responsables
              : typeof t.responsables === "string"
                ? JSON.parse(t.responsables)
                : [],
          })),
        ),
      )
      .catch(() => setTaches([]));
  }, [evenement.id]);

  const handleAjouterTache = () => {
    if (nouvelleTache.nom.trim() === "") return;
    const responsablesArray = nouvelleTache.responsables
      .split(",")
      .map((r) => r.trim())
      .filter((r) => r !== "");

    fetch("http://localhost:3001/taches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        evenement_id: evenement.id,
        nom: nouvelleTache.nom,
        responsables: responsablesArray,
        delai: nouvelleTache.delai,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Erreur serveur");
        return res.json();
      })
      .then((data) => {
        setTaches([
          ...taches,
          {
            nom: nouvelleTache.nom,
            delai: nouvelleTache.delai,
            responsables: responsablesArray,
            id: data.id,
          },
        ]);
        setNouvelleTache({ nom: "", responsables: "", delai: "" });
        setFormulaireTacheVisible(false);
      })
      .catch((err) => console.error("Erreur ajout tâche :", err));
  };

  const handleSupprimerTache = (id) => {
    fetch(`http://localhost:3001/taches/${id}`, { method: "DELETE" }).then(() =>
      setTaches(taches.filter((t) => t.id !== id)),
    );
  };

  const handleSauvegarder = () => {
    onModifier(form);
    setModeEdition(false);
  };

  if (tacheActive !== null) {
    return (
      <TacheDetails
        tache={taches[tacheActive]}
        onRetour={() => setTacheActive(null)}
        onModifier={(tacheModifiee) => {
          fetch(`http://localhost:3001/taches/${tacheModifiee.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...tacheModifiee,
              responsables: JSON.stringify(tacheModifiee.responsables),
            }),
          }).then(() => {
            const nouvelles = [...taches];
            nouvelles[tacheActive] = tacheModifiee;
            setTaches(nouvelles);
          });
        }}
      />
    );
  }

  return (
    <div className="dashboard">
      <button className="bouton-retour" onClick={onRetour}>
        ←
      </button>

      <div className="detail-container">
        <div className="detail-header">
          <h1>{form.nom}</h1>
        </div>

        {modeEdition ? (
          <div className="formulaire-inline">
            <label>Nom</label>
            <input
              type="text"
              value={form.nom || ""}
              onChange={(e) => setForm({ ...form, nom: e.target.value })}
            />
            <label>Date</label>
            <input
              type="date"
              value={form.date || ""}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
            <label>Responsable</label>
            <input
              type="text"
              value={form.responsable || ""}
              onChange={(e) =>
                setForm({ ...form, responsable: e.target.value })
              }
            />
            <label>Lieu</label>
            <input
              type="text"
              value={form.lieu || ""}
              onChange={(e) => setForm({ ...form, lieu: e.target.value })}
            />
            <label>Participants</label>
            <input
              type="text"
              value={form.participants || ""}
              onChange={(e) =>
                setForm({ ...form, participants: e.target.value })
              }
            />
            <button className="bouton-sauvegarder" onClick={handleSauvegarder}>
              ✅ Sauvegarder
            </button>
          </div>
        ) : (
          <>
            <div className="detail-section">
              <span className="detail-label">📅 Date</span>
              <span>{formaterDate(form.date)}</span>
            </div>

            <div className="detail-section">
              <span className="detail-label">👤 Responsable</span>
              <span>{form.responsable || "Non renseigné"}</span>
            </div>

            <div className="detail-section">
              <span className="detail-label">📍 Lieu</span>
              <span>{form.lieu || "Non renseigné"}</span>
            </div>

            <div className="detail-section">
              <span className="detail-label">👥 Participants</span>
              <span>
                {form.participants || "Aucun participant pour l'instant"}
              </span>
            </div>

            <div className="detail-section detail-section-colonne">
              <span className="detail-label">✅ Tâches</span>
              {taches.length === 0 ? (
                <span className="detail-vide">Aucune tâche pour l'instant</span>
              ) : (
                <div className="taches-liste">
                  {taches.map((tache, index) => (
                    <div
                      key={tache.id}
                      className="tache-item"
                      onClick={() => setTacheActive(index)}
                      style={{ cursor: "pointer" }}
                    >
                      <div className="tache-info">
                        <span className="tache-nom">{tache.nom}</span>
                        <span className="tache-meta">
                          👥{" "}
                          {Array.isArray(tache.responsables)
                            ? tache.responsables.join(", ")
                            : tache.responsables}
                        </span>
                        <span className="tache-meta">
                          ⏰ {formaterDate(tache.delai)}
                        </span>
                      </div>
                      <button
                        className="bouton-supprimer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSupprimerTache(tache.id);
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <button
                className="bouton-ajouter-tache"
                onClick={() => setFormulaireTacheVisible(true)}
              >
                + Ajouter une tâche
              </button>
            </div>

            <div className="detail-section">
              <span className="detail-label">📎 Documents</span>
              <span className="detail-vide">Aucun document pour l'instant</span>
            </div>

            <button
              className="bouton-modifier"
              onClick={() => setModeEdition(true)}
            >
              ✏️ Modifier
            </button>
          </>
        )}
      </div>

      {formulaireTacheVisible && (
        <div className="overlay">
          <div className="formulaire">
            <h2>Nouvelle tâche</h2>
            <label>Nom de la tâche</label>
            <input
              type="text"
              value={nouvelleTache.nom}
              onChange={(e) =>
                setNouvelleTache({ ...nouvelleTache, nom: e.target.value })
              }
            />
            <label>Responsables (séparés par des virgules)</label>
            <input
              type="text"
              placeholder="Ex : Alice, Bob, Claire"
              value={nouvelleTache.responsables}
              onChange={(e) =>
                setNouvelleTache({
                  ...nouvelleTache,
                  responsables: e.target.value,
                })
              }
            />
            <label>Délai</label>
            <input
              type="date"
              value={nouvelleTache.delai}
              onChange={(e) =>
                setNouvelleTache({ ...nouvelleTache, delai: e.target.value })
              }
            />
            <div className="formulaire-boutons">
              <button onClick={handleAjouterTache}>Créer</button>
              <button onClick={() => setFormulaireTacheVisible(false)}>
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EvenementDetails;
