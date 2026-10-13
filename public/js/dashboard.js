const usernameElement = document.getElementById('username');
const userEmailElement = document.getElementById('userEmail');
const currentDateElement = document.getElementById('currentDate');
const reservationsTable = document.getElementById('reservationsTable');
const reservationMessage = document.getElementById('reservationMessage');

// Afficher la date du jour
currentDateElement.textContent = new Date().toLocaleDateString('fr-FR');

// Charger les informations de l'utilisateur connecté
async function loadDashboard() {
  try {
    const userResponse = await fetch('/me', {
      credentials: 'same-origin'
    });

    if (!userResponse.ok) {
      window.location.href = '/';
      return;
    }

    const userData = await userResponse.json();

    // Charger le profil complet depuis l'API
    const profileResponse = await fetch('/users', {
      credentials: 'same-origin'
    });

    if (!profileResponse.ok) {
      throw new Error('Impossible de charger les utilisateurs.');
    }

    const users = await profileResponse.json();
    const user = users.find(item => item._id === userData.userId);

    if (!user) {
      throw new Error('Utilisateur introuvable.');
    }

    usernameElement.textContent = user.username;
    userEmailElement.textContent = user.email;

    await loadReservations();
  } catch (error) {
    console.error(error);
    reservationMessage.textContent =
      'Impossible de charger les informations du tableau de bord.';
  }
}

// Charger les réservations en cours
async function loadReservations() {
  try {
    const response = await fetch('/catways', {
      credentials: 'same-origin'
    });

    if (!response.ok) {
      throw new Error('Impossible de charger les catways.');
    }

    const catways = await response.json();
    const now = new Date();
    let reservations = [];

    for (const catway of catways) {
      const reservationResponse = await fetch(
        `/catways/${catway.catwayNumber}/reservations`,
        { credentials: 'same-origin' }
      );

      if (!reservationResponse.ok) continue;

      const catwayReservations = await reservationResponse.json();

      reservations.push(
        ...catwayReservations.filter(reservation => {
          const start = new Date(reservation.startDate);
          const end = new Date(reservation.endDate);
          return start <= now && end >= now;
        })
      );
    }

    reservationsTable.replaceChildren();

    if (reservations.length === 0) {
      reservationMessage.textContent = 'Aucune réservation en cours.';
      return;
    }

    reservationMessage.textContent = '';

    for (const reservation of reservations) {
      const row = document.createElement('tr');

      const values = [
        reservation.catwayNumber,
        reservation.clientName,
        reservation.boatName,
        new Date(reservation.startDate).toLocaleDateString('fr-FR'),
        new Date(reservation.endDate).toLocaleDateString('fr-FR')
      ];

      for (const value of values) {
        const cell = document.createElement('td');
        cell.textContent = value;
        row.appendChild(cell);
      }

      reservationsTable.appendChild(row);
    }
  } catch (error) {
    console.error(error);
    reservationMessage.textContent =
      'Impossible de charger les réservations.';
  }
}

loadDashboard();