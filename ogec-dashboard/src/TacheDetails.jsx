import { useState } from "react";

function formaterDate(date) {
  if (!date) return "Non renseignée";
  const [annee, mois, jour] = date.split("-");
  return `${jour}/${mois}/${annee}`;
}

function TacheDetails({ tache, onRetour, onModifier }) {
  const [modeEdition, setModeEdition] = useState(false);
  const [form, setForm] = useState({ ...tache });

  const handleSauvegarder = () => {
    onModifier(form);
    setModeEdition(false);
  };

  const handleToggleTerminee = () => {
    const updated = { ...form, terminee: !form.terminee };
    setForm(updated);
    onModifier(updated);
  };

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
            {form.terminee ? "✅ Terminée" : "🔄 En cours"}
          </span>
        </div>

        {modeEdition ? (
          <div className="formulaire-inline">
            <label>Nom de la tâche</label>
            <input
              type="text"
              value={form.nom}
              onChange={(e) => setForm({ ...form, nom: e.target.value })}
            />
            <label>Responsables (séparés par des virgules)</label>
            <input
              type="text"
              value={(form.responsables || []).join(", ")}
              onChange={(e) =>
                setForm({
                  ...form,
                  responsables: e.target.value
                    .split(",")
                    .map((r) => r.trim())
                    .filter((r) => r !== ""),
                })
              }
            />
            <label>Délai</label>
            <input
              type="date"
              value={form.delai}
              onChange={(e) => setForm({ ...form, delai: e.target.value })}
            />
            <button className="bouton-sauvegarder" onClick={handleSauvegarder}>
              ✅ Sauvegarder
            </button>
          </div>
        ) : (
          <>
            <div className="detail-section">
              <span className="detail-label">👥 Responsables</span>
              <span>
                {(form.responsables || []).join(", ") || "Non renseigné"}
              </span>
            </div>
            <div className="detail-section">
              <span className="detail-label">⏰ Délai</span>
              <span>{formaterDate(form.delai)}</span>
            </div>

            <button
              className={`bouton-terminer ${form.terminee ? "bouton-terminer-annuler" : ""}`}
              onClick={handleToggleTerminee}
            >
              {form.terminee
                ? "↩️ Marquer comme non terminée"
                : "✅ Marquer comme terminée"}
            </button>

            <button
              className="bouton-modifier"
              onClick={() => setModeEdition(true)}
            >
              ✏️ Modifier
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default TacheDetails;
