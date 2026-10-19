const CONFIG = {
  API_BASE_URL: (() => {
    if (
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.protocol === 'file:'
    ) {
      return 'http://localhost:5000/api';
    }
    return 'https://taste-hub-aoz5.vercel.app/api';
  })(),


  DEFAULT_FOOD_IMAGE: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',


  CURRENCY: '₹',
  DELIVERY_FEE: 40,
  FREE_DELIVERY_THRESHOLD: 500,


  STORAGE_KEYS: {
    TOKEN: 'tastehub_token',
    USER: 'tastehub_user',
    CART: 'tastehub_cart'
  }
};



async function fetchJson(url, options) {
  const response = await fetch(url, options);
  const text = await response.text();
  let data = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch (e) {
      data = { success: false, message: 'Server error. Please try again.' };
    }
  } else if (!response.ok) {
    data = { success: false, message: 'Server error. Please try again.' };
  }
  return { response, data };
}

function getToken() {
  return localStorage.getItem(CONFIG.STORAGE_KEYS.TOKEN);
}

function getUser() {
  const userStr = localStorage.getItem(CONFIG.STORAGE_KEYS.USER);
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch (e) {
    return null;
  }
}

function saveAuth(token, user) {
  localStorage.setItem(CONFIG.STORAGE_KEYS.TOKEN, token);
  localStorage.setItem(CONFIG.STORAGE_KEYS.USER, JSON.stringify(user));
}

function clearAuth() {
  localStorage.removeItem(CONFIG.STORAGE_KEYS.TOKEN);
  localStorage.removeItem(CONFIG.STORAGE_KEYS.USER);
}

function isAuthenticated() {
  return !!getToken();
}


function getCart() {
  const cartStr = localStorage.getItem(CONFIG.STORAGE_KEYS.CART);
  if (!cartStr) return [];
  try {
    return JSON.parse(cartStr);
  } catch (e) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CONFIG.STORAGE_KEYS.CART, JSON.stringify(cart));
  updateCartBadge();
}

function addToCart(dish, quantity = 1) {
  const cart = getCart();
  const dishId = dish._id || dish.id;

  const existingItemIndex = cart.findIndex(item => (item._id || item.id) === dishId);

  if (existingItemIndex > -1) {
    cart[existingItemIndex].quantity += quantity;
  } else {
    cart.push({
      _id: dishId,
      name: dish.name,
      price: dish.price,
      image: dish.image || CONFIG.DEFAULT_FOOD_IMAGE,
      category: dish.category || 'General',
      quantity: quantity
    });
  }

  saveCart(cart);
  showToast(`Added "${dish.name}" to cart! 🛒`, 'success');
}

function updateCartBadge() {
  const cart = getCart();
  const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const badges = document.querySelectorAll('.cart-badge');
  badges.forEach(badge => {
    badge.textContent = totalItems;
    badge.style.display = totalItems > 0 ? 'inline-flex' : 'none';
  });
}


function showToast(message, type = 'info') {
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="toast-message">${message}</span>
    <button class="toast-close" onclick="this.parentElement.remove()">&times;</button>
  `;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => {
      if (toast.parentElement) toast.remove();
    }, 400);
  }, 3500);
}


function updateNavAuth() {
  const navAuthContainer = document.getElementById('nav-auth-container');
  if (!navAuthContainer) return;

  const user = getUser();

  if (user && isAuthenticated()) {
    navAuthContainer.innerHTML = `
      <div class="user-profile-menu">
        <span class="user-greeting">👋 Hi, <strong>${escapeHtml(user.name.split(' ')[0])}</strong></span>
        <button id="logout-btn" class="btn btn-outline-light btn-sm">Logout</button>
      </div>
    `;

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        clearAuth();
        showToast('Logged out successfully.', 'info');
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 500);
      });
    }
  } else {
    navAuthContainer.innerHTML = `
      <a href="login.html" class="nav-link auth-link">Login</a>
      <a href="signup.html" class="btn btn-primary btn-sm">Sign Up</a>
    `;
  }
}

function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
