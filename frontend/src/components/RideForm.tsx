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

        try {
            const estimate = await estimateRide(customerId, origin, destination);
            onEstimateSuccess(estimate);
        } catch (err: any) {
            const apiError = err.response?.data as ApiError;
            setError(apiError?.error_description || 'Failed to estimate ride');
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
