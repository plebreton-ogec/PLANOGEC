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
      public: e.public ? e.public.split(",") : [],
    })),
  );
});

// Créer un événement
app.post("/evenements", (req, res) => {
  try {
    const {
      commission_id,
      nom,
      date,
      responsable_id,
      lieu,
      public: publicCible,
      lien_drive,
    } = req.body;
    const publicString = Array.isArray(publicCible)
      ? publicCible.join(",")
      : publicCible || "";
    const result = db
      .prepare(
        "INSERT INTO evenements (commission_id, nom, date, responsable_id, lieu, public, lien_drive) VALUES (?, ?, ?, ?, ?, ?, ?)",
      )
      .run(
        commission_id,
        nom,
        date,
        responsable_id ? Number(responsable_id) : null,
        lieu,
        publicString,
        lien_drive || null,
      );
    res.json({ id: result.lastInsertRowid });
  } catch (err) {
    console.error("Erreur POST evenement:", err);
    res.status(500).json({ error: err.message });
  }
});

// Modifier un événement
app.put("/evenements/:id", (req, res) => {
  try {
    const {
      nom,
      date,
      responsable_id,
      lieu,
      public: publicCible,
      lien_drive,
    } = req.body;
    const publicString = Array.isArray(publicCible)
      ? publicCible.join(",")
      : publicCible || "";
    db.prepare(
      "UPDATE evenements SET nom = ?, date = ?, responsable_id = ?, lieu = ?, public = ?, lien_drive = ? WHERE id = ?",
    ).run(
      nom,
      date,
      responsable_id ? Number(responsable_id) : null,
      lieu,
      publicString,
      lien_drive || null,
      req.params.id,
    );
    res.json({ success: true });
  } catch (err) {
    console.error("Erreur PUT evenement:", err);
    res.status(500).json({ error: err.message });
  }
});

// Supprimer un événement
app.delete("/evenements/:id", (req, res) => {
  db.prepare("DELETE FROM taches WHERE evenement_id = ?").run(req.params.id);
  db.prepare("DELETE FROM evenements WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

// ---- TÂCHES ----

// Récupérer les tâches d'un événement
app.get("/evenements/:id/taches", (req, res) => {
  const taches = db
    .prepare("SELECT * FROM taches WHERE evenement_id = ?")
    .all(req.params.id);
  res.json(
    taches.map((t) => ({
      ...t,
      responsables: JSON.parse(t.responsables || "[]"),
    })),
  );
});

// Créer une tâche
app.post("/taches", (req, res) => {
  const { evenement_id, nom, responsable_id, delai, lien_drive } = req.body;
  const result = db
    .prepare(
      "INSERT INTO taches (evenement_id, nom, responsables, delai, lien_drive) VALUES (?, ?, ?, ?, ?)",
    )
    .run(
      evenement_id,
      nom,
      responsable_id ? JSON.stringify([String(responsable_id)]) : "[]",
      delai,
      lien_drive || null,
    );
  res.json({ id: result.lastInsertRowid });
});

// Mettre à jour une tâche
app.put("/taches/:id", (req, res) => {
  const { nom, responsable_id, delai, terminee, lien_drive } = req.body;
  db.prepare(
    "UPDATE taches SET nom = ?, responsables = ?, delai = ?, terminee = ?, lien_drive = ? WHERE id = ?",
  ).run(
    nom,
    responsable_id ? JSON.stringify([String(responsable_id)]) : "[]",
    delai,
    terminee ? 1 : 0,
    lien_drive || null,
    req.params.id,
  );
  res.json({ success: true });
});

// Supprimer une tâche
app.delete("/taches/:id", (req, res) => {
  db.prepare("DELETE FROM taches WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

// ---- ADMINISTRATEURS ----

app.get("/administrateurs", (req, res) => {
  const rows = db
    .prepare(
      `SELECT a.*, c.nom AS commission_nom
       FROM administrateurs a
       LEFT JOIN commissions c ON a.commission_id = c.id
       ORDER BY a.nom, a.prenom`,
    )
    .all();
  res.json(rows);
});

app.post("/administrateurs", (req, res) => {
  const { nom, prenom, email, telephone, commission_id } = req.body;
  const result = db
    .prepare(
      "INSERT INTO administrateurs (nom, prenom, email, telephone, commission_id) VALUES (?, ?, ?, ?, ?)",
    )
    .run(nom, prenom, email || null, telephone || null, commission_id || null);
  res.json({ id: result.lastInsertRowid });
});

app.put("/administrateurs/:id", (req, res) => {
  const { nom, prenom, email, telephone, commission_id } = req.body;
  db.prepare(
    "UPDATE administrateurs SET nom = ?, prenom = ?, email = ?, telephone = ?, commission_id = ? WHERE id = ?",
  ).run(
    nom,
    prenom,
    email || null,
    telephone || null,
    commission_id || null,
    req.params.id,
  );
  res.json({ ok: true });
});

app.delete("/administrateurs/:id", (req, res) => {
  db.prepare("DELETE FROM administrateurs WHERE id = ?").run(req.params.id);
  res.json({ ok: true });
});

// ---- COMMISSIONS ----

app.get("/commissions", (req, res) => {
  const rows = db.prepare("SELECT * FROM commissions ORDER BY id").all();
  res.json(rows);
});

app.listen(3001, () => {
  console.log("Serveur démarré sur http://localhost:3001");
});
