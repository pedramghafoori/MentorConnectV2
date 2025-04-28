import express from 'express';
import cors from 'cors';
import path from 'path';

const app = express();

if (process.env.NODE_ENV === 'development') {
  app.use('/uploads', express.static(path.resolve('uploads')));
}

app.use(cors());
app.use(express.json());
app.use('/api', (await import('./routes/index.js')).default);

export default app; 