require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const Catway = require('../models/catway');
const Reservation = require('../models/Reservation');

async function importData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connexion à MongoDB réussie.');

    const catwaysPath = path.join(__dirname, '../data/catways.json');
    const reservationsPath = path.join(__dirname, '../data/reservations.json');

    const catways = JSON.parse(fs.readFileSync(catwaysPath, 'utf8'));
    const reservations = JSON.parse(
      fs.readFileSync(reservationsPath, 'utf8')
    );

    for (const catway of catways) {
      await Catway.updateOne(
        { catwayNumber: catway.catwayNumber },
        { $set: catway },
        { upsert: true, runValidators: true }
      );
    }

    for (const reservation of reservations) {
      await Reservation.updateOne(
        {
          catwayNumber: reservation.catwayNumber,
          clientName: reservation.clientName,
          boatName: reservation.boatName
        },
        { $set: reservation },
        { upsert: true, runValidators: true }
      );
    }

    console.log(`${catways.length} catways traités.`);
    console.log(`${reservations.length} réservations traitées.`);
  } catch (error) {
    console.error('Erreur pendant l’import :', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

importData();
