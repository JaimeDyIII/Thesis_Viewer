import { Dialog, DialogTitle, DialogContent, Button } from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

interface EmailErrorPopupProps {
  open: boolean;
  onClose: () => void;
}

const EmailErrorPopup: React.FC<EmailErrorPopupProps> = ({ open, onClose }) => {
  return (
    <Dialog open={open} onClose={onClose} className="alert-dialog">
      <DialogContent className="alert-content">
        {/* Alert Icon */}
        <div className="alert-icon">
          <WarningAmberIcon sx={{ fontSize: 50, color: "#FF6B6B" }} />
        </div>

        {/* Alert Title */}
        <DialogTitle className="alert-title">Access Denied</DialogTitle>

        {/* Alert Message */}
        <p className="alert-message">
          Please use your institutional email address to login.
        </p>

        <Button
          variant="contained"
          className="alert-button"
          onClick={onClose}
                sx={{
                  backgroundColor: "#52525B",
                  color: "white",
                  "&:hover": { backgroundColor: "#3F3F46" },
                }}
              >
                Back to Login
              </Button>

      </DialogContent>
    </Dialog>
  );
};

export default EmailErrorPopup;
