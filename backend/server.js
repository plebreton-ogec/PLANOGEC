const express = require("express");
const cors = require("cors");
const db = require("./database");

const app = express();
app.use(cors());
app.use(express.json());

// Récupérer tous les événements d'une commission
app.get("/commissions/:id/evenements", (req, res) => {
  const evenements = db
    .prepare("SELECT * FROM evenements WHERE commission_id = ?")
    .all(req.params.id);
  res.json(
    evenements.map((e) => ({
      ...e,
      participants: e.participants || "",
    })),
  );
});

// Créer un événement
app.post("/evenements", (req, res) => {
  const { commission_id, nom, date, responsable, lieu, participants } =
    req.body;
  const result = db
    .prepare(
      "INSERT INTO evenements (commission_id, nom, date, responsable, lieu, participants) VALUES (?, ?, ?, ?, ?, ?)",
    )
    .run(commission_id, nom, date, responsable, lieu, participants);
  res.json({ id: result.lastInsertRowid });
});

// Modifier un événement
app.put("/evenements/:id", (req, res) => {
  const { nom, date, responsable, lieu, participants } = req.body;
  db.prepare(
    "UPDATE evenements SET nom = ?, date = ?, responsable = ?, lieu = ?, participants = ? WHERE id = ?",
  ).run(nom, date, responsable, lieu, participants, req.params.id);
  res.json({ success: true });
});

// ---- TÂCHES ----

// Récupérer les tâches d'un événement
app.get("/evenements/:id/taches", (req, res) => {
  const taches = db
    .prepare("SELECT * FROM taches WHERE evenement_id = ?")
    .all(req.params.id);
  res.json(
    taches.map((t) => ({ ...t, responsables: JSON.parse(t.responsables) })),
  );
});

// Créer une tâche
app.post("/taches", (req, res) => {
  const { evenement_id, nom, responsables, delai } = req.body;
  const result = db
    .prepare(
      "INSERT INTO taches (evenement_id, nom, responsables, delai) VALUES (?, ?, ?, ?)",
    )
    .run(evenement_id, nom, JSON.stringify(responsables), delai);
  res.json({ id: result.lastInsertRowid });
});

// Mettre à jour une tâche

app.put("/taches/:id", (req, res) => {
  const { nom, responsables, delai, terminee } = req.body;
  db.prepare(
    "UPDATE taches SET nom = ?, responsables = ?, delai = ?, terminee = ? WHERE id = ?",
  ).run(
    nom,
    JSON.stringify(responsables),
    delai,
    terminee ? 1 : 0,
    req.params.id,
  );
  res.json({ success: true });
});

// Supprimer une tâche
app.delete("/taches/:id", (req, res) => {
  db.prepare("DELETE FROM taches WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

app.listen(3001, () => {
  console.log("Serveur démarré sur http://localhost:3001");
});

// Récupérer tous les responsables
app.get("/responsables", (req, res) => {
  const rows = db.prepare(`
    SELECT r.*, c.nom as commission_nom 
    FROM responsables r
    LEFT JOIN commissions c ON r.commission_id = c.id
  `).all();
  res.json(rows);
});

// Ajouter un responsable
app.post("/responsables", (req, res) => {
  const { nom, prenom, email, telephone, commission_id } = req.body;
  const result = db.prepare(`
    INSERT INTO responsables (nom, prenom, email, telephone, commission_id)
    VALUES (?, ?, ?, ?, ?)
  `).run(nom, prenom, email, telephone, commission_id);
  res.json({ id: result.lastInsertRowid });
});