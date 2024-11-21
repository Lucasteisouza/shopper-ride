import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Container, Box, Button } from '@mui/material';
import { RideForm } from './components/RideForm';
import { RideOptions } from './components/RideOptions';
import { RideHistory } from './components/RideHistory';
import { RouteEstimate } from './types';

const App: React.FC = () => {
    const [estimate, setEstimate] = useState<RouteEstimate | null>(null);

    const handleEstimateSuccess = (newEstimate: RouteEstimate) => {
        setEstimate(newEstimate);
        localStorage.setItem('customerId', localStorage.getItem('tempCustomerId') || '');
        localStorage.setItem('origin', localStorage.getItem('tempOrigin') || '');
        localStorage.setItem('destination', localStorage.getItem('tempDestination') || '');
    };

    return (
        <Router>
            <Box sx={{ flexGrow: 1 }}>
                <AppBar position="static">
                    <Toolbar>
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                            Shopper Ride
                        </Typography>
                        <Button color="inherit" component={Link} to="/">
                            New Ride
                        </Button>
                        <Button color="inherit" component={Link} to="/history">
                            History
                        </Button>
                    </Toolbar>
                </AppBar>

                <Container maxWidth="lg" sx={{ mt: 4 }}>
                    <Routes>
                        <Route
                            path="/"
                            element={
                                estimate ? (
                                    <RideOptions estimate={estimate} />
                                ) : (
                                    <RideForm onEstimateSuccess={handleEstimateSuccess} />
                                )
                            }
                        />
                        <Route path="/history" element={<RideHistory />} />
                    </Routes>
                </Container>
            </Box>
        </Router>
    );
};

export default App;
