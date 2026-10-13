const loginForm = document.getElementById('loginForm');
const loginMessage = document.getElementById('loginMessage');

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  loginMessage.textContent = '';

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  try {
    const response = await fetch('/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'same-origin',
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      loginMessage.textContent =
        data.message || 'Échec de la connexion.';
      return;
    }

    window.location.href = '/dashboard';
  } catch (error) {
    loginMessage.textContent =
      'Impossible de contacter le serveur. Réessaie plus tard.';
  }
});