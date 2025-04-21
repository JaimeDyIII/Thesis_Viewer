import { Box, Typography, Card, CardContent, Button } from "@mui/material";

type Props = {
  permissions: any;
  navigate: (path: string) => void;
  userRole: string;
};

export default function ThesisCarousel({ permissions, navigate }: Props) {
  return (
    <Box mt={5} px={5}>
      <Typography variant="h5" sx={{ mb: 2, color: '#4682A9', fontWeight: 600 }}>
        Featured Theses
      </Typography>
      <Box display="flex" overflow="auto" gap={2}>
        {[1, 2, 3].map((id) => (
          <Card key={id} sx={{ minWidth: 300, backgroundColor: '#F6F4EB' }}>
            <CardContent>
              <Typography variant="h6">Sample Thesis #{id}</Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                A short thesis description here...
              </Typography>
              <Button size="small" onClick={() => navigate('/thesis-repository')}>
                View →
              </Button>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
}
