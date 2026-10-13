const usersList = document.getElementById('usersList');
const userForm = document.getElementById('userForm');
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
    throw new Error(
      data.message || data.error || 'Une erreur est survenue.'
    );
  }

  return data;
}

function showMessage(text, error = false) {
  message.textContent = text;
  message.style.color = error ? 'red' : 'green';
}

async function loadUsers() {
  usersList.replaceChildren();

  try {
    const users = await apiRequest('/users');

    if (users.length === 0) {
      usersList.innerHTML =
        '<tr><td colspan="3">Aucun utilisateur trouvé.</td></tr>';
      return;
    }

    users.forEach(user => {
      const row = document.createElement('tr');

      const usernameCell = document.createElement('td');
      usernameCell.textContent = user.username;

      const emailCell = document.createElement('td');
      emailCell.textContent = user.email;

      const actionsCell = document.createElement('td');

      const editButton = document.createElement('button');
      editButton.type = 'button';
      editButton.textContent = 'Modifier';

      editButton.addEventListener('click', async () => {
        const username = prompt(
          "Nouveau nom d'utilisateur :",
          user.username
        );

        if (username === null) return;

        const password = prompt(
          'Nouveau mot de passe (laisser vide pour ne pas le changer) :'
        );

        if (password === null) return;

        const changes = {
          username: username.trim()
        };

        if (password.trim() !== '') {
          if (password.trim().length < 8) {
            showMessage(
              'Le mot de passe doit contenir au moins 8 caractères.',
              true
            );
            return;
          }

          changes.password = password.trim();
        }

        try {
          await apiRequest(
            `/users/${encodeURIComponent(user.email)}`,
            {
              method: 'PUT',
              body: JSON.stringify(changes)
            }
          );

          showMessage('Utilisateur modifié.');
          await loadUsers();
        } catch (error) {
          showMessage(error.message, true);
        }
      });

      const deleteButton = document.createElement('button');
      deleteButton.type = 'button';
      deleteButton.textContent = 'Supprimer';

      deleteButton.addEventListener('click', async () => {
        if (user.email === 'testuser@example.com') {
          showMessage(
            'Ce compte est utilisé pour les tests : suppression bloquée.',
            true
          );
          return;
        }

        if (!confirm(`Supprimer l'utilisateur ${user.email} ?`)) {
          return;
        }

        try {
          await apiRequest(
            `/users/${encodeURIComponent(user.email)}`,
            { method: 'DELETE' }
          );

          showMessage('Utilisateur supprimé.');
          await loadUsers();
        } catch (error) {
          showMessage(error.message, true);
        }
      });

      actionsCell.append(editButton, deleteButton);
      row.append(usernameCell, emailCell, actionsCell);
      usersList.appendChild(row);
    });
  } catch (error) {
    usersList.innerHTML =
      '<tr><td colspan="3">Impossible de charger les utilisateurs.</td></tr>';
    showMessage(error.message, true);
  }
}

userForm.addEventListener('submit', async event => {
  event.preventDefault();

  const username = document.getElementById('username').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  try {
    await apiRequest('/users', {
      method: 'POST',
      body: JSON.stringify({ username, email, password })
    });

    userForm.reset();
    showMessage('Utilisateur ajouté.');
    await loadUsers();
  } catch (error) {
    showMessage(error.message, true);
  }
});

loadUsers();