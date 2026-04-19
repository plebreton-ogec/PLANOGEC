import { useState, useEffect } from "react";
import TacheDetails from "./TacheDetails";
import "./css/Evenement.css";

function formaterDate(date) {
  if (!date) return "Non renseignée";
  const [annee, mois, jour] = date.split("-");
  return `${jour}/${mois}/${annee}`;
}

function EvenementDetails({
  evenement,
  onRetour,
  onModifier,
  administrateurs = [],
}) {
  const [modeEdition, setModeEdition] = useState(false);
  const [form, setForm] = useState({ ...evenement });
  const [taches, setTaches] = useState([]);
  const [formulaireTacheVisible, setFormulaireTacheVisible] = useState(false);
  const [nouvelleTache, setNouvelleTache] = useState({
    nom: "",
    responsable_id: "",
    delai: "",
    lien_drive: "",
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

  useEffect(() => {
    setForm({ ...evenement });
  }, [evenement]);

  const nomAdmin = (id) => {
    const a = administrateurs.find((a) => String(a.id) === String(id));
    return a ? `${a.prenom} ${a.nom}` : id;
  };

  const estUrgent = (delai) => {
    if (!delai) return false;
    const diff = (new Date(delai) - new Date()) / (1000 * 60 * 60 * 24);
    return diff <= 14 && diff >= 0;
  };

  const handleAjouterTache = () => {
    if (nouvelleTache.nom.trim() === "") return;
    fetch("http://localhost:3001/taches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        evenement_id: evenement.id,
        nom: nouvelleTache.nom,
        responsable_id: nouvelleTache.responsable_id,
        delai: nouvelleTache.delai,
        lien_drive: nouvelleTache.lien_drive,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Erreur serveur");
        return res.json();
      })
      .then((data) => {
        setTaches([...taches, { ...nouvelleTache, id: data.id }]);
        setNouvelleTache({
          nom: "",
          responsable_id: "",
          delai: "",
          lien_drive: "",
        });
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
    onModifier({
      id: form.id,
      nom: form.nom,
      date: form.date,
      responsable_id: form.responsable_id,
      lieu: form.lieu,
      public: Array.isArray(form.public) ? form.public.join(",") : form.public,
      lien_drive: form.lien_drive,
    });
    setModeEdition(false);
  };

  const handleToggleTache = (tache, terminee) => {
    const updated = { ...tache, terminee };
    fetch(`http://localhost:3001/taches/${tache.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...updated,
        responsable_id:
          updated.responsable_id ||
          (updated.responsables && updated.responsables[0]) ||
          null,
      }),
    }).then(() => {
      setTaches(taches.map((t) => (t.id === tache.id ? updated : t)));
    });
  };

  const getNomResponsableTache = (tache) => {
    if (tache.responsable_id) return nomAdmin(tache.responsable_id);
    if (Array.isArray(tache.responsables) && tache.responsables[0])
      return nomAdmin(tache.responsables[0]);
    return "Non renseigné";
  };

  if (tacheActive !== null) {
    return (
      <TacheDetails
        tache={taches[tacheActive]}
        onRetour={() => setTacheActive(null)}
        administrateurs={administrateurs}
        onModifier={(tacheModifiee) => {
          fetch(`http://localhost:3001/taches/${tacheModifiee.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...tacheModifiee,
              responsable_id: tacheModifiee.responsable_id || null,
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
            <div className="formulaire-inline-field">
              <label>Nom</label>
              <input
                type="text"
                value={form.nom || ""}
                onChange={(e) => setForm({ ...form, nom: e.target.value })}
              />
            </div>
            <div className="formulaire-inline-field">
              <label>Date</label>
              <input
                type="date"
                value={form.date || ""}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>
            <div className="formulaire-inline-field">
              <label>Responsable</label>
              <select
                value={form.responsable_id || ""}
                onChange={(e) =>
                  setForm({ ...form, responsable_id: e.target.value })
                }
              >
                <option value="">— Choisir un responsable —</option>
                {administrateurs.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.prenom} {a.nom}
                  </option>
                ))}
              </select>
            </div>
            <div className="formulaire-inline-field">
              <label>Lieu</label>
              <input
                type="text"
                value={form.lieu || ""}
                onChange={(e) => setForm({ ...form, lieu: e.target.value })}
              />
            </div>
            <div className="formulaire-inline-field">
              <label>Public</label>
              <input
                type="text"
                value={
                  Array.isArray(form.public)
                    ? form.public.join(", ")
                    : form.public || ""
                }
                onChange={(e) => setForm({ ...form, public: e.target.value })}
              />
            </div>
            <div className="formulaire-inline-field">
              <label>Lien Drive</label>
              <input
                type="url"
                value={form.lien_drive || ""}
                onChange={(e) =>
                  setForm({ ...form, lien_drive: e.target.value })
                }
                placeholder="https://drive.google.com/..."
              />
            </div>
            <button className="bouton-sauvegarder" onClick={handleSauvegarder}>
              Sauvegarder
            </button>
          </div>
        ) : (
          <div className="event-layout">
            {/* Colonne gauche — infos */}
            <div className="event-infos">
              <div className="detail-section">
                <span className="detail-label">Date</span>
                <span>{formaterDate(form.date)}</span>
              </div>
              <div className="detail-section">
                <span className="detail-label">Responsable</span>
                <span>
                  {form.responsable_id
                    ? nomAdmin(form.responsable_id)
                    : form.responsable || "Non renseigné"}
                </span>
              </div>
              <div className="detail-section">
                <span className="detail-label">Lieu</span>
                <span>{form.lieu || "Non renseigné"}</span>
              </div>
              <div className="detail-section">
                <span className="detail-label">Public</span>
                <span>{form.public || "Aucun public pour l'instant"}</span>
              </div>
              <div className="detail-section">
                <span className="detail-label">Documents Drive</span>
                {form.lien_drive ? (
                  <a
                    href={form.lien_drive}
                    target="_blank"
                    rel="noreferrer"
                    className="lien-drive"
                  >
                    Accès au Drive
                  </a>
                ) : (
                  <span className="detail-vide">Aucun lien renseigné</span>
                )}
              </div>
              <div className="event-actions">
                <button
                  className="bouton-modifier"
                  onClick={() => setModeEdition(true)}
                >
                  Modifier
                </button>
                <button
                  className="bouton-supprimer-evenement"
                  onClick={() => {
                    const confirme = window.confirm(
                      `Supprimer l'événement "${evenement.nom}" ? Cette action est irréversible.`,
                    );
                    if (confirme) {
                      fetch(
                        `http://localhost:3001/evenements/${evenement.id}`,
                        { method: "DELETE" },
                      ).then(() => onRetour());
                    }
                  }}
                >
                  Supprimer l'événement
                </button>
              </div>
            </div>

            {/* Colonne droite — tâches */}
            <div className="event-taches">
              <div className="taches-header">
                <h3>Tâches</h3>
                <button
                  className="bouton-ajouter-tache"
                  onClick={() => setFormulaireTacheVisible(true)}
                >
                  + Ajouter
                </button>
              </div>

              {/* À faire */}
              <div className="taches-section">
                <span className="taches-section-label">À faire</span>
                {taches.filter((t) => !t.terminee).length === 0 ? (
                  <span className="detail-vide">Aucune tâche à faire</span>
                ) : (
                  taches
                    .filter((t) => !t.terminee)
                    .sort((a, b) => new Date(a.delai) - new Date(b.delai))
                    .map((tache) => (
                      <div
                        key={tache.id}
                        className="tache-todo-item"
                        style={
                          estUrgent(tache.delai)
                            ? { background: "#fff3e0", borderColor: "#ffb74d" }
                            : {}
                        }
                      >
                        <input
                          type="checkbox"
                          checked={false}
                          onChange={() => handleToggleTache(tache, true)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div
                          className="tache-todo-info"
                          onClick={() => setTacheActive(taches.indexOf(tache))}
                        >
                          <span className="tache-nom">{tache.nom}</span>
                          <span className="tache-meta">
                            {formaterDate(tache.delai)} —{" "}
                            {getNomResponsableTache(tache)}
                          </span>
                        </div>
                        <button
                          className="bouton-supprimer"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSupprimerTache(tache.id);
                          }}
                        >
                          Supprimer
                        </button>
                      </div>
                    ))
                )}
              </div>

              {/* Réalisées */}
              {taches.filter((t) => t.terminee).length > 0 && (
                <div className="taches-section taches-section--realisees">
                  <span className="taches-section-label">Réalisées</span>
                  {taches
                    .filter((t) => t.terminee)
                    .sort((a, b) => new Date(a.delai) - new Date(b.delai))
                    .map((tache) => (
                      <div
                        key={tache.id}
                        className="tache-todo-item tache-todo-item--terminee"
                      >
                        <input
                          type="checkbox"
                          checked={true}
                          onChange={() => handleToggleTache(tache, false)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div
                          className="tache-todo-info"
                          onClick={() => setTacheActive(taches.indexOf(tache))}
                        >
                          <span className="tache-nom">{tache.nom}</span>
                          <span className="tache-meta">
                            {formaterDate(tache.delai)} —{" "}
                            {getNomResponsableTache(tache)}
                          </span>
                        </div>
                        <button
                          className="bouton-supprimer"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSupprimerTache(tache.id);
                          }}
                        >
                          Supprimer
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
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
            <label>Responsable</label>
            <select
              value={nouvelleTache.responsable_id}
              onChange={(e) =>
                setNouvelleTache({
                  ...nouvelleTache,
                  responsable_id: e.target.value,
                })
              }
            >
              <option value="">— Choisir un responsable —</option>
              {administrateurs.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.prenom} {a.nom}
                </option>
              ))}
            </select>
            <label>Délai</label>
            <input
              type="date"
              value={nouvelleTache.delai}
              onChange={(e) =>
                setNouvelleTache({ ...nouvelleTache, delai: e.target.value })
              }
            />
            <label>Lien Drive</label>
            <input
              type="url"
              value={nouvelleTache.lien_drive}
              onChange={(e) =>
                setNouvelleTache({
                  ...nouvelleTache,
                  lien_drive: e.target.value,
                })
              }
              placeholder="https://drive.google.com/..."
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
