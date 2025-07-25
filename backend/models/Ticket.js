const db = require('../config/database');

class Ticket {
  // Créer un nouveau ticket
  static create(ticketData) {
    return new Promise((resolve, reject) => {
      let { title, description, category, priority, created_by, status = 'open' } = ticketData;
      
      // Corriger la casse de la priorité pour respecter la contrainte SQL
      if (priority && typeof priority === 'string') {
        if (priority.toLowerCase() === 'low') priority = 'low';
        else if (priority.toLowerCase() === 'medium') priority = 'Medium';
        else if (priority.toLowerCase() === 'high') priority = 'High';
      }
      
      // Vérifier que la catégorie est valide
      const validCategories = ['Bug reports', 'Account issues', 'General support', 'Technical issues'];
      if (!validCategories.includes(category)) {
        return reject(new Error('Category must be one of: Bug reports, Account issues, General support, Technical issues'));
      }
      
      // Vérifier que la priorité est valide
      const validPriorities = ['low', 'Medium', 'High'];
      if (!validPriorities.includes(priority)) {
        return reject(new Error('Priority must be one of: low, Medium, High'));
      }
      
      // Vérifier que le statut est valide
      const validStatuses = ['open', 'in progress', 'resolved'];
      if (status && !validStatuses.includes(status)) {
        return reject(new Error('Status must be one of: open, in progress, resolved'));
      }
      
      // Vérifier que l'utilisateur existe
      db.get('SELECT id FROM users WHERE id = ?', [created_by], (err, row) => {
        if (err) return reject(err);
        if (!row) return reject(new Error('User not found'));
        
        const query = `INSERT INTO tickets (title, description, category, priority, status, created_by) 
                      VALUES (?, ?, ?, ?, ?, ?)`;
        
        db.run(query, [title, description, category, priority, status, created_by], function(err) {
          if (err) return reject(err);
          
          // Récupérer le ticket créé
          Ticket.findById(this.lastID)
            .then(ticket => resolve(ticket))
            .catch(err => reject(err));
        });
      });
    });
  }
  
  // Trouver un ticket par ID
  static findById(id) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT t.*, u.username as creator_username 
        FROM tickets t
        LEFT JOIN users u ON t.created_by = u.id
        WHERE t.id = ?
      `;
      
      db.get(query, [id], (err, row) => {
        if (err) return reject(err);
        if (!row) return resolve(null);
        
        resolve(row);
      });
    });
  }
  
  // Trouver tous les tickets
  static findAll() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT t.*, u.username as creator_username 
        FROM tickets t
        LEFT JOIN users u ON t.created_by = u.id
      `;
      
      db.all(query, [], (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  }
  
  // Trouver les tickets par utilisateur
  static findByUser(userId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT t.*, u.username as creator_username 
        FROM tickets t
        LEFT JOIN users u ON t.created_by = u.id
        WHERE t.created_by = ?
      `;
      
      db.all(query, [userId], (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  }
  
  // Trouver les tickets par catégorie
  static findByCategory(category) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT t.*, u.username as creator_username 
        FROM tickets t
        LEFT JOIN users u ON t.created_by = u.id
        WHERE t.category = ?
      `;
      
      db.all(query, [category], (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  }
  
  // Mettre à jour un ticket
  static update(id, ticketData) {
    return new Promise((resolve, reject) => {
      // Vérifier si le statut est mis à jour et si l'utilisateur est un admin
      if (ticketData.status) {
        const validStatuses = ['open', 'in progress', 'resolved'];
        if (!validStatuses.includes(ticketData.status)) {
          return reject(new Error('Status must be one of: open, in progress, resolved'));
        }
        
        // Si l'utilisateur_id est fourni, vérifier s'il est admin
        if (ticketData.user_id) {
          db.get('SELECT role FROM users WHERE id = ?', [ticketData.user_id], (err, user) => {
            if (err) return reject(err);
            if (!user) return reject(new Error('User not found'));
            
            // Seul un admin peut changer le statut à 'resolved' ou 'in progress'
            if ((ticketData.status === 'resolved' || ticketData.status === 'in progress') && user.role !== 'Admin') {
              return reject(new Error('Only administrators can change ticket status to resolved or in progress'));
            }
            
            // Continuer avec la mise à jour
            performUpdate();
          });
          return; // Sortir de la fonction ici car performUpdate sera appelé de manière asynchrone
        }
      }
      
      // Si pas de vérification d'admin nécessaire, continuer directement
      performUpdate();
      
      function performUpdate() {
        // Construire la requête de mise à jour dynamiquement
        const updateFields = [];
        const values = [];
        
        for (const [key, value] of Object.entries(ticketData)) {
          // Vérifier que le champ est autorisé à être mis à jour
          if (['title', 'description', 'category', 'priority', 'status'].includes(key) && key !== 'user_id') {
            // Vérifier que la catégorie est valide
            if (key === 'category') {
              const validCategories = ['Bug reports', 'Account issues', 'General support', 'Technical issues'];
              if (!validCategories.includes(value)) {
                return reject(new Error('Category must be one of: Bug reports, Account issues, General support, Technical issues'));
              }
            }
            
            // Vérifier que la priorité est valide
            if (key === 'priority') {
              const validPriorities = ['Low', 'Medium', 'High'];
              if (!validPriorities.includes(value)) {
                return reject(new Error('Priority must be one of: Low, Medium, High'));
              }
            }
            
            updateFields.push(`${key} = ?`);
            values.push(value);
          }
        }
      
        // Ajouter le champ updated_at
        updateFields.push('updated_at = CURRENT_TIMESTAMP');
        
        // Si aucun champ à mettre à jour, retourner le ticket actuel
        if (updateFields.length === 1) {
          return Ticket.findById(id)
            .then(ticket => resolve(ticket))
            .catch(err => reject(err));
        }
        
        // Ajouter l'ID à la fin des valeurs
        values.push(id);
        
        const query = `UPDATE tickets SET ${updateFields.join(', ')} WHERE id = ?`;
        
        db.run(query, values, function(err) {
          if (err) return reject(err);
          
          // Vérifier si la mise à jour a affecté une ligne
          if (this.changes === 0) {
            return reject(new Error('Ticket not found'));
          }
          
          // Récupérer le ticket mis à jour
          Ticket.findById(id)
            .then(ticket => resolve(ticket))
            .catch(err => reject(err));
        });
      }
    });
  }
  
  // Supprimer un ticket
  static delete(id) {
    return new Promise((resolve, reject) => {
      const query = 'DELETE FROM tickets WHERE id = ?';
      
      db.run(query, [id], function(err) {
        if (err) return reject(err);
        
        // Vérifier si la suppression a affecté une ligne
        if (this.changes === 0) {
          return reject(new Error('Ticket not found'));
        }
        
        resolve({ id, deleted: true });
      });
    });
  }
  
  // Trouver les tickets par priorité
  static findByPriority(priority) {
    return new Promise((resolve, reject) => {
      const validPriorities = ['low', 'Medium', 'High'];
      if (!validPriorities.includes(priority)) {
        return reject(new Error('Priority must be one of: low, Medium, High'));
      }
      
      const query = `
        SELECT t.*, u.username as creator_username 
        FROM tickets t
        LEFT JOIN users u ON t.created_by = u.id
        WHERE t.priority = ?
      `;
      
      db.all(query, [priority], (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  }
  
  // Trouver les tickets par statut
  static findByStatus(status) {
    return new Promise((resolve, reject) => {
      const validStatuses = ['open', 'in progress', 'resolved'];
      if (!validStatuses.includes(status)) {
        return reject(new Error('Status must be one of: open, in progress, resolved'));
      }
      
      const query = `
        SELECT t.*, u.username as creator_username 
        FROM tickets t
        LEFT JOIN users u ON t.created_by = u.id
        WHERE t.status = ?
      `;
      
      db.all(query, [status], (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  }
  
  // Compter le nombre total de tickets
  static countAll() {
    return new Promise((resolve, reject) => {
      const query = 'SELECT COUNT(*) as count FROM tickets';
      
      db.get(query, [], (err, row) => {
        if (err) return reject(err);
        resolve(row.count);
      });
    });
  }
  
  // Compter le nombre de tickets par utilisateur
  static countByUser(userId) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT COUNT(*) as count FROM tickets WHERE created_by = ?';
      
      db.get(query, [userId], (err, row) => {
        if (err) return reject(err);
        resolve(row.count);
      });
    });
  }
  
  // Compter le nombre de tickets par statut
  static countByStatus(status) {
    return new Promise((resolve, reject) => {
      const validStatuses = ['open', 'in progress', 'resolved'];
      if (!validStatuses.includes(status)) {
        return reject(new Error('Status must be one of: open, in progress, resolved'));
      }
      
      const query = 'SELECT COUNT(*) as count FROM tickets WHERE status = ?';
      
      db.get(query, [status], (err, row) => {
        if (err) return reject(err);
        resolve(row.count);
      });
    });
  }
  
  // Compter le nombre de tickets par statut et par utilisateur
  static countByStatusAndUser(status, userId) {
    return new Promise((resolve, reject) => {
      const validStatuses = ['open', 'in progress', 'resolved'];
      if (!validStatuses.includes(status)) {
        return reject(new Error('Status must be one of: open, in progress, resolved'));
      }
      
      const query = 'SELECT COUNT(*) as count FROM tickets WHERE status = ? AND created_by = ?';
      
      db.get(query, [status, userId], (err, row) => {
        if (err) return reject(err);
        resolve(row.count);
      });
    });
  }
  
  // Obtenir des statistiques complètes pour un utilisateur
  static getUserStats(userId) {
    return new Promise(async (resolve, reject) => {
      try {
        const totalTickets = await Ticket.countByUser(userId);
        const openTickets = await Ticket.countByStatusAndUser('open', userId);
        const inProgressTickets = await Ticket.countByStatusAndUser('in progress', userId);
        const resolvedTickets = await Ticket.countByStatusAndUser('resolved', userId);
        
        resolve({
          totalTickets,
          openTickets,
          inProgressTickets,
          resolvedTickets
        });
      } catch (error) {
        reject(error);
      }
    });
  }
}

module.exports = Ticket;