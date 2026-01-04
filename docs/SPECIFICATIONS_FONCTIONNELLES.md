# Spécifications Fonctionnelles - WorkNest

## 1. User Stories

### US-001 : Réserver un espace
**En tant que** utilisateur (client ou entreprise)  
**Je veux** réserver un espace de coworking  
**Afin de** garantir ma disponibilité pour une date et heure précises

**Critères d'acceptation :**
- L'utilisateur doit être authentifié
- L'utilisateur peut sélectionner un espace disponible
- L'utilisateur peut choisir une date et heure de début et de fin
- Le système vérifie les conflits de réservation
- Le système calcule automatiquement le prix total
- La réservation est créée avec le statut PENDING
- Un paiement doit être effectué pour confirmer la réservation

### US-002 : Payer une réservation
**En tant que** utilisateur  
**Je veux** payer ma réservation  
**Afin de** confirmer et finaliser ma réservation

**Critères d'acceptation :**
- Le paiement est lié à une réservation existante
- Plusieurs méthodes de paiement sont disponibles (CARD, BANK_TRANSFER, PAYPAL)
- Le montant correspond au total de la réservation
- Le statut de la réservation passe à CONFIRMED après paiement
- Un reçu/confirmation est généré

### US-003 : Gérer les espaces (admin)
**En tant qu'** administrateur  
**Je veux** gérer les espaces de coworking  
**Afin de** maintenir à jour le catalogue disponible

**Critères d'acceptation :**
- L'administrateur peut créer un nouvel espace
- L'administrateur peut modifier les informations d'un espace
- L'administrateur peut désactiver un espace (soft delete)
- Les champs obligatoires sont validés
- Les images et équipements peuvent être ajoutés

### US-004 : Consulter le planning
**En tant qu'** utilisateur  
**Je veux** consulter le planning d'un espace  
**Afin de** voir les créneaux déjà réservés

**Critères d'acceptation :**
- Le planning affiche les réservations confirmées et en attente
- Les créneaux passés ne sont pas affichés
- Les informations affichées incluent date, heure de début et fin
- Le planning est visible sur la page de détail d'un espace

### US-005 : Gérer son profil utilisateur
**En tant qu'** utilisateur  
**Je veux** gérer mon profil  
**Afin de** mettre à jour mes informations personnelles

**Critères d'acceptation :**
- L'utilisateur peut modifier son prénom, nom, téléphone
- L'utilisateur peut modifier le nom de son entreprise (si applicable)
- L'utilisateur peut changer son mot de passe
- La validation du mot de passe actuel est requise pour le changement
- Les modifications sont sauvegardées immédiatement

## 2. Parcours utilisateurs

### Parcours 1 : Réservation complète
1. Accès à la page d'accueil
2. Navigation vers le catalogue des espaces
3. Application de filtres (capacité, prix, ville, équipement)
4. Consultation des résultats
5. Clic sur un espace pour voir les détails
6. Consultation du planning et des informations
7. Clic sur "Réserver maintenant"
8. Connexion (si non connecté) ou redirection vers le formulaire
9. Saisie des dates et heures de réservation
10. Vérification du total calculé
11. Confirmation et paiement
12. Redirection vers le tableau de bord avec confirmation

### Parcours 2 : Inscription et première réservation
1. Accès à la page d'inscription
2. Remplissage du formulaire (nom, prénom, email, mot de passe)
3. Choix du type de compte (particulier/entreprise)
4. Validation et création du compte
5. Connexion automatique
6. Navigation vers le catalogue
7. Sélection d'un espace
8. Réservation (voir Parcours 1, étapes 6-12)

### Parcours 3 : Gestion administrative
1. Connexion en tant qu'administrateur
2. Accès au tableau de bord
3. Création d'un nouvel espace
4. Remplissage des informations (nom, description, capacité, prix, localisation)
5. Ajout d'équipements et d'images
6. Sauvegarde
7. Consultation des réservations en attente
8. Confirmation ou annulation de réservations

## 3. Écrans (Wireframes)

### Page Catalogue
```
┌─────────────────────────────────────────────────┐
│  WorkNest                    [Connexion] [Inscr]│
├─────────────────────────────────────────────────┤
│                                                 │
│  Catalogue des espaces                         │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │ Filtres                                   │  │
│  │ [Capacité] [Prix min] [Prix max]         │  │
│  │ [Équipement] [Ville]                     │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │ [Image]  │ │ [Image]  │ │ [Image]  │      │
│  │ Nom      │ │ Nom      │ │ Nom      │      │
│  │ Desc...  │ │ Desc...  │ │ Desc...  │      │
│  │ 📍 Ville │ │ 📍 Ville │ │ 📍 Ville │      │
│  │ 💰 Prix  │ │ 💰 Prix  │ │ 💰 Prix  │      │
│  │ [Détails]│ │ [Détails]│ │ [Détails]│      │
│  └──────────┘ └──────────┘ └──────────┘      │
│                                                 │
│  [Précédent] Page 1/5 [Suivant]                │
└─────────────────────────────────────────────────┘
```

### Page Détail Espace
```
┌─────────────────────────────────────────────────┐
│  WorkNest                    [Tableau de bord]  │
├─────────────────────────────────────────────────┤
│  ← Retour au catalogue                          │
│                                                 │
│  ┌──────────────┐  ┌────────────────────────┐ │
│  │              │  │ Nom de l'espace        │ │
│  │   [Image]    │  │                        │ │
│  │              │  │ Description...        │ │
│  │              │  │                        │ │
│  └──────────────┘  │ 📍 Localisation        │ │
│                    │ 🏢 Adresse             │ │
│                    │ 👥 Capacité: X         │ │
│                    │ 💰 Prix: XX€/h         │ │
│                    │                        │ │
│                    │ Équipements:           │ │
│                    │ [WiFi] [Projecteur]    │ │
│                    │                        │ │
│                    │ Planning:              │ │
│                    │ - 15 Jan 10h-12h       │ │
│                    │ - 20 Jan 14h-16h       │ │
│                    │                        │ │
│                    │ [Réserver maintenant]  │ │
│                    └────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

### Page Réservation
```
┌─────────────────────────────────────────────────┐
│  WorkNest                    [Tableau de bord]  │
├─────────────────────────────────────────────────┤
│  Réserver : Nom de l'espace                     │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │ Date de début *    │  Heure de début *   │  │
│  │ [2024-01-15]       │  [10:00]            │  │
│  │                    │                      │  │
│  │ Date de fin *      │  Heure de fin *      │  │
│  │ [2024-01-15]       │  [12:00]            │  │
│  │                    │                      │  │
│  │ Notes (optionnel)                         │  │
│  │ [_________________________________]       │  │
│  │                                            │  │
│  │ ────────────────────────────────────────  │  │
│  │ Total                         150.00€     │  │
│  │ Prix: 75€/heure × 2.0 heures             │  │
│  │                                            │  │
│  │ [Confirmer la réservation et payer]       │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

