const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Créer un chemin vers le fichier de base de données
const dbPath = path.resolve(__dirname, '../data/database.sqlite');

// Créer une nouvelle instance de base de données
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erreur lors de la connexion à la base de données SQLite:', err.message);
  } else {
    console.log('Connexion à la base de données SQLite établie');
    
    // Créer la table users si elle n'existe pas
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT NOT NULL,
      password TEXT NOT NULL,
      role TEXT CHECK(role IN ('User', 'Admin')) NOT NULL DEFAULT 'User',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
      if (err) {
        console.error('Erreur lors de la création de la table users:', err.message);
      } else {
        console.log('Table users créée ou déjà existante');
      }
    });
    
    // Créer la table tickets si elle n'existe pas
    db.run(`CREATE TABLE IF NOT EXISTS tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT CHECK(category IN ('Bug reports', 'Account issues', 'General support', 'Technical issues')) NOT NULL,
      priority TEXT CHECK(priority IN ('low', 'Medium', 'High')) NOT NULL,
      status TEXT CHECK(status IN ('open', 'in progress', 'resolved')) NOT NULL DEFAULT 'open',
      created_by INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id)
    )`, (err) => {
      if (err) {
        console.error('Erreur lors de la création de la table tickets:', err.message);
      } else {
        console.log('Table tickets créée ou déjà existante');
      }
    });
    
    // Les tables chats et messages ont été supprimées
  }
});

module.exports = db;