import React, { useState, useEffect } from 'react';
import { getAvg, getTopProducts, getTopCustomers, getSalesByDay, getHighValue, getMonthly } from './api.js';
import './styles.css';

const defaultItems = `[
  { "name": "Sample Item", "quantity": 2, "price": 19.99 }
]`;

const containerStyle = { maxWidth: 1000, margin: '0 auto', padding: '1.5rem', fontFamily: 'Inter, system-ui, Arial' };
const row = { display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' };
const card = { flex: '1 1 320px', background: '#fff', borderRadius: 8, padding: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' };
const title = { marginTop: 0, marginBottom: '0.5rem' };
const small = { fontSize: '0.9rem', color: '#666' };
const fieldStyle = { display: 'block', marginBottom: '0.6rem' };
const inputStyle = { width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid #ddd' };
const buttonStyle = { padding: '0.6rem 1rem', borderRadius: 6, border: 'none', background: '#0b5fff', color: '#fff', cursor: 'pointer' };

const StatRow = ({ children }) => <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>{children}</div>;

function App() {
  const [userId, setUserId] = useState('');
  const [itemsText, setItemsText] = useState(defaultItems);
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [transactionId, setTransactionId] = useState('');
  const [carrier, setCarrier] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [avg, setAvg] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);
  const [salesByDay, setSalesByDay] = useState([]);
  const [highOrders, setHighOrders] = useState([]);
  const [monthly, setMonthly] = useState([]);

  const run = async (fn) => {
    setLoading(true);
    setError('');
    try {
      const data = await fn();
      setOrder(data);
      if (data?.id) setOrderId(data.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const a = await getAvg();
        setAvg(a);
        setTopProducts(await getTopProducts(6));
        setTopCustomers(await getTopCustomers(6));
        setSalesByDay(await getSalesByDay(7));
        setHighOrders(await getHighValue(100));
        setMonthly(await getMonthly(6));
      } catch (err) {
        // ignore on initial load
      }
    })();
  }, []);

  const parseItems = () => {
    try {
      const parsed = JSON.parse(itemsText);
      if (!Array.isArray(parsed)) throw new Error('Items must be an array');
      return parsed;
    } catch (err) {
      throw new Error(`Invalid items JSON: ${err.message}`);
    }
  };

  return (
    <main style={containerStyle} className="app">
      <div className="hero">
        <h1 className="app-title">Orders Business Rules Dashboard</h1>
        <p className="muted">Place orders, advance them through the lifecycle, and view aggregated business metrics.</p>
      </div>

      <section style={row}>
        <div style={card} className="card">
          <h3 style={title} className="card-title">Quick Stats</h3>
          <StatRow>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{avg ? avg.avgValue.toFixed(2) : '—'}</div>
              <div style={small}>Avg order value</div>
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{topProducts.length}</div>
              <div style={small}>Top products</div>
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{topCustomers.length}</div>
              <div style={small}>Top customers</div>
            </div>
          </StatRow>

          <h4 style={{ marginTop: 16 }}>Top products</h4>
          <ul className="list">
            {topProducts.map((p) => (
              <li key={p.name} className="list-item">{p.name} <span className="muted">— {p.totalQuantity} units</span> <strong>${p.totalRevenue.toFixed(2)}</strong></li>
            ))}
          </ul>
        </div>

      </section> 

      <section style={row}>
        <div style={card} className="card">
          <h3 style={title} className="card-title">Sales by day (last 7 days)</h3>
          <ul className="list">
            {salesByDay.map((s) => (
              <li key={s.day} className="list-item">{s.day}: <strong>${s.totalRevenue.toFixed(2)}</strong> <span className="muted">({s.orders} orders)</span></li>
            ))}
          </ul>
        </div>

        <div style={card} className="card">
          <h3 style={title} className="card-title">High value orders (≥ $100)</h3>
          <ul className="list">
            {highOrders.map((h) => (
              <li key={h.id} className="list-item">{h.id}: <strong>${h.total.toFixed(2)}</strong></li>
            ))}
          </ul>
        </div>

        <div style={card} className="card">
          <h3 style={title} className="card-title">Monthly summary</h3>
          <ul className="list">
            {monthly.map((m) => (
              <li key={`${m.year}-${m.month}`} className="list-item">{m.year}-{String(m.month).padStart(2, '0')}: <strong>${m.totalRevenue.toFixed(2)}</strong> <span className="muted">({m.orders} orders)</span></li>
            ))}
          </ul>
        </div>
      </section>

      <section style={card} className="card">
        <h3 style={title} className="card-title">Top customers</h3>
        <ul className="list">
          {topCustomers.map((c, idx) => (
            <li key={idx} className="list-item">{c.user?.nombre || c.user?.email || c.user?.id}: <strong>${c.totalSpent.toFixed(2)}</strong> <span className="muted">({c.orders} orders)</span></li>
          ))}
        </ul>
      </section>
    </main>
  );
}

export default App;