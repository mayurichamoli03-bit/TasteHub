

document.addEventListener('DOMContentLoaded', () => {
  fetchCustomerOrders();
});

async function fetchCustomerOrders() {
  const container = document.getElementById('orders-list-container');
  const emptyState = document.getElementById('empty-orders-state');
  const loginPrompt = document.getElementById('login-prompt-state');

  if (!container) return;

 
  if (!isAuthenticated()) {
    if (loginPrompt) loginPrompt.style.display = 'block';
    if (emptyState) emptyState.style.display = 'none';
    container.style.display = 'none';
    return;
  }

  try {
    container.innerHTML = `
      <div class="spinner-wrapper">
        <div class="spinner"></div>
        <p>Fetching your delicious order history...</p>
      </div>
    `;

    const token = getToken();
    const { response, data } = await fetchJson(`${CONFIG.API_BASE_URL}/orders/my-orders`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok || !data.success) {
      if (response.status === 401) {
        clearAuth();
        if (loginPrompt) loginPrompt.style.display = 'block';
        container.style.display = 'none';
        return;
      }
      throw new Error(data.message || 'Could not load orders.');
    }

    const orders = data.orders || [];

    if (orders.length === 0) {
      container.style.display = 'none';
      if (emptyState) emptyState.style.display = 'block';
      return;
    }

    container.style.display = 'block';
    if (emptyState) emptyState.style.display = 'none';

    container.innerHTML = orders.map(order => createOrderCardHTML(order)).join('');
  } catch (err) {
    console.error('Fetch orders error:', err);
    container.innerHTML = `
      <div class="alert alert-danger" style="margin: 30px auto; max-width: 600px;">
        ⚠️ <strong>Error:</strong> ${escapeHtml(err.message || 'Unable to connect to server. Please try again.')}
      </div>
    `;
  }
}


function createOrderCardHTML(order) {
  // Format creation date
  const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });


  const statusSlug = (order.status || 'Pending').replace(/\s+/g, '-');

  const itemsHTML = (order.items || []).map(item => `
    <div class="order-item-line">
      <span>
        <strong>${escapeHtml(item.name)}</strong>
        <span style="color: var(--text-muted); font-size: 0.88rem;"> × ${item.quantity}</span>
      </span>
      <span>${CONFIG.CURRENCY}${item.price * item.quantity}</span>
    </div>
  `).join('');

  return `
    <div class="order-card">
      <div class="order-header">
        <div>
          <span class="order-id">Order #${order._id}</span>
          <div class="order-date">Placed on ${orderDate}</div>
        </div>
        <div>
          <span class="status-badge status-${statusSlug}">
            ● ${escapeHtml(order.status)}
          </span>
        </div>
      </div>

      <div class="order-body">
        <div class="order-items-list">
          ${itemsHTML}
        </div>

        <div class="order-footer-details">
          <div class="order-address-box">
            <strong>Delivery Destination</strong>
            <p>${escapeHtml(order.deliveryAddress)}</p>
            <p style="color: var(--text-muted); margin-top: 4px;">📞 Phone: ${escapeHtml(order.phone)}</p>
            <p style="color: var(--text-muted); margin-top: 2px;">💵 Payment: ${escapeHtml(order.paymentMethod || 'Cash on Delivery')}</p>
          </div>

          <div class="order-pricing-box" style="text-align: right;">
            <div>Subtotal: <strong>${CONFIG.CURRENCY}${order.subtotal}</strong></div>
            <div style="color: var(--text-muted); font-size: 0.85rem; margin-top: 4px;">
              Delivery: ${order.deliveryFee === 0 ? '<span style="color:#10b981; font-weight:700;">FREE</span>' : `${CONFIG.CURRENCY}${order.deliveryFee}`}
            </div>
            <div class="order-total-amount">
              Total: ${CONFIG.CURRENCY}${order.total}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}
