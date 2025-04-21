import { Box, Typography, Container, Link } from "@mui/material";
import { Mail, Globe, MapPin, Phone, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../../styles/Footer.css";

export function Footer() {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  return (
    <Box component="footer" className="site-footer">
      <Container maxWidth="lg" className="footer-container">
        <Box className="footer-top">
          <Box className="footer-logo-title">
            <img src="favicon.ico" alt="logo" className="footer-favicon" />
            <Typography variant="h6" className="footer-title">
              Thesis Viewer
            </Typography>
          </Box>

          <Box className="footer-section">
            <Typography variant="subtitle2" className="footer-heading">
              Contacts
            </Typography>
            <Box className="footer-item">
              <Mail size={16} className="footer-icon" />
              <Typography variant="body2" className="footer-text">
                info@neu.edu.ph
              </Typography>
            </Box>
            <Box className="footer-item">
              <Phone size={16} className="footer-icon" />
              <Typography variant="body2" className="footer-text">
                289814221
              </Typography>
            </Box>
            <Box className="footer-item">
              <MapPin size={16} className="footer-icon" />
              <Typography variant="body2" className="footer-text">
                #9 Central Avenue, New Era, Quezon City, Philippines
              </Typography>
            </Box>
          </Box>

          <Box className="footer-section">
            <Typography variant="subtitle2" className="footer-heading">
              Links
            </Typography>
            <Box className="footer-item">
              <Globe size={16} className="footer-icon" />
              <Link
                href="https://neuvle.neu.edu.ph/"
                target="_blank"
                rel="noopener"
                className="footer-link"
              >
                NEUVLE
              </Link>
            </Box>
            <Box className="footer-item">
              <Shield size={16} className="footer-icon" />
              <Link
                component="button"
                onClick={() => navigate("../Global/privacypolicy")}
                className="footer-link"
              >
                Privacy Policy
              </Link>
            </Box>
            
            <Typography
              variant="body2"
              className="footer-copyright"
              style={{ marginTop: "6px" }}
            >
              © {currentYear} All rights reserved
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}