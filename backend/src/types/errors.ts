export class AppError extends Error {
    constructor(
        public readonly code: string,
        message: string,
        public readonly statusCode: number = 400
    ) {
        super(message);
        this.name = 'AppError';
    }
}

export class ValidationError extends AppError {
    constructor(message: string) {
        super('VALIDATION_ERROR', message, 400);
    }
}

export class NotFoundError extends AppError {
    constructor(message: string) {
        super('NOT_FOUND', message, 404);
    }
}

export class GoogleMapsError extends AppError {
    constructor(message: string) {
        super('GOOGLE_MAPS_ERROR', message, 500);
    }
}

export function handleError(error: unknown): AppError {
    if (error instanceof AppError) {
        return error;
    }

    if (error instanceof Error) {
        return new AppError('INTERNAL_ERROR', error.message, 500);
    }

    return new AppError('INTERNAL_ERROR', 'An unexpected error occurred', 500);
}
