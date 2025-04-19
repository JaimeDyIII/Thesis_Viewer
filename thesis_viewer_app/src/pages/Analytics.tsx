import { Container, Grid, Box, Typography, Button } from "@mui/material";
import { Header } from "../components/Global/Header";
import ThesisAnalyticsChart from "../components/Analytics/ThesisAnalyticsChart";
import CategoryChart from "../components/Analytics/CategoryChart";
import { useState, useEffect } from 'react';
import "../styles/View.css";
import { Card, CardContent, CardHeader } from '@mui/material';
import { Users, FileText, Download } from 'lucide-react';
import { supabase } from "../lib/supabase";
import AnalyticsPDFExport from "../components/Analytics/AnalyticsPDFExport";

export default function Analytics() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalTheses: 0,
    totalUsers: 0
  });
  const [thesesData, setThesesData] = useState<any[]>([]);

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
        
        // Fetch theses data for the report
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
    <div className="admin-dashboard">
      <div className="admin-background-gradient"></div>
      <div className="admin-background-blur"></div>
      <div className="admin-background-radial"></div>
      <Header />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Download Button */}
        <Box display="flex" justifyContent="flex-end" mb={2}>
          <AnalyticsPDFExport />
        </Box>
        {/* Analytics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Total Theses Card */}
          <Grid item xs={12} md={6}>
            <Card className="card-hover" sx={{ height: '100%' }}>
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ 
                      backgroundColor: 'rgba(46, 125, 50, 0.1)', 
                      borderRadius: '50%', 
                      p: 1.5, 
                      mr: 2 
                    }}>
                      <FileText size={28} color="#2e7d32" />
                    </Box>
                    <Typography variant="h6">Total Theses</Typography>
                  </Box>
                }
              />
              <CardContent>
                <Typography variant="h3" fontWeight="bold" sx={{ mb: 1 }}>
                  {stats.totalTheses}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total theses submitted to the platform.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Total Users Card */}
          <Grid item xs={12} md={6}>
            <Card className="card-hover" sx={{ height: '100%' }}>
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ 
                      backgroundColor: 'rgba(156, 39, 176, 0.1)', 
                      borderRadius: '50%', 
                      p: 1.5, 
                      mr: 2 
                    }}>
                      <Users size={28} color="#9c27b0" />
                    </Box>
                    <Typography variant="h6">Total Users</Typography>
                  </Box>
                }
              />
              <CardContent>
                <Typography variant="h3" fontWeight="bold" sx={{ mb: 1 }}>
                  {stats.totalUsers}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Registered users on the platform.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {/* Category Pie Chart */}
          <Grid item xs={12} md={5}>
            <CategoryChart 
              onCategorySelect={handleCategorySelect}
              selectedCategory={selectedCategory}
            />
          </Grid>
          
          {/* Thesis Analytics Bar Chart */}
          <Grid item xs={12} md={7}>
            <ThesisAnalyticsChart selectedCategory={selectedCategory} />
          </Grid>
        </Grid>
      </Container>
    </div>
  );
}