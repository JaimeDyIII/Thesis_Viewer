import { Container, Grid, Box, Typography, Button, useMediaQuery } from "@mui/material";
import { Header } from "../components/Global/Header";
import ThesisAnalyticsChart from "../components/Analytics/ThesisAnalyticsChart";
import CategoryChart from "../components/Analytics/CategoryChart";
import { useState, useEffect } from 'react';
import "../styles/View.css";
import { Card, CardContent, CardHeader } from '@mui/material';
import { Users, FileText } from 'lucide-react';
import { supabase } from "../lib/supabase";
import AnalyticsPDFExport from "../components/Analytics/AnalyticsPDFExport";
import { useTheme } from '@mui/material/styles';

export default function Analytics() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalTheses: 0,
    totalUsers: 0
  });
  const [thesesData, setThesesData] = useState<any[]>([]);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleCategorySelect = (category: string | null) => {
    setSelectedCategory(category);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { count: thesesCount, error: thesesError } = await supabase
          .from('Thesis')
          .select('*', { count: 'exact', head: true });

        const { count: usersCount, error: usersError } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true });

        const { data: thesesDataResult, error: thesesDataError } = await supabase
          .from('Thesis')
          .select('*');

        if (thesesError) console.error('Error fetching theses count:', thesesError);
        if (usersError) console.error('Error fetching users count:', usersError);
        if (thesesDataError) console.error('Error fetching theses data:', thesesDataError);

        setStats({
          totalTheses: thesesCount || 0,
          totalUsers: usersCount || 0
        });

        if (thesesDataResult) {
          setThesesData(thesesDataResult);
        }
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="admin-dashboard patterned-background">
      <Header />
      <Box sx={{ height: 64 }} /> {/* Adds spacing below fixed Header */}

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>

        {/* Download Button */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            mt: 2,
            mb: 2,
            px: 2,
            position: "relative",
            zIndex: 10
          }}
        >
          <AnalyticsPDFExport />
        </Box>

        {/* Analytics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6}>
            <Card className="card-cream card-hover" sx={{ height: '100%' }}>
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{
                      backgroundColor: 'rgba(29, 57, 125, 0.1)',
                      borderRadius: '50%',
                      p: 1.5,
                      mr: 2
                    }}>
                      <FileText size={28} color="#1d397d" />
                    </Box>
                    <Typography variant="h6">Total Theses</Typography>
                  </Box>
                }
              />
              <CardContent>
                <Typography variant="h3" fontWeight="bold" sx={{ mb: 1, color: '#1d397d' }}>
                  {stats.totalTheses}
                </Typography>
                <Typography variant="body2" className="text-muted">
                  Total theses submitted to the platform.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Card className="card-cream card-hover" sx={{ height: '100%' }}>
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{
                      backgroundColor: 'rgba(29, 57, 125, 0.1)',
                      borderRadius: '50%',
                      p: 1.5,
                      mr: 2
                    }}>
                      <Users size={28} color="#1d397d" />
                    </Box>
                    <Typography variant="h6">Total Users</Typography>
                  </Box>
                }
              />
              <CardContent>
                <Typography variant="h3" fontWeight="bold" sx={{ mb: 1, color: '#1d397d' }}>
                  {stats.totalUsers}
                </Typography>
                <Typography variant="body2" className="text-muted">
                  Registered users on the platform.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Charts Section */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={5}>
            <Box className="white-container">
              <CategoryChart
                onCategorySelect={handleCategorySelect}
                selectedCategory={selectedCategory}
              />
            </Box>
          </Grid>

          <Grid item xs={12} md={7}>
            <Box className="white-container" sx={{ overflowX: 'auto' }}>
              <ThesisAnalyticsChart selectedCategory={selectedCategory} />
            </Box>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
}
