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

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`, {
        body: req.body,
        query: req.query,
        params: req.params
    });
    next();
});

// Health check endpoint
app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
});

// Test endpoint
app.get('/test', (_req, res) => {
    res.json({ message: 'Test endpoint working' });
});

// Mount ride routes
const rideRouter = initializeRoutes();
app.use('/ride', rideRouter);

// Error handling middleware
app.use(errorHandler);

// Initial driver data
const initialDrivers = [
    {
        name: 'Homer Simpson',
        vehicle: 'Plymouth Valiant 1973 rosa e enferrujado',
        rating: 2.0,
        reviewComment: 'Motorista simpático, mas errou o caminho 3 vezes. O carro cheira a donuts.',
        ratePerKm: 2.50,
        minDistance: 1,
        description: 'Olá! Sou o Homer, seu motorista camarada! Relaxe e aproveite o passeio, com direito a rosquinhas e boas risadas (e talvez alguns desvios).'
    },
    {
        name: 'Dominic Toretto',
        vehicle: 'Dodge Charger R/T 1970 modificado',
        rating: 4.0,
        reviewComment: 'Que viagem incrível! O carro é um show à parte e o motorista, apesar de ter uma cara de poucos amigos, foi super gente boa. Recomendo!',
        ratePerKm: 5.00,
        minDistance: 5,
        description: 'Ei, aqui é o Dom. Pode entrar, vou te levar com segurança e rapidez ao seu destino. Só não mexa no rádio, a playlist é sagrada.'
    },
    {
        name: 'James Bond',
        vehicle: 'Aston Martin DB5 clássico',
        rating: 5.0,
        reviewComment: 'Serviço impecável! O motorista é a própria definição de classe e o carro é simplesmente magnífico. Uma experiência digna de um agente secreto.',
        ratePerKm: 10.00,
        minDistance: 10,
        description: 'Boa noite, sou James Bond. À seu dispor para um passeio suave e discreto. Aperte o cinto e aproveite a viagem.'
    }
];

// Helper function to wait for database
async function waitForDatabase(maxRetries = 5, delay = 5000): Promise<void> {
    let retries = 0;
    while (retries < maxRetries) {
        try {
            await AppDataSource.initialize();
            console.log('Database connected successfully');
            return;
        } catch (error) {
            console.error('Failed to connect to database:', error);
            retries++;
            if (retries === maxRetries) {
                throw new Error('Failed to connect to database after maximum retries');
            }
            console.log(`Retrying in ${delay / 1000} seconds...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

// Database connection and server start
async function startServer() {
    try {
        await waitForDatabase();

        // Initialize initial data
        const driverRepository = AppDataSource.getRepository(Driver);
        const existingDrivers = await driverRepository.find();

        if (existingDrivers.length === 0) {
            console.log('Initializing driver data...');
            await driverRepository.save(initialDrivers);
            console.log('Driver data initialized successfully');
        }

        const port = process.env.PORT || 8080;
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
            console.log('Available endpoints:');
            console.log('- GET /health');
            console.log('- GET /test');
            console.log('- POST /ride/estimate');
            console.log('- POST /ride/confirm');
            console.log('- GET /ride/history/:customer_id');
            console.log('- GET /ride/active');
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();
