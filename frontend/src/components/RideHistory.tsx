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
    CircularProgress,
    Chip
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

    // Load history automatically if customerId is in localStorage
    useEffect(() => {
        const storedCustomerId = localStorage.getItem('customerId');
        if (storedCustomerId) {
            setCustomerId(storedCustomerId);
            fetchHistory(storedCustomerId);
        }
    }, []);

    const fetchHistory = async (customerIdToFetch?: string) => {
        const idToUse = customerIdToFetch || customerId;
        
        if (!idToUse) {
            setError('Please enter a customer ID');
            return;
        }

        setError('');
        setLoading(true);

        try {
            console.log('Fetching history for customer:', idToUse);
            const response = await getRideHistory(
                idToUse,
                selectedDriver ? parseInt(selectedDriver) : undefined
            );
            console.log('History response:', response);
            setRides(response.rides);
            if (response.rides.length === 0) {
                setError('No rides found for this customer');
            }
        } catch (err: any) {
            console.error('Error fetching history:', err);
            const apiError = err.response?.data;
            setError(apiError?.error_description || 'Failed to fetch ride history');
            setRides([]);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed':
                return 'success';
            case 'in_progress':
            case 'active':
                return 'warning';
            case 'cancelled':
                return 'error';
            default:
                return 'default';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
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
                        onChange={(e) => {
                            setCustomerId(e.target.value);
                            setRides([]); // Clear rides when customer ID changes
                        }}
                        sx={{ flexGrow: 1 }}
                    />

                    <TextField
                        select
                        label="Driver"
                        value={selectedDriver}
                        onChange={(e) => {
                            setSelectedDriver(e.target.value);
                            if (customerId) {
                                fetchHistory();
                            }
                        }}
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
                        onClick={() => fetchHistory()}
                        disabled={loading}
                        sx={{ minWidth: 120 }}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Search'}
                    </Button>
                </Box>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

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
                                <TableCell align="right">Price</TableCell>
                                <TableCell>Date</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rides.length > 0 ? (
                                rides.map((ride) => (
                                    <TableRow key={ride.id} hover>
                                        <TableCell>{ride.id}</TableCell>
                                        <TableCell>{ride.customer_id}</TableCell>
                                        <TableCell>{ride.driver_name}</TableCell>
                                        <TableCell>{ride.origin}</TableCell>
                                        <TableCell>{ride.destination}</TableCell>
                                        <TableCell>
                                            <Chip 
                                                label={ride.status} 
                                                color={getStatusColor(ride.status) as any}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell align="right">${typeof ride.price === 'string' ? parseFloat(ride.price).toFixed(2) : ride.price.toFixed(2)}</TableCell>
                                        <TableCell>{formatDate(ride.created_at)}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={8} align="center">
                                        {loading ? (
                                            <CircularProgress size={20} sx={{ my: 2 }} />
                                        ) : (
                                            <Typography variant="body2" color="text.secondary">
                                                No rides to display
                                            </Typography>
                                        )}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Box>
    );
};
