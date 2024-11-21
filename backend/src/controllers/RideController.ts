import { Request, Response } from 'express';
import { RideService } from '../services/RideService';

export class RideController {
    constructor(private rideService: RideService) {}

    estimateRide = async (req: Request, res: Response): Promise<void> => {
        try {
            const { customer_id, origin, destination } = req.body;

            const estimate = await this.rideService.estimateRide(
                customer_id,
                origin,
                destination
            );

            res.json(estimate);
        } catch (error: any) {
            if (error.message.startsWith('INVALID_DATA:')) {
                res.status(400).json({
                    error_code: 'INVALID_DATA',
                    error_description: error.message.split(': ')[1]
                });
            } else {
                res.status(500).json({
                    error_code: 'INTERNAL_ERROR',
                    error_description: 'An unexpected error occurred'
                });
            }
        }
    };

    confirmRide = async (req: Request, res: Response): Promise<void> => {
        try {
            const result = await this.rideService.confirmRide(req.body);
            res.json(result);
        } catch (error: any) {
            const errorMap: { [key: string]: number } = {
                'INVALID_DATA': 400,
                'DRIVER_NOT_FOUND': 404,
                'INVALID_DISTANCE': 406
            };

            const [errorCode, errorMessage] = error.message.split(': ');
            const statusCode = errorMap[errorCode] || 500;

            res.status(statusCode).json({
                error_code: errorCode,
                error_description: errorMessage || 'An unexpected error occurred'
            });
        }
    };

    getRideHistory = async (req: Request, res: Response): Promise<void> => {
        try {
            const customerId = req.params.customer_id;
            const driverId = req.query.driver_id ? Number(req.query.driver_id) : undefined;

            const history = await this.rideService.getRideHistory(customerId, driverId);
            res.json(history);
        } catch (error: any) {
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
}
