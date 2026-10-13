
const express = require('express');
const router = express.Router();

const Reservation = require('../models/Reservation');
const Catway = require('../models/catway');
const isAuthenticated = require('../middleware/authMiddleware');

// GET : récupérer toutes les réservations d'un catway
router.get('/:id/reservations', isAuthenticated, async (req, res) => {
  try {
    const catwayNumber = Number(req.params.id);

    if (!Number.isInteger(catwayNumber) || catwayNumber < 1) {
      return res.status(400).json({
        message: 'Le numéro du catway doit être un entier positif.'
      });
    }

    const reservations = await Reservation.find({ catwayNumber });

    return res.status(200).json(reservations);
  } catch (error) {
    console.error('Erreur lors de la récupération des réservations :', error);

    return res.status(500).json({
      message: 'Erreur lors de la récupération des réservations.'
    });
  }
});

// GET : récupérer une réservation précise d'un catway
router.get('/:id/reservations/:idReservation', isAuthenticated, async (req, res) => {
  try {
    const catwayNumber = Number(req.params.id);
    const reservation = await Reservation.findOne({
      _id: req.params.idReservation,
      catwayNumber
    });

    if (!reservation) {
      return res.status(404).json({
        message: 'Réservation introuvable pour ce catway.'
      });
    }

    return res.status(200).json(reservation);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        message: 'Identifiant de réservation invalide.'
      });
    }

    console.error('Erreur lors de la récupération de la réservation :', error);

    return res.status(500).json({
      message: 'Erreur lors de la récupération de la réservation.'
    });
  }
});

// POST : créer une réservation pour un catway
router.post('/:id/reservations', isAuthenticated, async (req, res) => {
  try {
    const catwayNumber = Number(req.params.id);
    const { clientName, boatName, startDate, endDate } = req.body;

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

    const reservation = await Reservation.create({
      catwayNumber,
      clientName,
      boatName,
      startDate,
      endDate
    });

    return res.status(201).json({
      message: 'Réservation créée avec succès.',
      reservation
    });
  } catch (error) {
    if (error.name === 'ValidationError' || error.name === 'CastError') {
      return res.status(400).json({
        message: 'Données de réservation invalides.',
        error: error.message
      });
    }

    console.error('Erreur lors de la création de la réservation :', error);

    return res.status(500).json({
      message: 'Erreur lors de la création de la réservation.'
    });
  }
});

// PUT : modifier une réservation
router.put('/:id/reservations/:idReservation', isAuthenticated, async (req, res) => {
  try {
    const catwayNumber = Number(req.params.id);
    const { clientName, boatName, startDate, endDate } = req.body;

    const reservation = await Reservation.findOne({
      _id: req.params.idReservation,
      catwayNumber
    });

    if (!reservation) {
      return res.status(404).json({
        message: 'Réservation introuvable pour ce catway.'
      });
    }

    if (clientName !== undefined) reservation.clientName = clientName;
    if (boatName !== undefined) reservation.boatName = boatName;
    if (startDate !== undefined) reservation.startDate = startDate;
    if (endDate !== undefined) reservation.endDate = endDate;

    await reservation.save();

    return res.status(200).json({
      message: 'Réservation modifiée avec succès.',
      reservation
    });
  } catch (error) {
    if (error.name === 'ValidationError' || error.name === 'CastError') {
      return res.status(400).json({
        message: 'Données de réservation invalides.',
        error: error.message
      });
    }

    console.error('Erreur lors de la modification de la réservation :', error);

    return res.status(500).json({
      message: 'Erreur lors de la modification de la réservation.'
    });
  }
});

// DELETE : supprimer une réservation
router.delete('/:id/reservations/:idReservation', isAuthenticated, async (req, res) => {
  try {
    const catwayNumber = Number(req.params.id);

    const reservation = await Reservation.findOneAndDelete({
      _id: req.params.idReservation,
      catwayNumber
    });

    if (!reservation) {
      return res.status(404).json({
        message: 'Réservation introuvable pour ce catway.'
      });
    }

    return res.status(200).json({
      message: 'Réservation supprimée avec succès.'
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        message: 'Identifiant de réservation invalide.'
      });
    }

    console.error('Erreur lors de la suppression de la réservation :', error);

    return res.status(500).json({
      message: 'Erreur lors de la suppression de la réservation.'
    });
  }
});

module.exports = router;
