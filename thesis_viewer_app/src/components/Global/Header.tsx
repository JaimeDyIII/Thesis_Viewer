import { Avatar, Typography, Box, IconButton, Menu, MenuItem } from "@mui/material";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useNavigate, useLocation } from "react-router-dom";
import { BookOpenText, BarChart2, UserCog, LayoutDashboard, Compass, Bookmark, LogOut } from "lucide-react";
import { usePermissions } from "../../context/PermissionsContext";
import { useAuth } from "../../context/AuthContext";
import "../../styles/Header.css";

export function Header() {
  const [googleProfilePic, setGoogleProfilePic] = useState("https://lh3.googleusercontent.com/a/default-user");
  const [displayName, setDisplayName] = useState("");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const open = Boolean(anchorEl);
  const navigate = useNavigate();
  const location = useLocation();
  const { permissions } = usePermissions();
  const { profile } = useAuth();

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        const avatarUrl = session.user.user_metadata.avatar_url;
        if (avatarUrl) setGoogleProfilePic(avatarUrl);

        const name = session.user.user_metadata.full_name || session.user.email;
        setDisplayName(name);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const controlNavbar = () => {
      if (typeof window !== 'undefined') { 
        if (window.scrollY > lastScrollY) {
          setVisible(false);
        } else {
          setVisible(true);
        }
        setLastScrollY(window.scrollY);
      }
    };

    window.addEventListener('scroll', controlNavbar);
    return () => window.removeEventListener('scroll', controlNavbar);
  }, [lastScrollY]);

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

  const isActive = (path: string) => location.pathname === path;

  return (
    <Box component="header" className={`header ${visible ? 'visible' : 'hidden'}`}>
      <Box className="logo-container">
        <img src="/favicon.ico" alt="logo" className="logo-icon" />
        <Typography variant="h6" className="logo-text">
          ThesisViewer
        </Typography>
      </Box>

      <Box className="nav-links">
        <Typography
          variant="button"
          onClick={() => navigate("/dashboard")}
          className={`nav-link ${isActive("/dashboard") ? 'active' : ''}`}
        >
          <LayoutDashboard size={18} /> Dashboard
        </Typography>

        <Typography
          variant="button"
          onClick={() => navigate("/view-thesis")}
          className={`nav-link ${isActive("/view-thesis") ? 'active' : ''}`}
        >
          <Compass size={18} /> Discover
        </Typography>

        <Typography
          variant="button"
          onClick={() => navigate("/bookmarks")}
          className={`nav-link ${isActive("/bookmarks") ? 'active' : ''}`}
        >
          <Bookmark size={18} /> Bookmarks
        </Typography>

        {(permissions?.ThesisRepository_add ||
          permissions?.ThesisRepository_view ||
          permissions?.ThesisRepository_edit ||
          permissions?.ThesisRepository_delete) ? (
          <Typography
            variant="button"
            onClick={() => navigate("/thesis-repository")}
            className={`nav-link ${isActive("/thesis-repository") ? 'active' : ''}`}
          >
            <BookOpenText size={18} /> Manage Thesis
          </Typography>
        ) : null}

        {!(profile?.role === 'User' || profile?.role === 'Librarian') ? (
          <Typography
            variant="button"
            onClick={() => navigate("/analytics")}
            className={`nav-link ${isActive("/analytics") ? 'active' : ''}`}
          >
            <BarChart2 size={18} /> Analytics
          </Typography>
        ) : null}

        {((profile?.role === 'Admin' || profile?.role === 'SuperAdmin') &&
          (permissions?.UserManagement_view ||
            permissions?.UserManagement_add ||
            permissions?.UserManagement_edit ||
            permissions?.UserManagement_delete)) ? (
          <Typography
            variant="button"
            onClick={() => navigate("/user-management")}
            className={`nav-link ${isActive("/user-management") ? 'active' : ''}`}
          >
            <UserCog size={18} /> Manage Users
          </Typography>
        ) : null}
      </Box>

      <Box className="avatar-container">
        <IconButton onClick={handleAvatarClick} className="avatar-button">
          <Avatar src={googleProfilePic} className="user-avatar" />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          className="user-menu"
        >
          <Typography variant="subtitle1" className="menu-name">
            {displayName}
          </Typography>
          <Typography variant="body2" className="menu-role">
            {profile?.role}
          </Typography>
          <MenuItem onClick={handleLogout} className="menu-item">
              <LogOut /> Logout
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );
}