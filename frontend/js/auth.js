
document.addEventListener('DOMContentLoaded', () => {

  if (isAuthenticated()) {
    const alreadyLoggedInNotice = document.getElementById('already-logged-in-notice');
    if (alreadyLoggedInNotice) {
      alreadyLoggedInNotice.style.display = 'block';
      const user = getUser();
      const userNameEl = document.getElementById('logged-in-user-name');
      if (userNameEl && user) userNameEl.textContent = user.name;
    }
  }

  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }


  const signupForm = document.getElementById('signup-form');
  if (signupForm) {
    signupForm.addEventListener('submit', handleSignup);
  }
});


async function handleLogin(e) {
  e.preventDefault();

  const emailInput = document.getElementById('login-email');
  const passwordInput = document.getElementById('login-password');
  const alertBox = document.getElementById('auth-alert');
  const submitBtn = document.getElementById('login-submit-btn');

  const email = emailInput.value.trim();
  const password = passwordInput.value;

 
  if (!email || !password) {
    showAlert(alertBox, 'Please enter both email and password.', 'danger');
    return;
  }

  hideAlert(alertBox);
  setButtonLoading(submitBtn, true, 'Logging in...');

  try {
    const { response, data } = await fetchJson(`${CONFIG.API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Login failed. Please check your credentials.');
    }

   
    saveAuth(data.token, data.user);
    showToast(`Welcome back, ${data.user.name}! 👋`, 'success');

  
    const urlParams = new URLSearchParams(window.location.search);
    const redirectUrl = urlParams.get('redirect') || 'index.html';

    setTimeout(() => {
      window.location.href = redirectUrl;
    }, 800);
  } catch (err) {
    showAlert(alertBox, err.message, 'danger');
  } finally {
    setButtonLoading(submitBtn, false, 'Sign In');
  }
}

async function handleSignup(e) {
  e.preventDefault();

  const nameInput = document.getElementById('signup-name');
  const emailInput = document.getElementById('signup-email');
  const passwordInput = document.getElementById('signup-password');
  const confirmPasswordInput = document.getElementById('signup-confirm-password');
  const alertBox = document.getElementById('auth-alert');
  const submitBtn = document.getElementById('signup-submit-btn');

  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const confirmPassword = confirmPasswordInput.value;

 
  if (!name || !email || !password || !confirmPassword) {
    showAlert(alertBox, 'Please fill in all required fields.', 'danger');
    return;
  }

  if (password.length < 6) {
    showAlert(alertBox, 'Password must be at least 6 characters long.', 'danger');
    return;
  }

  if (password !== confirmPassword) {
    showAlert(alertBox, 'Passwords do not match.', 'danger');
    return;
  }

  hideAlert(alertBox);
  setButtonLoading(submitBtn, true, 'Creating account...');

  try {
    const { response, data } = await fetchJson(`${CONFIG.API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, email, password, confirmPassword })
    });

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Registration failed.');
    }

   
    saveAuth(data.token, data.user);
    showToast(`Account created! Welcome, ${data.user.name} 🎉`, 'success');

    // Check for redirect param
    const urlParams = new URLSearchParams(window.location.search);
    const redirectUrl = urlParams.get('redirect') || 'menu.html';

    setTimeout(() => {
      window.location.href = redirectUrl;
    }, 800);
  } catch (err) {
    showAlert(alertBox, err.message, 'danger');
  } finally {
    setButtonLoading(submitBtn, false, 'Create Account');
  }
}


function showAlert(alertEl, message, type = 'danger') {
  if (!alertEl) return;
  alertEl.textContent = message;
  alertEl.className = `alert alert-${type}`;
  alertEl.style.display = 'block';
}

function hideAlert(alertEl) {
  if (!alertEl) return;
  alertEl.style.display = 'none';
  alertEl.textContent = '';
}

function setButtonLoading(button, isLoading, text) {
  if (!button) return;
  button.disabled = isLoading;
  button.textContent = text;
}
