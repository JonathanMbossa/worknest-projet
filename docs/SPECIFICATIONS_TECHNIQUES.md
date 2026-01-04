# Spécifications Techniques - WorkNest

## 1. Architecture globale

### Architecture 3-tiers

```
┌─────────────────────────────────────────┐
│         Frontend (React)                │
│         Port: 5173                      │
│         - Pages React                   │
│         - Tailwind CSS                  │
│         - React Router                  │
└──────────────┬──────────────────────────┘
               │ HTTP/REST
               │
┌──────────────▼──────────────────────────┐
│         Backend API (Express)           │
│         Port: 3000                      │
│         - Routes Express                │
│         - Middleware (Auth, Validation) │
│         - Business Logic                │
└──────────────┬──────────────────────────┘
               │ Prisma ORM
               │
┌──────────────▼──────────────────────────┐
│         Base de données (PostgreSQL)     │
│         Port: 5432                      │
│         - Tables relationnelles         │
│         - Indexes                       │
└─────────────────────────────────────────┘
```

### Stack technique

**Frontend:**
- React 18.2
- Vite (build tool)
- Tailwind CSS 3.3
- React Router 6.20
- React Query 3.39
- Axios 1.6

**Backend:**
- Node.js 18+
- Express 4.18
- Prisma 5.7
- PostgreSQL 15
- JWT (jsonwebtoken 9.0)
- bcryptjs 2.4
- express-validator 7.0
- Swagger (swagger-ui-express 5.0)

**DevOps:**
- Docker & Docker Compose
- Nginx (optionnel pour production)

## 2. Endpoints API détaillés

### Authentification

#### POST /api/auth/register
**Description:** Inscription d'un nouvel utilisateur

**Payload:**
```json
{
  "email": "user@example.com",
  "password": "Password123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "0612345678",
  "company": "Ma Société",
  "role": "CLIENT" | "ENTERPRISE"
}
```

**Réponse 201:**
```json
{
  "message": "Inscription réussie",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "CLIENT"
  },
  "token": "jwt-token"
}
```

**Erreurs:**
- 400: Données invalides
- 409: Email déjà utilisé

#### POST /api/auth/login
**Description:** Connexion utilisateur

**Payload:**
```json
{
  "email": "user@example.com",
  "password": "Password123"
}
```

**Réponse 200:**
```json
{
  "message": "Connexion réussie",
  "user": { ... },
  "token": "jwt-token"
}
```

**Erreurs:**
- 401: Identifiants invalides

#### GET /api/auth/me
**Description:** Récupérer le profil de l'utilisateur connecté

**Headers:**
```
Authorization: Bearer <token>
```

**Réponse 200:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "CLIENT"
  }
}
```

### Espaces

#### GET /api/spaces
**Description:** Liste des espaces avec filtres

**Query Parameters:**
- `capacity` (int): Capacité minimale
- `minPrice` (float): Prix minimum
- `maxPrice` (float): Prix maximum
- `equipment` (string): Équipement recherché
- `city` (string): Ville
- `page` (int): Numéro de page (défaut: 1)
- `limit` (int): Nombre d'éléments par page (défaut: 10)

**Réponse 200:**
```json
{
  "spaces": [
    {
      "id": "uuid",
      "name": "Espace 1",
      "description": "...",
      "capacity": 10,
      "price": 50.0,
      "location": "Paris",
      "city": "Paris",
      "equipment": ["WiFi", "Projecteur"],
      "images": ["url1", "url2"]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

#### GET /api/spaces/:id
**Description:** Détails d'un espace avec planning

**Réponse 200:**
```json
{
  "space": {
    "id": "uuid",
    "name": "Espace 1",
    "description": "...",
    "capacity": 10,
    "price": 50.0,
    "location": "Paris",
    "address": "123 Rue...",
    "city": "Paris",
    "postalCode": "75001",
    "equipment": ["WiFi"],
    "images": ["url1"],
    "reservations": [
      {
        "id": "uuid",
        "startDate": "2024-01-15T10:00:00Z",
        "endDate": "2024-01-15T12:00:00Z"
      }
    ]
  }
}
```

#### POST /api/spaces
**Description:** Créer un espace (Admin uniquement)

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Payload:**
```json
{
  "name": "Nouvel espace",
  "description": "Description...",
  "capacity": 20,
  "price": 75.0,
  "location": "Lyon",
  "address": "456 Rue...",
  "city": "Lyon",
  "postalCode": "69001",
  "equipment": ["WiFi", "Projecteur"],
  "images": ["url1"]
}
```

### Réservations

#### POST /api/reservations
**Description:** Créer une réservation

**Headers:**
```
Authorization: Bearer <token>
```

**Payload:**
```json
{
  "spaceId": "uuid",
  "startDate": "2024-01-15T10:00:00Z",
  "endDate": "2024-01-15T12:00:00Z",
  "notes": "Notes optionnelles"
}
```

**Réponse 201:**
```json
{
  "message": "Réservation créée avec succès",
  "reservation": {
    "id": "uuid",
    "userId": "uuid",
    "spaceId": "uuid",
    "startDate": "2024-01-15T10:00:00Z",
    "endDate": "2024-01-15T12:00:00Z",
    "status": "PENDING",
    "totalPrice": 100.0,
    "space": { ... }
  }
}
```

**Erreurs:**
- 400: Dates invalides
- 404: Espace non trouvé
- 409: Créneau déjà réservé

#### GET /api/reservations
**Description:** Liste des réservations

**Query Parameters:**
- `status`: PENDING | CONFIRMED | CANCELLED | COMPLETED
- `spaceId`: UUID de l'espace (Admin uniquement)

#### POST /api/reservations/:id/cancel
**Description:** Annuler une réservation

### Paiements

#### POST /api/payments
**Description:** Créer un paiement

**Payload:**
```json
{
  "reservationId": "uuid",
  "method": "CARD" | "BANK_TRANSFER" | "PAYPAL",
  "transactionId": "optional-external-id"
}
```

## 3. Gestion des erreurs

### Codes HTTP

- **200 OK** - Succès
- **201 Created** - Ressource créée
- **400 Bad Request** - Données invalides
- **401 Unauthorized** - Non authentifié
- **403 Forbidden** - Accès refusé (rôle insuffisant)
- **404 Not Found** - Ressource non trouvée
- **409 Conflict** - Conflit (ex: email existant, créneau réservé)
- **500 Internal Server Error** - Erreur serveur

### Format d'erreur

```json
{
  "error": "Message d'erreur",
  "details": [
    {
      "field": "email",
      "message": "Email invalide"
    }
  ]
}
```

## 4. Règles métier

### Réservations
1. Une réservation ne peut pas chevaucher une autre réservation confirmée ou en attente
2. La date de début doit être dans le futur
3. La date de fin doit être après la date de début
4. Le prix total est calculé automatiquement (prix/heure × nombre d'heures)
5. Une réservation annulée rembourse automatiquement le paiement associé

### Paiements
1. Un paiement est lié à une seule réservation
2. Le montant du paiement doit correspondre au total de la réservation
3. Après paiement, la réservation passe au statut CONFIRMED
4. Un paiement remboursé annule automatiquement la réservation

### Espaces
1. Un espace désactivé (isActive=false) n'apparaît plus dans les résultats de recherche
2. Les réservations existantes d'un espace désactivé restent valides
3. La capacité minimale est de 1 personne

### Utilisateurs
1. Un utilisateur désactivé ne peut plus se connecter
2. Les rôles sont: CLIENT, ENTERPRISE, ADMIN
3. Seul un ADMIN peut créer/modifier/supprimer des espaces
4. Un utilisateur ne peut voir que ses propres réservations (sauf ADMIN)

## 5. Schéma d'intégration

### Paiement
```
┌─────────────┐
│  Frontend   │
└──────┬──────┘
       │ POST /api/payments
       │ { reservationId, method }
       ▼
┌─────────────┐
│   Backend   │
│  - Validation
│  - Création Payment
│  - Mise à jour Reservation
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  PostgreSQL │
│  - Payment
│  - Reservation
└─────────────┘
```

### Calendrier/Planning
```
┌─────────────┐
│  Frontend   │
│  - Affichage│
│    planning │
└──────┬──────┘
       │ GET /api/spaces/:id
       │ (inclut reservations)
       ▼
┌─────────────┐
│   Backend   │
│  - Récupère │
│    espace   │
│  - Filtre   │
│    réserv.  │
│    futures  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  PostgreSQL │
│  - Space    │
│  - Reserv.  │
└─────────────┘
```

## 6. Sécurité

### Authentification
- JWT avec expiration (24h par défaut)
- Refresh token (7 jours) - optionnel
- Hashage bcrypt avec 12 rounds

### Validation
- express-validator pour toutes les entrées
- Sanitization des données
- Validation des UUIDs

### Protection
- Helmet pour les headers HTTP
- CORS configuré
- Rate limiting (100 req/15min)
- Protection CSRF (via JWT)

### Logs
- Morgan pour les logs HTTP
- Logs d'erreurs dans la console
- Logs d'authentification (succès/échec)

