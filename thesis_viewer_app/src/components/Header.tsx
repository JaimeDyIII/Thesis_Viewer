import { Avatar, Typography, Box, IconButton } from "@mui/material";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { LogoutButton } from "./Authentication/LogoutButton";
import { Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../styles/View.css";

export function Header() {
  const [googleProfilePic, setGoogleProfilePic] = useState(
    "https://lh3.googleusercontent.com/a/default-user"
  );
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        const avatarUrl = session.user.user_metadata.avatar_url;
        if (avatarUrl) {
          setGoogleProfilePic(avatarUrl);
        }

        const name = session.user.user_metadata.full_name || session.user.email;
        setDisplayName(name);

        const { data: userData } = await supabase
          .from("users")
          .select("role")
          .eq("id", session.user.id)
          .single();

        if (userData) {
          setRole(userData.role);
        }
      }
    };

    fetchUserData();
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
        <Avatar src={googleProfilePic} sx={{ width: 50, height: 50 }} />
        <Box>
          <Typography
            variant="h6"
            sx={{
              color: "var(--primary)",
              fontWeight: 600,
              fontSize: 20,
            }}
          >
            Hi! {displayName}, {role}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Thesis Management System
          </Typography>
        </Box>
      </Box>

      <Box display="flex" alignItems="center" gap={2}>
        <IconButton onClick={() => navigate('/dashboard')}>
          <Home size={24} />
        </IconButton>
        <LogoutButton />
      </Box>
    </Box>
  );
}
