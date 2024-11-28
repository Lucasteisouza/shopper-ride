import React, { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    CardActions,
    Button,
    Typography,
    Grid,
    Alert,
    CircularProgress,
    Paper
} from '@mui/material';
import { confirmRide } from '../services/api';
import { RouteEstimate, Driver } from '../types';

interface RideOptionsProps {
    estimate: RouteEstimate;
    onRideConfirmed: (rideDetails: any) => void;
}

export const RideOptions: React.FC<RideOptionsProps> = ({ estimate, onRideConfirmed }) => {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleConfirm = async (driver: Driver) => {
        setError('');
        setLoading(true);

        const customerId = localStorage.getItem('customerId');
        const origin = localStorage.getItem('origin');
        const destination = localStorage.getItem('destination');

        if (!customerId || !origin || !destination) {
            setError('Missing ride information. Please start a new ride request.');
            setLoading(false);
            return;
        }

        try {
            const result = await confirmRide({
                customer_id: customerId,
                origin: origin,
                destination: destination,
                distance: estimate.distance,
                duration: estimate.duration,
                driver: {
                    id: driver.id,
                    name: driver.name
                },
                value: driver.value
            });

            // Get the selected driver's full details from the estimate options
            const selectedDriver = estimate.options.find(opt => opt.id === driver.id);
            
            if (!selectedDriver) {
                throw new Error('Selected driver not found in options');
            }

            const rideDetails = {
                rideId: result.id,
                driverName: result.driver.name,
                driverVehicle: result.driver.vehicle,
                origin: origin,
                destination: destination
            };

            onRideConfirmed(rideDetails);
        } catch (err: any) {
            const apiError = err.response?.data;
            setError(apiError?.error_description || 'Failed to confirm ride');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ maxWidth: 800, mx: 'auto' }}>
            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h5" gutterBottom>
                    Ride Details
                </Typography>
                <Typography variant="body1">
                    From: {localStorage.getItem('origin')}
                </Typography>
                <Typography variant="body1">
                    To: {localStorage.getItem('destination')}
                </Typography>
                <Typography variant="body1">
                    Distance: {estimate.distance} km
                </Typography>
                <Typography variant="body1">
                    Duration: {estimate.duration}
                </Typography>
            </Paper>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            <Typography variant="h5" gutterBottom>
                Available Drivers
            </Typography>

            <Grid container spacing={3}>
                {estimate.options.map((driver) => (
                    <Grid item xs={12} sm={6} md={4} key={driver.id}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6">
                                    {driver.name}
                                </Typography>
                                <Typography color="text.secondary">
                                    Vehicle: {driver.vehicle}
                                </Typography>
                                <Typography variant="body2" sx={{ mt: 1 }}>
                                    Rating: {driver.rating}/5
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {driver.description}
                                </Typography>
                                <Typography variant="h6" sx={{ mt: 2 }}>
                                    ${driver.value.toFixed(2)}
                                </Typography>
                            </CardContent>
                            <CardActions>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    onClick={() => handleConfirm(driver)}
                                    disabled={loading}
                                >
                                    {loading ? <CircularProgress size={24} /> : 'Select Driver'}
                                </Button>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};
