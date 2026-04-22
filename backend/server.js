const express = require("express");
const cors = require("cors");
const { getDb, save } = require("./database");

const app = express();
app.use(cors());
app.use(express.json());

// Helper pour exécuter une requête et retourner les résultats
function query(db, sql, params = []) {
  const stmt = db.prepare(sql);
  const rows = [];
  stmt.bind(params);
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
}

function run(db, sql, params = []) {
  db.run(sql, params);
  save();
  // Récupère le dernier ID inséré
  const res = query(db, "SELECT last_insert_rowid() as id");
  return { lastInsertRowid: res[0]?.id };
}

// ---- ÉVÉNEMENTS ----

app.get("/commissions/:id/evenements", async (req, res) => {
  const db = await getDb();
  const evenements = query(db, "SELECT * FROM evenements WHERE commission_id = ?", [req.params.id]);
  res.json(evenements.map((e) => ({ ...e, public: e.public ? e.public.split(",") : [] })));
});

app.post("/evenements", async (req, res) => {
  try {
    const db = await getDb();
    const { commission_id, nom, date, responsable_id, lieu, public: publicCible, lien_drive } = req.body;
    const publicString = Array.isArray(publicCible) ? publicCible.join(",") : publicCible || "";
    const result = run(db,
      "INSERT INTO evenements (commission_id, nom, date, responsable_id, lieu, public, lien_drive) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [commission_id, nom, date, responsable_id ? Number(responsable_id) : null, lieu, publicString, lien_drive || null]
    );
    res.json({ id: result.lastInsertRowid });
  } catch (err) {
    console.error("Erreur POST evenement:", err);
    res.status(500).json({ error: err.message });
  }
});

app.put("/evenements/:id", async (req, res) => {
  try {
    const db = await getDb();
    const { nom, date, responsable_id, lieu, public: publicCible, lien_drive } = req.body;
    const publicString = Array.isArray(publicCible) ? publicCible.join(",") : publicCible || "";
    run(db,
      "UPDATE evenements SET nom = ?, date = ?, responsable_id = ?, lieu = ?, public = ?, lien_drive = ? WHERE id = ?",
      [nom, date, responsable_id ? Number(responsable_id) : null, lieu, publicString, lien_drive || null, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/evenements/:id", async (req, res) => {
  const db = await getDb();
  run(db, "DELETE FROM taches WHERE evenement_id = ?", [req.params.id]);
  run(db, "DELETE FROM evenements WHERE id = ?", [req.params.id]);
  res.json({ success: true });
});

// ---- TÂCHES ----

app.get("/evenements/:id/taches", async (req, res) => {
  const db = await getDb();
  const taches = query(db, "SELECT * FROM taches WHERE evenement_id = ?", [req.params.id]);
  res.json(taches.map((t) => ({ ...t, responsables: JSON.parse(t.responsables || "[]") })));
});

app.post("/taches", async (req, res) => {
  const db = await getDb();
  const { evenement_id, nom, responsable_id, delai, lien_drive } = req.body;
  const result = run(db,
    "INSERT INTO taches (evenement_id, nom, responsables, delai, lien_drive) VALUES (?, ?, ?, ?, ?)",
    [evenement_id, nom, responsable_id ? JSON.stringify([String(responsable_id)]) : "[]", delai, lien_drive || null]
  );
  res.json({ id: result.lastInsertRowid });
});

app.put("/taches/:id", async (req, res) => {
  const db = await getDb();
  const { nom, responsable_id, delai, terminee, lien_drive } = req.body;
  run(db,
    "UPDATE taches SET nom = ?, responsables = ?, delai = ?, terminee = ?, lien_drive = ? WHERE id = ?",
    [nom, responsable_id ? JSON.stringify([String(responsable_id)]) : "[]", delai, terminee ? 1 : 0, lien_drive || null, req.params.id]
  );
  res.json({ success: true });
});

app.delete("/taches/:id", async (req, res) => {
  const db = await getDb();
  run(db, "DELETE FROM taches WHERE id = ?", [req.params.id]);
  res.json({ success: true });
});

// ---- ADMINISTRATEURS ----

app.get("/administrateurs", async (req, res) => {
  const db = await getDb();
  const rows = query(db,
    `SELECT a.*, c.nom AS commission_nom
     FROM administrateurs a
     LEFT JOIN commissions c ON a.commission_id = c.id
     ORDER BY a.nom, a.prenom`
  );
  res.json(rows);
});

app.get("/administrateurs/:id/projets", async (req, res) => {
  const db = await getDb();
  const id = req.params.id;
  const evenementsRespo = query(db, "SELECT * FROM evenements WHERE responsable_id = ?", [id]);
  const toutesLesTaches = query(db, `SELECT * FROM taches WHERE responsables LIKE ?`, [`%"${id}"%`]);
  const idsEvenements = [...new Set([...evenementsRespo.map((e) => e.id), ...toutesLesTaches.map((t) => t.evenement_id)])];
  const result = idsEvenements.map((evtId) => {
    const evt = query(db, "SELECT * FROM evenements WHERE id = ?", [evtId])[0];
    const taches = query(db, `SELECT * FROM taches WHERE evenement_id = ? AND responsables LIKE ?`, [evtId, `%"${id}"%`]);
    return { ...evt, taches };
  });
  res.json(result);
});

app.post("/administrateurs", async (req, res) => {
  const db = await getDb();
  const { nom, prenom, email, telephone, commission_id } = req.body;
  const result = run(db,
    "INSERT INTO administrateurs (nom, prenom, email, telephone, commission_id) VALUES (?, ?, ?, ?, ?)",
    [nom, prenom, email || null, telephone || null, commission_id || null]
  );
  res.json({ id: result.lastInsertRowid });
});

app.put("/administrateurs/:id", async (req, res) => {
  const db = await getDb();
  const { nom, prenom, email, telephone, commission_id } = req.body;
  run(db,
    "UPDATE administrateurs SET nom = ?, prenom = ?, email = ?, telephone = ?, commission_id = ? WHERE id = ?",
    [nom, prenom, email || null, telephone || null, commission_id || null, req.params.id]
  );
  res.json({ ok: true });
});

app.delete("/administrateurs/:id", async (req, res) => {
  const db = await getDb();
  run(db, "DELETE FROM administrateurs WHERE id = ?", [req.params.id]);
  res.json({ ok: true });
});

// ---- COMMISSIONS ----

app.get("/commissions", async (req, res) => {
  const db = await getDb();
  const rows = query(db, "SELECT * FROM commissions ORDER BY id");
  res.json(rows);
});

app.listen(3001, () => {
  console.log("Serveur démarré sur http://localhost:3001");
});