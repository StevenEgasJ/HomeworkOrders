import mongoose from 'mongoose';

const schema = new mongoose.Schema({ name: { type: String, unique: true, required: true }, value: { type: Number, default: 0 } });
const Sequence = mongoose.model('Sequence', schema);
export default Sequence;
