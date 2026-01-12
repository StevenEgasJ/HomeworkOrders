import React, { useState } from 'react';
import { placeOrder, payOrder, shipOrder, cancelOrder, getOrder } from './api.js';

const defaultItems = `[
  { "name": "Sample Item", "quantity": 2, "price": 19.99 }
]`;

const Card = ({ title, children }) => (
  <section style={{ border: '1px solid #ddd', padding: '1rem', borderRadius: 8, marginBottom: '1rem' }}>
    <h2 style={{ marginTop: 0 }}>{title}</h2>
    {children}
  </section>
);

const Field = ({ label, children }) => (
  <label style={{ display: 'block', marginBottom: '0.5rem' }}>
    <span style={{ display: 'block', fontWeight: 600 }}>{label}</span>
    {children}
  </label>
);

const Button = ({ onClick, children, disabled }) => (
  <button onClick={onClick} disabled={disabled} style={{ padding: '0.6rem 1rem', marginRight: '0.5rem' }}>
    {children}
  </button>
);

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
    <main style={{ maxWidth: 960, margin: '0 auto', padding: '1.5rem', fontFamily: 'Arial, sans-serif' }}>
      <h1>Orders Business Rules Demo</h1>
      <p>Call the backend business actions (place → pay → ship or cancel). Paste a real Mongo userId to satisfy validation.</p>

      {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}

      <Card title="1) Place order (creates sequential id)">
        <Field label="User ID">
          <input value={userId} onChange={(e) => setUserId(e.target.value)} style={{ width: '100%' }} />
        </Field>
        <Field label="Items (JSON array)">
          <textarea rows={5} value={itemsText} onChange={(e) => setItemsText(e.target.value)} style={{ width: '100%' }} />
        </Field>
        <Field label="Payment method (optional)">
          <input value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} style={{ width: '100%' }} />
        </Field>
        <Button
          disabled={loading}
          onClick={() =>
            run(() =>
              placeOrder({
                userId,
                items: parseItems(),
                paymentMethod,
              })
            )
          }
        >
          Place order
        </Button>
      </Card>

      <Card title="2) Pay order (only if pending)">
        <Field label="Order public id (e.g., 000001)">
          <input value={orderId} onChange={(e) => setOrderId(e.target.value)} style={{ width: '100%' }} />
        </Field>
        <Field label="Transaction id (optional)">
          <input value={transactionId} onChange={(e) => setTransactionId(e.target.value)} style={{ width: '100%' }} />
        </Field>
        <Button disabled={loading} onClick={() => run(() => payOrder(orderId, { transactionId, method: paymentMethod }))}>
          Mark as paid
        </Button>
      </Card>

      <Card title="3) Ship order (only if paid)">
        <Field label="Carrier">
          <input value={carrier} onChange={(e) => setCarrier(e.target.value)} style={{ width: '100%' }} />
        </Field>
        <Field label="Tracking number">
          <input value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} style={{ width: '100%' }} />
        </Field>
        <Button disabled={loading} onClick={() => run(() => shipOrder(orderId, { carrier, trackingNumber }))}>
          Mark as shipped
        </Button>
      </Card>

      <Card title="4) Cancel order (only if pending)">
        <Button disabled={loading} onClick={() => run(() => cancelOrder(orderId))}>
          Cancel pending order
        </Button>
      </Card>

      <Card title="Lookup order">
        <Button disabled={loading} onClick={() => run(() => getOrder(orderId))}>
          Refresh order
        </Button>
        {order && (
          <pre style={{ background: '#f7f7f7', padding: '1rem', overflowX: 'auto' }}>{JSON.stringify(order, null, 2)}</pre>
        )}
      </Card>
    </main>
  );
}

export default App;