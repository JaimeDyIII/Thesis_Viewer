import { Button } from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import { useAuth } from '../services/AuthContext';

const LoginButton = () => {
    const { signInWithGoogle, loading } = useAuth();
    
    return (
        <Button
            variant="outlined"
            size="large"
            className="google-signin-button"
            onClick={!loading ? signInWithGoogle : undefined}
            disabled={loading}
            sx={{
                textTransform: "none",
                borderColor: "#E0E7FF",
                color: "#1E1B4B",
                "&:hover": {
                    backgroundColor: "#EEF2FF",
                    borderColor: "#E0E7FF",
                },
            }}
            startIcon={<GoogleIcon />}
        >
            {loading ? 'Signing in...' : 'Sign in with Google'}
        </Button>
    );
};
export default LoginButton;