import { Box, Typography, Button, Grid, Paper, Container } from "@mui/material";

export default function HeroSection() {
  return (
    <Box py={6} px={2}>
      <Container maxWidth={false} sx={{ maxWidth: '1250px' }}>
        <Paper
          elevation={3}
          sx={{
            borderRadius: 4,
            px: 7,
            py: 1, // taller height
            backgroundColor: '#FFFFFF',
          }}
        >
          <Grid container spacing={4} alignItems="center">
            {/* TEXT LEFT */}
            <Grid item xs={12} md={6}>
              <Typography variant="h4" sx={{ color: '#4682A9', fontWeight: 700 }}>
                Welcome to the NEU Thesis Repository
              </Typography>
              <Typography variant="body1" sx={{ mt: 2, color: '#555' }}>
                Browse featured topics, explore the latest uploads, and access student research anytime.
              </Typography>
              <Button
                variant="contained"
                sx={{
                  mt: 3,
                  px: 4,
                  py: 1.5,
                  backgroundColor: '#4682A9',
                  fontWeight: 'bold',
                  '&:hover': { backgroundColor: '#749BC2' },
                }}
              >
                Discover More →
              </Button>
            </Grid>

            {/* IMAGE RIGHT */}
            <Grid item xs={12} md={6}>
              <img
                src="/hero-section.png"
                alt="Student reading"
                style={{ width: '100%', maxWidth: '500px', height: 'auto' }}
              />
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
}