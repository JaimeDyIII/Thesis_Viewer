import { Card, CardContent, CardHeader, Typography, Box, Container } from "@mui/material";
import { Eye, Settings } from "lucide-react";
import { AdminHeader } from "../components/AdminHeader";
import { useNavigate } from "react-router-dom";
import { usePermissions } from "../context/PermissionsContext";
import "../styles/Admin.css";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { thesisRepositoryPermissions } = usePermissions();


  return (
    <div className="admin-dashboard">
      {/* Background Layers */}
      <div className="admin-background-gradient"></div>
      <div className="admin-background-blur"></div>
      <div className="admin-background-radial"></div>

      <AdminHeader />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <main className="admin-content">
        {/* Main Action Cards */}
        <Box display="grid" gridTemplateColumns={{ xs: "1fr", md: "1fr 1fr" }} gap={4} mb={6}>
          {/* Thesis Repository*/}
          {(thesisRepositoryPermissions?.add || 
          thesisRepositoryPermissions?.view || 
          thesisRepositoryPermissions?.edit || 
          thesisRepositoryPermissions?.delete) ? 
          (
            <Card className="card-hover" onClick={() => navigate("/thesis-repository")}>
              <CardHeader
                title={
                  <Box className="card-title">
                    <Box className="icon-circle">
                      <Eye size={28} />
                    </Box>
                    Thesis Repository
                  </Box>
                }
                titleTypographyProps={{ className: "card-title-text" }}
              />
              <CardContent>
                <Typography className="card-description">
                  Where the browsing and management of all thesis are done.
                </Typography>
              </CardContent>
            </Card>
          ) 
          :
          (null)}
          </Box>
        </main>
      </Container>
    </div>
  );
}
