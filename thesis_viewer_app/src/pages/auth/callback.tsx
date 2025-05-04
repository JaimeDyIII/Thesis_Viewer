import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingOverlay from '../../components/Global/LoadingOverlay';

function AuthCallback() {
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  
  useEffect(() => {
    if (!loading) {
      navigate('/dashboard', { replace: true });
    }
  }, [loading, navigate]);
  
  return <LoadingOverlay />;
}