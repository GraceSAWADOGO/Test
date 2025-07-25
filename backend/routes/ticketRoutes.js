const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const auth = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');
const Ticket = require('../models/Ticket');
const cors = require('cors');

// Middleware pour vérifier si l'utilisateur est le créateur du ticket
const isTicketCreator = async (req, res, next) => {
  try {
    const ticketId = req.params.id;
    const userId = req.user.id;
    
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket non trouvé' });
    }
    
    if (ticket.created_by !== userId && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Vous n\'êtes pas autorisé à effectuer cette action' });
    }
    
    req.ticket = ticket;
    next();
  } catch (error) {
    console.error('Erreur lors de la vérification du créateur du ticket:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Routes pour les tickets - CRUD de base
router.post('/', auth, ticketController.createTicket);
router.get('/', auth, ticketController.getAllTickets);
router.get('/my', auth, ticketController.getMyTickets);
router.get('/:id', auth, ticketController.getTicketById);

// Seul le créateur du ticket peut le modifier
router.put('/:id', auth, isTicketCreator, ticketController.updateTicket);

// Le créateur du ticket ou un admin peut le supprimer
router.delete('/:id', auth, isTicketCreator, ticketController.deleteTicket);

// Routes pour filtrer les tickets
router.get('/user/:userId', auth, ticketController.getTicketsByUser);
router.get('/category/:category', auth, ticketController.getTicketsByCategory);
router.get('/priority/:priority', auth, ticketController.getTicketsByPriority);
router.get('/status/:status', auth, ticketController.getTicketsByStatus);

// Routes pour les statistiques
router.get('/stats/count', auth, ticketController.getTicketsCount);
router.get('/stats/user/:userId', auth, ticketController.getTicketsCountByUser);
router.get('/stats/status/:status', auth, ticketController.getTicketsCountByStatus);
router.get('/stats/status/:status/user/:userId', auth, ticketController.getTicketsCountByStatusAndUser);
router.get('/stats/user/:userId/full', auth, ticketController.getUserStats);

module.exports = router;