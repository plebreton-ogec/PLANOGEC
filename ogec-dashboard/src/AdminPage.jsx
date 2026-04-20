import { useState, useEffect } from "react";
import EvenementDetails from "./EvenementDetails";
import TacheDetails from "./TacheDetails";
import "./css/AdminPage.css";

function AdminPage({ onRetour }) {
  const [administrateurs, setAdministrateurs] = useState([]);
  const [commissions, setCommissions] = useState([]);
  const [edition, setEdition] = useState(null);
  const [adminProjets, setAdminProjets] = useState(null);
  const [evenementActif, setEvenementActif] = useState(null);
  const [tacheActive, setTacheActive] = useState(null);
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

  const voirProjets = (admin) => {
    fetch(`http://localhost:3001/administrateurs/${admin.id}/projets`)
      .then((r) => r.json())
      .then((data) => setAdminProjets({ admin, projets: data }));
  };

  if (tacheActive !== null) {
    return (
      <TacheDetails
        tache={tacheActive}
        onRetour={() => setTacheActive(null)}
        administrateurs={administrateurs}
        onModifier={(tacheModifiee) => {
          fetch(`http://localhost:3001/taches/${tacheModifiee.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...tacheModifiee,
              responsable_id:
                tacheModifiee.responsable_id ||
                (tacheModifiee.responsables && tacheModifiee.responsables[0]) ||
                null,
              nom: tacheModifiee.nom,
              delai: tacheModifiee.delai,
              terminee: tacheModifiee.terminee,
              lien_drive: tacheModifiee.lien_drive,
            }),
          }).then(() => {
            setTacheActive(null);
            voirProjets(adminProjets.admin);
          });
        }}
      />
    );
  }

  if (evenementActif !== null) {
    return (
      <EvenementDetails
        evenement={evenementActif}
        onRetour={() => setEvenementActif(null)}
        administrateurs={administrateurs}
        onModifier={(evenementModifie) => {
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
            setEvenementActif(null);
          });
        }}
      />
    );
  }

  if (adminProjets !== null) {
    return (
      <div className="adminpage">
        <div className="adminpage-header">
          <button
            className="adminpage-retour"
            onClick={() => setAdminProjets(null)}
          >
            ← Retour
          </button>
          <h1 className="adminpage-titre">
            Projets de {adminProjets.admin.prenom} {adminProjets.admin.nom}
          </h1>
        </div>
        <div className="adminpage-projets">
          {adminProjets.projets.length === 0 ? (
            <span className="adminpage-vide-cell">Aucun projet associé.</span>
          ) : (
            adminProjets.projets.map((evt) => (
              <div
                key={evt.id}
                className="adminpage-projet-item"
                onClick={() => setEvenementActif(evt)}
                style={{ cursor: "pointer" }}
              >
                <div className="adminpage-projet-header">
                  <span className="adminpage-projet-nom">{evt.nom}</span>
                  <span className="adminpage-projet-date">
                    {evt.date
                      ? evt.date.split("-").reverse().join("/")
                      : "Date non renseignée"}
                  </span>
                </div>
                {evt.taches && evt.taches.length > 0 && (
                  <div className="adminpage-projet-taches">
                    {evt.taches.map((t) => (
                      <div
                        key={t.id}
                        className="adminpage-projet-tache"
                        onClick={(e) => {
                          e.stopPropagation();
                          const responsables = (() => {
                            if (Array.isArray(t.responsables))
                              return t.responsables;
                            try {
                              return JSON.parse(t.responsables || "[]");
                            } catch {
                              return [];
                            }
                          })();
                          setTacheActive({ ...t, responsables });
                        }}
                        style={{ cursor: "pointer" }}
                      >
                        <span
                          className={`adminpage-projet-tache-nom ${t.terminee ? "terminee" : ""}`}
                        >
                          {t.terminee ? "✓" : "○"} {t.nom}
                        </span>
                        <span className="adminpage-projet-tache-delai">
                          {t.delai
                            ? t.delai.split("-").reverse().join("/")
                            : ""}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

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
                  <th>Responsabilités</th>
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
                    <td>
                      <button
                        className="adminpage-btn-projets"
                        onClick={() => voirProjets(a)}
                      >
                        Voir projets ›
                      </button>
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
