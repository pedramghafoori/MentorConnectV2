import { config } from 'dotenv';
config();

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import router from './routes/index.js';
import authRoutes from './routes/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());

if (process.env.NODE_ENV === 'development') {
  app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
}

app.use('/api', router);
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API health check available at http://localhost:${PORT}/api/health`);
}); 