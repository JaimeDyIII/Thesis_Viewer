import { Avatar, Typography, Box } from "@mui/material";
import { useEffect, useState } from "react";
import { supabase } from "../config";
import {LogoutButton} from "./LogoutButton";
import "../styles/Admin.css";

export function AdminHeader() {
  const [googleProfilePic, setGoogleProfilePic] = useState(
    "https://lh3.googleusercontent.com/a/default-user"
  );

  useEffect(() => {
    const fetchProfilePic = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        const avatarUrl = session.user.user_metadata.avatar_url;
        if (avatarUrl) {
          setGoogleProfilePic(avatarUrl);
        }
      }
    };

    fetchProfilePic();
  }, []);

  return (
    <Box
      component="header"
      className="admin-header"
      sx={{
        backgroundColor: "rgba(255, 255, 255, 0.5)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
        paddingY: "16px",
        paddingX: "50px",
        height: "60px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Box display="flex" alignItems="center" gap={2}>
        {/* Google Profile Picture */}
        <Avatar
          src={googleProfilePic}
          sx={{ width: 50, height: 50 }}
        />
        
        <Box>
          {/* Admin Dashboard Title */}
          <Typography
            variant="h6"
            component="a"
            href="/admin"
            sx={{
              color: "var(--primary)",
              fontWeight: 600,
              fontSize: 24,
              textDecoration: "none",
              cursor: "pointer",
              "&:hover": {
                color: "var(--primary-hover) !important",
              },
            }}
          >
            Admin Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Thesis Management System
          </Typography>
        </Box>
      </Box>

      {/* Logout Button */}
        <LogoutButton />
    </Box>
  );
}
