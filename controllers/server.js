import dotenv from 'dotenv';
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import path from 'path';
import connectDb from '../models/db.js';
import orderRoutes from './orderRoutes.js';

dotenv.config();

const app = express();
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || '*' }));
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/orders', orderRoutes);

const staticDir = path.resolve('views/dist');
app.use(express.static(staticDir));
app.get('*', (_req, res) => res.sendFile(path.join(staticDir, 'index.html')));

const port = process.env.PORT || 4000;

connectDb()
  .then(() => app.listen(port, () => console.log(`listening ${port}`)))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
