
const express = require('express');
const router = express.Router();

const User = require('../models/User');
const isAuthenticated = require('../middleware/authMiddleware');
const bcrypt = require('bcryptjs');

// GET : récupérer tous les utilisateurs
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const users = await User.find().select('-password');

    res.status(200).json(users);
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs :', error);

    res.status(500).json({
      message: 'Erreur lors de la récupération des utilisateurs.'
    });
  }
});

// GET : récupérer un utilisateur par son e-mail
router.get('/:email', isAuthenticated, async (req, res) => {
  try {
    const email = req.params.email.trim().toLowerCase();

    const user = await User.findOne({ email }).select('-password');

    if (!user) {
      return res.status(404).json({
        message: 'Utilisateur introuvable.'
      });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Erreur lors de la récupération de l’utilisateur :', error);

    res.status(500).json({
      message: 'Erreur lors de la récupération de l’utilisateur.'
    });
  }
});

// POST : créer un utilisateur
router.post('/', isAuthenticated, async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        message: 'Tous les champs sont obligatoires.'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: 'Le mot de passe doit contenir au moins 8 caractères.'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({
        message: 'Cette adresse e-mail est déjà utilisée.'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      username: username.trim(),
      email: normalizedEmail,
      password: hashedPassword
    });

    res.status(201).json({
      message: 'Utilisateur créé avec succès.',
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: 'Cette adresse e-mail est déjà utilisée.'
      });
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Données invalides.',
        error: error.message
      });
    }

    console.error('Erreur lors de la création de l’utilisateur :', error);

    res.status(500).json({
      message: 'Erreur lors de la création de l’utilisateur.'
    });
  }
});

// PUT : modifier un utilisateur
router.put('/:email', isAuthenticated, async (req, res) => {
  try {
    const email = req.params.email.trim().toLowerCase();
    const { username, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(404).json({
        message: 'Utilisateur introuvable.'
      });
    }

    if (username !== undefined) {
      if (typeof username !== 'string' || !username.trim()) {
        return res.status(400).json({
          message: 'Le nom d’utilisateur est invalide.'
        });
      }

      user.username = username.trim();
    }

    if (password !== undefined) {
      if (typeof password !== 'string' || password.length < 8) {
        return res.status(400).json({
          message: 'Le mot de passe doit contenir au moins 8 caractères.'
        });
      }

      user.password = await bcrypt.hash(password, 12);
    }

    await user.save();

    res.status(200).json({
      message: 'Utilisateur modifié avec succès.',
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Erreur lors de la modification de l’utilisateur :', error);

    res.status(500).json({
      message: 'Erreur lors de la modification de l’utilisateur.'
    });
  }
});

// DELETE : supprimer un utilisateur
router.delete('/:email', isAuthenticated, async (req, res) => {
  try {
    const email = req.params.email.trim().toLowerCase();

    const user = await User.findOneAndDelete({ email });

    if (!user) {
      return res.status(404).json({
        message: 'Utilisateur introuvable.'
      });
    }

    res.status(200).json({
      message: 'Utilisateur supprimé avec succès.'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de l’utilisateur :', error);

    res.status(500).json({
      message: 'Erreur lors de la suppression de l’utilisateur.'
    });
  }
});

module.exports = router;
