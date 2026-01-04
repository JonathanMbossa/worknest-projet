# WorkNest - Plateforme SaaS de réservation d'espaces de coworking

## 📋 Description

WorkNest est une plateforme SaaS permettant aux particuliers et entreprises de réserver des espaces de coworking en France. Le projet comprend 25 espaces de coworking (salles de réunion, bureaux, zones créatives) avec un système complet de réservation, paiement et gestion.

## 🚀 Technologies utilisées

### Backend
- **Node.js 18+** + **Express 4.18** - Framework web
- **PostgreSQL 15** - Base de données relationnelle
- **Prisma 5.7** - ORM pour la gestion de la base de données
- **JWT** (jsonwebtoken 9.0) + **bcryptjs 2.4** - Authentification et sécurité
- **express-validator 7.0** - Validation des données
- **Swagger** (swagger-ui-express 5.0) - Documentation API
- **Jest 29.7** + **Supertest 6.3** - Tests unitaires

### Frontend
- **React 18.2** - Bibliothèque UI
- **Vite 5.0** - Build tool
- **Tailwind CSS 3.3** - Framework CSS
- **React Router 6.20** - Navigation
- **React Query 3.39** - Gestion des données
- **Axios 1.6** - Client HTTP

### DevOps
- **Docker** + **Docker Compose** - Containerisation
- **Nginx** (optionnel) - Reverse proxy

## 📁 Structure du projet

```
Rattrapage_Dossier_Final/
├── src/                          # Backend Node.js/Express
│   ├── config/                   # Configuration
│   │   ├── database.js          # Configuration Prisma
│   │   └── swagger.js           # Configuration Swagger
│   ├── middleware/              # Middlewares
│   │   ├── auth.js              # Authentification JWT
│   │   └── validation.js         # Validation des données
│   ├── routes/                  # Routes API
│   │   ├── auth.js              # Authentification
│   │   ├── spaces.js            # Gestion des espaces
│   │   ├── reservations.js      # Gestion des réservations
│   │   ├── payments.js          # Gestion des paiements
│   │   └── users.js             # Gestion des utilisateurs
│   ├── prisma/                  # Base de données
│   │   ├── schema.prisma        # Schéma Prisma
│   │   ├── seed.js              # Données de test
│   │   └── migrations/          # Migrations Prisma
│   ├── tests/                   # Tests unitaires
│   │   ├── auth.test.js
│   │   ├── spaces.test.js
│   │   └── setup.js
│   ├── utils/                   # Utilitaires
│   │   └── jwt.js               # Génération tokens JWT
│   └── server.js                # Point d'entrée serveur
│
├── front/                        # Frontend React
│   ├── src/
│   │   ├── components/          # Composants réutilisables
│   │   │   ├── Navbar.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── contexts/           # Contextes React
│   │   │   └── AuthContext.jsx
│   │   ├── pages/              # Pages de l'application
│   │   │   ├── Home.jsx
│   │   │   ├── Spaces.jsx
│   │   │   ├── SpaceDetail.jsx
│   │   │   ├── Reservation.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── Dashboard.jsx
│   │   ├── services/           # Services API
│   │   │   └── api.js
│   │   ├── App.jsx             # Composant principal
│   │   ├── main.jsx            # Point d'entrée
│   │   └── index.css           # Styles Tailwind
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
│
├── docker/                       # Configuration Docker
│   ├── Dockerfile.backend
│   └── Dockerfile.frontend
│
├── docs/                         # Documentation
│   ├── Spécification_Fonctionnelles+Techniques.pdf
│   ├── Audit+Test.pdf
│   ├── Modélisation de la base de données.pdf
│   └── Politique de gestion et d'accès des données.pdf
│
├── docker-compose.yml            # Orchestration Docker
├── package.json                  # Dépendances backend
├── jest.config.js               # Configuration Jest
├── env.example                  # Variables d'environnement
└── README.md
```

## 🛠️ Installation

### Prérequis
- **Node.js 18+**
- **Docker Desktop** et **Docker Compose**
- **PostgreSQL 15** (si utilisation sans Docker)

### Installation avec Docker (recommandé)

1. **Cloner le dépôt**
```bash
git clone <repository-url>
cd Rattrapage_Dossier_Final
```

2. **Configurer les variables d'environnement**
```bash
cp env.example .env
# Éditer .env avec vos valeurs si nécessaire
# Pour Docker, les valeurs par défaut fonctionnent
```

3. **Démarrer les services**
```bash
docker-compose up -d
```

Cette commande démarre :
- PostgreSQL (port 5432)
- Backend API (port 3000)
- Frontend React (port 5173)

4. **Initialiser la base de données**
```bash
# Accéder au conteneur backend
docker exec -it worknest-backend sh

# Générer le client Prisma
npm run prisma:generate

# Créer les tables
npm run prisma:migrate

# (Optionnel) Charger des données de test
npm run prisma:seed

# Sortir du conteneur
exit
```

5. **Accéder à l'application**
- **Frontend** : http://localhost:5173
- **Backend API** : http://localhost:3000
- **Documentation Swagger** : http://localhost:3000/api-docs
- **Prisma Studio** : `docker exec -it worknest-backend npx prisma studio --schema=./src/prisma/schema.prisma` (accessible sur http://localhost:5555)

### Installation manuelle

1. **Base de données**
```bash
# Créer la base de données
createdb worknest
```

2. **Backend**
```bash
# Installer les dépendances
npm install

# Configurer .env
cp env.example .env
# Éditer .env avec vos paramètres de base de données

# Générer le client Prisma
npm run prisma:generate

# Créer les tables
npm run prisma:migrate

# (Optionnel) Charger des données de test
npm run prisma:seed

# Démarrer le serveur
npm run dev
```

3. **Frontend**
```bash
cd front
npm install
npm run dev
```

## 📚 Documentation API

La documentation Swagger interactive est accessible à l'adresse : **http://localhost:3000/api-docs**

### Endpoints principaux

#### Authentification
- `POST /api/auth/register` - Inscription d'un nouvel utilisateur
- `POST /api/auth/login` - Connexion utilisateur
- `GET /api/auth/me` - Récupérer le profil de l'utilisateur connecté

#### Espaces
- `GET /api/spaces` - Liste des espaces (avec filtres : capacité, prix, équipement, ville)
- `GET /api/spaces/:id` - Détails d'un espace avec planning
- `POST /api/spaces` - Créer un espace (Admin uniquement)
- `PUT /api/spaces/:id` - Modifier un espace (Admin uniquement)
- `DELETE /api/spaces/:id` - Désactiver un espace (Admin uniquement)

#### Réservations
- `POST /api/reservations` - Créer une réservation
- `GET /api/reservations` - Liste des réservations (filtrée par utilisateur ou admin)
- `GET /api/reservations/:id` - Détails d'une réservation
- `POST /api/reservations/:id/cancel` - Annuler une réservation
- `POST /api/reservations/:id/confirm` - Confirmer une réservation (Admin uniquement)

#### Paiements
- `POST /api/payments` - Créer un paiement pour une réservation
- `GET /api/payments` - Liste des paiements
- `GET /api/payments/:id` - Détails d'un paiement

#### Utilisateurs
- `GET /api/users/profile` - Récupérer le profil utilisateur
- `PUT /api/users/profile` - Mettre à jour le profil
- `PUT /api/users/profile/password` - Changer le mot de passe
- `GET /api/users` - Liste des utilisateurs (Admin uniquement)

## 🧪 Tests

```bash
# Exécuter tous les tests
npm test

# Tests spécifiques
npm test -- auth.test.js
npm test -- spaces.test.js
```

Les tests couvrent :
- Authentification (inscription, connexion, profil)
- Gestion des espaces (création, liste, filtres)

## 🔐 Sécurité

- **Authentification JWT** avec expiration (24h par défaut)
- **Hashage des mots de passe** avec bcrypt (12 rounds)
- **Validation des données** avec express-validator
- **Rate limiting** sur les endpoints API (100 req/15min)
- **Helmet** pour les headers de sécurité HTTP
- **CORS** configuré pour le frontend
- **Protection CSRF** via JWT

## 📊 Base de données

Le schéma Prisma définit les modèles suivants :
- **User** - Utilisateurs (CLIENT, ENTERPRISE, ADMIN)
- **Space** - Espaces de coworking
- **Reservation** - Réservations
- **Payment** - Paiements

Le schéma se trouve dans `src/prisma/schema.prisma`.

### Commandes Prisma

```bash
# Générer le client Prisma
npm run prisma:generate

# Créer une migration
npm run prisma:migrate

# Ouvrir Prisma Studio (interface graphique)
npm run prisma:studio

# Charger des données de test
npm run prisma:seed
```

## 🎨 Pages Frontend

1. **Home** (`/`) - Page d'accueil avec présentation
2. **Spaces** (`/spaces`) - Catalogue des espaces avec filtres avancés
3. **SpaceDetail** (`/spaces/:id`) - Détails d'un espace avec planning
4. **Reservation** (`/spaces/:id/reserve`) - Formulaire de réservation
5. **Login** (`/login`) - Connexion
6. **Register** (`/register`) - Inscription
7. **Dashboard** (`/dashboard`) - Tableau de bord utilisateur (profil, réservations)

## 📝 Rôles utilisateurs

- **CLIENT** - Particulier, peut réserver et consulter ses réservations
- **ENTERPRISE** - Entreprise, mêmes droits que CLIENT avec champ entreprise
- **ADMIN** - Administrateur, gestion complète des espaces et réservations

## 🚢 Déploiement

### Variables d'environnement requises

```env
DATABASE_URL=postgresql://user:password@host:5432/database
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=24h
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://your-frontend-url.com
```

### Build de production

```bash
# Backend
npm install --production
npm run prisma:generate
npm run prisma:migrate deploy

# Frontend
cd front
npm install
npm run build
# Les fichiers sont dans front/dist/
```

## 📄 Documentation

La documentation complète du projet se trouve dans le dossier `docs/` :

- **Spécification_Fonctionnelles+Techniques.pdf** - Spécifications fonctionnelles et techniques détaillées
- **Audit+Test.pdf** - Plan de recettage et audit de sécurité
- **Modélisation de la base de données.pdf** - Modélisation MCD/MLD
- **Politique de gestion et d'accès des données.pdf** - Politique RGPD et sécurité

## 🐛 Dépannage

### Erreur de connexion à la base de données
```bash
# Vérifier que PostgreSQL est démarré
docker ps | grep postgres

# Vérifier les variables d'environnement
docker exec -it worknest-backend env | grep DATABASE
```

### Prisma ne fonctionne pas
```bash
docker exec -it worknest-backend sh
npm run prisma:generate
npm run prisma:migrate reset
npm run prisma:seed
```

### Le frontend ne démarre pas
```bash
# Vérifier les logs
docker-compose logs frontend

# Reconstruire le conteneur
docker-compose build --no-cache frontend
docker-compose up -d frontend
```


