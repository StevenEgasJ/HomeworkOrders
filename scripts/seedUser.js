import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/user.js';

dotenv.config();

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not set');
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  const user = await User.findOneAndUpdate(
    { email: 'dev+admin@example.com' },
    { nombre: 'Dev', apellido: 'Admin', email: 'dev+admin@example.com', isAdmin: true },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  console.log('Seeded user:', user.email, 'id:', user._id.toString());
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});