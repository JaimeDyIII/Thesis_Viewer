import { Button, Card } from "@mui/material";
import { motion } from "framer-motion";
import GoogleIcon from "@mui/icons-material/Google";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import EmailErrorPopup from "../../components/Authentication/EmailErrorPopup";
import { useAuth } from "../../context/AuthContext";
import "../../styles/Login.css";

const Login: React.FC = () => {
  const { handleGoogleLogin, showError, setShowError } = useAuth();

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

      {/* Alert */}
      <EmailErrorPopup open={showError} onClose={() => setShowError(false)} />
    </div>
  );
};

export default Login;
