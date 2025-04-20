import React from 'react';
import { Box, Typography, IconButton } from "@mui/material";
import { ArrowLeft, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../../styles/View.css";

export function PrivacyPolicyHeader() {
  const navigate = useNavigate();

  return (
    <Box
      component="header"
      sx={{
        width: '100%',
        backgroundColor: 'rgba(244, 237, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(155, 104, 255, 0.2)',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 1100,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <IconButton
          aria-label="back"
          onClick={() => navigate(-1)}
          sx={{ 
            color: '#6E3CBC',
            '&:hover': {
              backgroundColor: 'rgba(110, 60, 188, 0.08)',
            }
          }}
        >
          <ArrowLeft size={20} />
        </IconButton>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Shield size={22} color="#6E3CBC" />
          <Typography
            variant="h6"
            sx={{
              color: '#6E3CBC',
              fontWeight: 600,
              fontSize: { xs: 16, md: 18 },
            }}
          >
            Privacy Policy
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Typography
          variant="subtitle2"
          sx={{
            color: '#6E3CBC',
            fontSize: { xs: 12, md: 14 },
            opacity: 0.8
          }}
        >
          Thesis Management System
        </Typography>
      </Box>
    </Box>
  );
}

export default PrivacyPolicyHeader;