import Order from '../models/order.js';
import User from '../models/user.js';

const findById = async (id) => Order.findOne({ id });

export const placeOrder = async (req, res) => {
  try {
    const { userId, items, paymentMethod } = req.body;
    if (!userId) return res.status(400).json({ message: 'userId is required' });
    if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ message: 'At least one item is required' });
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const order = new Order({ userId, items, pagos: { method: paymentMethod || 'unassigned' } });
    order.recalculateResumen();
    await order.save();
    return res.status(201).json(render(order));
  } catch (err) {
    return res.status(500).json({ message: 'Failed to place order', error: err.message });
  }
};

export const payOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { transactionId, method } = req.body;
    const order = await findById(id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.estado !== 'pendiente') return res.status(400).json({ message: 'Only pending orders can be paid' });
    order.estado = 'pagado';
    order.pagos = { method: method || order.pagos?.method || 'unknown', paidAt: new Date(), transactionId };
    order.recalculateResumen();
    await order.save();
    return res.json(render(order));
  } catch (err) {
    return res.status(500).json({ message: 'Failed to mark order as paid', error: err.message });
  }
};

export const shipOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { carrier, trackingNumber } = req.body;
    const order = await findById(id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.estado !== 'pagado') return res.status(400).json({ message: 'Only paid orders can be shipped' });
    order.estado = 'enviado';
    order.shipping = { carrier: carrier || order.shipping?.carrier, trackingNumber: trackingNumber || order.shipping?.trackingNumber, shippedAt: new Date() };
    await order.save();
    return res.json(render(order));
  } catch (err) {
    return res.status(500).json({ message: 'Failed to ship order', error: err.message });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await findById(id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.estado !== 'pendiente') return res.status(400).json({ message: 'Only pending orders can be cancelled' });
    order.estado = 'cancelado';
    order.resumen.lastUpdated = new Date();
    await order.save();
    return res.json(render(order));
  } catch (err) {
    return res.status(500).json({ message: 'Failed to cancel order', error: err.message });
  }
};

export const getOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await findById(id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    return res.json(render(order));
  } catch (err) {
    return res.status(500).json({ message: 'Failed to get order', error: err.message });
  }
};

const render = (o) => ({ id: o.id, estado: o.estado, resumen: o.resumen, pagos: o.pagos, shipping: o.shipping, fecha: o.fecha, items: o.items, userId: o.userId });
