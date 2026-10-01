import express, { type Application, type Request, type Response } from 'express';
import cors from 'cors';
import { router as productRoutes } from './routes/productRoutes';
import { router as adminRoutes } from './routes/adminRoutes';
import { errorHandler } from './middleware/errorHandler';
import { DBManager } from './db/manager';
import { getLogger } from './logger/logger';


const PORT = process.env.PORT || 3000;

const app: Application = express();
const logger = getLogger();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/products', productRoutes);
app.use('/api/admin', adminRoutes);
app.get('/api', (_req: Request, res: Response) => {
  res.status(200).json({ 
    message: "Healthy",
  })
})


// Errors
app.use(errorHandler);

const server = app.listen(PORT, () => {
  logger.info(`Server running in http://localhost:${PORT}`);
})

let shuttingDown = false;


const gracefullyShutdown = async (signal: string) => {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info(`\nReceived ${signal}. Closing DB connection and server...`);
  try {
    const dbManager = await DBManager.getInstance();
    await dbManager.close();
  } catch (e) {
    logger.error("Error during DB close:", e);
  }
  server.close(() => {
    logger.info("Process is finished.");
    process.exit(0);
  });
}

process.on('SIGINT', () => { gracefullyShutdown('SIGINT').catch(() => process.exit(1)); });
process.on('SIGTERM', () => { gracefullyShutdown('SIGTERM').catch(() => process.exit(1)); });
