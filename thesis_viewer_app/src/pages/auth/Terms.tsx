import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usePermissions } from '../../context/PermissionsContext';
import useTermsSession from '../../hooks/useTerms';
import LoadingOverlay from '../../components/Global/LoadingOverlay';
import TermsAndConditionsOverlay from '../../components/Terms/TermsAndConditionsOverlay';
import { Box } from '@mui/material';

const Terms: React.FC = () => {
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const { profile, refreshUserProfile } = useAuth();
  const { refreshPermissions } = usePermissions();
  
  const { 
    userSession, 
    handleTermsAgreed 
  } = useTermsSession({ 
    setInitialLoading, 
    navigate, 
    profile, 
    refreshUserProfile, 
    refreshPermissions 
  });

  if (initialLoading) {
    return <LoadingOverlay />;
  }

  return (
    <Box sx={{ height: '100vh', backgroundColor: '#f7f2ff' }}>
      <TermsAndConditionsOverlay
        userId={userSession?.user?.id || ''}
        onAgree={handleTermsAgreed}
        isLoading={false}
      />
    </Box>
  );
}

export default Terms;