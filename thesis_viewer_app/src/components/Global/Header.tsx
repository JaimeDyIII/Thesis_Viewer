import { Avatar, Typography, Box, IconButton, Menu, MenuItem, Popover } from "@mui/material";
import { useEffect, useState, useRef } from "react";
import { supabase } from "../../lib/supabase";
import { useNavigate, useLocation } from "react-router-dom";
import { BookOpenText, BarChart2, UserCog, LayoutDashboard, Compass, Bookmark, Glasses, LogOut, ChevronDown } from "lucide-react";
import { usePermissions } from "../../context/PermissionsContext";
import { useAuth } from "../../context/AuthContext";
import Notifications from "../Notifications/Notifications";
import "../../styles/Header.css";

export function Header() {
  const [googleProfilePic, setGoogleProfilePic] = useState("https://lh3.googleusercontent.com/a/default-user");
  const [displayName, setDisplayName] = useState("");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [visible, setVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [thesisRepoAnchor, setThesisRepoAnchor] = useState<null | HTMLElement>(null);
  const [manageAnchor, setManageAnchor] = useState<null | HTMLElement>(null);
  const lastScrollY = useRef(0);
  const open = Boolean(anchorEl);
  const navigate = useNavigate();
  const location = useLocation();
  const { permissions } = usePermissions();
  const { profile } = useAuth();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
      if (window.scrollY > lastScrollY.current) {
        // Scrolling down
        setVisible(false);
      } else {
        // Scrolling up
        setVisible(true);
      }
      lastScrollY.current = window.scrollY;
    };

    window.addEventListener('scroll', controlNavbar);
    return () => window.removeEventListener('scroll', controlNavbar);
  }, []);

  const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleThesisRepoClick = (event: React.MouseEvent<HTMLElement>) => {
    setThesisRepoAnchor(event.currentTarget);
  };

  const handleManageClick = (event: React.MouseEvent<HTMLElement>) => {
    setManageAnchor(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setThesisRepoAnchor(null);
    setManageAnchor(null);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const isActive = (path: string) => location.pathname === path;

  const renderThesisRepoDropdown = () => (
    <Menu
      anchorEl={thesisRepoAnchor}
      open={Boolean(thesisRepoAnchor)}
      onClose={handleClose}
      className="dropdown-menu"
    >
      <MenuItem onClick={() => { navigate("/view-thesis"); handleClose(); }}>
        <Compass size={18} /> <span>Discover</span>
      </MenuItem>
      <MenuItem onClick={() => { navigate("/bookmarks"); handleClose(); }}>
        <Bookmark size={18} /> <span>Bookmarks</span>
      </MenuItem>
    </Menu>
  );

  const renderManageDropdown = () => {
    const hasUserManagement = permissions?.UserManagement_view;
    const hasThesisRepository = permissions?.ThesisRepository_view;

    // Only show Manage dropdown if user has at least one permission
    if (!hasUserManagement && !hasThesisRepository) return null;

    return (
      <Menu
        anchorEl={manageAnchor}
        open={Boolean(manageAnchor)}
        onClose={handleClose}
        className="dropdown-menu"
      >
        {hasUserManagement && (
          <MenuItem onClick={() => { navigate("/user-management"); handleClose(); }}>
            <UserCog size={18} /> <span>Manage Users</span>
          </MenuItem>
        )}
        {hasThesisRepository && (
          <MenuItem onClick={() => { navigate("/manage-thesis"); handleClose(); }}>
            <BookOpenText size={18} /> <span>Manage Thesis</span>
          </MenuItem>
        )}
      </Menu>
    );
  };

  const renderNavLinks = () => {
    if (!profile) return null;

    const baseLinks = [
      <Typography
        key="dashboard"
        variant="button"
        onClick={() => navigate("/dashboard")}
        className={`nav-link ${isActive("/dashboard") ? 'active' : ''}`}
      >
        <LayoutDashboard size={18} /> <span>Dashboard</span>
      </Typography>,
      <Typography
        key="thessa"
        variant="button"
        onClick={() => navigate("/thessaAI")}
        className={`nav-link ${isActive("/thessaAI") ? 'active' : ''}`}
      >
        <Glasses size={18} /> <span>ThessaAI</span>
      </Typography>
    ];

    if (profile.role === 'User') {
      return [
        ...baseLinks,
        <Typography
          key="discover"
          variant="button"
          onClick={() => navigate("/view-thesis")}
          className={`nav-link ${isActive("/view-thesis") ? 'active' : ''}`}
        >
          <Compass size={18} /> <span>Discover</span>
        </Typography>,
        <Typography
          key="bookmarks"
          variant="button"
          onClick={() => navigate("/bookmarks")}
          className={`nav-link ${isActive("/bookmarks") ? 'active' : ''}`}
        >
          <Bookmark size={18} /> <span>Bookmarks</span>
        </Typography>
      ];
    }

    if (profile.role === 'Librarian') {
      return [
        ...baseLinks,
        permissions?.ThesisRepository_view && (
          <Typography
            key="manage-thesis"
            variant="button"
            onClick={() => navigate("/manage-thesis")}
            className={`nav-link ${isActive("/manage-thesis") ? 'active' : ''}`}
          >
            <BookOpenText size={18} /> <span>Manage Thesis</span>
          </Typography>
        ),
        permissions?.ThesisRepository_view && (
          <Typography
            key="thesis-repo"
            variant="button"
            onClick={handleThesisRepoClick}
            className={`nav-link dropdown-trigger ${Boolean(thesisRepoAnchor) ? 'active' : ''}`}
          >
            <Compass size={18} /> <span>Thesis Repository</span> <ChevronDown size={16} />
          </Typography>
        )
      ];
    }

    if (profile.role === 'Admin' || profile.role === 'SuperAdmin') {
      const hasUserManagement = permissions?.UserManagement_view;
      const hasThesisRepository = permissions?.ThesisRepository_view;
      const showManageDropdown = hasUserManagement || hasThesisRepository;

      return [
        ...baseLinks,
        showManageDropdown && (
          <Typography
            key="manage"
            variant="button"
            onClick={handleManageClick}
            className={`nav-link dropdown-trigger ${Boolean(manageAnchor) ? 'active' : ''}`}
          >
            <UserCog size={18} /> <span>Manage</span> <ChevronDown size={16} />
          </Typography>
        ),
        <Typography
          key="analytics"
          variant="button"
          onClick={() => navigate("/analytics")}
          className={`nav-link ${isActive("/analytics") ? 'active' : ''}`}
        >
          <BarChart2 size={18} /> <span>Analytics</span>
        </Typography>,
        permissions?.ThesisRepository_view && (
          <Typography
            key="thesis-repo"
            variant="button"
            onClick={handleThesisRepoClick}
            className={`nav-link dropdown-trigger ${Boolean(thesisRepoAnchor) ? 'active' : ''}`}
          >
            <Compass size={18} /> <span>Thesis Repository</span> <ChevronDown size={16} />
          </Typography>
        )
      ];
    }

    return baseLinks;
  };

  return (
    <Box component="header" className={`header ${visible ? '' : 'hide'} ${isMobile && !visible ? 'scrolled' : ''}`}>
      {isMobile ? (
        <>
          <Box className="header-top-row">
            <Box className="logo-container">
              <img src="/favicon.ico" alt="logo" className="logo-icon" />
              <Typography variant="h6" className="logo-text">
                ThesisViewer
              </Typography>
            </Box>
            <Box className="avatar-container">
              <Notifications />
              <IconButton onClick={handleAvatarClick} className="avatar-button">
                <Avatar src={googleProfilePic} className="user-avatar" />
              </IconButton>
            </Box>
          </Box>
          <Box className="nav-links">
            {renderNavLinks()}
          </Box>
        </>
      ) : (
        <>
          <Box className="logo-container">
            <img src="/favicon.ico" alt="logo" className="logo-icon" />
            <Typography variant="h6" className="logo-text">
              ThesisViewer
            </Typography>
          </Box>
          <Box className="nav-links">
            {renderNavLinks()}
          </Box>
          <Box className="avatar-container">
            <Notifications />
            <IconButton onClick={handleAvatarClick} className="avatar-button">
              <Avatar src={googleProfilePic} className="user-avatar" />
            </IconButton>
          </Box>
        </>
      )}

      {renderThesisRepoDropdown()}
      {renderManageDropdown()}

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
  );
}