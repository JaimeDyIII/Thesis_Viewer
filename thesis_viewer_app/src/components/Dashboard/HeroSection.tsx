import { Box, Typography, Button, Grid, Paper, Container } from "@mui/material";
import { useNavigate } from 'react-router-dom';

export default function HeroSection() {
  const navigate = useNavigate();
  return (
    <Box py={6} px={2}>
      <Container maxWidth={false} sx={{ maxWidth: '1250px' }}>
        <Paper
          elevation={3}
          className="white-container"
          sx={{
            borderRadius: 4,
            px: 7,
            py: 1,
          }}
        >
          <Grid container spacing={4} alignItems="center">
            {/* TEXT LEFT */}
            <Grid item xs={12} md={6}>
            <Typography variant="h4">
              <strong>Welcome to the NEU Thesis Repository</strong>
            </Typography>
            <Typography variant="body1" className="text-muted" sx={{ mt: 2 }}>
              Browse featured topics, explore the latest uploads, and access student research anytime.
            </Typography>
              <Button
                variant="contained"
                className="button-primary"
                sx={{
                  mt: 3,
                  px: 4,
                  py: 1.5,
                }}
                onClick={() => navigate('/view-thesis')}
              >
                Discover More →
              </Button>
            </Grid>

            {/* IMAGE RIGHT */}
            <Grid item xs={12} md={6}>
              <img src="/hero-section.png" alt="Student reading"
                style={{ width: '100%', maxWidth: '500px', height: 'auto' }}/>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
}