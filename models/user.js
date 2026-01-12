import mongoose from 'mongoose';

const schema = new mongoose.Schema({ nombre: { type: String, required: true }, apellido: { type: String }, email: { type: String, unique: true, required: true }, passwordHash: { type: String }, isAdmin: { type: Boolean, default: false }, emailVerified: { type: Boolean, default: false }, emailVerificationToken: { type: String }, cedula: { type: String }, telefono: { type: String }, photo: { type: String }, fechaRegistro: { type: Date, default: Date.now }, cart: { type: Array, default: [] }, orders: { type: Array, default: [] } }, { timestamps: true });

const User = mongoose.model('User', schema);
export default User;
