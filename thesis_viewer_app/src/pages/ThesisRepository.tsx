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
            
            {/* View Thesis Card */}
            {thesisRepositoryPermissions?.view ? (

            <Card className="card-hover" onClick={() => navigate("/view-thesis")}>
              <CardHeader
                title={
                  <Box className="card-title">
                    <Box className="icon-circle">
                      <Eye size={28} />
                    </Box>
                    View Thesis
                  </Box>
                }
                titleTypographyProps={{ className: "card-title-text" }}
              />
              <CardContent>
                <Typography className="card-description">
                  Browse and view all the thesis in the system.
                </Typography>
              </CardContent>
            </Card>
            ) : (null)}

            {/* Manage Thesis Card */}
            {(thesisRepositoryPermissions?.add || 
              thesisRepositoryPermissions?.edit || 
              thesisRepositoryPermissions?.delete) ? 
              (
              <Card className="card-hover" onClick={() => navigate("/manage-thesis")}>
                <CardHeader
                  title={
                    <Box className="card-title">
                      <Box className="icon-circle">
                        <Settings size={28} />
                      </Box>
                      Manage Thesis
                    </Box>
                  }
                  titleTypographyProps={{ className: "card-title-text" }}
                />
                <CardContent>
                  <Typography className="card-description">
                    Add, Edit, Delete and control thesis visibility.
                  </Typography>
                </CardContent>
              </Card>
              ) : (null)}
          </Box>
        </main>
      </Container>
    </div>
  );
}
