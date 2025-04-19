import { Card, CardContent, CardHeader, Typography, Box, Container, Grid } from "@mui/material";
import { Eye, Glasses, User, BarChart2 } from "lucide-react";
import { Header } from "../components/Global/Header";
import { useNavigate } from "react-router-dom";
import { usePermissions } from "../context/PermissionsContext";
import "../styles/View.css";
import { useAuth } from "../context/AuthContext";
import { useState } from 'react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { permissions } = usePermissions();
  const userRole = profile.role;
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const handleCategorySelect = (category: string | null) => {
    setSelectedCategory(category);
  };
  
  return (
    <div className="admin-dashboard">
      {/* Background Layers */}
      <div className="admin-background-gradient"></div>
      <div className="admin-background-blur"></div>
      <div className="admin-background-radial"></div>
      <Header />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <main className="admin-content">
          {/* Main Action Cards */}
          <Box display="grid" gridTemplateColumns={{ xs: "1fr", md: "1fr 1fr" }} gap={4} mb={6}>
            {/* Thesis Repository*/}
            {(permissions?.ThesisRepository_add ||
              permissions?.ThesisRepository_view ||
              permissions?.ThesisRepository_edit ||
              permissions?.ThesisRepository_delete) ?
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
              
            {/* thessaAI */}
            <Card className="card-hover" onClick={() => navigate("/thessaAI")}>
              <CardHeader
                title={
                  <Box className="card-title">
                    <Box className="icon-circle">
                      <Glasses size={28} />
                    </Box>
                    ThessaAI - AI Assistant
                  </Box>
                }
                titleTypographyProps={{ className: "card-title-text" }}
              />
              <CardContent>
                <Typography className="card-description">
                  Ask ThessaAI about the Theses.
                </Typography>
              </CardContent>
            </Card>
              
            {/* User Management */}
            {((userRole === 'Admin' || userRole === 'SuperAdmin') &&
              (permissions?.UserManagement_add ||
                permissions?.UserManagement_view ||
                permissions?.UserManagement_edit ||
                permissions?.UserManagement_delete)) ?
              (
                <Card className="card-hover" onClick={() => navigate("/user-management")}>
                  <CardHeader
                    title={
                      <Box className="card-title">
                        <Box className="icon-circle">
                          <User size={28} />
                        </Box>
                        User Management
                      </Box>
                    }
                    titleTypographyProps={{ className: "card-title-text" }}
                  />
                  <CardContent>
                    <Typography className="card-description">
                      Where the browsing and management of all users are done.
                    </Typography>
                  </CardContent>
                </Card>
              )
              :
              (null)}

            {/* Analytics Card */}
            {!(userRole=='User' || userRole=='Librarian') ? 
              (
                <Card className="card-hover" onClick={() => navigate("/analytics")}>
                  <CardHeader
                    title={
                      <Box className="card-title">
                        <Box className="icon-circle">
                          <BarChart2 size={28} />
                        </Box>
                        Analytics
                      </Box>
                    }
                    titleTypographyProps={{ className: "card-title-text" }}
                  />
                  <CardContent>
                    <Typography className="card-description">
                      View thesis statistics and analytics.
                    </Typography>
                  </CardContent>
                </Card>
              ) 
              : 
              (null)
            }
          </Box>
        </main>
      </Container>
    </div>
  );
}