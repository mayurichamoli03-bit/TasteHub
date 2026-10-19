

document.addEventListener('DOMContentLoaded', () => {
 
  if (typeof updateNavAuth === 'function') updateNavAuth();
  if (typeof updateCartBadge === 'function') updateCartBadge();

 
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const navLinks = document.getElementById('nav-links');

  if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener('click', () => {
      navLinks.classList.toggle('show');
    });

   
    document.addEventListener('click', (e) => {
      if (!mobileMenuBtn.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove('show');
      }
    });
  }

  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const navItems = document.querySelectorAll('.nav-link');
  navItems.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });


  const isHomepage = document.getElementById('hero-search-form') || document.getElementById('featured-dishes-grid');
  if (isHomepage) {
    initHomepage();
  }
});

/**
 * Homepage Specific Logic
 */
function initHomepage() {
  // Hero Search Form
  const searchForm = document.getElementById('hero-search-form');
  const searchInput = document.getElementById('hero-search-input');

  if (searchForm && searchInput) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const query = searchInput.value.trim();
      if (query) {
        window.location.href = `menu.html?search=${encodeURIComponent(query)}`;
      } else {
        window.location.href = 'menu.html';
      }
    });
  }

  // Category Cards Click Redirect
  const categoryCards = document.querySelectorAll('.category-card[data-category]');
  categoryCards.forEach(card => {
    card.addEventListener('click', () => {
      const category = card.getAttribute('data-category');
      if (category) {
        window.location.href = `menu.html?category=${encodeURIComponent(category)}`;
      }
    });
  });

  // Load Featured Dishes
  loadFeaturedDishes();
}


async function loadFeaturedDishes() {
  const container = document.getElementById('featured-dishes-grid');
  if (!container) return;

  try {
    container.innerHTML = `
      <div class="spinner-wrapper" style="grid-column: 1 / -1;">
        <div class="spinner"></div>
        <p>Cooking up something special for you...</p>
      </div>
    `;

    const { response, data } = await fetchJson(`${CONFIG.API_BASE_URL}/dishes`);

    if (!response.ok || !data.success || !data.dishes || data.dishes.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="empty-state-icon">🍽️</div>
          <h3>Dishes are warming up!</h3>
          <p>Please make sure the backend server is running and database is seeded.</p>
          <a href="menu.html" class="btn btn-primary">Go to Full Menu</a>
        </div>
      `;
      return;
    }

    const featured = data.dishes.slice(0, 6);

    container.innerHTML = featured.map(dish => createDishCardHTML(dish)).join('');

   
    attachAddToCartListeners(container, featured);
  } catch (err) {
    console.error('Failed to load featured dishes:', err);
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-state-icon">📡</div>
        <h3>Unable to reach TasteHub Kitchen</h3>
        <p>Could not reach the TasteHub API. Please try again in a moment.</p>
        <a href="menu.html" class="btn btn-outline">Check Full Menu</a>
      </div>
    `;
  }
}


function createDishCardHTML(dish) {
  const id = dish._id || dish.id;
  const image = dish.image || CONFIG.DEFAULT_FOOD_IMAGE;
  const price = dish.price || 0;

  return `
    <div class="dish-card" data-id="${id}">
      <div class="dish-img-wrap">
        <span class="dish-category-badge">${escapeHtml(dish.category)}</span>
        <img 
          src="${image}" 
          alt="${escapeHtml(dish.name)}" 
          loading="lazy"
          onerror="this.onerror=null; this.src='${CONFIG.DEFAULT_FOOD_IMAGE}';"
        />
      </div>
      <div class="dish-content">
        <div class="dish-header">
          <h3 class="dish-title">${escapeHtml(dish.name)}</h3>
        </div>
        <p class="dish-desc">${escapeHtml(dish.description)}</p>
        <div class="dish-footer">
          <span class="dish-price">${CONFIG.CURRENCY}${price}</span>
          <button class="btn btn-primary btn-sm btn-add-cart" data-id="${id}">
            + Add
          </button>
        </div>
      </div>
    </div>
  `;
}


function attachAddToCartListeners(container, dishesList) {
  const addButtons = container.querySelectorAll('.btn-add-cart');
  addButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const dishId = btn.getAttribute('data-id');
      const dish = dishesList.find(d => (d._id || d.id) === dishId);
      if (dish) {
        addToCart(dish, 1);
        
       
        const originalText = btn.innerHTML;
        btn.innerHTML = '✓ Added';
        btn.style.backgroundColor = '#10b981';
        setTimeout(() => {
          btn.innerHTML = originalText;
          btn.style.backgroundColor = '';
        }, 1200);
      }
    });
  });
}
