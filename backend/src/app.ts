import express from 'express';
import cors from 'cors';
import path from 'path';
import router from './routes/index.js';
import authRoutes from './routes/auth.js';
import uploadRoutes from './routes/upload.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import lssRoutes from './lss/lssRoutes.js';
import accountRoutes from './routes/account.js';
import stripeRoutes from './routes/stripe.routes.js';
import waiverRoutes from './routes/waiverRoutes.js';

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://mentorconnect-ecc82a256094.herokuapp.com',
    'https://www.mentorconnectcanada.com',
    'https://mentorconnectcanada.com'
  ],
  credentials: true,
}));
app.use(express.json());

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/api', router);
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/lss', lssRoutes);
app.use('/api/account', accountRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api/waivers', waiverRoutes);

export default app; 
