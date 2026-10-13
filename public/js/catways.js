
const catwaysList = document.getElementById('catwaysList');
const catwayForm = document.getElementById('catwayForm');
const message = document.getElementById('message');

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

async function loadCatways() {
  catwaysList.replaceChildren();

  try {
    const catways = await apiRequest('/catways');

    if (!Array.isArray(catways) || catways.length === 0) {
      catwaysList.innerHTML =
        '<tr><td colspan="4">Aucun catway trouvé.</td></tr>';
      return;
    }

    catways.forEach(catway => {
      const row = document.createElement('tr');

      const numberCell = document.createElement('td');
      numberCell.textContent = catway.catwayNumber;

      const typeCell = document.createElement('td');
      typeCell.textContent =
        catway.catwayType === 'long' ? 'Long' : 'Court';

      const stateCell = document.createElement('td');
      stateCell.textContent = catway.catwayState;

      const actionsCell = document.createElement('td');

      const editButton = document.createElement('button');
      editButton.textContent = 'Modifier l’état';
      editButton.type = 'button';

      editButton.addEventListener('click', async () => {
        const newState = prompt(
          'Nouvel état du catway :',
          catway.catwayState
        );

        if (newState === null) return;

        if (!newState.trim()) {
          showMessage('L’état ne peut pas être vide.', true);
          return;
        }

        try {
          await apiRequest(`/catways/${catway.catwayNumber}`, {
            method: 'PUT',
            body: JSON.stringify({ catwayState: newState.trim() })
          });

          showMessage('État du catway modifié.');
          await loadCatways();
        } catch (error) {
          showMessage(error.message, true);
        }
      });

      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'Supprimer';
      deleteButton.type = 'button';

      deleteButton.addEventListener('click', async () => {
        if (!confirm(`Supprimer le catway ${catway.catwayNumber} ?`)) {
          return;
        }

        try {
          await apiRequest(`/catways/${catway.catwayNumber}`, {
            method: 'DELETE'
          });

          showMessage('Catway supprimé.');
          await loadCatways();
        } catch (error) {
          showMessage(error.message, true);
        }
      });

      actionsCell.append(editButton, deleteButton);
      row.append(numberCell, typeCell, stateCell, actionsCell);
      catwaysList.appendChild(row);
    });
  } catch (error) {
    catwaysList.innerHTML =
      '<tr><td colspan="4">Impossible de charger les catways.</td></tr>';
    showMessage(error.message, true);
  }
}

catwayForm.addEventListener('submit', async event => {
  event.preventDefault();

  const catway = {
    catwayNumber: Number(document.getElementById('catwayNumber').value),
    catwayType: document.getElementById('catwayType').value,
    catwayState: document.getElementById('catwayState').value.trim()
  };

  try {
    await apiRequest('/catways', {
      method: 'POST',
      body: JSON.stringify(catway)
    });

    catwayForm.reset();
    showMessage('Catway ajouté avec succès.');
    await loadCatways();
  } catch (error) {
    showMessage(error.message, true);
  }
});

loadCatways();
