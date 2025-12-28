# Guide d'Installation - WorkNest

## Installation rapide avec Docker

### 1. Prérequis
- Docker Desktop installé et démarré
- Git (optionnel)

### 2. Cloner le projet
```bash
git clone <repository-url>
cd Rattrapage_Dossier_Final
```

### 3. Configuration
```bash
# Copier le fichier d'environnement
cp env.example .env

# Éditer .env et modifier les valeurs si nécessaire
# Pour Docker, les valeurs par défaut fonctionnent
```

### 4. Démarrer les services
```bash
docker-compose up -d
```

Cette commande démarre :
- PostgreSQL (port 5432)
- Backend API (port 3000)
- Frontend React (port 5173)

### 5. Initialiser la base de données
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

### 6. Accéder à l'application
- **Frontend** : http://localhost:5173
- **Backend API** : http://localhost:3000
- **Documentation Swagger** : http://localhost:3000/api-docs
- **Prisma Studio** : `docker exec -it worknest-backend npx prisma studio` (accessible sur http://localhost:5555)

### 7. Comptes de test
Après avoir exécuté le seed :
- **Admin** : admin@worknest.fr / Admin1234!
- **Client** : client@test.fr / Client1234!

## Installation manuelle (sans Docker)

### 1. Prérequis
- Node.js 18+
- PostgreSQL 15+
- npm ou yarn

### 2. Base de données
```bash
# Créer la base de données
createdb worknest

# Ou via psql
psql -U postgres
CREATE DATABASE worknest;
\q
```

### 3. Backend
```bash
cd src
npm install

# Configurer .env
cp ../env.example .env
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

### 4. Frontend
```bash
cd front
npm install

# Configurer .env
cp .env.example .env

# Démarrer le serveur de développement
npm run dev
```

## Commandes utiles

### Docker
```bash
# Voir les logs
docker-compose logs -f

# Arrêter les services
docker-compose down

# Redémarrer les services
docker-compose restart

# Reconstruire les images
docker-compose build --no-cache
```

### Backend
```bash
# Tests
npm test

# Prisma Studio (interface graphique pour la BDD)
npm run prisma:studio

# Créer une nouvelle migration
npm run prisma:migrate -- --name nom_de_la_migration
```

### Frontend
```bash
# Build de production
npm run build

# Prévisualiser le build
npm run preview
```

## Dépannage

### Erreur de connexion à la base de données
- Vérifier que PostgreSQL est démarré
- Vérifier les variables d'environnement DATABASE_URL
- Vérifier que le port 5432 n'est pas utilisé par un autre service

### Erreur "Port already in use"
- Changer les ports dans docker-compose.yml ou .env
- Arrêter les services qui utilisent ces ports

### Erreur Prisma
```bash
# Réinitialiser Prisma
npm run prisma:generate
npm run prisma:migrate reset
```

### Erreur CORS
- Vérifier que FRONTEND_URL dans .env correspond à l'URL du frontend
- Vérifier la configuration CORS dans src/server.js

## Production

### Variables d'environnement de production
```env
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:5432/worknest
JWT_SECRET=<secret-fort-et-aléatoire>
FRONTEND_URL=https://votre-domaine.com
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
# Les fichiers sont dans front/dist/
```

### Déploiement
- Utiliser un serveur web (Nginx) pour servir le frontend
- Utiliser PM2 ou systemd pour gérer le processus Node.js
- Configurer un reverse proxy pour l'API
- Mettre en place SSL/TLS (Let's Encrypt)

