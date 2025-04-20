import React, { useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button,
  Typography,
  Checkbox,
  FormControlLabel,
  Paper,
  Divider
} from '@mui/material';
import ArticleIcon from '@mui/icons-material/Article';

interface TermsAndConditionsDialogProps {
  open: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

const TermsAndConditionsDialog: React.FC<TermsAndConditionsDialogProps> = ({
  open,
  onAccept,
  onDecline
}) => {
  const [accepted, setAccepted] = useState(false);

  const handleAccept = () => {
    if (accepted) {
      onAccept();
    }
  };

  return (
    <Dialog 
      open={open} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        elevation: 3,
        sx: { 
          borderRadius: 2,
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle sx={{ 
        bgcolor: '#4F46E5', 
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>
        <ArticleIcon />
        <Typography variant="h6">Terms and Conditions</Typography>
      </DialogTitle>
      
      <DialogContent sx={{ p: 3 }}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Please read and accept our Terms and Conditions to continue
        </Typography>
        
        <Paper 
          variant="outlined" 
          sx={{ 
            mt: 2, 
            p: 2, 
            maxHeight: '300px', 
            overflow: 'auto',
            bgcolor: '#fafafa'
          }}
        >
          <Typography variant="body2" paragraph>
            <strong>1. Introduction</strong><br />
            Welcome to Thesis Viewer. By using our application, you agree to these Terms and Conditions. 
            These Terms govern your access to and use of the Thesis Viewer application.
          </Typography>
          
          <Typography variant="body2" paragraph>
            <strong>2. Institutional Email Requirement</strong><br />
            Thesis Viewer is exclusively for users with valid institutional email addresses. You must authenticate
            using an authorized institutional email (@neu.edu.ph) to access the service.
          </Typography>
          
          <Typography variant="body2" paragraph>
            <strong>3. Content Usage</strong><br />
            All content viewed through this application is for academic and research purposes only. Unauthorized distribution,
            copying, or reproduction of any content accessed through Thesis Viewer is strictly prohibited.
          </Typography>
          
          <Typography variant="body2" paragraph>
            <strong>4. Data Privacy</strong><br />
            We collect and process certain personal information in accordance with our Privacy Policy.
            By using Thesis Viewer, you consent to such processing and warrant that all data provided by you is accurate.
          </Typography>
          
          <Typography variant="body2" paragraph>
            <strong>5. Intellectual Property</strong><br />
            All intellectual property rights related to the theses available through this application
            belong to their respective authors and institutions. Users agree to respect these rights
            and properly cite any content used in their academic work.
          </Typography>
          
          <Typography variant="body2" paragraph>
            <strong>6. Changes to Terms</strong><br />
            We reserve the right to modify these Terms at any time. Continued use of Thesis Viewer after changes
            constitutes your acceptance of the revised Terms.
          </Typography>
        </Paper>
        
        <FormControlLabel
          control={
            <Checkbox 
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              color="primary"
            />
          }
          label="I have read and accept the Terms and Conditions"
          sx={{ mt: 2 }}
        />
      </DialogContent>
      
      <Divider />
      
      <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
        <Button 
          onClick={onDecline}
          variant="outlined"
          color="error"
        >
          Decline
        </Button>
        <Button 
          onClick={handleAccept}
          variant="contained"
          color="primary"
          disabled={!accepted}
        >
          Accept & Continue
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TermsAndConditionsDialog;