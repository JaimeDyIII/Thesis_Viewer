import { Box, Paper, useMediaQuery, useTheme } from "@mui/material";
import { usePermissions } from "../../context/PermissionsContext";
import { Header } from "../../components/Global/Header";
import HeroSection from "../../components/Dashboard/HeroSection";
import FeaturedThesis from "../../components/Dashboard/FeaturedThesis";
import LatestUploads from "../../components/Dashboard/LatestUploads";
import RecentlyRead from "../../components/Dashboard/RecentlyRead";
import AIAssistant from "../../components/Dashboard/AIAssistant";
import '../../styles/Dashboard.css';

export default function Dashboard() {
  const { permissions } = usePermissions();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box className="root">
      <Header />
      <Box className="patterned-background">
      <Box className="content-container">
          <HeroSection />
        
        {permissions?.ThesisRepository_view && ( 
            <Paper
              elevation={3}
              className="white-container"
              sx={{
                borderRadius: 4
              }}
            >
              <FeaturedThesis />
              <LatestUploads />
              <RecentlyRead />
            </Paper>
          )}
        </Box>
        {!isMobile && <AIAssistant />}
      </Box>
    </Box>
  );
}