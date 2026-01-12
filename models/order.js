import mongoose from 'mongoose';
import Sequence from './sequence.js';

const itemSchema = new mongoose.Schema({ name: { type: String, required: true }, quantity: { type: Number, required: true, min: 1 }, price: { type: Number, required: true, min: 0 } }, { _id: false });

const schema = new mongoose.Schema({ id: { type: String, unique: true }, userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, items: { type: [itemSchema], required: true }, resumen: { total: Number, itemsCount: Number, lastUpdated: Date }, estado: { type: String, enum: ['pendiente', 'pagado', 'enviado', 'cancelado'], default: 'pendiente' }, fecha: { type: Date, default: Date.now }, pagos: { method: { type: String }, paidAt: { type: Date }, transactionId: { type: String } }, shipping: { carrier: { type: String }, shippedAt: { type: Date }, trackingNumber: { type: String } } }, { timestamps: true });

async function nextSequence(name) {
  const seq = await Sequence.findOneAndUpdate({ name }, { $inc: { value: 1 } }, { new: true, upsert: true });
  return seq.value;
}

schema.pre('save', async function (next) {
  if (this.id) return next();
  try {
    const v = await nextSequence('order');
    this.id = v.toString().padStart(6, '0');
    return next();
  } catch (err) {
    return next(err);
  }
});

schema.methods.recalculateResumen = function () {
  const total = this.items.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const itemsCount = this.items.reduce((acc, i) => acc + i.quantity, 0);
  this.resumen = { total, itemsCount, lastUpdated: new Date() };
};

const Order = mongoose.model('Order', schema);
export default Order;
