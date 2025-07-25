/**
 * Script de test pour l'API d'enregistrement de ticket
 * Ce script simule une requête HTTP pour créer un ticket
 */

require('dotenv').config();
const axios = require('axios');
const jwt = require('jsonwebtoken');

// Configuration
const API_URL = `http://localhost:${process.env.PORT || 5001}`;

// Fonction pour se connecter et obtenir un token JWT
async function login(username, password) {
  try {
    console.log(`Tentative de connexion avec l'utilisateur: ${username}`);
    
    const response = await axios.post(`${API_URL}/api/auth/login`, {
      username,
      password
    });
    
    if (response.data && response.data.token) {
      console.log('Connexion réussie, token JWT obtenu');
      return response.data.token;
    } else {
      throw new Error('Token non reçu dans la réponse');
    }
  } catch (error) {
    console.error('Erreur lors de la connexion:', error.message);
    if (error.response) {
      console.error('Détails de l\'erreur:', error.response.data);
    }
    throw error;
  }
}

// Fonction pour créer un ticket via l'API
async function createTicket(token, ticketData) {
  try {
    console.log('Tentative de création d\'un ticket via l\'API...');
    console.log('Données du ticket:', ticketData);
    
    const response = await axios.post(`${API_URL}/api/tickets`, ticketData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Réponse du serveur:', response.status);
    console.log('Ticket créé:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la création du ticket via l\'API:', error.message);
    if (error.response) {
      console.error('Statut:', error.response.status);
      console.error('Données:', error.response.data);
    }
    throw error;
  }
}

// Fonction principale de test
async function runTest() {
  try {
    // 1. Se connecter pour obtenir un token
    const token = await login('testuser', 'password123');
    
    // Décoder le token pour vérifier l'utilisateur
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Utilisateur connecté:', decoded);
    
    // 2. Créer un ticket
    const ticketData = {
      title: 'Problème via API',
      description: 'Ceci est un ticket créé via l\'API pour tester l\'enregistrement',
      category: 'Technical issues',
      priority: 'Medium'
    };
    
    const createdTicket = await createTicket(token, ticketData);
    console.log('Test terminé avec succès');
    
    return createdTicket;
  } catch (error) {
    console.error('Le test a échoué:', error.message);
    throw error;
  }
}

// Exécuter le test
runTest()
  .then(() => {
    console.log('Test d\'API terminé avec succès');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Le test d\'API a échoué:', error.message);
    process.exit(1);
  });