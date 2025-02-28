import { Logout } from "@mui/icons-material";
import { Button } from "@mui/material";
import { useAuth } from "../services/AuthContext";
import { useNavigate } from "react-router-dom";

export function LogoutButton() {
  const { handleSignOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await handleSignOut();
    navigate("/login"); 
  };

  return (
    <Button
      onClick={handleLogout}
      sx={{
        minWidth: "auto",
        padding: "8px",
        borderRadius: "50%",
        color: "var(--primary)",
        "&:hover": { backgroundColor: "rgba(103, 58, 183, 0.1)" },
      }}
    >
      <Logout />
    </Button>
  );
}

export default LogoutButton;
