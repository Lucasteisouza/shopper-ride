import { Router } from 'express';
import { RideController } from '../controllers/RideController';
import { RideService } from '../services/RideService';
import { GoogleMapsService } from '../services/GoogleMapsService';
import { AppDataSource } from '../app';
import { Driver } from '../models/Driver';
import { Ride } from '../models/Ride';

const router = Router();

const googleMapsService = new GoogleMapsService();

export const initializeRoutes = () => {
    const rideService = new RideService(
        AppDataSource.getRepository(Driver),
        AppDataSource.getRepository(Ride),
        googleMapsService
    );
    const rideController = new RideController(rideService);

    // Define routes
    router.post('/estimate', rideController.estimateRide);
    router.post('/confirm', rideController.confirmRide);
    router.get('/history/:customer_id', rideController.getRideHistory);
    router.get('/active', rideController.getActiveRides);

    return router;
};
