import { Request, Response } from 'express';
import { RideService } from '../services/RideService';

export class RideController {
    constructor(private rideService: RideService) {}

    estimateRide = async (req: Request, res: Response): Promise<void> => {
        try {
            const { customer_id, origin, destination } = req.body;

            console.log('Estimating ride with params:', {
                customer_id,
                origin,
                destination
            });

            const estimate = await this.rideService.estimateRide(
                customer_id,
                origin,
                destination
            );

            console.log('Ride estimate successful:', estimate);
            res.json(estimate);
        } catch (error: any) {
            console.error('Error in estimateRide:', error);

            if (error.message?.includes('Google Maps API Error')) {
                res.status(400).json({
                    error_code: 'GOOGLE_MAPS_ERROR',
                    error_description: error.message
                });
            } else if (error.message?.startsWith('INVALID_DATA:')) {
                res.status(400).json({
                    error_code: 'INVALID_DATA',
                    error_description: error.message.split(': ')[1]
                });
            } else {
                res.status(500).json({
                    error_code: 'INTERNAL_ERROR',
                    error_description: error.message || 'An unexpected error occurred'
                });
            }
        }
    };

    confirmRide = async (req: Request, res: Response): Promise<void> => {
        try {
            console.log('Confirming ride with data:', req.body);
            const result = await this.rideService.confirmRide(req.body);
            console.log('Ride confirmed:', result);
            res.json(result);
        } catch (error: any) {
            console.error('Error confirming ride:', error);
            if (error.message?.startsWith('INVALID_DATA:')) {
                res.status(400).json({
                    error_code: 'INVALID_DATA',
                    error_description: error.message.split(': ')[1]
                });
            } else {
                res.status(500).json({
                    error_code: 'INTERNAL_ERROR',
                    error_description: error.message || 'An unexpected error occurred'
                });
            }
        }
    };

    getRideHistory = async (req: Request, res: Response): Promise<void> => {
        try {
            const customerId = req.params.customer_id;
            const driverId = req.query.driver_id ? Number(req.query.driver_id) : undefined;

            const history = await this.rideService.getRideHistory(customerId, driverId);
            res.json(history);
        } catch (error: any) {
            console.error('Error in getRideHistory:', error);

            const [errorCode, errorMessage] = error.message.split(': ');

            if (errorCode === 'INVALID_DATA' || errorCode === 'INVALID_DRIVER') {
                res.status(400).json({
                    error_code: errorCode,
                    error_description: errorMessage
                });
            } else if (errorCode === 'NO_RIDES_FOUND') {
                res.status(404).json({
                    error_code: errorCode,
                    error_description: errorMessage
                });
            } else {
                res.status(500).json({
                    error_code: 'INTERNAL_ERROR',
                    error_description: 'An unexpected error occurred'
                });
            }
        }
    };

    getActiveRides = async (_req: Request, res: Response): Promise<void> => {
        try {
            const activeRides = await this.rideService.getActiveRides();
            res.json(activeRides);
        } catch (error: any) {
            console.error('Error in getActiveRides:', error);

            const [errorCode, errorMessage] = error.message.split(': ');

            if (errorCode === 'NO_RIDES_FOUND') {
                res.status(404).json({
                    error_code: errorCode,
                    error_description: errorMessage
                });
            } else {
                res.status(500).json({
                    error_code: 'INTERNAL_ERROR',
                    error_description: 'An unexpected error occurred'
                });
            }
        }
    };

    async completeRide(req: Request, res: Response) {
        const rideId = parseInt(req.params.ride_id);
        const result = await this.rideService.completeRide(rideId);
        res.json(result);
    }
}
