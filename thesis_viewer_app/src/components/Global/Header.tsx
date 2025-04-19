import { Avatar, Typography, Box, IconButton } from "@mui/material";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { LogoutButton } from "../Authentication/LogoutButton";
import { Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Notifications from "../Notifications/Notifications";
import "../../styles/View.css";

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
        paddingX: { xs: "16px", sm: "50px" }, // Responsive padding
        height: { xs: "70px", sm: "60px" },   // Responsive height
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Box display="flex" alignItems="center" gap={{ xs: 1, sm: 2 }}> {/* Responsive gap */}
        <Avatar 
          src={googleProfilePic} 
          className="header-avatar"
          sx={{ 
            width: { xs: 40, sm: 50 }, 
            height: { xs: 40, sm: 50 } 
          }} 
        />
        <Box className="header-info">
          <Typography
            variant="h6"
            className="header-title"
            sx={{
              color: "var(--primary)",
              fontWeight: 600,
              fontSize: { xs: 16, sm: 20 },  // Responsive font size
              overflow: { xs: "hidden", sm: "visible" },
              textOverflow: { xs: "ellipsis", sm: "clip" },
              whiteSpace: { xs: "nowrap", sm: "normal" },
            }}
          >
            Hi! {displayName}, {role}
          </Typography>
          <Typography 
            variant="body2" 
            color="text.secondary"
            className="header-subtitle"
            sx={{
              fontSize: { xs: 12, sm: 14 }, // Responsive font size
            }}
          >
            Thesis Management System
          </Typography>
        </Box>
      </Box>
  
      <Box 
        display="flex" 
        alignItems="center" 
        className="header-actions"
        gap={{ xs: 1, sm: 2 }} // Responsive gap
      >
        <IconButton 
          onClick={() => navigate('/dashboard')}
          className="header-icon-button"
          sx={{ padding: { xs: 0.75, sm: 1 } }} // Responsive padding
        >
          <Home size={24} />
        </IconButton>
        
        {/* Using our updated Notifications component */}
        <Notifications />
        
        <LogoutButton />
      </Box>
    </Box>
  );
}