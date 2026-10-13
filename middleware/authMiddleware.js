const User = require('../models/User');

const isAuthenticated = async (req, res, next) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({
        message: 'Vous devez être connecté pour accéder à cette ressource.'
      });
    }

    const user = await User.findById(req.session.userId);

    if (!user) {
      return req.session.destroy(() => {
        res.status(401).json({
          message: 'Session invalide. Veuillez vous reconnecter.'
        });
      });
    }

    req.user = user;

    next();
  } catch (error) {
    console.error('Erreur du middleware d’authentification :', error);

    return res.status(500).json({
      message: 'Erreur interne du serveur.'
    });
  }
};

module.exports = isAuthenticated;