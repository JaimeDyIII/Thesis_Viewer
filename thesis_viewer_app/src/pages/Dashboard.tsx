import { useState, useEffect } from 'react';
import { Box, Paper, Container, useMediaQuery, useTheme } from "@mui/material";
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
  const { profile } = useAuth();
  const { permissions } = usePermissions();
  const [showTerms, setShowTerms] = useState<boolean>(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const checkTermsAndConditions = async () => {
      if (profile) {
        const { data, error } = await supabase
          .from('users')
          .select('terms_and_condition')
          .eq('id', profile.id)
          .single();

        if (error) {
          console.error('Error fetching terms and conditions:', error);
          return;
        }

        if (data && !data.terms_and_condition) {
          setShowTerms(true);
        }
      }
    };

    checkTermsAndConditions();
  }, [profile]);

  const handleTermsAgreed = () => {
    setShowTerms(false);
  };

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
      {showTerms && (
        <TermsAndConditionsOverlay
          userId={profile.id}
          onAgree={handleTermsAgreed}
        />
      )}
    </Box>
  );
}