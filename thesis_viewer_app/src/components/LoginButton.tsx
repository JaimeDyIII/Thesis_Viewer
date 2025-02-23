import { Button } from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import { useAuth } from '../services/AuthContext';

const LoginButton = () => {
    const { handleGoogleLogin } = useAuth();

    return (
        <Button
            variant="outlined"
            size="large"
            className="google-signin-button"
            onClick={handleGoogleLogin}
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
            Sign In
        </Button>
    );
};
export default LoginButton;