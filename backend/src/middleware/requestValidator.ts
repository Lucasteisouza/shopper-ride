import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../types/errors';

export interface ValidationSchema {
    [key: string]: {
        type: 'string' | 'number' | 'boolean' | 'object';
        required?: boolean;
        minLength?: number;
        maxLength?: number;
        min?: number;
        max?: number;
        pattern?: RegExp;
        custom?: (value: any) => boolean;
    };
}

export function validateRequest(schema: ValidationSchema) {
    return (req: Request, res: Response, next: NextFunction) => {
        const errors: string[] = [];

        Object.entries(schema).forEach(([field, rules]) => {
            const value = req.body[field];

            // Check required fields
            if (rules.required && (value === undefined || value === null || value === '')) {
                errors.push(`${field} is required`);
                return;
            }

            // Skip validation if field is not required and not provided
            if (!rules.required && (value === undefined || value === null)) {
                return;
            }

            // Type validation
            if (typeof value !== rules.type) {
                errors.push(`${field} must be of type ${rules.type}`);
                return;
            }

            // String-specific validations
            if (rules.type === 'string') {
                if (rules.minLength && value.length < rules.minLength) {
                    errors.push(`${field} must be at least ${rules.minLength} characters long`);
                }
                if (rules.maxLength && value.length > rules.maxLength) {
                    errors.push(`${field} must be at most ${rules.maxLength} characters long`);
                }
                if (rules.pattern && !rules.pattern.test(value)) {
                    errors.push(`${field} has an invalid format`);
                }
            }

            // Number-specific validations
            if (rules.type === 'number') {
                if (rules.min !== undefined && value < rules.min) {
                    errors.push(`${field} must be greater than or equal to ${rules.min}`);
                }
                if (rules.max !== undefined && value > rules.max) {
                    errors.push(`${field} must be less than or equal to ${rules.max}`);
                }
            }

            // Custom validation
            if (rules.custom && !rules.custom(value)) {
                errors.push(`${field} is invalid`);
            }
        });

        if (errors.length > 0) {
            throw new ValidationError(errors.join(', '));
        }

        next();
    };
}
