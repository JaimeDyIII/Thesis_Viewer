import { Box, Typography, Container, Link, IconButton } from "@mui/material";
import { Phone, Mail, Globe, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../../styles/View.css";

export function Footer() {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      className="site-footer"
      sx={{
        backgroundColor: "rgba(255, 255, 255, 0.5)",
        backdropFilter: "blur(10px)",
        borderTop: "1px solid rgba(0, 0, 0, 0.1)",
        paddingY: { xs: "16px", sm: "24px" },
        paddingX: { xs: "16px", sm: "50px" },
        marginTop: "auto",
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "center", sm: "flex-start" },
            gap: 2,
          }}
        >
          <Box sx={{ textAlign: { xs: "center", sm: "left" } }}>
            <Typography
              variant="h6"
              sx={{
                color: "var(--primary)",
                fontWeight: 600,
                fontSize: { xs: 16, sm: 18 },
                mb: 1,
              }}
            >
              Thesis Management System
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: { xs: 12, sm: 14 } }}
            >
              © {currentYear} All rights reserved
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: { xs: 2, sm: 4 },
              alignItems: "center",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1,
                alignItems: { xs: "center", sm: "flex-start" },
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{ color: "var(--primary)", fontWeight: 600 }}
              >
                Other Links
              </Typography>
              <Link
                component="button"
                variant="body2"
                onClick={() => navigate("/dashboard")}
                underline="hover"
                sx={{ color: "text.secondary" }}
              >
                NEUVLE
              </Link>
              <Link
                component="button"
                variant="body2"
                onClick={() => navigate("/thesis-repository")}
                underline="hover"
                sx={{ color: "text.secondary" }}
              >
                About us
              </Link>
            </Box>

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1,
                alignItems: { xs: "center", sm: "flex-start" },
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{ color: "var(--primary)", fontWeight: 600 }}
              >
                Contact & Policies
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <IconButton size="small" aria-label="address">
                  <MapPin size={18} />
                </IconButton>
                <Typography variant="body2" color="text.secondary">
                  #9 Central Avenue, New Era, Quezon City, Philippines
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <IconButton size="small" aria-label="phone">
                  <Phone size={18} />
                </IconButton>
                <Typography variant="body2" color="text.secondary">
                  289814221
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <IconButton size="small" aria-label="email">
                  <Mail size={18} />
                </IconButton>
                <Typography variant="body2" color="text.secondary">
                  info@neu.edu.ph
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <IconButton size="small" aria-label="website">
                  <Globe size={18} />
                </IconButton>
                <Link
                  href="https://neu.edu.ph"
                  target="_blank"
                  rel="noopener"
                  underline="hover"
                  sx={{ color: "text.secondary" }}
                >
                  neu.edu.ph
                </Link>
              </Box>
              <Link
                component="button"
                variant="body2"
                onClick={() => navigate("../Global/privacypolicy")}
                underline="hover"
                sx={{ color: "text.secondary" }}
              >
                Privacy Policy
              </Link>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}