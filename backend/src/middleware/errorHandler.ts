import { Request, Response, NextFunction } from 'express';
import { AppError, handleError } from '../types/errors';

export function errorHandler(
    error: Error,
    req: Request,
    res: Response,
    next: NextFunction
) {
    console.error('Error:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        path: req.path,
        method: req.method,
        body: req.body,
        params: req.params,
        query: req.query
    });

    const appError = handleError(error);

    res.status(appError.statusCode).json({
        error_code: appError.code,
        error_description: appError.message
    });
}
