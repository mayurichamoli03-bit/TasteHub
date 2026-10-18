
document.addEventListener('DOMContentLoaded', () => {

  if (!isAuthenticated()) {
    showToast('Please log in to proceed with checkout', 'info');
    setTimeout(() => {
      window.location.href = 'login.html?redirect=checkout.html';
    }, 1000);
    return;
  }


  const cart = getCart();
  if (!cart || cart.length === 0) {
    showToast('Your cart is empty. Please select food first!', 'info');
    setTimeout(() => {
      window.location.href = 'menu.html';
    }, 1000);
    return;
  }


  const user = getUser();
  const nameInput = document.getElementById('checkout-name');
  if (nameInput && user && user.name) {
    nameInput.value = user.name;
  }

 
  renderCheckoutSummary(cart);


  const checkoutForm = document.getElementById('checkout-form');
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', handlePlaceOrder);
  }
});


function renderCheckoutSummary(cart) {
  const itemsContainer = document.getElementById('checkout-items-list');
  const subtotalEl = document.getElementById('checkout-subtotal');
  const deliveryFeeEl = document.getElementById('checkout-delivery-fee');
  const totalEl = document.getElementById('checkout-total');

  let subtotal = 0;

  if (itemsContainer) {
    itemsContainer.innerHTML = cart.map(item => {
      const itemSubtotal = item.price * item.quantity;
      subtotal += itemSubtotal;

      return `
        <div class="order-item-line">
          <div>
            <strong>${escapeHtml(item.name)}</strong>
            <span style="color: var(--text-muted); font-size: 0.85rem;"> × ${item.quantity}</span>
          </div>
          <div>${CONFIG.CURRENCY}${itemSubtotal}</div>
        </div>
      `;
    }).join('');
  }

  const deliveryFee = subtotal >= CONFIG.FREE_DELIVERY_THRESHOLD ? 0 : CONFIG.DELIVERY_FEE;
  const grandTotal = subtotal + deliveryFee;

  if (subtotalEl) subtotalEl.textContent = `${CONFIG.CURRENCY}${subtotal}`;
  if (deliveryFeeEl) {
    deliveryFeeEl.textContent = deliveryFee === 0 ? 'FREE' : `${CONFIG.CURRENCY}${deliveryFee}`;
    if (deliveryFee === 0) {
      deliveryFeeEl.style.color = '#10b981';
      deliveryFeeEl.style.fontWeight = '700';
    }
  }
  if (totalEl) totalEl.textContent = `${CONFIG.CURRENCY}${grandTotal}`;
}

async function handlePlaceOrder(e) {
  e.preventDefault();

  const phoneInput = document.getElementById('checkout-phone');
  const addressInput = document.getElementById('checkout-address');
  const submitBtn = document.getElementById('place-order-btn');
  const alertBox = document.getElementById('checkout-alert');

  const phone = phoneInput.value.trim();
  const deliveryAddress = addressInput.value.trim();

 
  if (!phone || !deliveryAddress) {
    showCheckoutAlert(alertBox, 'Please provide both delivery address and phone number.', 'danger');
    return;
  }

  if (phone.length < 10) {
    showCheckoutAlert(alertBox, 'Please enter a valid 10-digit contact phone number.', 'danger');
    return;
  }

  const cart = getCart();
  if (cart.length === 0) {
    showCheckoutAlert(alertBox, 'Your cart is empty!', 'danger');
    return;
  }


  const items = cart.map(item => ({
    dishId: item._id || item.id,
    quantity: item.quantity
  }));

  hideCheckoutAlert(alertBox);
  submitBtn.disabled = true;
  submitBtn.innerHTML = 'Placing Order... ⏳';

  try {
    const token = getToken();
    const response = await fetch(`${CONFIG.API_BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        items,
        deliveryAddress,
        phone
      })
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to place order. Please try again.');
    }

  
    localStorage.removeItem(CONFIG.STORAGE_KEYS.CART);
    updateCartBadge();

    showSuccessModal(data.order);
  } catch (err) {
    console.error('Order placement error:', err);
    showCheckoutAlert(alertBox, err.message, 'danger');
    submitBtn.disabled = false;
    submitBtn.innerHTML = 'Place Order (Cash on Delivery)';
  }
}


function showSuccessModal(order) {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'order-success-modal';

  modal.innerHTML = `
    <div class="modal-card">
      <div class="modal-icon">✓</div>
      <h3>Order Placed Successfully!</h3>
      <p style="color: var(--text-muted); font-size: 0.95rem;">
        Thank you for ordering with TasteHub! Your food is being prepared and will be delivered shortly.
      </p>
      
      <div class="order-badge-id">Order ID: #${order._id}</div>

      <div style="background: #faf7f0; border-radius: 12px; padding: 16px; margin-bottom: 24px; text-align: left; font-size: 0.92rem;">
        <div style="margin-bottom: 6px;"><strong>Payment Method:</strong> Cash on Delivery</div>
        <div style="margin-bottom: 6px;"><strong>Total to Pay:</strong> ${CONFIG.CURRENCY}${order.total}</div>
        <div style="margin-bottom: 6px;"><strong>Deliver to:</strong> ${escapeHtml(order.deliveryAddress)}</div>
        <div><strong>Status:</strong> <span class="status-badge status-Pending">${order.status}</span></div>
      </div>

      <div style="display: flex; gap: 12px; flex-direction: column;">
        <a href="orders.html" class="btn btn-primary btn-block">View My Orders</a>
        <a href="index.html" class="btn btn-outline btn-block">Return to Home</a>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
}

function showCheckoutAlert(alertEl, message, type = 'danger') {
  if (!alertEl) return;
  alertEl.textContent = message;
  alertEl.className = `alert alert-${type}`;
  alertEl.style.display = 'block';
}

function hideCheckoutAlert(alertEl) {
  if (!alertEl) return;
  alertEl.style.display = 'none';
  alertEl.textContent = '';
}
