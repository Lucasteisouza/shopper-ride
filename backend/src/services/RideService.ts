import { Repository } from 'typeorm';
import { Driver } from '../models/Driver';
import { Ride } from '../models/Ride';
import { GoogleMapsService } from './GoogleMapsService';
import { ValidationError, NotFoundError } from '../types/errors';
import { LessThanOrEqual } from 'typeorm';

export class RideService {
    constructor(
        private driverRepository: Repository<Driver>,
        private rideRepository: Repository<Ride>,
        private googleMapsService: GoogleMapsService
    ) {}

    private validateCustomerId(customerId: string): void {
        if (!customerId || customerId.trim().length === 0) {
            throw new ValidationError('Customer ID is required');
        }
        if (!/^[A-Za-z0-9-]+$/.test(customerId)) {
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
        // Input validation
        this.validateCustomerId(customerId);
        this.validateAddresses(origin, destination);

        // Calculate route using Google Maps
        const routeDetails = await this.googleMapsService.calculateRoute(
            origin.trim(),
            destination.trim()
        );

        // Get available drivers based on distance
        const drivers = await this.driverRepository.find({
            where: {
                minDistance: LessThanOrEqual(routeDetails.distance)
            },
            order: {
                ratePerKm: 'ASC'
            }
        });

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

        return {
            ...routeDetails,
            options
        };
    }

    async confirmRide(rideData: {
        customerId: string;
        origin: string;
        destination: string;
        distance: number;
        duration: string;
        driver: { id: number; name: string };
        value: number;
    }) {
        // Input validation
        this.validateCustomerId(rideData.customerId);
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

        // Validate minimum distance
        if (rideData.distance < driver.minDistance) {
            throw new ValidationError(
                `Distance is below driver minimum of ${driver.minDistance}km`
            );
        }

        // Get coordinates and validate route
        const routeDetails = await this.googleMapsService.calculateRoute(
            rideData.origin.trim(),
            rideData.destination.trim()
        );

        // Create ride record
        const ride = this.rideRepository.create({
            ...rideData,
            driver,
            originLat: routeDetails.origin.latitude,
            originLng: routeDetails.origin.longitude,
            destinationLat: routeDetails.destination.latitude,
            destinationLng: routeDetails.destination.longitude,
            status: 'active'
        });

        await this.rideRepository.save(ride);

        return { success: true, rideId: ride.id };
    }

    async getRideHistory(customerId: string, driverId?: number) {
        // Input validation
        this.validateCustomerId(customerId);

        const query = this.rideRepository
            .createQueryBuilder('ride')
            .leftJoinAndSelect('ride.driver', 'driver')
            .where('ride.customerId = :customerId', { customerId })
            .andWhere('ride.status = :status', { status: 'completed' })
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

        return {
            customerId,
            rides: rides.map(ride => ({
                id: ride.id,
                date: ride.createdAt,
                origin: ride.origin,
                destination: ride.destination,
                distance: ride.distance,
                duration: ride.duration,
                driver: {
                    id: ride.driver.id,
                    name: ride.driver.name
                },
                value: ride.value
            }))
        };
    }

    async getActiveRides() {
        const rides = await this.rideRepository
            .createQueryBuilder('ride')
            .leftJoinAndSelect('ride.driver', 'driver')
            .where('ride.status = :status', { status: 'active' })
            .orderBy('ride.createdAt', 'DESC')
            .getMany();

        if (rides.length === 0) {
            throw new NotFoundError('No active rides found');
        }

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
                status: ride.status
            }))
        };
    }
}
