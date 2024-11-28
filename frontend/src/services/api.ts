import axios from 'axios';
import { RouteEstimate, RideHistory } from '../types';

const api = axios.create({
    baseURL: '/api'
});

export const estimateRide = async (
    customerId: string,
    origin: string,
    destination: string
): Promise<RouteEstimate> => {
    const response = await api.post('/ride/estimate', {
        customer_id: customerId,
        origin,
        destination
    });
    return response.data;
};

export const confirmRide = async (rideData: {
    customer_id: string;
    origin: string;
    destination: string;
    distance: number;
    duration: string;
    driver: {
        id: number;
        name: string;
    };
    value: number;
}) => {
    const response = await api.post('/ride/confirm', rideData);
    return response.data;
};

export const getRideHistory = async (
    customerId: string,
    driverId?: number
): Promise<{ customer_id: string; rides: RideHistory[] }> => {
    const response = await api.get(`/ride/history/${customerId}${driverId ? `?driver_id=${driverId}` : ''}`);
    return response.data;
};

export const completeRide = async (rideId: number) => {
    const response = await api.post(`/ride/${rideId}/complete`);
    return response.data;
};
