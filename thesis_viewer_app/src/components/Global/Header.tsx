import { Avatar, Typography, Box, IconButton, Menu, MenuItem, Button } from "@mui/material";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useNavigate } from "react-router-dom";
import "../../styles/View.css";

export function Header() {
  const [googleProfilePic, setGoogleProfilePic] = useState("https://lh3.googleusercontent.com/a/default-user");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState("");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        const avatarUrl = session.user.user_metadata.avatar_url;
        if (avatarUrl) setGoogleProfilePic(avatarUrl);

        const name = session.user.user_metadata.full_name || session.user.email;
        setDisplayName(name);

        const { data: userData } = await supabase
          .from("users")
          .select("role")
          .eq("id", session.user.id)
          .single();

        if (userData) setRole(userData.role);
      }
    };

    fetchUserData();
  }, []);

  const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <Box
      component="header"
      className="admin-header"
      sx={{
        backgroundColor: "rgba(255, 255, 255, 0.5)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
        px: { xs: 2, sm: 6 },
        py: 1.5,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      {/* Left - Logo */}
      <Box 
        className="logo" 
        display="flex" 
        alignItems="center" 
        gap={1} 
        onClick={() => navigate("/dashboard")}
        sx={{ 
          fontWeight: 700, 
          color: "#4682A9", 
          cursor: "pointer", 
          "&:hover": {
            opacity: 0.85
          }
        }}
      >
        <img 
          src="/favicon.ico" 
          alt="logo" 
          className="favicon" 
          style={{ width: 30, height: 30 }} 
        />
        <Typography 
          variant="h6" 
          sx={{ fontWeight: 700, color: "#4682A9" }}
        >
          ThesisViewer
        </Typography>
      </Box>

      {/* Middle - Discover & Bookmarks */}
      <Box display="flex" gap={4}>
        <Typography
          variant="button"
          onClick={() => navigate("/view-thesis")}
          sx={{
            cursor: "pointer",
            color: "#4682A9",
            fontWeight: 600,
            "&:hover": { color: "#749BC2" },
          }}
        >
          Discover
        </Typography>
        <Typography
          variant="button"
          onClick={() => navigate("/bookmarks")}
          sx={{
            cursor: "pointer",
            color: "#4682A9",
            fontWeight: 600,
            "&:hover": { color: "#749BC2" },
          }}
        >
          Bookmarks
        </Typography>
      </Box>

      {/* Right - Avatar with Dropdown */}
      <Box display="flex" alignItems="center">
        <IconButton onClick={handleAvatarClick}>
          <Avatar src={googleProfilePic} sx={{ width: 44, height: 44 }} />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          PaperProps={{
            elevation: 3,
            sx: {
              borderRadius: 2,
              mt: 1.5,
              minWidth: 180,
              px: 2,
              py: 1.5,
              backgroundColor: "#fff",
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#4682A9" }}>
            {displayName}
          </Typography>
          <Typography variant="body2" sx={{ color: "#777", mb: 1 }}>
            {role}
          </Typography>
          <MenuItem onClick={handleLogout} sx={{ color: "#4682A9", fontWeight: 500 }}>
            Logout
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );
}