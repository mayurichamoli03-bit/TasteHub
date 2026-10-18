
document.addEventListener('DOMContentLoaded', () => {
  renderCart();
});

function renderCart() {
  const cartContainer = document.getElementById('cart-items-list');
  const cartLayout = document.getElementById('cart-layout');
  const emptyCartState = document.getElementById('empty-cart-state');
  const subtotalEl = document.getElementById('cart-subtotal');
  const deliveryFeeEl = document.getElementById('cart-delivery-fee');
  const totalEl = document.getElementById('cart-total');
  const freeDeliveryNotice = document.getElementById('free-delivery-notice');

  const cart = getCart();

  if (cart.length === 0) {
    if (cartLayout) cartLayout.style.display = 'none';
    if (emptyCartState) emptyCartState.style.display = 'block';
    updateCartBadge();
    return;
  }

  if (cartLayout) cartLayout.style.display = 'grid';
  if (emptyCartState) emptyCartState.style.display = 'none';

  let subtotal = 0;

  cartContainer.innerHTML = cart.map((item, index) => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;

    return `
      <div class="cart-item-row" data-index="${index}">
        <img 
          src="${item.image || CONFIG.DEFAULT_FOOD_IMAGE}" 
          alt="${escapeHtml(item.name)}" 
          class="cart-item-img"
          onerror="this.onerror=null; this.src='${CONFIG.DEFAULT_FOOD_IMAGE}';"
        />
        <div class="cart-item-details">
          <h4 class="cart-item-title">${escapeHtml(item.name)}</h4>
          <p class="cart-item-category">${escapeHtml(item.category || 'Dish')}</p>
          <span class="cart-item-unit-price">${CONFIG.CURRENCY}${item.price} each</span>
        </div>
        <div class="qty-control">
          <button class="qty-btn btn-qty-minus" data-index="${index}" aria-label="Decrease quantity">−</button>
          <span class="qty-display">${item.quantity}</span>
          <button class="qty-btn btn-qty-plus" data-index="${index}" aria-label="Increase quantity">+</button>
        </div>
        <div class="cart-item-subtotal">
          ${CONFIG.CURRENCY}${itemTotal}
        </div>
        <button class="btn-remove-item" data-index="${index}" title="Remove item" aria-label="Remove item">
          🗑️
        </button>
      </div>
    `;
  }).join('');


  const deliveryFee = subtotal >= CONFIG.FREE_DELIVERY_THRESHOLD ? 0 : CONFIG.DELIVERY_FEE;
  const finalTotal = subtotal + deliveryFee;

  if (subtotalEl) subtotalEl.textContent = `${CONFIG.CURRENCY}${subtotal}`;
  if (deliveryFeeEl) {
    deliveryFeeEl.textContent = deliveryFee === 0 ? 'FREE' : `${CONFIG.CURRENCY}${deliveryFee}`;
    if (deliveryFee === 0) {
      deliveryFeeEl.style.color = '#10b981';
      deliveryFeeEl.style.fontWeight = '700';
    } else {
      deliveryFeeEl.style.color = '';
      deliveryFeeEl.style.fontWeight = '';
    }
  }
  if (totalEl) totalEl.textContent = `${CONFIG.CURRENCY}${finalTotal}`;

  if (freeDeliveryNotice) {
    if (subtotal >= CONFIG.FREE_DELIVERY_THRESHOLD) {
      freeDeliveryNotice.innerHTML = `🎉 <strong>Congratulations!</strong> You unlocked FREE delivery!`;
      freeDeliveryNotice.style.display = 'block';
      freeDeliveryNotice.className = 'alert alert-success';
    } else {
      const remaining = CONFIG.FREE_DELIVERY_THRESHOLD - subtotal;
      freeDeliveryNotice.innerHTML = `💡 Add <strong>${CONFIG.CURRENCY}${remaining}</strong> more for <strong>FREE Delivery</strong>!`;
      freeDeliveryNotice.style.display = 'block';
      freeDeliveryNotice.className = 'alert alert-info';
    }
  }

  attachCartItemListeners();
  updateCartBadge();
}

function attachCartItemListeners() {
  const cart = getCart();


  document.querySelectorAll('.btn-qty-plus').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-index'), 10);
      if (cart[idx]) {
        cart[idx].quantity += 1;
        saveCart(cart);
        renderCart();
      }
    });
  });


  document.querySelectorAll('.btn-qty-minus').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-index'), 10);
      if (cart[idx]) {
        if (cart[idx].quantity > 1) {
          cart[idx].quantity -= 1;
        } else {
          // If decreasing from 1, remove item
          cart.splice(idx, 1);
          showToast('Item removed from cart', 'info');
        }
        saveCart(cart);
        renderCart();
      }
    });
  });


  document.querySelectorAll('.btn-remove-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-index'), 10);
      if (cart[idx]) {
        const removedName = cart[idx].name;
        cart.splice(idx, 1);
        saveCart(cart);
        renderCart();
        showToast(`Removed "${removedName}" from cart`, 'info');
      }
    });
  });


  const checkoutBtn = document.getElementById('proceed-checkout-btn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      if (getCart().length === 0) {
        showToast('Your cart is empty!', 'danger');
        return;
      }

      if (!isAuthenticated()) {
        showToast('Please log in to continue to checkout', 'info');
        setTimeout(() => {
          window.location.href = 'login.html?redirect=checkout.html';
        }, 800);
      } else {
        window.location.href = 'checkout.html';
      }
    });
  }
}
