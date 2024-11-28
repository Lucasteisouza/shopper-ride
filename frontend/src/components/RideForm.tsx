import React, { useState } from 'react';
import {
    Box,
    TextField,
    Button,
    Paper,
    Typography,
    Alert,
    CircularProgress
} from '@mui/material';
import { estimateRide } from '../services/api';
import { ApiError, RouteEstimate } from '../types';

interface RideFormProps {
    onEstimateSuccess: (estimate: RouteEstimate) => void;
}

export const RideForm: React.FC<RideFormProps> = ({ onEstimateSuccess }) => {
    const [customerId, setCustomerId] = useState('');
    const [origin, setOrigin] = useState('');
    const [destination, setDestination] = useState('');
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Validate inputs
        if (!customerId.trim()) {
            setError('Please enter a customer ID');
            setLoading(false);
            return;
        }

        if (!origin.trim()) {
            setError('Please enter a pickup location');
            setLoading(false);
            return;
        }

        if (!destination.trim()) {
            setError('Please enter a destination');
            setLoading(false);
            return;
        }

        try {
            // Store values in localStorage
            localStorage.setItem('customerId', customerId.trim());
            localStorage.setItem('origin', origin.trim());
            localStorage.setItem('destination', destination.trim());

            const estimate = await estimateRide(customerId.trim(), origin.trim(), destination.trim());
            onEstimateSuccess(estimate);
        } catch (err: any) {
            console.error('RideForm: Error occurred:', err);
            const apiError = err.response?.data;
            setError(apiError?.error_description || 'Failed to estimate ride');
            
            // Clear localStorage on error
            localStorage.removeItem('customerId');
            localStorage.removeItem('origin');
            localStorage.removeItem('destination');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Paper elevation={3} sx={{ p: 3, maxWidth: 500, mx: 'auto', mt: 4 }}>
            <Typography variant="h5" component="h2" gutterBottom>
                Request a Ride
            </Typography>

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                <TextField
                    fullWidth
                    label="Customer ID"
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    margin="normal"
                    required
                />

                <TextField
                    fullWidth
                    label="Origin Address"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    margin="normal"
                    required
                />

                <TextField
                    fullWidth
                    label="Destination Address"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    margin="normal"
                    required
                />

                {error && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                        {error}
                    </Alert>
                )}

                <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    sx={{ mt: 3 }}
                    disabled={loading}
                >
                    {loading ? <CircularProgress size={24} /> : 'Estimate Ride'}
                </Button>
            </Box>
        </Paper>
    );
};
