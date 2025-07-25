# Système de Tickets - API

Cette API utilise Node.js, Express et SQLite pour gérer un système de tickets et de support.

## Configuration requise

- Node.js
- npm

## Installation

1. Clonez ce dépôt
2. Installez les dépendances :
   ```
   npm install
   ```
3. Créez un fichier `.env` à la racine du projet avec les variables suivantes :
   ```
   PORT=5000
   NODE_ENV=development
   JWT_SECRET=votre_secret_jwt_ici
   ```

## Démarrage

```
npm start
```

Le serveur démarrera sur le port 5000 par défaut (ou le port spécifié dans le fichier .env).

## Structure du projet

- `config/` - Configuration de la base de données
- `controllers/` - Contrôleurs de l'application
- `data/` - Fichier de base de données SQLite
- `middlewares/` - Middlewares Express
- `models/` - Modèles de données
- `routes/` - Routes de l'API
- `utils/` - Utilitaires

## API Endpoints

### Authentification

- `POST /api/auth/signup` - S'inscrire et obtenir un token JWT
  - Champs requis : `email`, `username`, `password`, `role`
- `POST /api/auth/login` - Se connecter et obtenir un token JWT
  - Champs requis : `email`, `password`
- `GET /api/auth/me` - Vérifier le token et obtenir les informations de l'utilisateur connecté

### Utilisateurs

- `POST /api/users` - Créer un nouvel utilisateur (accessible à tous)
- `GET /api/users` - Obtenir tous les utilisateurs (Admin uniquement)
- `GET /api/users/:id` - Obtenir un utilisateur par ID (utilisateur lui-même ou Admin)
- `PUT /api/users/:id` - Mettre à jour un utilisateur (utilisateur lui-même ou Admin)
- `DELETE /api/users/:id` - Supprimer un utilisateur (Admin uniquement)



### Tickets

#### Opérations CRUD de base
- `POST /api/tickets` - Créer un nouveau ticket (authentification requise)
- `GET /api/tickets` - Obtenir tous les tickets (authentification requise)
- `GET /api/tickets/:id` - Obtenir un ticket par ID (authentification requise)
- `PUT /api/tickets/:id` - Mettre à jour un ticket (seul le créateur du ticket peut le modifier)
- `DELETE /api/tickets/:id` - Supprimer un ticket (le créateur du ticket ou un admin peut le supprimer)

#### Filtrage des tickets
- `GET /api/tickets/user/:userId` - Obtenir les tickets d'un utilisateur (authentification requise)
- `GET /api/tickets/category/:category` - Obtenir les tickets par catégorie (authentification requise)
- `GET /api/tickets/priority/:priority` - Obtenir les tickets par priorité (authentification requise)
- `GET /api/tickets/status/:status` - Obtenir les tickets par statut (authentification requise)

#### Statistiques des tickets
- `GET /api/tickets/stats/count` - Obtenir le nombre total de tickets (authentification requise)
- `GET /api/tickets/stats/user/:userId` - Obtenir le nombre de tickets par utilisateur (authentification requise)
- `GET /api/tickets/stats/status/:status` - Obtenir le nombre de tickets par statut (authentification requise)
- `GET /api/tickets/stats/status/:status/user/:userId` - Obtenir le nombre de tickets par statut et par utilisateur (authentification requise)
- `GET /api/tickets/stats/user/:userId/full` - Obtenir les statistiques complètes pour un utilisateur (authentification requise)

## Modèle de données

### Utilisateur (User)

- `id` - Identifiant unique (auto-incrémenté)
- `username` - Nom d'utilisateur (unique)
- `email` - Adresse e-mail
- `password` - Mot de passe
- `role` - Rôle de l'utilisateur (User ou Admin)
- `created_at` - Date de création
- `updated_at` - Date de mise à jour

### Ticket

- `id` - Identifiant unique (auto-incrémenté)
- `title` - Titre du ticket
- `description` - Description du ticket (optionnel)
- `category` - Catégorie du ticket (Bug reports, Account issues, General support, Technical issues)
- `priority` - Priorité du ticket (low, Medium, High)
- `status` - Statut du ticket (open, in progress, resolved)
- `created_by` - ID de l'utilisateur qui a créé le ticket (clé étrangère vers User)
- `created_at` - Date de création



## Règles métier

### Gestion des tickets

- Seul l'utilisateur qui a créé un ticket peut modifier ses informations
- L'utilisateur peut modifier uniquement les champs qu'il souhaite (title, description, category, priority) sans avoir à tout modifier
- Seul un administrateur peut changer le statut d'un ticket à "in progress" ou "resolved"
- L'utilisateur qui a créé un ticket ou un administrateur peut supprimer un ticket
- Toutes les routes nécessitent une authentification (sauf la création d'utilisateur et la connexion)

## Tester l'API avec Postman

### Authentification

1. **Créer un utilisateur**
   - Méthode: `POST`
   - URL: `http://localhost:5000/api/users`
   - Body (JSON):
     ```json
     {
       "username": "testuser",
       "email": "test@example.com",
       "password": "password123",
       "role": "User"
     }
     ```

2. **Se connecter pour obtenir un token JWT**
   - Méthode: `POST`
   - URL: `http://localhost:5000/api/auth/login`
   - Body (JSON):
     ```json
     {
       "username": "testuser",
       "password": "password123"
     }
     ```
   - La réponse contiendra un token JWT

3. **Utiliser le token pour les requêtes authentifiées**
   - Pour toutes les autres requêtes, ajoutez un header:
     - Key: `Authorization`
     - Value: `Bearer votre_token_jwt`

### Exemples de requêtes

#### Tickets

1. **Créer un ticket**
   - Méthode: `POST`
   - URL: `http://localhost:5000/api/tickets`
   - Headers: `Authorization: Bearer votre_token_jwt`
   - Body (JSON):
     ```json
     {
       "title": "Problème de connexion",
       "description": "Je ne peux pas me connecter à mon compte",
       "category": "Account issues",
       "priority": "Medium"
     }
     ```

2. **Mettre à jour un ticket**
   - Méthode: `PUT`
   - URL: `http://localhost:5000/api/tickets/1`
   - Headers: `Authorization: Bearer votre_token_jwt`
   - Body (JSON):
     ```json
     {
       "title": "Problème de connexion urgent",
       "priority": "High"
     }
     ```
   - Note: 
     - Seul le créateur du ticket peut le modifier
     - L'utilisateur peut modifier uniquement les champs qu'il souhaite (title, description, category, priority)
     - Seul un administrateur peut changer le statut à "in progress" ou "resolved"

3. **Supprimer un ticket**
   - Méthode: `DELETE`
   - URL: `http://localhost:5000/api/tickets/1`
   - Headers: `Authorization: Bearer votre_token_jwt`
   - Note: Le créateur du ticket ou un administrateur peut le supprimer

#### Chat avec IA (Qwen)

1. **Créer une nouvelle conversation**
   - Méthode: `POST`
   - URL: `http://localhost:5000/api/chats`
   - Headers: `Authorization: Bearer votre_token_jwt`
   - Body (JSON):
     ```json
     {
       "message": "Bonjour, j'ai un problème avec mon ticket #1234."
     }
     ```
   - La réponse contiendra l'ID de la conversation et la réponse de l'IA

2. **Ajouter un message à une conversation existante**
   - Méthode: `POST`
   - URL: `http://localhost:5000/api/chats/1/messages`
   - Headers: `Authorization: Bearer votre_token_jwt`
   - Body (JSON):
     ```json
     {
       "message": "Le problème persiste après avoir redémarré l'application."
     }
     ```
   - La réponse contiendra la réponse de l'IA

3. **Récupérer une conversation**
   - Méthode: `GET`
   - URL: `http://localhost:5000/api/chats/1`
   - Headers: `Authorization: Bearer votre_token_jwt`
   - La réponse contiendra tous les messages de la conversation

4. **Récupérer toutes les conversations de l'utilisateur**
   - Méthode: `GET`
   - URL: `http://localhost:5000/api/chats`
   - Headers: `Authorization: Bearer votre_token_jwt`
   - La réponse contiendra la liste des conversations de l'utilisateur

5. **Supprimer une conversation**
   - Méthode: `DELETE`
   - URL: `http://localhost:5000/api/chats/1`
   - Headers: `Authorization: Bearer votre_token_jwt`
   - Note: Seul le propriétaire de la conversation ou un administrateur peut la supprimer

- Lors de la création d'un ticket, son statut est automatiquement défini comme "open".
- Seul un administrateur peut changer le statut d'un ticket en "resolved".
- Un ticket prend le statut "in progress" si un administrateur l'a ouvert mais n'a pas encore répondu.
- Les utilisateurs peuvent filtrer les tickets par priorité, catégorie ou statut.
- Les statistiques permettent de suivre le nombre de tickets par utilisateur et par statut.