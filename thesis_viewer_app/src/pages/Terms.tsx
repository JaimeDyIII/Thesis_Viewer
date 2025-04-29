import { useState, useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import TermsAndConditionsOverlay from '../components/Terms/TermsAndConditionsOverlay';
import { checkUserExists } from '../api/auth/queries';
import { insertUserAfterAcceptingTermsAndCondition } from '../api/auth/mutation';
import { useAuth } from '../context/AuthContext';
import LoadingOverlay from '../components/Global/LoadingOverlay';
import { usePermissions } from '../context/PermissionsContext';

export default function Terms() {
  const [initialLoading, setInitialLoading] = useState(true);
  const [userSession, setUserSession] = useState<any>(null);
  const navigate = useNavigate();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const hasCheckedRef = useRef(false);
  const { setUserProfile, profile, refreshUserProfile } = useAuth();
  const { refreshPermissions } = usePermissions();
  
  useEffect(() => {
    const getSession = async () => {
        try {
            if (isRedirecting || hasCheckedRef.current) return;
            
            const { data: { session } } = await supabase.auth.getSession();
            
            if (!session) {
                navigate('/login');
                return;
            }

            setUserSession(session);

            const exists = await checkUserExists(session.user.id);
                    
            if (exists === true && profile?.terms_and_condition === true) {
                console.log("User exists in public.users and has accepted terms, redirecting to dashboard");
                setIsRedirecting(true);
                hasCheckedRef.current = true;
                navigate('/dashboard');
            } else {
                setInitialLoading(false); 
                setIsRedirecting(false);
            }

        } catch (error) {
            console.error('Error checking session:', error);
            navigate('/login');
        } finally {
            setInitialLoading(false);
            setIsRedirecting(false);
        }
    };

    getSession();
  }, [profile]);

  const handleTermsAgreed = async () => {
    if (!userSession) return;
    
    try {
      const data = await insertUserAfterAcceptingTermsAndCondition(
        userSession.user.id,
        userSession.user.email,
        userSession.user.user_metadata?.name || userSession.user.email.split('@')[0]
      );

      setUserProfile(data);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating user after terms acceptance:', error);
    } finally {
      refreshUserProfile();
      refreshPermissions();
    }
  };

  if (initialLoading) {
    return <LoadingOverlay />;
  }

  return (
    <Box sx={{ height: '100vh', backgroundColor: '#f7f2ff' }}>
      <TermsAndConditionsOverlay
        userId={userSession?.user?.id}
        onAgree={handleTermsAgreed}
        isLoading={false}
      />
    </Box>
  );
}