import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Container, Box, Button } from '@mui/material';
import { RideForm } from './components/RideForm';
import { RideOptions } from './components/RideOptions';
import { RideHistory } from './components/RideHistory';
import { ActiveRide } from './components/ActiveRide';
import { RouteEstimate } from './types';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from './theme';

const App: React.FC = () => {
    const [estimate, setEstimate] = useState<RouteEstimate | null>(null);
    const [currentPage, setCurrentPage] = useState<'form' | 'options' | 'active' | 'history'>('form');
    const [activeRideDetails, setActiveRideDetails] = useState<any>(null);

    // Check if we have ride data in localStorage and show appropriate page
    useEffect(() => {
        const customerId = localStorage.getItem('customerId');
        const origin = localStorage.getItem('origin');
        const destination = localStorage.getItem('destination');

        // If we have ride data but no estimate, go back to form
        if (customerId && origin && destination && !estimate && currentPage === 'options') {
            setCurrentPage('form');
        }
    }, [estimate, currentPage]);

    const handleEstimateSuccess = (newEstimate: RouteEstimate) => {
        setEstimate(newEstimate);
        setCurrentPage('options');
    };

    const handleRideConfirmed = (rideDetails: any) => {
        setActiveRideDetails(rideDetails);
        setCurrentPage('active');
    };

    const handleRideCompleted = () => {
        setCurrentPage('history');
        setActiveRideDetails(null);
        setEstimate(null);
        
        // Only remove ride-specific data from localStorage, keep customerId for history
        localStorage.removeItem('origin');
        localStorage.removeItem('destination');
    };

    const handleNewRide = () => {
        setCurrentPage('form');
        setEstimate(null);
        setActiveRideDetails(null);
        
        // Clear ride-related data from localStorage
        localStorage.removeItem('customerId');
        localStorage.removeItem('origin');
        localStorage.removeItem('destination');
    };

    const renderContent = () => {
        switch (currentPage) {
            case 'options':
                if (!estimate) {
                    setCurrentPage('form');
                    return <RideForm onEstimateSuccess={handleEstimateSuccess} />;
                }
                return <RideOptions estimate={estimate} onRideConfirmed={handleRideConfirmed} />;
            case 'active':
                return <ActiveRide rideDetails={activeRideDetails} onRideComplete={handleRideCompleted} />;
            case 'history':
                return <RideHistory />;
            default:
                return <RideForm onEstimateSuccess={handleEstimateSuccess} />;
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box sx={{ flexGrow: 1 }}>
                <AppBar position="static">
                    <Toolbar>
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                            Shopper Ride
                        </Typography>
                        <Button 
                            color="inherit" 
                            onClick={handleNewRide}
                        >
                            New Ride
                        </Button>
                        <Button 
                            color="inherit"
                            onClick={() => {
                                setCurrentPage('history');
                                setEstimate(null);
                                setActiveRideDetails(null);
                            }}
                        >
                            History
                        </Button>
                    </Toolbar>
                </AppBar>

                <Container maxWidth="lg" sx={{ mt: 4 }}>
                    {renderContent()}
                </Container>
            </Box>
        </ThemeProvider>
    );
};

export default App;
