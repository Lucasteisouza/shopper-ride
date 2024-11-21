export interface Driver {
    id: number;
    name: string;
    description: string;
    vehicle: string;
    review: {
        rating: number;
        comment: string;
    };
    value: number;
}

export interface RouteEstimate {
    origin: {
        latitude: number;
        longitude: number;
    };
    destination: {
        latitude: number;
        longitude: number;
    };
    distance: number;
    duration: string;
    options: Driver[];
    routeResponse: any;
}

export interface RideHistory {
    id: number;
    customer_id: string;
    driver_name: string;
    origin: string;
    destination: string;
    status: string;
    price: number;
}

export interface ApiError {
    error_code: string;
    error_description: string;
}
