import { Button, Card, Alert, Snackbar } from "@mui/material";
import { motion } from "framer-motion";
import GoogleIcon from "@mui/icons-material/Google";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import EmailErrorPopup from "../../components/Authentication/EmailErrorPopup";
import { useAuth } from "../../context/AuthContext";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import "../../styles/Login.css";

const Login: React.FC = () => {
  const { handleGoogleLogin, showError, setShowError } = useAuth();
  const location = useLocation();
  const [banMessage, setBanMessage] = useState<string | null>(null);

  useEffect(() => {
    if (location.hash === '#banned') {
      setBanMessage('You have been banned from accessing the system.');
    }
  }, [location]);

  return (
    <div
      className="login-container patterned-background"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="content-container"
        style={{ maxWidth: 400, width: "100%" }}
      >
        <Card className="white-container" sx={{ borderRadius: 4, p: 4 }}>
          <div
            className="login-content"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            {/* Icon */}
            <div style={{ marginBottom: 16 }}>
              <MenuBookIcon
                sx={{ fontSize: 50, color: "var(--heading-blue)" }}
              />
            </div>

            {/* Title & Subtitle */}
            <h1
              className="text-heading"
              style={{ margin: 0, marginBottom: 8, color: "var(--heading-blue)" }}
            >
              Thesis Viewer
            </h1>
            <p className="text-muted" style={{ margin: 0, marginBottom: 24 }}>
              Sign in with your institutional email
            </p>

            {/* Google Sign-In Button */}
            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={handleGoogleLogin}
              sx={{
                textTransform: "none",
                backgroundColor: "var(--heading-blue)",
                color: "var(--white)",
                "&:hover": {
                  backgroundColor: "var(--button-hover-blue)",
                },
                borderRadius: 2,
                paddingY: 1.5,
              }}
              startIcon={<GoogleIcon />}
            >
              Sign in with Google
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Alerts */}
      <EmailErrorPopup open={showError} onClose={() => setShowError(false)} />
      <Snackbar
        open={!!banMessage}
        autoHideDuration={6000}
        onClose={() => setBanMessage(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          severity="error" 
          onClose={() => setBanMessage(null)}
          sx={{ width: '100%' }}
        >
          {banMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Login;
