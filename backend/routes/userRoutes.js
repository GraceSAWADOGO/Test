const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');

// Routes pour les utilisateurs
// Création d'utilisateur - accessible à tous
router.post('/', userController.createUser);

// Liste des utilisateurs - accessible aux administrateurs uniquement
router.get('/', auth, authorize('Admin'), userController.getAllUsers);

// Obtenir un utilisateur par ID - accessible à l'utilisateur lui-même ou à un administrateur
router.get('/:id', auth, async (req, res, next) => {
  // Vérifier si l'utilisateur demande ses propres informations ou s'il est admin
  if (req.user.id === req.params.id || req.user.role === 'Admin') {
    return next();
  }
  return res.status(403).json({ message: 'Accès non autorisé' });
}, userController.getUserById);

// Mettre à jour un utilisateur - accessible à l'utilisateur lui-même ou à un administrateur
router.put('/:id', auth, async (req, res, next) => {
  // Vérifier si l'utilisateur met à jour ses propres informations ou s'il est admin
  if (req.user.id === req.params.id || req.user.role === 'Admin') {
    return next();
  }
  return res.status(403).json({ message: 'Accès non autorisé' });
}, userController.updateUser);

// Supprimer un utilisateur - accessible aux administrateurs uniquement
router.delete('/:id', auth, authorize('Admin'), userController.deleteUser);

module.exports = router;