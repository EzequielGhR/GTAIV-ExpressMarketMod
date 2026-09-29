import express, { type Application, type Request, type Response } from 'express';
import cors from 'cors';
import { router as productRoutes } from './routes/productRoutes';
import { errorHandler } from './middleware/errorHandler';


const PORT = process.env.PORT || 3000;

const app: Application = express();
const server = app.listen(PORT, () => {
  console.log(`Server running in http://localhost:${PORT}`);
})


app.use(cors());
app.use(express.json());

// Routes
app.use('/api/products', productRoutes);

app.get('/api', (_req: Request, res: Response) => {
  res.status(200).json({ 
    message: "Healthy",
  })
})

// Errors
app.use(errorHandler);


const gracefullyShutdown = () => {
  console.log('\nShutting down gracefully...');
  server.close(() => {
    console.log("Process is finished.");
    process.exit(0);
  })  
}

process.on('SIGINT', gracefullyShutdown);
process.on('SIGTERM', gracefullyShutdown);
