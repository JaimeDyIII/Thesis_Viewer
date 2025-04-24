import React from 'react';
import { Button, Box } from '@mui/material';
import { Download } from 'lucide-react';
import { useAnalytics } from '../../context/AnalyticsContext';
import { generateAnalyticsPDF } from '../../services/AnalyticsPDFService';

const AnalyticsPDFExport: React.FC = () => {
  const { fetchAnalyticsData } = useAnalytics();

  const handleGeneratePDF = async () => {
    try {
      const loadingElement = document.createElement('div');
      loadingElement.style.position = 'fixed';
      loadingElement.style.top = '0';
      loadingElement.style.left = '0';
      loadingElement.style.width = '100%';
      loadingElement.style.height = '100%';
      loadingElement.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
      loadingElement.style.display = 'flex';
      loadingElement.style.justifyContent = 'center';
      loadingElement.style.alignItems = 'center';
      loadingElement.style.zIndex = '9999';
      loadingElement.innerHTML = '<div style="background-color: white; padding: 20px; border-radius: 5px; box-shadow: 0 0 10px rgba(0,0,0,0.1);"><p style="margin: 0; font-family: sans-serif;">Generating comprehensive PDF report, please wait...</p></div>';
      loadingElement.setAttribute('data-testid', 'loading-indicator');
      document.body.appendChild(loadingElement);

      const data = await fetchAnalyticsData();
      await generateAnalyticsPDF(data);
      document.body.removeChild(loadingElement);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('An error occurred while generating the PDF. Please try again.');
      const loadingElement = document.querySelector('[data-testid="loading-indicator"]');
      if (loadingElement && loadingElement.parentNode) {
        loadingElement.parentNode.removeChild(loadingElement);
      }
    }
  };

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        justifyContent: 'flex-end',
        mt: 2,
        mb: 2,
        px: 1
      }}
    >
      <Button
        variant="contained"
        color="primary"
        startIcon={<Download />}
        onClick={handleGeneratePDF}
        sx={{
          borderRadius: 2,
          textTransform: 'none',
          boxShadow: 3,
          fontWeight: 'bold',
          whiteSpace: 'nowrap'
        }}
        data-testid="download-button"
      >
        Download Analytics Report
      </Button>
    </Box>
  );
};

export default AnalyticsPDFExport;
