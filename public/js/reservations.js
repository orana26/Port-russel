
const reservationsList = document.getElementById('reservationsList');
const reservationForm = document.getElementById('reservationForm');
const searchForm = document.getElementById('searchForm');
const message = document.getElementById('message');

let allReservations = [];

async function apiRequest(url, options = {}) {
  const response = await fetch(url, {
    credentials: 'same-origin',
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers
    }
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || data.error || 'Une erreur est survenue.');
  }

  return data;
}

function showMessage(text, error = false) {
  message.textContent = text;
  message.style.color = error ? 'red' : 'green';
}

function formatDate(value) {
  return new Date(value).toLocaleString('fr-FR');
}

async function loadReservations(catwayNumber = null) {
  reservationsList.replaceChildren();

  try {
    const catways = await apiRequest('/catways');

    const selectedCatways = catwayNumber === null
      ? catways
      : catways.filter(catway =>
          String(catway.catwayNumber) === String(catwayNumber)
        );

    const results = await Promise.all(
      selectedCatways.map(async catway => {
        const reservations = await apiRequest(
          `/catways/${catway.catwayNumber}/reservations`
        );

        return reservations.map(reservation => ({
          ...reservation,
          catwayNumber: catway.catwayNumber
        }));
      })
    );

    allReservations = results.flat();
    renderReservations(allReservations);

    if (allReservations.length === 0) {
      showMessage('Aucune réservation trouvée.');
    } else {
      showMessage(`${allReservations.length} réservation(s) affichée(s).`);
    }
  } catch (error) {
    reservationsList.innerHTML =
      '<tr><td colspan="6">Impossible de charger les réservations.</td></tr>';
    showMessage(error.message, true);
  }
}

function renderReservations(reservations) {
  reservationsList.replaceChildren();

  if (reservations.length === 0) {
    reservationsList.innerHTML =
      '<tr><td colspan="6">Aucune réservation trouvée.</td></tr>';
    return;
  }

  reservations.forEach(reservation => {
    const row = document.createElement('tr');

    const values = [
      reservation.catwayNumber,
      reservation.clientName,
      reservation.boatName,
      formatDate(reservation.startDate),
      formatDate(reservation.endDate)
    ];

    values.forEach(value => {
      const cell = document.createElement('td');
      cell.textContent = value ?? '';
      row.appendChild(cell);
    });

    const actionsCell = document.createElement('td');

    const editButton = document.createElement('button');
    editButton.type = 'button';
    editButton.textContent = 'Modifier';

    editButton.addEventListener('click', async () => {
      const clientName = prompt('Nom du client :', reservation.clientName);
      if (clientName === null) return;

      const boatName = prompt('Nom du bateau :', reservation.boatName);
      if (boatName === null) return;

      const startDate = prompt(
        'Date de début (format ISO, ex. 2026-11-01T10:00:00Z) :',
        new Date(reservation.startDate).toISOString()
      );
      if (startDate === null) return;

      const endDate = prompt(
        'Date de fin (format ISO, ex. 2026-11-05T10:00:00Z) :',
        new Date(reservation.endDate).toISOString()
      );
      if (endDate === null) return;

      try {
        await apiRequest(
          `/catways/${reservation.catwayNumber}/reservations/${reservation._id}`,
          {
            method: 'PUT',
            body: JSON.stringify({
              clientName: clientName.trim(),
              boatName: boatName.trim(),
              startDate,
              endDate
            })
          }
        );

        showMessage('Réservation modifiée.');
        await loadReservations();
      } catch (error) {
        showMessage(error.message, true);
      }
    });

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.textContent = 'Supprimer';

    deleteButton.addEventListener('click', async () => {
      if (!confirm('Supprimer cette réservation ?')) return;

      try {
        await apiRequest(
          `/catways/${reservation.catwayNumber}/reservations/${reservation._id}`,
          { method: 'DELETE' }
        );

        showMessage('Réservation supprimée.');
        await loadReservations();
      } catch (error) {
        showMessage(error.message, true);
      }
    });

    actionsCell.append(editButton, deleteButton);
    row.appendChild(actionsCell);
    reservationsList.appendChild(row);
  });
}

reservationForm.addEventListener('submit', async event => {
  event.preventDefault();

  const catwayNumber = Number(
    document.getElementById('catwayNumber').value
  );

  const startDate = new Date(
    document.getElementById('startDate').value
  );
  const endDate = new Date(
    document.getElementById('endDate').value
  );

  if (endDate <= startDate) {
    showMessage('La date de fin doit être après la date de début.', true);
    return;
  }

  const reservation = {
    clientName: document.getElementById('clientName').value.trim(),
    boatName: document.getElementById('boatName').value.trim(),
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString()
  };

  try {
    await apiRequest(`/catways/${catwayNumber}/reservations`, {
      method: 'POST',
      body: JSON.stringify(reservation)
    });

    reservationForm.reset();
    showMessage('Réservation ajoutée.');
    await loadReservations();
  } catch (error) {
    showMessage(error.message, true);
  }
});

searchForm.addEventListener('submit', async event => {
  event.preventDefault();

  const catwayNumber = document.getElementById('searchCatway').value;
  await loadReservations(catwayNumber);
});

document.getElementById('showAll').addEventListener('click', () => {
  searchForm.reset();
  loadReservations();
});

loadReservations();
