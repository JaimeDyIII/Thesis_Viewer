import { Box, Typography, Button, Grid, Paper } from "@mui/material";
import { useNavigate } from 'react-router-dom';
import { usePermissions } from "../../context/PermissionsContext";

export default function HeroSection() {
  const navigate = useNavigate();
  const { permissions } = usePermissions();
  
  return (
    <Paper
      elevation={3}
      className="white-container"
      sx={{
        borderRadius: 4,
        pt: 1, 
        pb: 1,
        px: 4,
      }}
    >
      <Box sx={{ px: 7 }}>
        <Grid container spacing={4} alignItems="center">
          {/* TEXT LEFT */}
          <Grid item xs={12} md={6}>
            <Typography variant="h4">
              <strong>Welcome to the NEU Thesis Repository</strong>
            </Typography>
            <Typography variant="body1" className="text-muted" sx={{ mt: 2 }}>
              Browse featured topics, explore the latest uploads, and access student research anytime.
            </Typography>
            {permissions?.ThesisRepository_view && (
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
            )}
          </Grid>

          {/* IMAGE RIGHT */}
          <Grid item xs={12} md={6}>
            <img 
              src="/hero-section.png" 
              alt="Student reading"
              style={{ 
                width: '100%',
                maxWidth: '500px',
                height: 'auto',
                display: 'block',
                margin: '0 auto'
              }}
            />
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
}