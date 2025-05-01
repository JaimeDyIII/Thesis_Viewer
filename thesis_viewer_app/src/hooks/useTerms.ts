import { useState, useEffect, useRef } from 'react';
import { NavigateFunction } from 'react-router-dom';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { checkUserExists } from '../api/auth/queries';
import { insertUserAfterAcceptingTermsAndCondition } from '../api/auth/mutation';
import { useAuth } from '../context/AuthContext';

interface UserProfile {
    terms_and_condition?: boolean;
    [key: string]: any;
  }
  
  interface TermsSessionProps {
    setInitialLoading: React.Dispatch<React.SetStateAction<boolean>>;
    navigate: NavigateFunction;
    profile: UserProfile | null;
    refreshUserProfile: () => void;
    refreshPermissions: () => void;
  }
  
  interface TermsSessionReturn {
    userSession: Session | null;
    isRedirecting: boolean;
    handleTermsAgreed: () => Promise<void>;
  }
  
  export default function useTermsSession({ 
    setInitialLoading, 
    navigate, 
    profile, 
    refreshUserProfile,
    refreshPermissions
  }: TermsSessionProps): TermsSessionReturn {
    const [userSession, setUserSession] = useState<Session | null>(null);
    const [isRedirecting, setIsRedirecting] = useState<boolean>(false);
    const hasCheckedRef = useRef<boolean>(false);
    const { setUserProfile } = useAuth();
  
    useEffect(() => {
      const getSession = async (): Promise<void> => {
        try {
          if (isRedirecting || hasCheckedRef.current) return;
          
          const { data: { session } } = await supabase.auth.getSession();
          
          if (!session) {
            navigate('/login');
            return;
          }
  
          setUserSession(session);
  
          if (session.user?.id) {
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
    }, [profile, isRedirecting, navigate, setInitialLoading]);
  
    const handleTermsAgreed = async (): Promise<void> => {
      if (!userSession || !userSession.user) return;
      
      try {
        const userId = userSession.user.id;
        const userEmail = userSession.user.email || '';
        const userName = userSession.user.user_metadata?.name || userEmail.split('@')[0];
        
        const data = await insertUserAfterAcceptingTermsAndCondition(
          userId,
          userEmail,
          userName
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
  
    return {
      userSession,
      isRedirecting,
      handleTermsAgreed
    };
  }