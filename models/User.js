const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Le nom d’utilisateur est obligatoire'],
      trim: true,
      minlength: [3, 'Le nom d’utilisateur doit contenir au moins 3 caractères'],
      maxlength: [50, 'Le nom d’utilisateur ne peut pas dépasser 50 caractères']
    },
    email: {
      type: String,
      required: [true, 'L’adresse e-mail est obligatoire'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Adresse e-mail invalide']
    },
    password: {
      type: String,
      required: [true, 'Le mot de passe est obligatoire'],
      minlength: [8, 'Le mot de passe doit contenir au moins 8 caractères'],
      select: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('User', userSchema);