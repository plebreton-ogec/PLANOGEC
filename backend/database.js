const Database = require("better-sqlite3");
const db = new Database("ogec.db");
db.pragma("foreign_keys = OFF");

db.exec(`
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

  INSERT OR IGNORE INTO commissions (id, nom) VALUES
    (1, 'Commission Vie Collective'),
    (2, 'Commission du Personnel'),
    (3, 'Commission Finance'),
    (4, 'Commission Sécurité, Hygiène et Réglementation'),
    (5, 'Commission Restauration et Périscolaire'),
    (6, 'Commission Vie Scolaire'),
    (7, 'Commission Vie Extérieure');

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

// Migrations
try {
  db.prepare("ALTER TABLE evenements ADD COLUMN public TEXT DEFAULT ''").run();
} catch (e) {}
try {
  db.prepare("ALTER TABLE taches ADD COLUMN terminee INTEGER DEFAULT 0").run();
} catch (e) {}
try {
  db.prepare(
    "ALTER TABLE evenements ADD COLUMN responsable_id INTEGER REFERENCES administrateurs(id)",
  ).run();
} catch (e) {}
try {
  db.prepare(
    "ALTER TABLE administrateurs ADD COLUMN commission_id INTEGER REFERENCES commissions(id)",
  ).run();
} catch (e) {}
try {
  db.prepare("ALTER TABLE evenements ADD COLUMN lien_drive TEXT").run();
} catch (e) {}
try {
  db.prepare("ALTER TABLE taches ADD COLUMN lien_drive TEXT").run();
} catch (e) {}

// Nettoie les anciennes valeurs JSON en tableau vide
db.prepare(
  "UPDATE evenements SET public = '' WHERE public = '[]' OR public IS NULL",
).run();

module.exports = db;
