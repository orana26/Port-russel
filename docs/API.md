# API Port de Plaisance Russell

## Présentation

Cette API permet de gérer les utilisateurs, les catways et les réservations du Port de Plaisance Russell.

L'API est développée avec Node.js, Express et MongoDB.

## Authentification

Les routes protégées nécessitent une session utilisateur active.

### Connexion

**POST** `/login`

Permet de connecter un utilisateur.

{
  "email": "testuser@example.com",
  "password": "********"
}

### Déconnexion

**GET** `/logout`

Détruit la session utilisateur.

---

# Utilisateurs

Toutes les routes suivantes nécessitent une authentification.

### Lister les utilisateurs

**GET** `/users`

Retourne la liste des utilisateurs sans leurs mots de passe.

### Rechercher un utilisateur

**GET** `/users/:email`

Exemple :

GET /users/testuser%40example.com

### Créer un utilisateur

**POST** `/users`

{
  "username": "userTest",
  "email": "user@example.com",
  "password": "Password123!"
}

### Modifier un utilisateur

**PUT** `/users/:email`

{
  "username": "nouveauNom"
}

ou :

{
  "password": "NouveauPassword123!"
}

### Supprimer un utilisateur

**DELETE** `/users/:email`

---

# Catways

### Lister les catways

**GET** `/catways`

### Consulter un catway

**GET** `/catways/:id`

Exemple :

GET /catways/1

### Créer un catway

**POST** `/catways`

{
  "catwayNumber": 1,
  "catwayType": "long",
  "catwayState": "Disponible"
}

### Modifier l'état d'un catway

**PUT** `/catways/:id`

{
  "catwayState": "Occupé"
}

### Supprimer un catway

**DELETE** `/catways/:id`

---

# Réservations

Les réservations sont rattachées à un catway.

### Lister les réservations d'un catway

**GET** `/catways/:id/reservations`

### Consulter une réservation

**GET** `/catways/:id/reservations/:idReservation`

### Créer une réservation

**POST** `/catways/:id/reservations`

{
  "clientName": "Jean Dupont",
  "boatName": "Le Neptune",
  "startDate": "2026-10-15T10:00:00.000Z",
  "endDate": "2026-10-20T10:00:00.000Z"
}

### Modifier une réservation

**PUT** `/catways/:id/reservations/:idReservation`

{
  "clientName": "Jean Dupont",
  "boatName": "Le Neptune",
  "startDate": "2026-10-15T10:00:00.000Z",
  "endDate": "2026-10-22T10:00:00.000Z"
}

### Supprimer une réservation

**DELETE** `/catways/:id/reservations/:idReservation`

---

# Tableau de bord

**GET** `/dashboard`

Page protégée accessible uniquement aux utilisateurs connectés.

Elle affiche :

- le nom de l'utilisateur ;
- son adresse e-mail ;
- la date du jour ;
- les réservations en cours ;
- les liens de navigation.

## Codes HTTP principaux

| Code | Signification |
|---|---|
| 200 | Requête réussie |
| 201 | Ressource créée |
| 400 | Requête invalide |
| 401 | Authentification requise |
| 404 | Ressource introuvable |
| 409 | Conflit, par exemple e-mail déjà utilisé |
| 500 | Erreur serveur |

## Base URL

En développement :

http://localhost:3000