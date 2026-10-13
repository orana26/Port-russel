
const express = require('express');
const router = express.Router();

const Catway = require('../models/catway');
const isAuthenticated = require('../middleware/authMiddleware');

// GET : récupérer tous les catways
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const catways = await Catway.find();

    res.status(200).json(catways);
  } catch (error) {
    console.error('Erreur lors de la récupération des catways :', error);

    res.status(500).json({
      message: 'Erreur lors de la récupération des catways.'
    });
  }
});

// GET : récupérer un catway par son numéro
router.get('/:id', isAuthenticated, async (req, res) => {
  try {
    const catwayNumber = Number(req.params.id);

    if (!Number.isInteger(catwayNumber) || catwayNumber < 1) {
      return res.status(400).json({
        message: 'Le numéro du catway doit être un entier positif.'
      });
    }

    const catway = await Catway.findOne({ catwayNumber });

    if (!catway) {
      return res.status(404).json({
        message: 'Catway introuvable.'
      });
    }

    res.status(200).json(catway);
  } catch (error) {
    console.error('Erreur lors de la récupération du catway :', error);

    res.status(500).json({
      message: 'Erreur lors de la récupération du catway.'
    });
  }
});

// POST : créer un catway
router.post('/', isAuthenticated, async (req, res) => {
  try {
    const { catwayNumber, catwayType, catwayState } = req.body;

    const catway = new Catway({
      catwayNumber,
      catwayType,
      catwayState
    });

    await catway.save();

    res.status(201).json({
      message: 'Catway créé avec succès.',
      catway
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: 'Ce numéro de catway existe déjà.'
      });
    }

    if (error.name === 'ValidationError' || error.name === 'CastError') {
      return res.status(400).json({
        message: 'Données invalides.',
        error: error.message
      });
    }

    console.error('Erreur lors de la création du catway :', error);

    res.status(500).json({
      message: 'Erreur lors de la création du catway.'
    });
  }
});

// PUT : modifier uniquement l'état du catway
router.put('/:id', isAuthenticated, async (req, res) => {
  try {
    const catwayNumber = Number(req.params.id);

    if (!Number.isInteger(catwayNumber) || catwayNumber < 1) {
      return res.status(400).json({
        message: 'Le numéro du catway doit être un entier positif.'
      });
    }

    const { catwayState } = req.body;

    if (
      typeof catwayState !== 'string' ||
      catwayState.trim().length === 0
    ) {
      return res.status(400).json({
        message: 'Un état valide est obligatoire.'
      });
    }

    const catway = await Catway.findOneAndUpdate(
      { catwayNumber },
      { $set: { catwayState: catwayState.trim() } },
      { new: true, runValidators: true }
    );

    if (!catway) {
      return res.status(404).json({
        message: 'Catway introuvable.'
      });
    }

    res.status(200).json({
      message: 'État du catway modifié avec succès.',
      catway
    });
  } catch (error) {
    console.error('Erreur lors de la modification du catway :', error);

    res.status(500).json({
      message: 'Erreur lors de la modification du catway.'
    });
  }
});

// DELETE : supprimer un catway
router.delete('/:id', isAuthenticated, async (req, res) => {
  try {
    const catwayNumber = Number(req.params.id);

    if (!Number.isInteger(catwayNumber) || catwayNumber < 1) {
      return res.status(400).json({
        message: 'Le numéro du catway doit être un entier positif.'
      });
    }

    const catway = await Catway.findOneAndDelete({ catwayNumber });

    if (!catway) {
      return res.status(404).json({
        message: 'Catway introuvable.'
      });
    }

    res.status(200).json({
      message: 'Catway supprimé avec succès.'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du catway :', error);

    res.status(500).json({
      message: 'Erreur lors de la suppression du catway.'
    });
  }
});

module.exports = router;