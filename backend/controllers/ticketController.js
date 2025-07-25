const Ticket = require('../models/Ticket');

// Créer un nouveau ticket
exports.createTicket = async (req, res) => {
  try {
    console.log("Payload reçu pour création ticket :", req.body, "User ID:", req.user && req.user.id);
    const ticketData = {
      ...req.body,
      // Assurez-vous que le titre commence par une majuscule
      title: req.body.title ? req.body.title.charAt(0).toUpperCase() + req.body.title.slice(1) : req.body.title,
      // Définir le statut par défaut à 'open'
      status: 'open',
      // Utiliser l'ID de l'utilisateur authentifié
      created_by: req.user.id
    };
    
    const ticket = await Ticket.create(ticketData);
    res.status(201).json(ticket);
  } catch (error) {
    if (error.message === 'User not found') {
      return res.status(404).json({ message: error.message });
    }
    if (error.message.includes('Category must be one of') || 
        error.message.includes('Priority must be one of') ||
        error.message.includes('Status must be one of')) {
      return res.status(400).json({ message: error.message });
    }
    console.error('Erreur lors de la création du ticket:', error);
    res.status(500).json({ message: 'Erreur lors de la création du ticket' });
  }
};

// Obtenir tous les tickets
exports.getAllTickets = async (req, res) => {
  try {
    const tickets = await Ticket.findAll();
    res.status(200).json(tickets);
  } catch (error) {
    console.error('Erreur lors de la récupération des tickets:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des tickets' });
  }
};

// Obtenir un ticket par ID
exports.getTicketById = async (req, res) => {
  try {
    const ticketId = req.params.id;
    const ticket = await Ticket.findById(ticketId);
    
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket non trouvé' });
    }
    
    res.status(200).json(ticket);
  } catch (error) {
    console.error('Erreur lors de la récupération du ticket:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération du ticket' });
  }
};

// Obtenir les tickets par utilisateur
exports.getTicketsByUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const tickets = await Ticket.findByUser(userId);
    res.status(200).json(tickets);
  } catch (error) {
    console.error('Erreur lors de la récupération des tickets de l\'utilisateur:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des tickets de l\'utilisateur' });
  }
};

// Obtenir les tickets par catégorie
exports.getTicketsByCategory = async (req, res) => {
  try {
    const category = req.params.category;
    const tickets = await Ticket.findByCategory(category);
    res.status(200).json(tickets);
  } catch (error) {
    console.error('Erreur lors de la récupération des tickets par catégorie:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des tickets par catégorie' });
  }
};

// Mettre à jour un ticket
exports.updateTicket = async (req, res) => {
  try {
    const ticketId = req.params.id;
    const ticketData = {
      ...req.body,
      // Utiliser l'ID de l'utilisateur authentifié
      user_id: req.user.id
    };
    
    // Assurez-vous que le titre commence par une majuscule si présent
    if (ticketData.title) {
      ticketData.title = ticketData.title.charAt(0).toUpperCase() + ticketData.title.slice(1);
    }
    
    const ticket = await Ticket.update(ticketId, ticketData);
    res.status(200).json(ticket);
  } catch (error) {
    if (error.message === 'Ticket not found') {
      return res.status(404).json({ message: 'Ticket non trouvé' });
    }
    if (error.message.includes('Category must be one of') || 
        error.message.includes('Priority must be one of') ||
        error.message.includes('Status must be one of')) {
      return res.status(400).json({ message: error.message });
    }
    if (error.message.includes('Only administrators can change')) {
      return res.status(403).json({ message: error.message });
    }
    console.error('Erreur lors de la mise à jour du ticket:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour du ticket' });
  }
};

// Supprimer un ticket
exports.deleteTicket = async (req, res) => {
  try {
    const ticketId = req.params.id;
    
    await Ticket.delete(ticketId);
    res.status(200).json({ message: 'Ticket supprimé avec succès' });
  } catch (error) {
    if (error.message === 'Ticket not found') {
      return res.status(404).json({ message: 'Ticket non trouvé' });
    }
    console.error('Erreur lors de la suppression du ticket:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression du ticket' });
  }
};

// Obtenir les tickets par priorité
exports.getTicketsByPriority = async (req, res) => {
  try {
    const priority = req.params.priority;
    const tickets = await Ticket.findByPriority(priority);
    res.status(200).json(tickets);
  } catch (error) {
    if (error.message.includes('Priority must be one of')) {
      return res.status(400).json({ message: error.message });
    }
    console.error('Erreur lors de la récupération des tickets par priorité:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des tickets par priorité' });
  }
};

// Obtenir les tickets par statut
exports.getTicketsByStatus = async (req, res) => {
  try {
    const status = req.params.status;
    const tickets = await Ticket.findByStatus(status);
    res.status(200).json(tickets);
  } catch (error) {
    if (error.message.includes('Status must be one of')) {
      return res.status(400).json({ message: error.message });
    }
    console.error('Erreur lors de la récupération des tickets par statut:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des tickets par statut' });
  }
};

// Obtenir le nombre total de tickets
exports.getTicketsCount = async (req, res) => {
  try {
    const count = await Ticket.countAll();
    res.status(200).json({ count });
  } catch (error) {
    console.error('Erreur lors du comptage des tickets:', error);
    res.status(500).json({ message: 'Erreur lors du comptage des tickets' });
  }
};

// Obtenir le nombre de tickets par utilisateur
exports.getTicketsCountByUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const count = await Ticket.countByUser(userId);
    res.status(200).json({ count });
  } catch (error) {
    console.error('Erreur lors du comptage des tickets par utilisateur:', error);
    res.status(500).json({ message: 'Erreur lors du comptage des tickets par utilisateur' });
  }
};

// Obtenir le nombre de tickets par statut
exports.getTicketsCountByStatus = async (req, res) => {
  try {
    const status = req.params.status;
    const count = await Ticket.countByStatus(status);
    res.status(200).json({ count });
  } catch (error) {
    if (error.message.includes('Status must be one of')) {
      return res.status(400).json({ message: error.message });
    }
    console.error('Erreur lors du comptage des tickets par statut:', error);
    res.status(500).json({ message: 'Erreur lors du comptage des tickets par statut' });
  }
};

// Obtenir le nombre de tickets par statut et par utilisateur
exports.getTicketsCountByStatusAndUser = async (req, res) => {
  try {
    const { status, userId } = req.params;
    const count = await Ticket.countByStatusAndUser(status, userId);
    res.status(200).json({ count });
  } catch (error) {
    if (error.message.includes('Status must be one of')) {
      return res.status(400).json({ message: error.message });
    }
    console.error('Erreur lors du comptage des tickets par statut et utilisateur:', error);
    res.status(500).json({ message: 'Erreur lors du comptage des tickets par statut et utilisateur' });
  }
};

// Obtenir les statistiques complètes pour un utilisateur
exports.getUserStats = async (req, res) => {
  try {
    const userId = req.params.userId;
    const stats = await Ticket.getUserStats(userId);
    res.status(200).json(stats);
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques utilisateur:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des statistiques utilisateur' });
  }
};

exports.getMyTickets = async (req, res) => {
  try {
    const userId = req.user.id;
    const tickets = await Ticket.findByUser(userId);
    res.status(200).json(tickets);
  } catch (error) {
    console.error('Erreur lors de la récupération des tickets utilisateur connecté:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des tickets utilisateur connecté' });
  }
};