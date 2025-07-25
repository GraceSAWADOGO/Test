/**
 * Script pour créer un utilisateur de test
 */

require('dotenv').config();
const db = require('./config/database');
const bcrypt = require('bcryptjs');

// Fonction pour créer un utilisateur de test
async function createTestUser() {
  return new Promise((resolve, reject) => {
    // Vérifier si l'utilisateur existe déjà
    db.get('SELECT id FROM users WHERE username = ?', ['testuser'], (err, row) => {
      if (err) return reject(err);
      
      if (row) {
        console.log('L\'utilisateur testuser existe déjà avec l\'ID:', row.id);
        return resolve(row.id);
      }
      
      // Hacher le mot de passe
      bcrypt.hash('password123', 10, (err, hashedPassword) => {
        if (err) return reject(err);
        
        // Insérer le nouvel utilisateur
        const query = `
          INSERT INTO users (username, email, password, role)
          VALUES (?, ?, ?, ?)
        `;
        
        db.run(query, ['testuser', 'test@example.com', hashedPassword, 'User'], function(err) {
          if (err) return reject(err);
          
          console.log('Utilisateur testuser créé avec l\'ID:', this.lastID);
          resolve(this.lastID);
        });
      });
    });
  });
}

// Exécuter la fonction et fermer la connexion à la base de données
createTestUser()
  .then(() => {
    console.log('Opération terminée avec succès');
    // Fermer la connexion à la base de données après un délai
    setTimeout(() => {
      db.close((err) => {
        if (err) {
          console.error('Erreur lors de la fermeture de la connexion à la base de données:', err.message);
        } else {
          console.log('Connexion à la base de données fermée');
        }
        process.exit(0);
      });
    }, 1000);
  })
  .catch((error) => {
    console.error('Erreur lors de la création de l\'utilisateur de test:', error.message);
    // Fermer la connexion à la base de données en cas d'erreur
    db.close((err) => {
      if (err) {
        console.error('Erreur lors de la fermeture de la connexion à la base de données:', err.message);
      }
      process.exit(1);
    });
  });