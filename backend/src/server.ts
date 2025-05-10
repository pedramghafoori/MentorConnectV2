import { config } from 'dotenv';
config();

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import router from './routes/index.js';
import authRoutes from './routes/auth.js';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import uploadRoutes from './routes/upload.js';
import lssRoutes from './lss/lssRoutes.js';
import stripeRoutes from './routes/stripe.routes.js';
import waiverRoutes from './routes/waiverRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'http://www.mentorconnectcanada.com', 'https://mentorconnect-ecc82a256094.herokuapp.com'],
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  throw new Error('MONGODB_URI is not defined in environment variables');
}

// Connect to MongoDB
mongoose.connect(mongoUri)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  });

app.use('/api', router);
app.use('/api/auth', authRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api/waivers', waiverRoutes);


app.use('/api/upload', (req, res, next) => {
  
  next();
});
app.use('/api/upload', uploadRoutes);


app.use('/api/lss', lssRoutes);



// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../../frontend/dist')));

// For any route not handled by your API, serve the React index.html
app.get('*', (req, res) => {
  // Only serve index.html for non-API routes
  if (!req.originalUrl.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '../../frontend/dist', 'index.html'));
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 