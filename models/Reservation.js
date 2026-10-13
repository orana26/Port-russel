const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema(
  {
    catwayNumber: {
      type: Number,
      required: [true, 'Le numéro du catway est obligatoire'],
      min: [1, 'Le numéro du catway doit être supérieur à 0'],
      validate: {
        validator: Number.isInteger,
        message: 'Le numéro du catway doit être un entier'
      }
    },
    clientName: {
      type: String,
      required: [true, 'Le nom du client est obligatoire'],
      trim: true,
      minlength: [2, 'Le nom du client doit contenir au moins 2 caractères']
    },
    boatName: {
      type: String,
      required: [true, 'Le nom du bateau est obligatoire'],
      trim: true,
      minlength: [1, 'Le nom du bateau ne peut pas être vide']
    },
    startDate: {
      type: Date,
      required: [true, 'La date de début est obligatoire']
    },
    endDate: {
      type: Date,
      required: [true, 'La date de fin est obligatoire'],
      validate: {
        validator: function (value) {
          return !this.startDate || value > this.startDate;
        },
        message: 'La date de fin doit être postérieure à la date de début'
      }
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Reservation', reservationSchema);