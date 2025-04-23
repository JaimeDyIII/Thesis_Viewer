import { useState, useEffect, useRef } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import TermsAndConditionsOverlay from '../components/Terms/TermsAndConditionsOverlay';
import { checkUserExists } from '../api/auth/queries';
import { insertUserAfterAcceptingTermsAndCondition } from '../api/auth/mutation';

export default function Terms() {
  const [loading, setLoading] = useState(true);
  const [userSession, setUserSession] = useState<any>(null);
  const navigate = useNavigate();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const hasCheckedRef = useRef(false);

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
                    
            if (exists === true) {
                console.log("User exists in public.users, redirecting to dashboard");
                setIsRedirecting(true);
                hasCheckedRef.current = true;
                navigate('/dashboard');
            } else if (exists === false) {
                setLoading(false); 
                setIsRedirecting(false);
            }

        } catch (error) {
            console.error('Error checking session:', error);
            navigate('/login');
        } finally {
            setLoading(false);
            setIsRedirecting(false);
        }
    };

    getSession();
  }, []);

  const handleTermsAgreed = async () => {
    if (!userSession) return;
    
    try {
      await insertUserAfterAcceptingTermsAndCondition(
        userSession.user.id,
        userSession.user.email,
        userSession.user.user_metadata?.name || userSession.user.email.split('@')[0]
      );
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating user after terms acceptance:', error);
    }
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: '#f7f2ff'
      }}>
        <CircularProgress color="secondary" />
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100vh', backgroundColor: '#f7f2ff' }}>
      <TermsAndConditionsOverlay
        userId={userSession?.user?.id}
        onAgree={handleTermsAgreed}
      />
    </Box>
  );
}