const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Route pour l'inscription (signup)
router.post('/signup', authController.signup);

// Route pour l'authentification (login)
router.post('/login', authController.login);

// Route pour vérifier le token et obtenir les informations de l'utilisateur connecté
router.get('/me', authController.getMe);

module.exports = router;