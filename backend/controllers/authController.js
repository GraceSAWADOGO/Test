const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Inscription d'un nouvel utilisateur (signup)
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
exports.signup = async (req, res) => {
  try {
    const { email, username, password, role } = req.body;
    
    // Vérifier si tous les champs requis sont présents
    if (!email || !username || !password) {
      return res.status(400).json({ message: 'Veuillez fournir un email, un nom d\'utilisateur et un mot de passe' });
    }
    
    // Vérifier si l'email existe déjà
    const existingEmail = await User.findByEmail(email);
    if (existingEmail) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }
    
    // Vérifier si le nom d'utilisateur existe déjà
    const existingUsername = await User.findByUsername(username);
    if (existingUsername) {
      return res.status(400).json({ message: 'Ce nom d\'utilisateur est déjà utilisé' });
    }
    
    // Créer le nouvel utilisateur
    const userData = { username, email, password, role };
    const newUser = await User.create(userData);
    
    // Générer un token JWT
    const token = jwt.sign(
      { id: newUser.id, username: newUser.username, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.status(201).json({
      message: 'Inscription réussie',
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    res.status(500).json({ message: 'Erreur lors de l\'inscription' });
  }
};

/**
 * Authentification d'un utilisateur (login)
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Vérifier si l'utilisateur existe
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }
    
    // Vérifier le mot de passe (dans un cas réel, vous utiliseriez bcrypt)
    if (user.password !== password) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }
    
    // Générer un token JWT
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.status(200).json({
      message: 'Authentification réussie',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Erreur lors de l\'authentification:', error);
    res.status(500).json({ message: 'Erreur lors de l\'authentification' });
  }
};

/**
 * Vérification du token et récupération des informations de l'utilisateur
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
exports.getMe = async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Authentification requise' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded._id);
    
    if (!user) {
      return res.status(401).json({ message: 'Utilisateur non trouvé' });
    }
    
    res.status(200).json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Erreur lors de la vérification du token:', error);
    res.status(401).json({ message: 'Token invalide ou expiré' });
  }
};