/**
 * Script de test pour l'enregistrement d'un ticket
 * Ce script permet de tester directement la création d'un ticket sans passer par l'API
 */

require('dotenv').config();
const Ticket = require('./models/Ticket');
const db = require('./config/database');

// Fonction pour tester la création d'un ticket
async function testTicketCreation() {
  try {
    console.log('Test de création d\'un ticket...');
    
    // Récupérer un utilisateur existant pour le test
    const getUserPromise = new Promise((resolve, reject) => {
      db.get('SELECT id FROM users LIMIT 1', [], (err, row) => {
        if (err) return reject(err);
        if (!row) return reject(new Error('Aucun utilisateur trouvé dans la base de données'));
        resolve(row.id);
      });
    });
    
    const userId = await getUserPromise;
    console.log(`Utilisateur trouvé avec l'ID: ${userId}`);
    
    // Données du ticket de test
    const ticketData = {
      title: 'Problème de test',
      description: 'Ceci est un ticket de test pour vérifier l\'enregistrement',
      category: 'Technical issues',
      priority: 'Medium',
      created_by: userId
    };
    
    console.log('Données du ticket à créer:', ticketData);
    
    // Créer le ticket
    const ticket = await Ticket.create(ticketData);
    console.log('Ticket créé avec succès:', ticket);
    
    return ticket;
  } catch (error) {
    console.error('Erreur lors de la création du ticket:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
    throw error;
  }
}

// Exécuter le test et fermer la connexion à la base de données
testTicketCreation()
  .then(() => {
    console.log('Test terminé avec succès');
    // Fermer la connexion à la base de données après un délai pour s'assurer que toutes les opérations sont terminées
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
    console.error('Le test a échoué:', error.message);
    // Fermer la connexion à la base de données en cas d'erreur
    db.close((err) => {
      if (err) {
        console.error('Erreur lors de la fermeture de la connexion à la base de données:', err.message);
      }
      process.exit(1);
    });
  });