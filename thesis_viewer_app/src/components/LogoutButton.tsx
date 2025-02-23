import { Button } from "@mui/material";
import { useAuth } from "../services/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export function LogoutButton() {
    const { handleSignOut } = useAuth();
    const navigate = useNavigate();


    return (
        <Button
                variant="outlined"
                size="large"
                className="google-signin-button"
                onClick={handleSignOut}
                sx={{
                    textTransform: "none",
                    borderColor: "#E0E7FF",
                    color: "#1E1B4B",
                    "&:hover": {
                        backgroundColor: "#EEF2FF",
                        borderColor: "#E0E7FF",
                    },
                }}
        >
            Sign Out
        </Button>
    );
};

export default LogoutButton;