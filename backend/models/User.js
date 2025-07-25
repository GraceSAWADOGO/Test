const db = require('../config/database');

class User {
  // Créer un nouvel utilisateur
  static create(userData) {
    return new Promise((resolve, reject) => {
      const { username, email, password, role = 'User' } = userData;
      
      // Vérifier que le rôle est valide
      if (role !== 'User' && role !== 'Admin') {
        return reject(new Error('User role must be User or Admin'));
      }
      
      const query = `INSERT INTO users (username, email, password, role) 
                    VALUES (?, ?, ?, ?)`;
      
      db.run(query, [username, email, password, role], function(err) {
        if (err) {
          // Vérifier si l'erreur est due à un nom d'utilisateur en double
          if (err.message.includes('UNIQUE constraint failed: users.username')) {
            return reject(new Error('Username already exists'));
          }
          return reject(err);
        }
        
        // Récupérer l'utilisateur créé
        User.findById(this.lastID)
          .then(user => resolve(user))
          .catch(err => reject(err));
      });
    });
  }
  
  // Trouver un utilisateur par ID
  static findById(id) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM users WHERE id = ?';
      
      db.get(query, [id], (err, row) => {
        if (err) return reject(err);
        if (!row) return resolve(null);
        
        resolve(row);
      });
    });
  }
  
  // Trouver un utilisateur par nom d'utilisateur
  static findByUsername(username) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM users WHERE username = ?';
      
      db.get(query, [username], (err, row) => {
        if (err) return reject(err);
        if (!row) return resolve(null);
        
        resolve(row);
      });
    });
  }
  
  // Trouver un utilisateur par email
  static findByEmail(email) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM users WHERE email = ?';
      
      db.get(query, [email], (err, row) => {
        if (err) return reject(err);
        if (!row) return resolve(null);
        
        resolve(row);
      });
    });
  }
  
  // Trouver tous les utilisateurs
  static findAll() {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM users';
      
      db.all(query, [], (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  }
  
  // Mettre à jour un utilisateur
  static update(id, userData) {
    return new Promise((resolve, reject) => {
      // Construire la requête de mise à jour dynamiquement
      const updateFields = [];
      const values = [];
      
      for (const [key, value] of Object.entries(userData)) {
        // Vérifier que le champ est autorisé à être mis à jour
        if (['username', 'email', 'password', 'role'].includes(key)) {
          // Vérifier que le rôle est valide
          if (key === 'role' && value !== 'User' && value !== 'Admin') {
            return reject(new Error('User role must be User or Admin'));
          }
          
          updateFields.push(`${key} = ?`);
          values.push(value);
        }
      }
      
      // Ajouter le champ updated_at
      updateFields.push('updated_at = CURRENT_TIMESTAMP');
      
      // Si aucun champ à mettre à jour, retourner l'utilisateur actuel
      if (updateFields.length === 1) {
        return User.findById(id)
          .then(user => resolve(user))
          .catch(err => reject(err));
      }
      
      // Ajouter l'ID à la fin des valeurs
      values.push(id);
      
      const query = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
      
      db.run(query, values, function(err) {
        if (err) {
          // Vérifier si l'erreur est due à un nom d'utilisateur en double
          if (err.message.includes('UNIQUE constraint failed: users.username')) {
            return reject(new Error('Username already exists'));
          }
          return reject(err);
        }
        
        // Vérifier si la mise à jour a affecté une ligne
        if (this.changes === 0) {
          return reject(new Error('User not found'));
        }
        
        // Récupérer l'utilisateur mis à jour
        User.findById(id)
          .then(user => resolve(user))
          .catch(err => reject(err));
      });
    });
  }
  
  // Supprimer un utilisateur
  static delete(id) {
    return new Promise((resolve, reject) => {
      const query = 'DELETE FROM users WHERE id = ?';
      
      db.run(query, [id], function(err) {
        if (err) return reject(err);
        
        // Vérifier si la suppression a affecté une ligne
        if (this.changes === 0) {
          return reject(new Error('User not found'));
        }
        
        resolve({ id, deleted: true });
      });
    });
  }
}

module.exports = User;