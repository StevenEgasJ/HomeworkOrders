const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok) {
    const message = data?.message || 'Request failed';
    throw new Error(message);
  }
  return data;
};


export const getAvg = () => fetch(`${API_BASE}/orders/stats/average`).then(handleResponse);
export const getTopProducts = (limit = 5) => fetch(`${API_BASE}/orders/stats/top-products?limit=${limit}`).then(handleResponse);
export const getTopCustomers = (limit = 5) => fetch(`${API_BASE}/orders/stats/top-customers?limit=${limit}`).then(handleResponse);
export const getSalesByDay = (days = 7) => fetch(`${API_BASE}/orders/stats/sales-by-day?days=${days}`).then(handleResponse);
export const getHighValue = (min = 100) => fetch(`${API_BASE}/orders/stats/high-value?min=${min}`).then(handleResponse);
export const getMonthly = (months = 6) => fetch(`${API_BASE}/orders/stats/monthly-summary?months=${months}`).then(handleResponse);