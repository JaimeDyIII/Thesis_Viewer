import { useState, useEffect, useRef } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import TermsAndConditionsOverlay from '../components/Terms/TermsAndConditionsOverlay';
import { checkUserExists } from '../api/auth/queries';
import { insertUserAfterAcceptingTermsAndCondition } from '../api/auth/mutation';
import { useAuth } from '../context/AuthContext';

export default function Terms() {
  const [loading, setLoading] = useState(true);
  const [insertLoading, setInsertLoading] = useState(false);
  const [userSession, setUserSession] = useState<any>(null);
  const navigate = useNavigate();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const hasCheckedRef = useRef(false);
  const { setUserProfile, profile } = useAuth();

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
  }, [profile]);

  const handleTermsAgreed = async () => {
    if (!userSession) return;
    
    try {
        setInsertLoading(true);

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
        setInsertLoading(false);
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
        isLoading={insertLoading}
      />
    </Box>
  );
}