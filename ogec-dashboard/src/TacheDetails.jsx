import { useState } from "react";
import "./css/Tache.css";

function formaterDate(date) {
  if (!date) return "Non renseignée";
  const [annee, mois, jour] = date.split("-");
  return `${jour}/${mois}/${annee}`;
}

function TacheDetails({ tache, onRetour, onModifier, administrateurs = [] }) {
  const [modeEdition, setModeEdition] = useState(false);
  const [form, setForm] = useState({ ...tache });

  const nomAdmin = (id) => {
    const a = administrateurs.find((a) => String(a.id) === String(id));
    return a ? `${a.prenom} ${a.nom}` : id;
  };

  const handleSauvegarder = () => {
    onModifier({
      ...form,
      responsable_id:
        form.responsable_id ||
        (Array.isArray(form.responsables) && form.responsables[0]) ||
        (typeof form.responsables === "string" &&
          JSON.parse(form.responsables)[0]) ||
        null,
    });
    setModeEdition(false);
  };

  const handleResponsableChange = (e) => {
    setForm({ ...form, responsable_id: e.target.value });
  };

  const chargeAffichage = (() => {
    if (form.responsable_id) return nomAdmin(form.responsable_id);
    try {
      const responsables = Array.isArray(form.responsables)
        ? form.responsables
        : JSON.parse(form.responsables || "[]");
      const id = responsables[0];
      if (!id || id === "[" || id === "") return "";
      return nomAdmin(id);
    } catch {
      return "";
    }
  })();

  return (
    <div className="dashboard">
      <button className="bouton-retour" onClick={onRetour}>
        ←
      </button>

      <div className="detail-container">
        <div className="detail-header">
          <h1>{form.nom}</h1>
          <span
            className={`badge ${form.terminee ? "badge-terminee" : "badge-en-cours"}`}
          >
            {form.terminee ? "Terminée" : "En cours"}
          </span>
        </div>

        {modeEdition ? (
          <div className="formulaire-inline">
            <div className="formulaire-inline-field">
              <label>Nom de la tâche</label>
              <input
                type="text"
                value={form.nom}
                onChange={(e) => setForm({ ...form, nom: e.target.value })}
              />
            </div>
            <div className="formulaire-inline-field">
              <label>Délai</label>
              <input
                type="date"
                value={form.delai}
                onChange={(e) => setForm({ ...form, delai: e.target.value })}
              />
            </div>
            <div className="formulaire-inline-field formulaire-inline-field--full">
              <label>Chargé(e) de cette tâche</label>
              <select
                value={
                  form.responsable_id ||
                  (Array.isArray(form.responsables) && form.responsables[0]) ||
                  (typeof form.responsables === "string" &&
                    JSON.parse(form.responsables)[0]) ||
                  ""
                }
                onChange={handleResponsableChange}
              >
                <option value="">— Choisir —</option>
                {administrateurs.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.prenom} {a.nom}
                  </option>
                ))}
              </select>
            </div>
            <div className="formulaire-inline-field formulaire-inline-field--full">
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
          <>
            <div className="detail-section">
              <span className="detail-label">Chargé(e) de cette tâche</span>
              <span>
                {chargeAffichage || (
                  <span className="detail-vide">Non renseigné</span>
                )}
              </span>
            </div>
            <div className="detail-section">
              <span className="detail-label">Délai</span>
              <span>{formaterDate(form.delai)}</span>
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
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default TacheDetails;
