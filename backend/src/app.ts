import express from 'express';
import cors from 'cors';
import { DataSource } from 'typeorm';
import { Driver } from './models/Driver';
import { Ride } from './models/Ride';
import { initializeRoutes } from './routes/ride.routes';
import { errorHandler } from './middleware/errorHandler';

// Database configuration
export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'db',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'shopper_ride',
    entities: [Driver, Ride],
    synchronize: true, // Only for development
    connectTimeoutMS: 10000,
    extra: {
        connectionTimeoutMillis: 10000,
        query_timeout: 10000,
        statement_timeout: 10000
    }
});

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
});

// Initial driver data
const initialDrivers = [
    {
        name: 'John Doe',
        vehicle: 'Toyota Corolla',
        rating: 4.8,
        reviewComment: 'Great driver, very punctual',
        ratePerKm: 2.5,
        minDistance: 3,
        description: 'Experienced driver with 5 years of service'
    },
    {
        name: 'Jane Smith',
        vehicle: 'Honda Civic',
        rating: 4.9,
        reviewComment: 'Very professional and friendly',
        ratePerKm: 2.8,
        minDistance: 2,
        description: 'Professional driver with excellent customer service'
    }
];

// Helper function to wait for database
const waitForDatabase = async (maxRetries = 5, delay = 5000): Promise<void> => {
    let retries = 0;
    while (retries < maxRetries) {
        try {
            if (AppDataSource.isInitialized) {
                await AppDataSource.query('SELECT 1');
            } else {
                await AppDataSource.initialize();
            }
            console.log('Database connection established');
            return;
        } catch (error) {
            retries++;
            console.log(`Database connection attempt ${retries}/${maxRetries} failed:`, error.message);
            if (retries < maxRetries) {
                console.log(`Retrying in ${delay/1000} seconds...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    throw new Error('Failed to connect to database after multiple attempts');
};

// Database connection and server start
const startServer = async () => {
    try {
        // Wait for database to be ready
        await waitForDatabase();

        // Seed initial drivers data
        const driverRepository = AppDataSource.getRepository(Driver);
        const existingDrivers = await driverRepository.find();

        if (existingDrivers.length === 0) {
            await driverRepository.save(initialDrivers);
            console.log('Initial drivers data seeded');
        }

        // Initialize and add routes after database connection
        app.use('/ride', initializeRoutes());

        // Error handling
        app.use(errorHandler);

        const port = process.env.PORT || 8080;
        app.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
