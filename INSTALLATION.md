# Guide d'Installation Complet - WorkNest

## 📋 Table des matières

1. [Prérequis](#prérequis)
2. [Installation avec Docker (Recommandé)](#installation-avec-docker-recommandé)
3. [Installation manuelle](#installation-manuelle)
4. [Configuration](#configuration)
5. [Initialisation de la base de données](#initialisation-de-la-base-de-données)
6. [Vérification de l'installation](#vérification-de-linstallation)
7. [Accès à l'application](#accès-à-lapplication)
8. [Dépannage](#dépannage)
9. [Commandes utiles](#commandes-utiles)

---

## Prérequis

### Pour l'installation avec Docker (Recommandé)

- **Docker Desktop** version 4.0+ installé et démarré
  - Téléchargement : https://www.docker.com/products/docker-desktop
  - Vérifier l'installation : `docker --version`
  - Vérifier que Docker est démarré : `docker ps`

- **Git** (optionnel, pour cloner le dépôt)
  - Téléchargement : https://git-scm.com/downloads
  - Vérifier l'installation : `git --version`

### Pour l'installation manuelle

- **Node.js** version 18 ou supérieure
  - Téléchargement : https://nodejs.org/
  - Vérifier l'installation : `node --version` (doit afficher v18.x.x ou supérieur)
  - Vérifier npm : `npm --version`

- **PostgreSQL** version 15 ou supérieure
  - Téléchargement : https://www.postgresql.org/download/
  - Vérifier l'installation : `psql --version`
  - PostgreSQL doit être démarré et accessible

- **Git** (optionnel)

---

## Installation avec Docker (Recommandé)

### Étape 1 : Cloner le projet

```bash
# Cloner le dépôt (si vous avez l'URL)
git clone <repository-url>
cd Rattrapage_Dossier_Final

# Ou si vous avez déjà le projet, naviguer vers le dossier
cd Rattrapage_Dossier_Final
```

### Étape 2 : Vérifier Docker

```bash
# Vérifier que Docker est installé et fonctionne
docker --version
docker-compose --version

# Vérifier que Docker Desktop est démarré
docker ps
```

Si Docker n'est pas démarré, lancez Docker Desktop et attendez qu'il soit complètement démarré.

### Étape 3 : Configuration des variables d'environnement

```bash
# Copier le fichier d'exemple
cp env.example .env

# Éditer le fichier .env (optionnel pour Docker)
# Les valeurs par défaut dans docker-compose.yml fonctionnent
```

**Contenu du fichier `.env` (optionnel pour Docker) :**
```env
DATABASE_URL="postgresql://worknest:worknest_password@postgres:5432/worknest?schema=public"
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

**Note :** Pour Docker, ces variables sont déjà configurées dans `docker-compose.yml`. Vous n'avez besoin de créer `.env` que si vous voulez les personnaliser.

### Étape 4 : Démarrer les services Docker

```bash
# Démarrer tous les services en arrière-plan
docker-compose up -d
```

Cette commande va :
1. Télécharger les images nécessaires (si pas déjà présentes)
2. Construire les images personnalisées (backend et frontend)
3. Créer les conteneurs
4. Démarrer les services dans cet ordre :
   - PostgreSQL (port 5432)
   - Backend API (port 3000)
   - Frontend React (port 5173)

**Temps estimé :** 2-5 minutes la première fois (téléchargement des images)

### Étape 5 : Vérifier que les conteneurs sont démarrés

```bash
# Voir l'état de tous les conteneurs
docker-compose ps
```

Vous devriez voir 3 conteneurs avec le statut "Up" :
- `worknest-postgres` - Running
- `worknest-backend` - Running
- `worknest-frontend` - Running

Si un conteneur n'est pas démarré, voir la section [Dépannage](#dépannage).

### Étape 6 : Vérifier les logs

```bash
# Voir les logs de tous les services
docker-compose logs

# Voir les logs d'un service spécifique
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres

# Suivre les logs en temps réel
docker-compose logs -f backend
```

### Étape 7 : Initialiser la base de données

Une fois les conteneurs démarrés, il faut initialiser la base de données :

```bash
# Option 1 : Exécuter les commandes une par une
docker-compose exec backend npm run prisma:generate
docker-compose exec backend npm run prisma:migrate
docker-compose exec backend npm run prisma:seed

# Option 2 : Entrer dans le conteneur et exécuter les commandes
docker-compose exec backend sh
```

Une fois dans le conteneur :

```bash
# Générer le client Prisma
npm run prisma:generate

# Créer les tables dans la base de données
npm run prisma:migrate

# Charger des données de test (optionnel mais recommandé)
npm run prisma:seed

# Sortir du conteneur
exit
```

**Détails des commandes :**

1. **`prisma:generate`** : Génère le client Prisma TypeScript/JavaScript à partir du schéma
2. **`prisma:migrate`** : Crée les tables dans PostgreSQL selon le schéma Prisma
3. **`prisma:seed`** : Charge des données de test (utilisateurs et espaces)

### Étape 8 : Vérifier que tout fonctionne

```bash
# Vérifier les logs du backend
docker-compose logs backend --tail 20

# Vous devriez voir :
# ✅ Connexion à la base de données réussie
# 🚀 Serveur démarré sur le port 3000
```

---

## Installation manuelle

### Étape 1 : Cloner le projet

```bash
git clone <repository-url>
cd Rattrapage_Dossier_Final
```

### Étape 2 : Installer PostgreSQL

#### Sur Windows :
1. Télécharger PostgreSQL depuis https://www.postgresql.org/download/windows/
2. Installer avec l'installateur
3. Noter le mot de passe du superutilisateur `postgres`
4. Vérifier que le service PostgreSQL est démarré

#### Sur Linux (Ubuntu/Debian) :
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### Sur macOS :
```bash
brew install postgresql@15
brew services start postgresql@15
```

### Étape 3 : Créer la base de données

```bash
# Se connecter à PostgreSQL
psql -U postgres

# Dans psql, créer la base de données et l'utilisateur
CREATE DATABASE worknest;
CREATE USER worknest WITH PASSWORD 'worknest_password';
GRANT ALL PRIVILEGES ON DATABASE worknest TO worknest;
\q
```

**Alternative avec commande directe :**
```bash
createdb -U postgres worknest
```

### Étape 4 : Installer le backend

```bash
# Aller dans le dossier racine du projet
cd Rattrapage_Dossier_Final

# Installer les dépendances
npm install

# Copier et configurer les variables d'environnement
cp env.example .env
```

**Éditer le fichier `.env` :**
```env
DATABASE_URL="postgresql://worknest:worknest_password@localhost:5432/worknest?schema=public"
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

**Important :** Modifier `DATABASE_URL` avec vos identifiants PostgreSQL si différents.

### Étape 5 : Initialiser la base de données (Backend)

```bash
# Générer le client Prisma
npm run prisma:generate

# Créer les tables
npm run prisma:migrate

# Charger des données de test (optionnel)
npm run prisma:seed
```

### Étape 6 : Démarrer le backend

```bash
# Mode développement (avec rechargement automatique)
npm run dev

# Ou mode production
npm start
```

Le serveur devrait démarrer sur http://localhost:3000

### Étape 7 : Installer le frontend

Ouvrir un **nouveau terminal** :

```bash
# Aller dans le dossier frontend
cd Rattrapage_Dossier_Final/front

# Installer les dépendances
npm install

# Créer le fichier .env (optionnel)
# Le frontend utilise par défaut http://localhost:3000/api
```

**Créer `front/.env` si vous voulez personnaliser l'URL de l'API :**
```env
VITE_API_URL=http://localhost:3000/api
```

### Étape 8 : Démarrer le frontend

```bash
# Mode développement
npm run dev

# Le serveur devrait démarrer sur http://localhost:5173
```

---

## Configuration

### Variables d'environnement

#### Backend (`.env` à la racine)

| Variable | Description | Valeur par défaut |
|----------|------------|-------------------|
| `DATABASE_URL` | URL de connexion PostgreSQL | `postgresql://worknest:worknest_password@localhost:5432/worknest` |
| `JWT_SECRET` | Clé secrète pour signer les tokens JWT | `your-super-secret-jwt-key-change-in-production` |
| `JWT_EXPIRES_IN` | Durée de validité des tokens | `24h` |
| `PORT` | Port du serveur backend | `3000` |
| `NODE_ENV` | Environnement (development/production) | `development` |
| `FRONTEND_URL` | URL du frontend pour CORS | `http://localhost:5173` |

#### Frontend (`front/.env`)

| Variable | Description | Valeur par défaut |
|----------|------------|-------------------|
| `VITE_API_URL` | URL de l'API backend | `http://localhost:3000/api` |

### Configuration Docker

Les variables d'environnement Docker sont définies dans `docker-compose.yml`. Pour les modifier :

1. Éditer `docker-compose.yml`
2. Modifier les valeurs dans la section `environment` de chaque service
3. Redémarrer les conteneurs : `docker-compose restart`

---

## Initialisation de la base de données

### Commandes Prisma

#### Générer le client Prisma
```bash
# Docker
docker-compose exec backend npm run prisma:generate

# Manuel
npm run prisma:generate
```

#### Créer les migrations
```bash
# Docker
docker-compose exec backend npm run prisma:migrate

# Manuel
npm run prisma:migrate
```

**Note :** La première fois, cela créera un dossier `src/prisma/migrations/` avec la migration initiale.

#### Charger des données de test
```bash
# Docker
docker-compose exec backend npm run prisma:seed

# Manuel
npm run prisma:seed
```

**Données créées par le seed :**
- 1 utilisateur admin : `admin@worknest.fr` / `Admin1234!`
- 1 utilisateur client : `client@test.fr` / `Client1234!`
- 3 espaces de coworking (Paris, Lyon, Marseille)

#### Ouvrir Prisma Studio (interface graphique)
```bash
# Docker
docker-compose exec backend npm run prisma:studio

# Manuel
npm run prisma:studio
```

Puis accéder à : **http://localhost:5555**

### Structure de la base de données

Après les migrations, les tables suivantes sont créées :

- **users** - Utilisateurs
- **spaces** - Espaces de coworking
- **reservations** - Réservations
- **payments** - Paiements

Voir `src/prisma/schema.prisma` pour le schéma complet.

---

## Vérification de l'installation

### Vérifier que les services sont démarrés

#### Avec Docker :
```bash
docker-compose ps
```

Tous les conteneurs doivent avoir le statut "Up".

#### Sans Docker :
```bash
# Vérifier que PostgreSQL est démarré
psql -U postgres -c "SELECT version();"

# Vérifier que le backend répond
curl http://localhost:3000/health

# Vérifier que le frontend répond
curl http://localhost:5173
```

### Tester l'API

```bash
# Test de santé
curl http://localhost:3000/health

# Réponse attendue :
# {"status":"OK","timestamp":"2024-01-15T10:00:00.000Z"}
```

### Tester la base de données

```bash
# Avec Docker
docker-compose exec postgres psql -U worknest -d worknest -c "SELECT COUNT(*) FROM users;"

# Sans Docker
psql -U worknest -d worknest -c "SELECT COUNT(*) FROM users;"
```

---

## Accès à l'application

### URLs d'accès

Une fois l'installation terminée, accédez à :

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:5173 | Interface utilisateur |
| **Backend API** | http://localhost:3000 | API REST |
| **Swagger** | http://localhost:3000/api-docs | Documentation API interactive |
| **Prisma Studio** | http://localhost:5555 | Interface graphique pour la BDD |

### Comptes de test

Après avoir exécuté `prisma:seed` :

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| **Admin** | `admin@worknest.fr` | `Admin1234!` |
| **Client** | `client@test.fr` | `Client1234!` |

### Première utilisation

1. Accéder à http://localhost:5173
2. Cliquer sur "Inscription" ou utiliser un compte de test
3. Se connecter
4. Naviguer vers "Espaces" pour voir le catalogue
5. Sélectionner un espace et créer une réservation

---

## Dépannage

### Problème : Les conteneurs ne démarrent pas

```bash
# Vérifier les logs
docker-compose logs

# Vérifier que les ports ne sont pas utilisés
netstat -ano | findstr :3000
netstat -ano | findstr :5173
netstat -ano | findstr :5432

# Arrêter les services qui utilisent ces ports, ou modifier les ports dans docker-compose.yml
```

### Problème : Erreur de connexion à la base de données

```bash
# Vérifier que PostgreSQL est démarré
docker-compose ps postgres

# Vérifier les logs PostgreSQL
docker-compose logs postgres

# Vérifier les variables d'environnement
docker-compose exec backend env | grep DATABASE

# Redémarrer PostgreSQL
docker-compose restart postgres
```

### Problème : Erreur Prisma "Could not locate Query Engine"

```bash
# Régénérer le client Prisma
docker-compose exec backend npm run prisma:generate

# Ou reconstruire l'image
docker-compose build --no-cache backend
docker-compose up -d backend
```

### Problème : Le frontend ne se connecte pas à l'API

```bash
# Vérifier que le backend est démarré
docker-compose ps backend

# Vérifier les logs du backend
docker-compose logs backend

# Vérifier la variable VITE_API_URL dans le frontend
docker-compose exec frontend env | grep VITE

# Vérifier CORS dans le backend
# Le FRONTEND_URL doit correspondre à l'URL du frontend
```

### Problème : Port déjà utilisé

Si un port est déjà utilisé, vous pouvez le modifier dans `docker-compose.yml` :

```yaml
services:
  backend:
    ports:
      - "3001:3000"  # Changer 3000 en 3001
  frontend:
    ports:
      - "5174:5173"  # Changer 5173 en 5174
  postgres:
    ports:
      - "5433:5432"  # Changer 5432 en 5433
```

Puis mettre à jour les variables d'environnement en conséquence.

### Problème : Erreur "Permission denied" sur Linux/macOS

```bash
# Donner les permissions d'exécution
chmod +x docker-compose.yml

# Si problème avec Docker
sudo usermod -aG docker $USER
# Puis se déconnecter/reconnecter
```

### Réinitialiser complètement

```bash
# Arrêter tous les conteneurs
docker-compose down

# Supprimer les volumes (⚠️ supprime les données)
docker-compose down -v

# Reconstruire les images
docker-compose build --no-cache

# Redémarrer
docker-compose up -d

# Réinitialiser la base de données
docker-compose exec backend npm run prisma:migrate reset
docker-compose exec backend npm run prisma:seed
```

---

## Commandes utiles

### Docker

```bash
# Démarrer les services
docker-compose up -d

# Arrêter les services
docker-compose down

# Voir les logs
docker-compose logs -f

# Redémarrer un service
docker-compose restart backend

# Reconstruire une image
docker-compose build --no-cache backend

# Accéder à un conteneur
docker-compose exec backend sh
docker-compose exec postgres psql -U worknest -d worknest

# Voir l'utilisation des ressources
docker stats
```

### Prisma

```bash
# Générer le client
npm run prisma:generate

# Créer une migration
npm run prisma:migrate

# Appliquer les migrations (production)
npm run prisma:migrate deploy

# Réinitialiser la base (⚠️ supprime toutes les données)
npm run prisma:migrate reset

# Ouvrir Prisma Studio
npm run prisma:studio

# Charger des données de test
npm run prisma:seed
```

### Base de données

```bash
# Se connecter à PostgreSQL
docker-compose exec postgres psql -U worknest -d worknest

# Sauvegarder la base de données
docker-compose exec postgres pg_dump -U worknest worknest > backup.sql

# Restaurer la base de données
docker-compose exec -T postgres psql -U worknest -d worknest < backup.sql

# Voir les tables
docker-compose exec postgres psql -U worknest -d worknest -c "\dt"

# Compter les enregistrements
docker-compose exec postgres psql -U worknest -d worknest -c "SELECT COUNT(*) FROM users;"
```

### Tests

```bash
# Exécuter tous les tests
npm test

# Exécuter un test spécifique
npm test -- auth.test.js

# Exécuter les tests avec couverture
npm test -- --coverage
```

### Développement

```bash
# Backend - Mode développement
npm run dev

# Frontend - Mode développement
cd front
npm run dev

# Build de production (frontend)
cd front
npm run build
```

---

## Prochaines étapes

Une fois l'installation terminée :

1. ✅ Vérifier que tous les services sont démarrés
2. ✅ Accéder à http://localhost:5173
3. ✅ Se connecter avec un compte de test
4. ✅ Explorer le catalogue d'espaces
5. ✅ Créer une réservation de test
6. ✅ Consulter la documentation Swagger : http://localhost:3000/api-docs

---

## Support

Pour toute question ou problème :

1. Consulter la section [Dépannage](#dépannage)
2. Vérifier les logs : `docker-compose logs`
3. Consulter la documentation dans le dossier `docs/`
4. Consulter la documentation Swagger : http://localhost:3000/api-docs

---

## Notes importantes

- ⚠️ **En production**, changez tous les mots de passe et secrets par défaut
- ⚠️ **En production**, configurez correctement CORS et les variables d'environnement
- ⚠️ Les données de test sont uniquement pour le développement
- ✅ Les volumes Docker persistent les données même après `docker-compose down`
- ✅ Utilisez `docker-compose down -v` uniquement si vous voulez supprimer toutes les données

