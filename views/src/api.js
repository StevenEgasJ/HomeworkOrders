const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok) {
    const message = data?.message || 'Request failed';
    throw new Error(message);
  }
  return data;
};

export const getOrder = (id) => fetch(`${API_BASE}/orders/${id}`).then(handleResponse);

export const placeOrder = (payload) =>
  fetch(`${API_BASE}/orders/place`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).then(handleResponse);

export const payOrder = (id, payload) =>
  fetch(`${API_BASE}/orders/${id}/pay`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).then(handleResponse);

export const shipOrder = (id, payload) =>
  fetch(`${API_BASE}/orders/${id}/ship`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).then(handleResponse);

export const cancelOrder = (id) =>
  fetch(`${API_BASE}/orders/${id}/cancel`, {
    method: 'POST',
  }).then(handleResponse);