const mongoose = require('mongoose');

const catwaySchema = new mongoose.Schema(
  {
    catwayNumber: {
      type: Number,
      required: [true, 'Le numéro du catway est obligatoire'],
      unique: true,
      min: [1, 'Le numéro du catway doit être supérieur à 0'],
      validate: {
        validator: Number.isInteger,
        message: 'Le numéro du catway doit être un entier'
      }
    },
    catwayType: {
      type: String,
      required: [true, 'Le type du catway est obligatoire'],
      enum: {
        values: ['long', 'short'],
        message: 'Le type doit être long ou short'
      }
    },
    catwayState: {
      type: String,
      required: [true, 'L’état du catway est obligatoire'],
      trim: true,
      minlength: [1, 'L’état du catway ne peut pas être vide']
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Catway', catwaySchema);