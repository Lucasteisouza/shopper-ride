export interface Driver {
    id: number;
    name: string;
    vehicle: string;
    rating: number;
    value: number;
    description: string;
}

export interface RouteEstimate {
    distance: number;
    duration: string;
    options: Driver[];
}

export interface RideHistory {
    id: number;
    customer_id: string;
    driver_name: string;
    driver_id: number;
    origin: string;
    destination: string;
    status: 'completed' | 'cancelled' | 'in_progress';
    price: number;
    created_at: string;
    completed_at?: string;
}

export interface ApiError {
    error: string;
    error_description: string;
}
