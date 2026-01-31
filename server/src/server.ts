import { createApp } from './app.js';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const app = createApp();
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════╗
║   Wheels and Glass API Server         ║
╠═══════════════════════════════════════╣
║   Port: ${PORT}                       ║
║   Environment: ${process.env.NODE_ENV || 'development'}        ║
║   Time: ${new Date().toLocaleString()}  ║
╚═══════════════════════════════════════╝
  `);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  process.exit(0);
});
