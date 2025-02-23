import { Button, Card } from "@mui/material";
import { motion } from "framer-motion";
import GoogleIcon from "@mui/icons-material/Google";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import EmailErrorPopup from "../components/EmailErrorPopup"; // Import error popup
import { useAuth } from "../services/AuthContext"; // Import Auth Context
import "../styles/Login.css"; // Import styles

const Login: React.FC = () => {
  const { handleGoogleLogin, showError, setShowError } = useAuth(); // Use Auth Context

  return (
    <div className="login-container">
      {/* Background Elements */}
      <div className="background-gradient"></div>
      <div className="background-blur"></div>
      <div className="background-radial"></div>

      {/* Centered Login Card */}
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
              onClick={handleGoogleLogin} // Call login function
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

      {/* Alert Pop-up (Only shows when showError is true) */}
      <EmailErrorPopup open={showError} onClose={() => setShowError(false)} />
    </div>
  );
};

export default Login;