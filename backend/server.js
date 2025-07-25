const express = require("express");
const dotenv = require("dotenv");
const path = require("path");

// Initialiser la base de données SQLite
const db = require("./config/database");

const app = express();
dotenv.config();
app.use(express.json());

const cors = require('cors');
app.use(cors());

//activer les logs des requetes

// Routes
const userRoutes = require('./routes/userRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const authRoutes = require('./routes/authRoutes');
const axios = require('axios');
app.use('/api/users', userRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/auth', authRoutes);

// Route par défaut
app.get('/', (req, res) => {
  res.send('API du système de tickets est en ligne');
});

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).json({ message: 'Route non trouvée' });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));