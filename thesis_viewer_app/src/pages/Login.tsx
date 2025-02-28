import { Button, Card } from "@mui/material";
import { motion } from "framer-motion";
import GoogleIcon from "@mui/icons-material/Google";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import EmailErrorPopup from "../components/EmailErrorPopup";
import { useAuth } from "../services/AuthContext";
import "../styles/Login.css";

const Login: React.FC = () => {
  const { handleGoogleLogin, showError, setShowError } = useAuth();

  return (
    <div className="login-container">
      {/* Background Layers */}
      <div className="login-background-gradient"></div>
      <div className="login-background-blur"></div>
      <div className="login-background-radial"></div>


      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="login-box"
      >
        <div className="glass-overlay"></div>

        <Card className="login-card">
          <div className="login-content">
            {/* Icon Wrapper */}
            <div className="login-icon-wrapper">
              <MenuBookIcon sx={{ fontSize: 40, color: "#4F46E5" }} />
            </div>

            {/* Title & Subtitle */}
            <div className="text-center">
              <h1 className="login-title">Thesis Viewer</h1>
              <p className="login-subtitle">Sign in with your institutional email</p>
            </div>

            {/* Google Sign-In Button */}
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
              Sign in with Google
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Alert Pop-up */}
      <EmailErrorPopup open={showError} onClose={() => setShowError(false)} />
    </div>
  );
};

export default Login;