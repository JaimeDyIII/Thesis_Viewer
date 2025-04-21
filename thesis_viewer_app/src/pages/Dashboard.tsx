// Dashboard.tsx
import { useState, useEffect } from 'react';
import { Box, Container } from "@mui/material";
import { useNavigate } from 'react-router-dom';
import { usePermissions } from "../context/PermissionsContext";
import { useAuth } from "../context/AuthContext";
import { supabase } from '../lib/supabase';
import TermsAndConditionsOverlay from '../components/Terms/TermsAndConditionsOverlay';
import { Header } from "../components/Global/Header";
import HeroSection from "../components/Dashboard/HeroSection";
import ThesisCarousel from "../components/Dashboard/ThesisCarousel";
import LatestUploads from "../components/Dashboard/LatestUploads";
import AIAssistant from "../components/Dashboard/AIAssistant";
import '../styles/Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { permissions } = usePermissions();
  const userRole = profile.role;
  const [showTerms, setShowTerms] = useState<boolean>(false);

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
    <Box className="dashboard-root">
      <Header />
      <Box className="dashboard-patterned-background">
        <HeroSection />
        <Container maxWidth="lg" className="dashboard-white-container">
          <ThesisCarousel permissions={permissions} navigate={navigate} userRole={userRole} />
          <LatestUploads permissions={permissions} navigate={navigate} userRole={userRole} />
        </Container>
        <AIAssistant />
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
