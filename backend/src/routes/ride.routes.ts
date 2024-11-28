import { Router } from 'express';
import { RideController } from '../controllers/RideController';
import { RideService } from '../services/RideService';
import { GoogleMapsService } from '../services/GoogleMapsService';
import { AppDataSource } from '../app';
import { Driver } from '../models/Driver';
import { Ride } from '../models/Ride';

export const initializeRoutes = () => {
    const router = Router();
    const googleMapsService = new GoogleMapsService();
    const rideService = new RideService(
        AppDataSource.getRepository(Driver),
        AppDataSource.getRepository(Ride),
        googleMapsService
    );
    const rideController = new RideController(rideService);

    // Define routes
    router.post('/estimate', (req, res, next) => rideController.estimateRide(req, res).catch(next));
    router.post('/confirm', (req, res, next) => rideController.confirmRide(req, res).catch(next));
    router.post('/:ride_id/complete', (req, res, next) => rideController.completeRide(req, res).catch(next));
    router.get('/history/:customer_id', (req, res, next) => rideController.getRideHistory(req, res).catch(next));
    router.get('/active', (req, res, next) => rideController.getActiveRides(req, res).catch(next));

    return router;
};
