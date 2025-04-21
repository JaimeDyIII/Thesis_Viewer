import { Box, Typography, Card, CardContent, Grid, Button } from "@mui/material";

type Props = {
  permissions: any;
  navigate: (path: string) => void;
  userRole: string;
};

export default function LatestUploads({ permissions, navigate }: Props) {
  return (
    <Box mt={8} px={5}>
      <Typography variant="h5" sx={{ mb: 2, color: '#4682A9', fontWeight: 600 }}>
        Latest Uploads
      </Typography>
      <Grid container spacing={2}>
        {[1, 2, 3, 4].map((id) => (
          <Grid item xs={12} md={6} key={id}>
            <Card sx={{ backgroundColor: '#F6F4EB' }}>
              <CardContent>
                <Typography variant="subtitle1">Recent Thesis #{id}</Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Uploaded recently with a short summary...
                </Typography>
                <Button size="small" onClick={() => navigate('/thesis-repository')}>
                  View →
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
