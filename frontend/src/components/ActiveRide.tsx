import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, CircularProgress, Paper } from '@mui/material';
import { completeRide } from '../services/api';

interface RideDetails {
    rideId: number;
    driverName: string;
    driverVehicle: string;
    origin: string;
    destination: string;
}

interface ActiveRideProps {
    rideDetails: RideDetails;
    onRideComplete: () => void;
}

export const ActiveRide: React.FC<ActiveRideProps> = ({ rideDetails, onRideComplete }) => {
    const [status, setStatus] = useState('Connecting with driver...');
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!rideDetails) {
            return;
        }

        // Simulate driver status updates
        const statusSequence = [
            { message: 'Driver is on the way', delay: 1000 },
            { message: 'Driver is nearby', delay: 2000 },
            { message: 'Driver has arrived', delay: 3000 },
            { message: 'Ride in progress', delay: 4000 },
            { message: 'Arriving at destination', delay: 5000 },
            { message: 'Ride completed', delay: 6000 }
        ];

        const timers: NodeJS.Timeout[] = [];

        statusSequence.forEach(({ message, delay }, index) => {
            const timer = setTimeout(async () => {
                setStatus(message);
                setProgress((index + 1) * (100 / statusSequence.length));
                
                if (index === statusSequence.length - 1) {
                    try {
                        // Call the complete ride endpoint
                        await completeRide(rideDetails.rideId);
                        const completeTimer = setTimeout(() => {
                            onRideComplete();
                        }, 1000);
                        timers.push(completeTimer);
                    } catch (err: any) {
                        console.error('Failed to complete ride:', err);
                        setError('Failed to complete ride. Please try again.');
                    }
                }
            }, delay);
            timers.push(timer);
        });

        // Cleanup timers on unmount
        return () => {
            timers.forEach(timer => clearTimeout(timer));
        };
    }, [rideDetails, onRideComplete]);

    return (
        <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4, p: 2 }}>
            <Card elevation={3}>
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <CircularProgress variant="determinate" value={progress} sx={{ mr: 2 }} />
                        <Typography variant="h6">{status}</Typography>
                    </Box>

                    {error && (
                        <Paper sx={{ p: 2, mb: 2, bgcolor: 'error.light' }}>
                            <Typography color="error">{error}</Typography>
                        </Paper>
                    )}

                    <Paper sx={{ p: 2, mb: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>
                            Driver: {rideDetails.driverName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Vehicle: {rideDetails.driverVehicle}
                        </Typography>
                    </Paper>

                    <Paper sx={{ p: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>
                            Ride Details
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                            From: {rideDetails.origin}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            To: {rideDetails.destination}
                        </Typography>
                    </Paper>
                </CardContent>
            </Card>
        </Box>
    );
};
