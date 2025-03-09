import { Card, CardContent, CardHeader, Typography, Box, Container } from "@mui/material";
import { Eye, Settings } from "lucide-react";
import { Header } from "../components/Header";
import { useNavigate } from "react-router-dom";
import { usePermissions } from "../context/PermissionsContext";

import "../styles/Admin.css";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { permissions } = usePermissions();

  return (
    <div className="admin-dashboard">
      {/* Background Layers */}
      <div className="admin-background-gradient"></div>
      <div className="admin-background-blur"></div>
      <div className="admin-background-radial"></div>

      <Header />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <main className="admin-content">
          <h1>User Management Page</h1>
        </main>
      </Container>
    </div>
  );
}
