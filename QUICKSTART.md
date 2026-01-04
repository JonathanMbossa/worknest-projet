# Démarrage Rapide - WorkNest

## 🚀 Démarrage en 5 minutes

### Option 1 : Docker (Recommandé)

```bash
# 1. Cloner et entrer dans le projet
cd Rattrapage_Dossier_Final

# 2. Démarrer tous les services
docker-compose up -d

# 3. Initialiser la base de données
docker exec -it worknest-backend sh
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
exit

# 4. Accéder à l'application
# Frontend: http://localhost:5173
# API: http://localhost:3000
# Swagger: http://localhost:3000/api-docs
```

### Option 2 : Installation manuelle

```bash
# Backend
cd src
npm install
cp ../env.example .env
# Éditer .env
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev

# Frontend (nouveau terminal)
cd front
npm install
cp .env.example .env
npm run dev
```

## 🔑 Comptes de test

Après avoir exécuté le seed :
- **Admin** : `admin@worknest.fr` / `Admin1234!`
- **Client** : `client@test.fr` / `Client1234!`

## 📚 Documentation

- **Installation complète** : Voir [INSTALLATION.md](INSTALLATION.md)
- **API** : http://localhost:3000/api-docs (Swagger)
- **README** : Voir [README.md](README.md)

## 🐛 Problèmes courants

### Port déjà utilisé
```bash
# Modifier les ports dans docker-compose.yml
# Ou arrêter les services qui utilisent ces ports
```

### Erreur de connexion à la base de données
```bash
# Vérifier que PostgreSQL est démarré
docker ps

# Vérifier les variables d'environnement
docker exec -it worknest-backend env | grep DATABASE
```

### Prisma ne fonctionne pas
```bash
docker exec -it worknest-backend sh
npm run prisma:generate
npm run prisma:migrate reset
```

## ✅ Vérification

Une fois démarré, vous devriez pouvoir :
1. ✅ Accéder à http://localhost:5173
2. ✅ Voir la page d'accueil
3. ✅ Naviguer vers le catalogue
4. ✅ Vous inscrire ou vous connecter
5. ✅ Réserver un espace

Bon développement ! 🎉

