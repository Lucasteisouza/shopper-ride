import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    MenuItem,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Alert,
    CircularProgress
} from '@mui/material';
import { getRideHistory } from '../services/api';
import { RideHistory as RideHistoryType } from '../types';

export const RideHistory: React.FC = () => {
    const [customerId, setCustomerId] = useState('');
    const [selectedDriver, setSelectedDriver] = useState<string>('');
    const [rides, setRides] = useState<RideHistoryType[]>([]);
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState(false);

    const drivers = [
        { id: 1, name: 'Homer Simpson' },
        { id: 2, name: 'Dominic Toretto' },
        { id: 3, name: 'James Bond' }
    ];

    const fetchHistory = async () => {
        if (!customerId) {
            setError('Please enter a customer ID');
            return;
        }

        setError('');
        setLoading(true);

        try {
            const response = await getRideHistory(
                customerId,
                selectedDriver ? parseInt(selectedDriver) : undefined
            );
            setRides(response.rides);
        } catch (err: any) {
            const apiError = err.response?.data;
            setError(apiError?.error_description || 'Failed to fetch ride history');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
                Ride History
            </Typography>

            <Paper sx={{ p: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                    <TextField
                        label="Customer ID"
                        value={customerId}
                        onChange={(e) => setCustomerId(e.target.value)}
                        sx={{ flexGrow: 1 }}
                    />

                    <TextField
                        select
                        label="Driver"
                        value={selectedDriver}
                        onChange={(e) => setSelectedDriver(e.target.value)}
                        sx={{ width: 200 }}
                    >
                        <MenuItem value="">All Drivers</MenuItem>
                        {drivers.map((driver) => (
                            <MenuItem key={driver.id} value={driver.id.toString()}>
                                {driver.name}
                            </MenuItem>
                        ))}
                    </TextField>

                    <Button
                        variant="contained"
                        onClick={fetchHistory}
                        disabled={loading}
                        sx={{ minWidth: 120 }}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Search'}
                    </Button>
                </Box>

                {error && <Alert severity="error">{error}</Alert>}

                {rides.length > 0 && (
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Ride ID</TableCell>
                                    <TableCell>Customer ID</TableCell>
                                    <TableCell>Driver</TableCell>
                                    <TableCell>Origin</TableCell>
                                    <TableCell>Destination</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Price</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rides.map((ride) => (
                                    <TableRow key={ride.id}>
                                        <TableCell>{ride.id}</TableCell>
                                        <TableCell>{ride.customer_id}</TableCell>
                                        <TableCell>{ride.driver_name}</TableCell>
                                        <TableCell>{ride.origin}</TableCell>
                                        <TableCell>{ride.destination}</TableCell>
                                        <TableCell>{ride.status}</TableCell>
                                        <TableCell>${ride.price.toFixed(2)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Paper>
        </Box>
    );
};
