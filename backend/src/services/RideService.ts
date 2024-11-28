import { Repository } from 'typeorm';
import { Driver } from '../models/Driver';
import { Ride } from '../models/Ride';
import { GoogleMapsService } from './GoogleMapsService';
import { ValidationError, NotFoundError, GoogleMapsError } from '../types/errors';
import { LessThanOrEqual } from 'typeorm';

export class RideService {
    constructor(
        private driverRepository: Repository<Driver>,
        private rideRepository: Repository<Ride>,
        private googleMapsService: GoogleMapsService
    ) {}

    private validateCustomerId(customerId: string | undefined): void {
        const id = customerId || '';
        if (!id || id.trim().length === 0) {
            throw new ValidationError('Customer ID is required');
        }
        if (!/^[A-Za-z0-9-]+$/.test(id)) {
            throw new ValidationError('Customer ID contains invalid characters');
        }
    }

    private validateAddresses(origin: string, destination: string): void {
        if (!origin || origin.trim().length === 0) {
            throw new ValidationError('Origin address is required');
        }
        if (!destination || destination.trim().length === 0) {
            throw new ValidationError('Destination address is required');
        }
        if (origin.trim() === destination.trim()) {
            throw new ValidationError('Origin and destination cannot be the same');
        }
    }

    async estimateRide(customerId: string, origin: string, destination: string) {
        try {
            console.log('Starting ride estimation with params:', {
                customerId,
                origin,
                destination
            });

            // Input validation
            this.validateCustomerId(customerId);
            this.validateAddresses(origin, destination);

            // Calculate route using Google Maps
            console.log('Calculating route with Google Maps...');
            const routeDetails = await this.googleMapsService.calculateRoute(
                origin.trim(),
                destination.trim()
            );
            console.log('Route details:', routeDetails);

            // Get available drivers based on distance
            console.log('Finding available drivers...');
            const drivers = await this.driverRepository.find({
                where: {
                    minDistance: LessThanOrEqual(routeDetails.distance)
                },
                order: {
                    ratePerKm: 'ASC'
                }
            });
            console.log(`Found ${drivers.length} available drivers`);

            if (drivers.length === 0) {
                throw new NotFoundError('No available drivers for this route');
            }

            // Calculate price for each driver
            const options = drivers.map(driver => ({
                id: driver.id,
                name: driver.name,
                description: driver.description,
                vehicle: driver.vehicle,
                review: {
                    rating: driver.rating,
                    comment: driver.reviewComment
                },
                value: Number((routeDetails.distance * driver.ratePerKm).toFixed(2))
            }));

            console.log('Estimation completed successfully');
            return {
                ...routeDetails,
                options
            };
        } catch (error: any) {
            console.error('Error in estimateRide:', {
                error: error.message,
                stack: error.stack,
                params: { customerId, origin, destination }
            });

            if (error.message?.includes('Google Maps API Error')) {
                throw new GoogleMapsError(error.message);
            }

            throw error;
        }
    }

    async confirmRide(rideData: {
        customer_id?: string;
        customerId?: string;
        origin: string;
        destination: string;
        distance: number;
        duration: string;
        driver: { id: number; name: string };
        value: number;
    }) {
        try {
            console.log('Starting ride confirmation:', rideData);

            // Input validation
            const customerId = rideData.customer_id || rideData.customerId;
            this.validateCustomerId(customerId);
            this.validateAddresses(rideData.origin, rideData.destination);

            if (rideData.distance <= 0) {
                throw new ValidationError('Invalid distance value');
            }

            if (!rideData.driver || !rideData.driver.id) {
                throw new ValidationError('Driver information is required');
            }

            // Validate driver
            const driver = await this.driverRepository.findOne({
                where: { id: rideData.driver.id }
            });

            if (!driver) {
                throw new NotFoundError('Selected driver not found');
            }

            // Get coordinates from Google Maps
            const routeDetails = await this.googleMapsService.calculateRoute(
                rideData.origin,
                rideData.destination
            );

            // Create ride record
            const ride = this.rideRepository.create({
                customerId: customerId,
                origin: rideData.origin,
                destination: rideData.destination,
                distance: rideData.distance,
                duration: rideData.duration,
                value: rideData.value,
                driver: driver,
                originLat: routeDetails.origin.latitude,
                originLng: routeDetails.origin.longitude,
                destinationLat: routeDetails.destination.latitude,
                destinationLng: routeDetails.destination.longitude,
                status: 'active'
            });

            console.log('Saving ride record...');
            await this.rideRepository.save(ride);
            console.log('Ride confirmed successfully');

            return {
                id: ride.id,
                status: ride.status,
                driver: {
                    id: driver.id,
                    name: driver.name,
                    vehicle: driver.vehicle
                }
            };
        } catch (error: any) {
            console.error('Error in confirmRide:', {
                error: error.message,
                stack: error.stack,
                rideData
            });
            throw error;
        }
    }

    async getRideHistory(customerId: string, driverId?: number) {
        try {
            console.log('Getting ride history for customer:', customerId);

            // Input validation
            this.validateCustomerId(customerId);

            const query = this.rideRepository
                .createQueryBuilder('ride')
                .leftJoinAndSelect('ride.driver', 'driver')
                .where('ride.customerId = :customerId', { customerId })
                .orderBy('ride.createdAt', 'DESC');

            if (driverId) {
                const driver = await this.driverRepository.findOne({
                    where: { id: driverId }
                });

                if (!driver) {
                    throw new NotFoundError('Specified driver not found');
                }

                query.andWhere('driver.id = :driverId', { driverId });
            }

            const rides = await query.getMany();

            if (rides.length === 0) {
                throw new NotFoundError('No rides found for this customer');
            }

            console.log('Ride history retrieved successfully');
            return {
                customer_id: customerId,
                rides: rides.map(ride => ({
                    id: ride.id,
                    customer_id: ride.customerId,
                    driver_name: ride.driver.name,
                    origin: ride.origin,
                    destination: ride.destination,
                    status: ride.status,
                    price: ride.value,
                    created_at: ride.createdAt,
                    completed_at: ride.completedAt || null
                }))
            };
        } catch (error: any) {
            console.error('Error in getRideHistory:', {
                error: error.message,
                stack: error.stack,
                params: { customerId, driverId }
            });
            throw error;
        }
    }

    async getActiveRides() {
        try {
            console.log('Getting active rides');

            const rides = await this.rideRepository
                .createQueryBuilder('ride')
                .leftJoinAndSelect('ride.driver', 'driver')
                .where('ride.status = :status', { status: 'active' })
                .orderBy('ride.createdAt', 'DESC')
                .getMany();

            if (rides.length === 0) {
                throw new NotFoundError('No active rides found');
            }

            console.log('Active rides retrieved successfully');
            return {
                rides: rides.map(ride => ({
                    id: ride.id,
                    customerId: ride.customerId,
                    date: ride.createdAt,
                    origin: ride.origin,
                    destination: ride.destination,
                    distance: ride.distance,
                    duration: ride.duration,
                    driver: {
                        id: ride.driver.id,
                        name: ride.driver.name
                    },
                    value: ride.value,
                    status: ride.status,
                    completed_at: ride.completedAt || null
                }))
            };
        } catch (error: any) {
            console.error('Error in getActiveRides:', {
                error: error.message,
                stack: error.stack
            });
            throw error;
        }
    }

    async completeRide(rideId: number) {
        try {
            console.log('Completing ride:', rideId);

            const ride = await this.rideRepository.findOne({
                where: { id: rideId }
            });

            if (!ride) {
                throw new NotFoundError('Ride not found');
            }

            ride.status = 'completed';
            ride.completedAt = new Date();

            await this.rideRepository.save(ride);
            console.log('Ride completed successfully');

            return {
                id: ride.id,
                status: ride.status,
                completed_at: ride.completedAt
            };
        } catch (error: any) {
            console.error('Error in completeRide:', {
                error: error.message,
                stack: error.stack,
                rideId
            });
            throw error;
        }
    }
}
