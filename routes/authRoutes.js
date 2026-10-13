const express = require('express');
const router = express.Router();

const {
  register,
  login,
  logout
} = require('../controllers/authController');

// Création d'un utilisateur
router.post('/register', register);

// Connexion
router.post('/login', login);

// Déconnexion
router.get('/logout', logout);

module.exports = router;