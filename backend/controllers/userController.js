const User = require('../models/User');

// Créer un nouvel utilisateur
exports.createUser = async (req, res) => {
  try {
    const userData = req.body;
    const user = await User.create(userData);
    res.status(201).json(user);
  } catch (error) {
    if (error.message === 'Username already exists') {
      return res.status(400).json({ message: error.message });
    }
    if (error.message === 'User role must be User or Admin') {
      return res.status(400).json({ message: error.message });
    }
    console.error('Erreur lors de la création de l\'utilisateur:', error);
    res.status(500).json({ message: 'Erreur lors de la création de l\'utilisateur' });
  }
};

// Obtenir tous les utilisateurs
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.status(200).json(users);
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs' });
  }
};

// Obtenir un utilisateur par ID
exports.getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération de l\'utilisateur' });
  }
};

// Mettre à jour un utilisateur
exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const userData = req.body;
    
    const user = await User.update(userId, userData);
    res.status(200).json(user);
  } catch (error) {
    if (error.message === 'User not found') {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    if (error.message === 'Username already exists') {
      return res.status(400).json({ message: error.message });
    }
    if (error.message === 'User role must be User or Admin') {
      return res.status(400).json({ message: error.message });
    }
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'utilisateur' });
  }
};

// Supprimer un utilisateur
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    
    await User.delete(userId);
    res.status(200).json({ message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    if (error.message === 'User not found') {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    console.error('Erreur lors de la suppression de l\'utilisateur:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression de l\'utilisateur' });
  }
};