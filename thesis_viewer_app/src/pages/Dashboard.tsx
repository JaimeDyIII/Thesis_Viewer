import { useState, useEffect } from 'react';
import { Box, Container, useMediaQuery, useTheme } from "@mui/material";
import { usePermissions } from "../context/PermissionsContext";
import { useAuth } from "../context/AuthContext";
import { supabase } from '../lib/supabase';
import TermsAndConditionsOverlay from '../components/Terms/TermsAndConditionsOverlay';
import { Header } from "../components/Global/Header";
import HeroSection from "../components/Dashboard/HeroSection";
import FeaturedThesis from "../components/Dashboard/FeaturedThesis";
import LatestUploads from "../components/Dashboard/LatestUploads";
import RecentlyRead from "../components/Dashboard/RecentlyRead";
import AIAssistant from "../components/Dashboard/AIAssistant";
import '../styles/Dashboard.css';

export default function Dashboard() {
  const { permissions } = usePermissions();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));



  return (
    <Box className="root">
      <Header />
      <Box className="patterned-background">
        <Box sx={{ pt: 5 }}>
          <HeroSection />
        </Box>
        {permissions?.ThesisRepository_view && (
        <Container maxWidth="lg" className="white-container">
          <FeaturedThesis />
          <LatestUploads />
          <RecentlyRead />
        </Container>
        )}
        {!isMobile && <AIAssistant />}
      </Box>
    </Box>
  );
}
