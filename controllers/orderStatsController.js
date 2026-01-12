import Order from '../models/order.js';
import User from '../models/user.js';

export const avgOrderValue = async (_req, res) => {
  try {
    const agg = await Order.aggregate([
      { $match: { 'resumen.total': { $exists: true } } },
      { $group: { _id: null, avgValue: { $avg: '$resumen.total' }, count: { $sum: 1 } } }
    ]);
    const { avgValue = 0, count = 0 } = agg[0] || {};
    return res.json({ avgValue, count });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to compute average', error: err.message });
  }
};

export const topProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 5;
    const agg = await Order.aggregate([
      { $unwind: '$items' },
      { $group: { _id: '$items.name', totalQuantity: { $sum: '$items.quantity' }, totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } } } },
      { $sort: { totalQuantity: -1 } },
      { $limit: limit }
    ]);
    return res.json(agg.map((a) => ({ name: a._id, totalQuantity: a.totalQuantity, totalRevenue: a.totalRevenue })));
  } catch (err) {
    return res.status(500).json({ message: 'Failed to compute top products', error: err.message });
  }
};

export const topCustomers = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 5;
    const agg = await Order.aggregate([
      { $group: { _id: '$userId', totalSpent: { $sum: '$resumen.total' }, orders: { $sum: 1 } } },
      { $sort: { totalSpent: -1 } },
      { $limit: limit }
    ]);
    const users = await User.find({ _id: { $in: agg.map((a) => a._id) } }).select('nombre apellido email');
    const usersById = {};
    users.forEach((u) => { usersById[u._id.toString()] = u; });
    return res.json(agg.map((a) => ({ user: usersById[a._id.toString()] || { id: a._id }, totalSpent: a.totalSpent, orders: a.orders })));
  } catch (err) {
    return res.status(500).json({ message: 'Failed to compute top customers', error: err.message });
  }
};

export const salesByDay = async (req, res) => {
  try {
    const days = parseInt(req.query.days, 10) || 7;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const agg = await Order.aggregate([
      { $match: { fecha: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$fecha' } }, totalRevenue: { $sum: '$resumen.total' }, orders: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    return res.json(agg.map((a) => ({ day: a._id, totalRevenue: a.totalRevenue, orders: a.orders })));
  } catch (err) {
    return res.status(500).json({ message: 'Failed to compute sales by day', error: err.message });
  }
};

export const highValueOrders = async (req, res) => {
  try {
    const min = parseFloat(req.query.min) || 100;
    const agg = await Order.find({ 'resumen.total': { $gte: min } }).sort({ 'resumen.total': -1 }).limit(20);
    return res.json(agg.map((o) => ({ id: o.id, total: o.resumen.total, userId: o.userId })));
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch high value orders', error: err.message });
  }
};

export const monthlySummary = async (req, res) => {
  try {
    const months = parseInt(req.query.months, 10) || 6;
    const start = new Date();
    start.setMonth(start.getMonth() - (months - 1));
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    const agg = await Order.aggregate([
      { $match: { fecha: { $gte: start } } },
      { $group: { _id: { year: { $year: '$fecha' }, month: { $month: '$fecha' } }, totalRevenue: { $sum: '$resumen.total' }, orders: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    return res.json(agg.map((a) => ({ year: a._id.year, month: a._id.month, totalRevenue: a.totalRevenue, orders: a.orders })));
  } catch (err) {
    return res.status(500).json({ message: 'Failed to compute monthly summary', error: err.message });
  }
};