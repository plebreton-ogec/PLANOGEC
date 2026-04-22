const initSqlJs = require("sql.js");
const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "ogec.db");

let db;

async function getDb() {
  if (db) return db;

  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  db.run(`PRAGMA foreign_keys = OFF`);

  db.run(`
    CREATE TABLE IF NOT EXISTS commissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nom TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS evenements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      commission_id INTEGER NOT NULL,
      nom TEXT NOT NULL,
      date TEXT,
      lieu TEXT,
      public TEXT DEFAULT '',
      FOREIGN KEY (commission_id) REFERENCES commissions(id)
    );
    CREATE TABLE IF NOT EXISTS taches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      evenement_id INTEGER,
      nom TEXT,
      responsables TEXT,
      delai TEXT,
      terminee INTEGER DEFAULT 0,
      FOREIGN KEY (evenement_id) REFERENCES evenements(id)
    );
    CREATE TABLE IF NOT EXISTS administrateurs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nom TEXT NOT NULL,
      prenom TEXT NOT NULL,
      email TEXT,
      telephone TEXT,
      commission_id INTEGER,
      FOREIGN KEY (commission_id) REFERENCES commissions(id)
    );
  `);

  // Insérer les commissions par défaut
  db.run(`
    INSERT OR IGNORE INTO commissions (id, nom) VALUES
      (1, 'Commission Vie Collective'),
      (2, 'Commission du Personnel'),
      (3, 'Commission Finance'),
      (4, 'Commission Sécurité, Hygiène et Réglementation'),
      (5, 'Commission Restauration et Périscolaire'),
      (6, 'Commission Vie Scolaire'),
      (7, 'Commission Vie Extérieure');
  `);

  // Migrations
  const migrations = [
    "ALTER TABLE evenements ADD COLUMN public TEXT DEFAULT ''",
    "ALTER TABLE taches ADD COLUMN terminee INTEGER DEFAULT 0",
    "ALTER TABLE evenements ADD COLUMN responsable_id INTEGER REFERENCES administrateurs(id)",
    "ALTER TABLE administrateurs ADD COLUMN commission_id INTEGER REFERENCES commissions(id)",
    "ALTER TABLE evenements ADD COLUMN lien_drive TEXT",
    "ALTER TABLE taches ADD COLUMN lien_drive TEXT",
  ];
  for (const sql of migrations) {
    try { db.run(sql); } catch (e) {}
  }

  db.run(`UPDATE evenements SET public = '' WHERE public = '[]' OR public IS NULL`);

  save();
  return db;
}

function save() {
  if (!db) return;
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

module.exports = { getDb, save };