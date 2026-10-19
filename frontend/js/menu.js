
let allDishes = [];
let currentCategory = 'All';
let currentSearch = '';

document.addEventListener('DOMContentLoaded', () => {
  // Parse query parameters from URL
  const urlParams = new URLSearchParams(window.location.search);
  const paramCategory = urlParams.get('category');
  const paramSearch = urlParams.get('search');

  if (paramCategory) {
    currentCategory = paramCategory;
  }
  if (paramSearch) {
    currentSearch = paramSearch;
    const searchInput = document.getElementById('menu-search-input');
    if (searchInput) searchInput.value = currentSearch;
  }

  setupMenuFilters();
  setupSearchInput();
  fetchDishes();
});


function setupMenuFilters() {
  const filterPills = document.querySelectorAll('.filter-pill');
  filterPills.forEach(pill => {
    const cat = pill.getAttribute('data-category');
    if (cat && cat.toLowerCase() === currentCategory.toLowerCase()) {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
    }

    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentCategory = pill.getAttribute('data-category') || 'All';
      
      // Update browser URL without reloading
      const url = new URL(window.location);
      if (currentCategory === 'All') {
        url.searchParams.delete('category');
      } else {
        url.searchParams.set('category', currentCategory);
      }
      window.history.replaceState({}, '', url);

      fetchDishes();
    });
  });
}


function setupSearchInput() {
  const searchInput = document.getElementById('menu-search-input');
  const searchClearBtn = document.getElementById('search-clear-btn');
  let debounceTimer;

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        currentSearch = e.target.value.trim();
        
        const url = new URL(window.location);
        if (currentSearch) {
          url.searchParams.set('search', currentSearch);
        } else {
          url.searchParams.delete('search');
        }
        window.history.replaceState({}, '', url);

        fetchDishes();
      }, 350);
    });
  }

  if (searchClearBtn && searchInput) {
    searchClearBtn.addEventListener('click', () => {
      searchInput.value = '';
      currentSearch = '';
      const url = new URL(window.location);
      url.searchParams.delete('search');
      window.history.replaceState({}, '', url);
      fetchDishes();
    });
  }
}

async function fetchDishes() {
  const dishesGrid = document.getElementById('menu-dishes-grid');
  const resultsCount = document.getElementById('results-count');
  if (!dishesGrid) return;

  try {
    dishesGrid.innerHTML = `
      <div class="spinner-wrapper" style="grid-column: 1 / -1;">
        <div class="spinner"></div>
        <p>Loading TasteHub Menu...</p>
      </div>
    `;

    const queryParams = new URLSearchParams();
    if (currentCategory && currentCategory.toLowerCase() !== 'all') {
      queryParams.append('category', currentCategory);
    }
    if (currentSearch) {
      queryParams.append('search', currentSearch);
    }

    const apiUrl = `${CONFIG.API_BASE_URL}/dishes?${queryParams.toString()}`;
    const { response, data } = await fetchJson(apiUrl);

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to load dishes');
    }

    allDishes = data.dishes || [];

    if (resultsCount) {
      resultsCount.textContent = `Showing ${allDishes.length} ${allDishes.length === 1 ? 'dish' : 'dishes'}`;
    }

    if (allDishes.length === 0) {
      dishesGrid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="empty-state-icon">🔍</div>
          <h3>No dishes found</h3>
          <p>We couldn't find any dishes matching "${escapeHtml(currentSearch || currentCategory)}". Try searching for something else!</p>
          <button class="btn btn-outline" onclick="resetFilters()">View All Dishes</button>
        </div>
      `;
      return;
    }

    dishesGrid.innerHTML = allDishes.map(dish => createDishCardHTML(dish)).join('');
    attachAddToCartListeners(dishesGrid, allDishes);
  } catch (err) {
    console.error('Menu load error:', err);
    if (resultsCount) resultsCount.textContent = 'Menu unavailable';
    dishesGrid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-state-icon">⚠️</div>
        <h3>Unable to load menu</h3>
        <p>${escapeHtml(err.message || 'Could not reach the TasteHub API. Please try again in a moment.')}</p>
        <button class="btn btn-primary" onclick="fetchDishes()">Retry Connection</button>
      </div>
    `;
  }
}


window.resetFilters = function() {
  currentCategory = 'All';
  currentSearch = '';

  const searchInput = document.getElementById('menu-search-input');
  if (searchInput) searchInput.value = '';

  const filterPills = document.querySelectorAll('.filter-pill');
  filterPills.forEach(p => {
    p.classList.toggle('active', p.getAttribute('data-category') === 'All');
  });

  const url = new URL(window.location);
  url.searchParams.delete('category');
  url.searchParams.delete('search');
  window.history.replaceState({}, '', url);

  fetchDishes();
};
