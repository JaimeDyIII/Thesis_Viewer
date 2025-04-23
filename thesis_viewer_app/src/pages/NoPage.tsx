import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NoPage: React.FC = () => {
    const navigate = useNavigate();
    const { session } = useAuth();
    
    const handleGoHome = () => {
        if(session){
            navigate('/dashboard');
        } else {
            navigate('/');
        }
    };

    return (
        <Box
            sx={{
                height: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'column',
                position: 'relative',
                textAlign: 'center',
                overflow: 'hidden',
            }}
        >
            <Box className="admin-background-gradient" />
            <Box className="admin-background-blur" />
            <Box className="admin-background-radial" />

            <Typography variant="h1" sx={{ fontSize: { xs: '4rem', md: '6rem' }, zIndex: 1 }}>
                404
            </Typography>
            <Typography variant="h5" sx={{ mt: 2, zIndex: 1 }}>
                Error: Page Not Found!
            </Typography>

            <Button
                variant="contained"
                color="primary"
                onClick={handleGoHome}
                sx={{ mt: 4, zIndex: 1 }}
            >
                Go to Homepage
            </Button>
        </Box>
    );
};

export default NoPage;
