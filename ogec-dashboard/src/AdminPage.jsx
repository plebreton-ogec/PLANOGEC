import { useState, useEffect } from "react";
import "./css/AdminPage.css";

function AdminPage({ onRetour }) {
  const [administrateurs, setAdministrateurs] = useState([]);
  const [commissions, setCommissions] = useState([]);
  const [edition, setEdition] = useState(null); // null | "nouveau" | id
  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    commission_id: "",
  });

  useEffect(() => {
    chargerDonnees();
  }, []);

  const chargerDonnees = () => {
    fetch("http://localhost:3001/administrateurs")
      .then((r) => r.json())
      .then(setAdministrateurs);
    fetch("http://localhost:3001/commissions")
      .then((r) => r.json())
      .then(setCommissions);
  };

  const ouvrirEdition = (admin) => {
    setForm({
      nom: admin.nom,
      prenom: admin.prenom,
      email: admin.email || "",
      telephone: admin.telephone || "",
      commission_id: admin.commission_id || "",
    });
    setEdition(admin.id);
  };

  const ouvrirNouveauForm = () => {
    setForm({
      nom: "",
      prenom: "",
      email: "",
      telephone: "",
      commission_id: "",
    });
    setEdition("nouveau");
  };

  const handleSauvegarder = () => {
    if (!form.nom.trim() || !form.prenom.trim()) return;
    const url =
      edition === "nouveau"
        ? "http://localhost:3001/administrateurs"
        : `http://localhost:3001/administrateurs/${edition}`;
    const method = edition === "nouveau" ? "POST" : "PUT";

    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
      .then((r) => r.json())
      .then(() => {
        chargerDonnees();
        setEdition(null);
      });
  };

  const handleSupprimer = (id) => {
    if (!window.confirm("Supprimer cet administrateur ?")) return;
    fetch(`http://localhost:3001/administrateurs/${id}`, {
      method: "DELETE",
    }).then(chargerDonnees);
  };

  return (
    <div className="adminpage">
      <div className="adminpage-header">
        <button className="adminpage-retour" onClick={onRetour}>
          ← Retour
        </button>
        <h1 className="adminpage-titre">🛡️ Administrateurs de l'OGEC</h1>
        {edition === null && (
          <button className="adminpage-btn-ajouter" onClick={ouvrirNouveauForm}>
            + Ajouter
          </button>
        )}
      </div>

      {/* Formulaire */}
      {edition !== null && (
        <div className="adminpage-form-wrapper">
          <div className="adminpage-form">
            <h2>
              {edition === "nouveau"
                ? "Nouvel administrateur"
                : "Modifier l'administrateur"}
            </h2>

            <div className="adminpage-form-grid">
              <div className="adminpage-form-group">
                <label>Prénom *</label>
                <input
                  type="text"
                  value={form.prenom}
                  onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                  placeholder="Prénom"
                />
              </div>
              <div className="adminpage-form-group">
                <label>Nom *</label>
                <input
                  type="text"
                  value={form.nom}
                  onChange={(e) => setForm({ ...form, nom: e.target.value })}
                  placeholder="Nom"
                />
              </div>
              <div className="adminpage-form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="email@exemple.com"
                />
              </div>
              <div className="adminpage-form-group">
                <label>Téléphone</label>
                <input
                  type="tel"
                  value={form.telephone}
                  onChange={(e) =>
                    setForm({ ...form, telephone: e.target.value })
                  }
                  placeholder="06 00 00 00 00"
                />
              </div>
              <div className="adminpage-form-group adminpage-form-group-full">
                <label>Commission</label>
                <select
                  value={form.commission_id}
                  onChange={(e) =>
                    setForm({ ...form, commission_id: e.target.value })
                  }
                >
                  <option value="">— Aucune —</option>
                  {commissions.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nom}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="adminpage-form-boutons">
              <button
                className="adminpage-btn-save"
                onClick={handleSauvegarder}
              >
                ✅ Sauvegarder
              </button>
              <button
                className="adminpage-btn-cancel"
                onClick={() => setEdition(null)}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Liste */}
      {edition === null && (
        <div className="adminpage-liste">
          {administrateurs.length === 0 ? (
            <div className="adminpage-vide">
              <p>Aucun administrateur enregistré.</p>
              <button
                className="adminpage-btn-ajouter"
                onClick={ouvrirNouveauForm}
              >
                + Ajouter le premier administrateur
              </button>
            </div>
          ) : (
            <table className="adminpage-table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Email</th>
                  <th>Téléphone</th>
                  <th>Commission</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {administrateurs.map((a) => (
                  <tr key={a.id}>
                    <td className="adminpage-td-nom">
                      {a.prenom} {a.nom}
                    </td>
                    <td>
                      {a.email || (
                        <span className="adminpage-vide-cell">—</span>
                      )}
                    </td>
                    <td>
                      {a.telephone || (
                        <span className="adminpage-vide-cell">—</span>
                      )}
                    </td>
                    <td>
                      {a.commission_nom || (
                        <span className="adminpage-vide-cell">Aucune</span>
                      )}
                    </td>
                    <td className="adminpage-td-actions">
                      <button
                        className="adminpage-btn-edit"
                        onClick={() => ouvrirEdition(a)}
                        title="Modifier"
                      >
                        ✏️
                      </button>
                      <button
                        className="adminpage-btn-delete"
                        onClick={() => handleSupprimer(a.id)}
                        title="Supprimer"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminPage;
