import React, { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Rating,
    Grid,
    Alert,
    CircularProgress
} from '@mui/material';
import { RouteEstimate, Driver } from '../types';
import { confirmRide } from '../services/api';
import { useNavigate } from 'react-router-dom';

interface RideOptionsProps {
    estimate: RouteEstimate;
}

export const RideOptions: React.FC<RideOptionsProps> = ({ estimate }) => {
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleConfirm = async (driver: Driver) => {
        setError('');
        setLoading(true);

        try {
            await confirmRide({
                customer_id: localStorage.getItem('customerId') || '',
                origin: localStorage.getItem('origin') || '',
                destination: localStorage.getItem('destination') || '',
                distance: estimate.distance,
                duration: estimate.duration,
                driver: {
                    id: driver.id,
                    name: driver.name
                },
                value: driver.value
            });

            navigate('/history');
        } catch (err: any) {
            const apiError = err.response?.data;
            setError(apiError?.error_description || 'Failed to confirm ride');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom>
                Available Drivers
            </Typography>

            <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1">
                    Distance: {estimate.distance.toFixed(2)} km
                </Typography>
                <Typography variant="subtitle1">
                    Estimated Duration: {estimate.duration}
                </Typography>
            </Box>

            {/* Static Map */}
            <Box
                component="img"
                sx={{
                    width: '100%',
                    height: 300,
                    objectFit: 'cover',
                    mb: 3,
                    borderRadius: 1
                }}
                alt="Route Map"
                src={`https://maps.googleapis.com/maps/api/staticmap?size=600x300&path=color:0x0000ff|weight:5|${estimate.origin.latitude},${estimate.origin.longitude}|${estimate.destination.latitude},${estimate.destination.longitude}&markers=color:red|label:A|${estimate.origin.latitude},${estimate.origin.longitude}&markers=color:red|label:B|${estimate.destination.latitude},${estimate.destination.longitude}&key=${process.env.REACT_APP_GOOGLE_API_KEY}`}
            />

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            <Grid container spacing={3}>
                {estimate.options.map((driver) => (
                    <Grid item xs={12} md={4} key={driver.id}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    {driver.name}
                                </Typography>

                                <Typography variant="body2" color="text.secondary" paragraph>
                                    {driver.description}
                                </Typography>

                                <Typography variant="body2" color="text.secondary">
                                    Vehicle: {driver.vehicle}
                                </Typography>

                                <Box sx={{ my: 1, display: 'flex', alignItems: 'center' }}>
                                    <Rating value={driver.review.rating} readOnly />
                                    <Typography variant="body2" sx={{ ml: 1 }}>
                                        {driver.review.comment}
                                    </Typography>
                                </Box>

                                <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
                                    R$ {driver.value.toFixed(2)}
                                </Typography>

                                <Button
                                    variant="contained"
                                    fullWidth
                                    sx={{ mt: 2 }}
                                    onClick={() => handleConfirm(driver)}
                                    disabled={loading}
                                >
                                    {loading ? <CircularProgress size={24} /> : 'Choose Driver'}
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};
