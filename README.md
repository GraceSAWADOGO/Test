# Système de Tickets de Support

## Présentation

Ce projet est une application complète de gestion de tickets de support, permettant aux utilisateurs de créer, suivre et gérer leurs demandes, et aux administrateurs de superviser et traiter les tickets. L'application propose une interface utilisateur moderne, une gestion des rôles (utilisateur/admin), des statistiques, des filtres, et une API sécurisée.

---

## Fonctionnalités principales
- Création de tickets par les utilisateurs
- Suivi de l’état des tickets (open, in progress, resolved)
- Filtrage et recherche des tickets
- Tableau de bord administrateur avec statistiques et graphiques
- Gestion des utilisateurs (inscription, connexion, rôles)
- Mise à jour et suppression des tickets
- Sécurité (authentification JWT, rôles)

---

## Technologies utilisées

### Frontend
- **HTML5/CSS3** :
  - *Pourquoi ?* Pour structurer et styliser les pages de façon moderne, responsive et accessible. HTML5 permet une sémantique claire, CSS3 offre des animations et un design agréable sans dépendance lourde.
- **JavaScript** :
  - *Pourquoi ?* Pour rendre l’interface dynamique, gérer les interactions utilisateur, les appels à l’API, le filtrage, la validation des formulaires, etc. JavaScript natif est léger et universellement supporté.
- **ECharts** :
  - *Pourquoi ?* Pour afficher des graphiques interactifs et modernes dans le dashboard admin (statistiques, tendances, répartitions). ECharts est puissant, personnalisable et facile à intégrer.
- **FontAwesome & Remixicon** :
  - *Pourquoi ?* Pour enrichir l’interface avec des icônes claires et attractives, facilitant la navigation et la compréhension visuelle.

### Backend
- **Node.js** : Environnement serveur
- **Express.js** : Framework web/API
- **SQLite** : Base de données légère (fichier)
- **JWT** : Authentification sécurisée

---

## Installation

### Prérequis
- Node.js (v14 ou plus recommandé)
- npm (installé avec Node.js)

### 1. Cloner le projet
```bash
 git clone <lien-du-repo>
 cd BusSystem
```

### 2. Installer les dépendances backend
```bash
cd backend
npm install
```

### 3. Lancer le backend
```bash
node server.js
```
Le serveur écoute par défaut sur `http://localhost:5001`

### 4. Lancer le frontend
Ouvre simplement les fichiers HTML du dossier `front/` dans ton navigateur (ex : `front/index.html`).

> **Astuce** : Pour un usage local optimal, tu peux utiliser une extension serveur local (Live Server sur VSCode, ou `python -m http.server` dans le dossier `front`).

---

## Modules à installer pour le backend

Avant de lancer le serveur, assure-toi d’avoir installé les modules suivants dans le dossier `backend/` :

| Module         | Utilité principale                                 |
|---------------|----------------------------------------------------|
| express        | Serveur web/API                                    |
| cors           | Autoriser les requêtes entre domaines              |
| dotenv         | Variables d’environnement                          |
| jsonwebtoken   | Authentification par token JWT                     |
| sqlite3        | Base de données locale (fichier)                   |
| axios          | Requêtes HTTP côté serveur (optionnel)             |
| nodemon        | Redémarrage auto du serveur en dev (optionnel)     |

**Commande d’installation**

```bash
npm install
```

**Commandes pour lancer le serveur**

- En mode normal :
  ```bash
  node server.js
  ```
- En mode développement (avec redémarrage auto) :
  ```bash
  npm run dev
  ```

---

## Que faire après avoir lancé le serveur ?

1. **Accéder à l’interface utilisateur (frontend)**
   - Ouvre le dossier `front/` de ton projet.
   - Double-clique sur `index.html` (ou ouvre-le dans ton navigateur préféré).
   - Pour une meilleure expérience, tu peux utiliser un serveur local (ex : extension Live Server sur VSCode, ou `python -m http.server` dans le dossier `front`).

2. **Créer un compte**
   - Clique sur “S’inscrire” ou “Créer un compte” pour créer un nouvel utilisateur ou un administrateur.
   - Remplis le formulaire d’inscription.

3. **Se connecter**
   - Utilise tes identifiants pour te connecter.
   - Selon ton rôle (utilisateur ou admin), tu accèderas à l’espace utilisateur ou à l’espace administrateur.

4. **Utiliser l’application**
   - **Utilisateur** : Crée des tickets, consulte-les, mets-les à jour ou supprime-les.
   - **Admin** : Accède au dashboard, visualise les statistiques, gère tous les tickets et utilisateurs.

5. **(Optionnel) Tester l’API**
   - Tu peux aussi tester les routes de l’API backend avec Postman, Insomnia ou un autre outil, en utilisant l’URL : `http://localhost:5001/api/...`

---

### Exemple de parcours utilisateur

1. Lance le serveur backend (`node server.js`).
2. Ouvre le frontend (`front/index.html`).
3. Inscris-toi, connecte-toi, puis commence à utiliser le système de tickets.

**N’oublie pas** :
- Le backend doit toujours être lancé avant d’utiliser le frontend.
- Si tu rencontres une erreur de connexion, vérifie que le serveur backend tourne bien sur `http://localhost:5001`.

---

## Utilisation

- **Inscription/Connexion** : Les utilisateurs peuvent s’inscrire et se connecter via l’interface.
- **Création de ticket** : Depuis l’espace utilisateur, clique sur "Create Ticket" et remplis le formulaire.
- **Suivi** : Accède à "My Tickets" pour voir, mettre à jour ou supprimer tes tickets.
- **Espace admin** : Les administrateurs accèdent à un dashboard avec statistiques, gestion des tickets et des utilisateurs.

---

## Structure du projet

```
BusSystem/
  backend/           # Code serveur Node.js/Express
    config/          # Configuration (base de données)
    controllers/     # Logique métier (auth, tickets, users)
    models/          # Modèles de données
    routes/          # Routes API
    ...
  front/             # Interface utilisateur (HTML/CSS/JS)
    admin/           # Pages admin
    user/            # Pages utilisateur
    js/              # Scripts JS
    css/             # Feuilles de style
    ...
```

---

## Sécurité & bonnes pratiques
- Authentification par token JWT
- Séparation claire frontend/backend
- Validation des entrées côté serveur
- Gestion des rôles (utilisateur/admin)

---

## Auteurs & contact
- Projet réalisé par une équipe passionnée.
- Pour toute question ou suggestion, consulte la page "À propos de nous" ou contacte le support via l’application.

---

## Licence
Ce projet est open-source, libre d’utilisation et de modification. 