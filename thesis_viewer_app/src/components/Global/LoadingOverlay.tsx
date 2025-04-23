import { Box, CircularProgress } from "@mui/material";

export default function LoadingOverlay() {
    return (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          backgroundColor: '#f7f2ff'
        }}>
          <CircularProgress color="secondary" />
        </Box>
      );
}
