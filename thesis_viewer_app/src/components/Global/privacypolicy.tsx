import { Container, Typography, Box, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield } from "lucide-react";
import "../../styles/View.css";

export default function PrivacyPolicy() {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#f8f9fa",
      }}
    >
      {/* Custom header for privacy policy */}
      <Box
        component="header"
        sx={{
          width: '100%',
          backgroundColor: 'rgba(244, 237, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(155, 104, 255, 0.2)',
          padding: '16px 32px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Box 
            onClick={() => navigate(-1)} 
            sx={{ 
              cursor: 'pointer',
              display: 'flex',
              color: '#6E3CBC',
              '&:hover': { opacity: 0.8 }
            }}
          >
            <ArrowLeft size={20} />
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography
              variant="h6"
              sx={{
                color: '#6E3CBC',
                fontWeight: 500,
                fontSize: { xs: 16, md: 18 },
                ml: 0.5
              }}
            >
              Thesis Viewer
            </Typography>
            <Typography 
              sx={{ 
                color: '#6E3CBC', 
                fontSize: 14, 
                opacity: 0.9,
                mx: 1
              }}
            >
              /
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Shield size={16} color="#6E3CBC" />
              <Typography
                sx={{
                  color: '#6E3CBC',
                  fontSize: { xs: 14, md: 16 },
                }}
              >
                Privacy Policy
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
      
      <Container maxWidth="lg" sx={{ flex: 1, py: 4 }}>
        {/* Policy Content */}
        <Paper 
          elevation={0}
          sx={{ 
            p: { xs: 3, md: 5 }, 
            borderRadius: 2,
            boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
            mb: 4,
          }}
        >
          <Typography variant="subtitle1" gutterBottom sx={{ color: "text.secondary" }}>
            Last Updated: April 20, 2025
          </Typography>

          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
              1. Introduction
            </Typography>
            <Typography paragraph>
              Welcome to the Thesis Management System. We respect your privacy and are committed to protecting your personal data. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
            </Typography>
          </Box>

          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
              2. Data We Collect
            </Typography>
            
            <Typography variant="h6" gutterBottom sx={{ mt: 2, fontWeight: 600 }}>
              2.1 Personal Information
            </Typography>
            <ul>
              <li>
                <Typography>Name, email address, and contact details</Typography>
              </li>
              <li>
                <Typography>Academic credentials and institutional affiliations</Typography>
              </li>
              <li>
                <Typography>User account information and authentication data</Typography>
              </li>
              <li>
                <Typography>User preferences and settings</Typography>
              </li>
            </ul>

            <Typography variant="h6" gutterBottom sx={{ mt: 2, fontWeight: 600 }}>
              2.2 Thesis and Academic Materials
            </Typography>
            <ul>
              <li>
                <Typography>Thesis documents, research papers, and related materials</Typography>
              </li>
              <li>
                <Typography>Metadata related to your academic work</Typography>
              </li>
              <li>
                <Typography>Version history and submission records</Typography>
              </li>
              <li>
                <Typography>Comments, feedback, and review information</Typography>
              </li>
            </ul>

            <Typography variant="h6" gutterBottom sx={{ mt: 2, fontWeight: 600 }}>
              2.3 System Usage Data
            </Typography>
            <ul>
              <li>
                <Typography>Log data and access timestamps</Typography>
              </li>
              <li>
                <Typography>Device information and IP addresses</Typography>
              </li>
              <li>
                <Typography>Browser type and system configuration</Typography>
              </li>
              <li>
                <Typography>User interaction patterns with the platform</Typography>
              </li>
            </ul>
          </Box>

          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
              3. How We Use Your Data
            </Typography>
            <Typography paragraph>
              We use your information for the following purposes:
            </Typography>
            <ul>
              <li>
                <Typography>Providing and maintaining the Thesis Management System</Typography>
              </li>
              <li>
                <Typography>Processing and facilitating thesis submissions and reviews</Typography>
              </li>
              <li>
                <Typography>Communication regarding system updates and academic requirements</Typography>
              </li>
              <li>
                <Typography>Improving our platform's functionality and user experience</Typography>
              </li>
              <li>
                <Typography>Analytics to enhance system performance and features</Typography>
              </li>
            </ul>
          </Box>

          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
              4. Data Storage and Security
            </Typography>
            
            <Typography variant="h6" gutterBottom sx={{ mt: 2, fontWeight: 600 }}>
              4.1 Data Protection Measures
            </Typography>
            <ul>
              <li>
                <Typography>All data is encrypted both during transmission and at rest</Typography>
              </li>
              <li>
                <Typography>Access controls limit data availability to authorized personnel only</Typography>
              </li>
              <li>
                <Typography>Regular security audits and vulnerability assessments</Typography>
              </li>
              <li>
                <Typography>Automated threat detection and monitoring systems</Typography>
              </li>
              <li>
                <Typography>Regular data backups in secure, redundant storage systems</Typography>
              </li>
            </ul>

            <Typography variant="h6" gutterBottom sx={{ mt: 2, fontWeight: 600 }}>
              4.2 Data Retention
            </Typography>
            <Typography paragraph>
              We retain your personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, 
              unless a longer retention period is required for legal, academic, or regulatory compliance.
            </Typography>
          </Box>

          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
              5. Thesis Repository and Intellectual Property
            </Typography>
            
            <Typography variant="h6" gutterBottom sx={{ mt: 2, fontWeight: 600 }}>
              5.1 Academic Jurisdiction
            </Typography>
            <Typography paragraph>
              All theses stored in our repository remain under school premises and jurisdiction. The copyright and intellectual 
              property rights of theses remain with their original authors, subject to your institution's academic policies.
            </Typography>

            <Typography variant="h6" gutterBottom sx={{ mt: 2, fontWeight: 600 }}>
              5.2 Access Limitations
            </Typography>
            <Typography paragraph>
              Access to thesis materials is restricted based on institutional policies and permissions set by academic administrators. 
              Public access to thesis content is provided only when explicitly authorized by both the author and the institution.
            </Typography>
          </Box>

          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
              6. Compliance with Privacy Laws
            </Typography>
            <Typography paragraph>
              This Privacy Policy is designed to comply with applicable data protection laws, including but not limited to:
            </Typography>
            <ul>
              <li>
                <Typography>Family Educational Rights and Privacy Act (FERPA)</Typography>
              </li>
              <li>
                <Typography>General Data Protection Regulation (GDPR) where applicable</Typography>
              </li>
              <li>
                <Typography>State-specific privacy laws such as the California Consumer Privacy Act (CCPA)</Typography>
              </li>
              <li>
                <Typography>Institutional policies governing academic records and research data</Typography>
              </li>
            </ul>
            <Typography paragraph>
              We regularly review our privacy practices to ensure continued compliance with evolving privacy regulations and academic standards.
            </Typography>
          </Box>

          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
              7. Your Privacy Rights
            </Typography>
            <Typography paragraph>
              Depending on your location, you may have the right to:
            </Typography>
            <ul>
              <li>
                <Typography>Access personal data we hold about you</Typography>
              </li>
              <li>
                <Typography>Correct inaccurate or incomplete data</Typography>
              </li>
              <li>
                <Typography>Request deletion of your personal data</Typography>
              </li>
              <li>
                <Typography>Restrict or object to certain processing of your data</Typography>
              </li>
              <li>
                <Typography>Request transfer of your data in a structured format</Typography>
              </li>
              <li>
                <Typography>Withdraw consent for specific data processing activities</Typography>
              </li>
            </ul>
          </Box>

          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
              8. Data Sharing and Third Parties
            </Typography>
            <Typography paragraph>
              We may share your information with:
            </Typography>
            <ul>
              <li>
                <Typography>Academic administrators and faculty within your institution</Typography>
              </li>
              <li>
                <Typography>External reviewers approved by your institution</Typography>
              </li>
              <li>
                <Typography>Third-party service providers who help us operate the platform</Typography>
              </li>
              <li>
                <Typography>Regulatory authorities when legally required</Typography>
              </li>
            </ul>
            <Typography paragraph>
              We do not sell your personal information to third parties or use it for advertising purposes.
            </Typography>
          </Box>

          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
              9. International Data Transfers
            </Typography>
            <Typography paragraph>
              If data is transferred internationally, we implement appropriate safeguards to ensure your information 
              receives protection consistent with this Privacy Policy and applicable laws.
            </Typography>
          </Box>

          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
              10. Changes to This Policy
            </Typography>
            <Typography paragraph>
              We may update this Privacy Policy periodically to reflect changes in our practices or for legal, operational, 
              or regulatory reasons. We will notify users of any material changes through the platform.
            </Typography>
          </Box>

          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
              11. Contact Us
            </Typography>
            <Typography paragraph>
              If you have questions or concerns about this Privacy Policy or our data practices, please contact:
            </Typography>
            <Box sx={{ mt: 2, pl: 2 }}>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>Privacy Officer</Typography>
              <Typography>Thesis Management System</Typography>
              <Typography>Email: privacy@thesisViewer.edu</Typography>
              <Typography>Phone: +1 (555) 123-4567</Typography>
            </Box>
          </Box>
        </Paper>

        {/* Last Updated Section */}
        <Box sx={{ textAlign: "center", mt: 3, color: "text.secondary" }}>
          <Typography variant="body2">
            © {currentYear} Thesis Management System. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}