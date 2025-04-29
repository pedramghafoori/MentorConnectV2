import express from 'express';
import cors from 'cors';
import path from 'path';
import router from './routes/index.js';
import authRoutes from './routes/auth.js';
import uploadRoutes from './routes/upload.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import lssRoutes from './lss/lssRoutes.js';

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/api', router);
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/lss', lssRoutes);

export default app; 
