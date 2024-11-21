import axios from 'axios';
import { RouteEstimate, RideHistory } from '../types';

const api = axios.create({
    baseURL: 'http://localhost:8080'
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
    const response = await api.patch('/ride/confirm', rideData);
    return response.data;
};

export const getRideHistory = async (
    customerId: string,
    driverId?: number
): Promise<{ customer_id: string; rides: RideHistory[] }> => {
    const response = await api.get(`/ride/${customerId}${driverId ? `?driver_id=${driverId}` : ''}`);
    return response.data;
};
