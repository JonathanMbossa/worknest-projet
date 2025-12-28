# WorkNest - Plateforme SaaS de réservation d'espaces de coworking

## 📋 Description

WorkNest est une plateforme SaaS permettant aux particuliers et entreprises de réserver des espaces de coworking en France. Le projet comprend 25 espaces de coworking (salles de réunion, bureaux, zones créatives) avec un système complet de réservation, paiement et gestion.

## 🚀 Technologies utilisées

### Backend
- **Node.js** + **Express** - Framework web
- **PostgreSQL** - Base de données relationnelle
- **Prisma** - ORM pour la gestion de la base de données
- **JWT** + **bcrypt** - Authentification et sécurité
- **express-validator** - Validation des données
- **Swagger** - Documentation API

### Frontend
- **React** - Bibliothèque UI
- **Vite** - Build tool
- **Tailwind CSS** - Framework CSS
- **React Router** - Navigation
- **React Query** - Gestion des données
- **Axios** - Client HTTP

### DevOps
- **Docker** + **Docker Compose** - Containerisation
- **Nginx** (optionnel) - Reverse proxy

## 📁 Structure du projet

```
Rattrapage_Dossier_Final/
├── src/                    # Backend Node.js/Express
│   ├── config/             # Configuration (DB, Swagger)
│   ├── middleware/         # Middlewares (auth, validation)
│   ├── routes/             # Routes API
│   ├── utils/              # Utilitaires (JWT)
│   ├── tests/              # Tests unitaires
│   └── server.js           # Point d'entrée
├── front/                  # Frontend React
│   ├── src/
│   │   ├── components/     # Composants React
│   │   ├── contexts/       # Contextes (Auth)
│   │   ├── pages/          # Pages de l'application
│   │   ├── services/       # Services API
│   │   └── main.jsx        # Point d'entrée
│   └── package.json
├── prisma/                 # Schéma Prisma
│   └── schema.prisma
├── docker/                 # Configuration Docker
│   ├── Dockerfile.backend
│   └── Dockerfile.frontend
├── docs/                   # Documentation
│   ├── Politique de gestion et d'accès des données.pdf
│   └── Modélisation de la base de données.pdf
├── docker-compose.yml      # Orchestration Docker
└── README.md
```

## 🛠️ Installation

### Prérequis
- Node.js 18+
- Docker et Docker Compose
- PostgreSQL (si utilisation sans Docker)

### Installation avec Docker (recommandé)

1. **Cloner le dépôt**
```bash
git clone <repository-url>
cd Rattrapage_Dossier_Final
```

2. **Configurer les variables d'environnement**
```bash
cp .env.example .env
# Éditer .env avec vos valeurs
```

3. **Démarrer les services**
```bash
docker-compose up -d
```

4. **Initialiser la base de données**
```bash
# Accéder au conteneur backend
docker exec -it worknest-backend sh

# Générer le client Prisma
npm run prisma:generate

# Exécuter les migrations
npm run prisma:migrate
```

5. **Accéder à l'application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- Documentation Swagger: http://localhost:3000/api-docs

### Installation manuelle

1. **Backend**
```bash
cd src
npm install
cp ../.env.example .env
# Configurer .env
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

2. **Frontend**
```bash
cd front
npm install
npm run dev
```

## 📚 Documentation API

La documentation Swagger est accessible à l'adresse: `http://localhost:3000/api-docs`

### Endpoints principaux

#### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/me` - Profil utilisateur

#### Espaces
- `GET /api/spaces` - Liste des espaces (avec filtres)
- `GET /api/spaces/:id` - Détails d'un espace
- `POST /api/spaces` - Créer un espace (Admin)
- `PUT /api/spaces/:id` - Modifier un espace (Admin)
- `DELETE /api/spaces/:id` - Supprimer un espace (Admin)

#### Réservations
- `POST /api/reservations` - Créer une réservation
- `GET /api/reservations` - Liste des réservations
- `GET /api/reservations/:id` - Détails d'une réservation
- `POST /api/reservations/:id/cancel` - Annuler une réservation
- `POST /api/reservations/:id/confirm` - Confirmer (Admin)

#### Paiements
- `POST /api/payments` - Créer un paiement
- `GET /api/payments` - Liste des paiements
- `GET /api/payments/:id` - Détails d'un paiement

## 🧪 Tests

```bash
# Backend
cd src
npm test

# Tests spécifiques
npm test -- auth.test.js
```

## 🔐 Sécurité

- Authentification JWT avec expiration
- Hashage des mots de passe avec bcrypt (12 rounds)
- Validation des données avec express-validator
- Rate limiting sur les endpoints API
- Helmet pour la sécurité HTTP
- CORS configuré

## 📊 Base de données

Le schéma Prisma définit les modèles suivants:
- **User** - Utilisateurs (CLIENT, ENTERPRISE, ADMIN)
- **Space** - Espaces de coworking
- **Reservation** - Réservations
- **Payment** - Paiements

Voir `prisma/schema.prisma` pour plus de détails.

## 🎨 Pages Frontend

1. **Home** (`/`) - Page d'accueil
2. **Spaces** (`/spaces`) - Catalogue des espaces avec filtres
3. **SpaceDetail** (`/spaces/:id`) - Détails d'un espace
4. **Reservation** (`/spaces/:id/reserve`) - Formulaire de réservation
5. **Login** (`/login`) - Connexion
6. **Register** (`/register`) - Inscription
7. **Dashboard** (`/dashboard`) - Tableau de bord utilisateur

## 📝 Rôles utilisateurs

- **CLIENT** - Particulier, peut réserver et consulter ses réservations
- **ENTERPRISE** - Entreprise, mêmes droits que CLIENT avec champ entreprise
- **ADMIN** - Administrateur, gestion complète des espaces et réservations

## 🚢 Déploiement

### Variables d'environnement requises

```env
DATABASE_URL=postgresql://user:password@host:5432/database
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://your-frontend-url.com
```

### Build de production

```bash
# Backend
cd src
npm install --production
npm run prisma:generate
npm run prisma:migrate deploy

# Frontend
cd front
npm install
npm run build
```

## 📄 Licence

Ce projet est un projet éducatif.

## 👥 Auteur

Projet réalisé dans le cadre d'un rattrapage de dossier final.

## 📞 Support

Pour toute question, consulter la documentation dans le dossier `docs/`.
