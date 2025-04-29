import { config } from 'dotenv';
config();

import app from './app.js';

const PORT = process.env.PORT || 4000;

try {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`API health check available at http://localhost:${PORT}/api/health`);
  });
} catch (error) {
  console.error('Failed to start server:', error);
  process.exit(1);
} 