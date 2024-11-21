import { Client, TravelMode } from '@googlemaps/google-maps-services-js';
import { ValidationError } from '../types/errors';

export class GoogleMapsService {
    private client: Client;
    private apiKey: string;

    constructor() {
        this.client = new Client({});
        this.apiKey = process.env.GOOGLE_API_KEY || '';
        
        if (!this.apiKey) {
            throw new Error('GOOGLE_API_KEY environment variable is not set');
        }
    }

    private async retry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
        try {
            return await fn();
        } catch (error: any) {
            console.error('Google Maps API Error:', error.response?.data || error);
            
            if (error.response?.data?.status === 'REQUEST_DENIED') {
                throw new ValidationError(
                    'Google Maps API Error: The API key is not properly configured or the Directions API is not enabled. ' +
                    'Error details: ' + (error.response?.data?.error_message || 'Unknown error')
                );
            }
            
            if (error.response?.data?.error_message) {
                throw new ValidationError(`Google Maps API Error: ${error.response.data.error_message}`);
            }

            if (retries > 0) {
                console.log(`Retrying request... (${retries} attempts remaining)`);
                await new Promise(resolve => setTimeout(resolve, 1000));
                return this.retry(fn, retries - 1);
            }

            throw new ValidationError('Failed to calculate route: ' + (error.message || 'Unknown error'));
        }
    }

    async calculateRoute(origin: string, destination: string) {
        const response = await this.retry(() =>
            this.client.directions({
                params: {
                    origin,
                    destination,
                    mode: TravelMode.driving,
                    key: this.apiKey
                }
            })
        );

        if (!response.data.routes || response.data.routes.length === 0) {
            throw new ValidationError('No route found between the specified locations');
        }

        const route = response.data.routes[0];
        const leg = route.legs[0];

        if (!leg) {
            throw new ValidationError('Invalid route data received');
        }

        return {
            distance: Math.ceil(leg.distance.value / 1000), // Convert to km and round up to nearest integer
            duration: leg.duration.text,
            origin: {
                address: leg.start_address,
                latitude: leg.start_location.lat,
                longitude: leg.start_location.lng
            },
            destination: {
                address: leg.end_address,
                latitude: leg.end_location.lat,
                longitude: leg.end_location.lng
            }
        };
    }
}
