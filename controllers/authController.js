const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Création d'un utilisateur
exports.register = async (req, res) => {
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

    const existingUser = await User.findOne({
      email: email.trim().toLowerCase()
    });

    if (existingUser) {
      return res.status(409).json({
        message: 'Cette adresse e-mail est déjà utilisée.'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      username,
      email,
      password: hashedPassword
    });

    return res.status(201).json({
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

    console.error('Erreur lors de la création de l’utilisateur :', error);

    return res.status(500).json({
      message: 'Erreur interne du serveur.'
    });
  }
};

// Connexion d'un utilisateur
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'L’adresse e-mail et le mot de passe sont obligatoires.'
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase()
    }).select('+password');

    if (!user) {
      return res.status(401).json({
        message: 'Identifiants incorrects.'
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatches) {
      return res.status(401).json({
        message: 'Identifiants incorrects.'
      });
    }

    req.session.userId = user._id.toString();

    return res.status(200).json({
      message: 'Connexion réussie.',
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Erreur lors de la connexion :', error);

    return res.status(500).json({
      message: 'Erreur interne du serveur.'
    });
  }
};

// Déconnexion d'un utilisateur
exports.logout = (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      console.error('Erreur lors de la déconnexion :', error);

      return res.status(500).json({
        message: 'Erreur lors de la déconnexion.'
      });
    }

    res.clearCookie('port-russell.sid', {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax'
});

    return res.redirect('/');
  });
};