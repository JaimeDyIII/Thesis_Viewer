import { useState, useEffect } from 'react';
import { Drawer, Typography, Box, Button, CircularProgress, Alert } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Bookmark, FileText, Glasses } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from '@tanstack/react-query';
import { getThesisById } from '../../../api/thesis/queries';
import { useView } from '../../../hooks/useView';
import { useBookmark } from '../../../hooks/useBookmark';
import { useAuth } from '../../../context/AuthContext';
import { useThesis } from '../../../context/ThesisContext';

type ThesisSidebarProps = {
  open: boolean;
  onClose: () => void;
  thesisId: number;
  onBookmarkToggle?: () => void;
};

export default function ThesisSidebar({ open, onClose, thesisId, onBookmarkToggle }: ThesisSidebarProps) {
  const navigate = useNavigate();
  const { data: thesis, isLoading, error } = useQuery({
    queryKey: ['thesis', thesisId],
    queryFn: () => getThesisById(thesisId),
    enabled: !!thesisId
  });

  const { recordView } = useView();
  const { toggleBookmark, checkBookmark } = useBookmark();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const { session } = useAuth();
  const { setSelectedThesis } = useThesis();

  useEffect(() => {
    const checkBookmarkStatus = async () => {
      if (!thesisId) return;
      try {
        const bookmarked = await checkBookmark(thesisId);
        setIsBookmarked(bookmarked);
      } catch (error) {
        console.error('Error checking bookmark status:', error);
      }
    };
    checkBookmarkStatus();
  }, [thesisId, checkBookmark]);

  const handleToggleBookmark = async () => {
    if (!thesisId) return;
    setBookmarkLoading(true);
    try {
      await toggleBookmark(thesisId);
      setIsBookmarked(!isBookmarked);
      onBookmarkToggle?.();
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    } finally {
      setBookmarkLoading(false);
    }
  };

  const handleAskThessa = () => {
    if (!thesis) return;
    setSelectedThesis(thesis);
    navigate('/thessaAI');
  };

  const handleViewPDF = () => {
    if (!session) return console.error("No session found!");
    if (!thesis?.id) return console.error("No thesis id found");

    window.open(`/pdf-viewer/${encodeURIComponent(thesis.title)}`);
    recordView(thesis.id);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 2 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">
          Error loading thesis: {(error as Error).message}
        </Alert>
      </Box>
    );
  }

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: "400px" },
          backgroundColor: "var(--primary-blue-dark)",
          padding: { xs: "16px", sm: "20px" },
          borderRadius: { xs: "10px 0 0 10px" },
          boxSizing: "border-box",
        },
      }}
    >
      <Box display="flex" justifyContent="flex-end">
        <CloseIcon 
          onClick={onClose} 
          sx={{ cursor: "pointer", fontSize: { xs: "22px", sm: "24px" } }} 
        />
      </Box>

      <Box display="flex" justifyContent="center" mb={1}>
        <img
          src={'/DefaultBookCover.png'}
          alt="Book Cover"
          style={{ width: "100px", height: "140px", maxWidth: "30%" }}
        />
      </Box>

      <Typography 
        variant="h6" 
        fontWeight="bold" 
        textAlign="center" 
        sx={{ fontSize: { xs: "15px", sm: "16px" }, color: "var(--card-cream)", mb: 0.5 }}
      >
        {thesis?.title || "No Title Available"}
      </Typography>

      <Typography 
        fontStyle="italic" 
        textAlign="center" 
        sx={{ mb: 1, fontSize: { xs: "13px", sm: "14px" }, color: "var(--white)" }}
      >
        {thesis?.author || "Unknown Author"}
      </Typography>

      <Box sx={{ mb: 2 }}>
        <Typography fontWeight="bold" fontSize={{ xs: "13px", sm: "14px" }} sx={{ color: "var(--card-cream)" }}>
          Category:
        </Typography>
        <Typography fontSize={{ xs: "13px", sm: "14px" }} sx={{ color: "var(--white)" }}>
          {thesis?.category || "Not Specified"}
        </Typography>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography fontWeight="bold" fontSize={{ xs: "13px", sm: "14px" }} sx={{ color: "var(--card-cream)" }}>
          Description:
        </Typography>
        <Typography 
          fontSize={{ xs: "13px", sm: "14px" }}
          sx={{ 
            maxHeight: { xs: "120px", sm: "none" },
            overflowY: { xs: "auto", sm: "visible" },
            color: "var(--white)"
          }}
        >
          {thesis?.description || "No description provided."}
        </Typography>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography fontWeight="bold" fontSize={{ xs: "13px", sm: "14px" }} sx={{ color: "var(--card-cream)" }}>
          Publishing Year:
        </Typography>
        <Typography fontSize={{ xs: "13px", sm: "14px" }} sx={{ color: "var(--white)" }}>
          {thesis?.publishing_year}
        </Typography>
      </Box>

      <Box sx={{ mt: { xs: 1, sm: 2 } }}>
        {thesis?.pdf_url && (
          <Button
            variant="contained"
            fullWidth
            sx={{
              backgroundColor: "var(--white)",
              color: "var(--primary-blue)",
              fontWeight: "bold",
              borderRadius: "8px",
              padding: { xs: "5px", sm: "6px" },
              fontSize: { xs: "13px", sm: "14px" },
              "&:hover": { backgroundColor: "var(--primary-blue)", color: "var(--white)" },
              mb: 1,
            }}
            onClick={handleViewPDF}
            startIcon={<FileText size={16} />}
          >
            View PDF
          </Button>
        )}

        <Button
          variant="contained"
          fullWidth
          sx={{
            backgroundColor: isBookmarked ? "var(--heading-blue)" : "var(--button-hover-blue)",
            color: isBookmarked ? "var(--white)" : "black",
            fontWeight: "bold",
            borderRadius: "8px",
            padding: { xs: "5px", sm: "6px" },
            fontSize: { xs: "13px", sm: "14px" },
            "&:hover": { backgroundColor: "var(--primary-blue)", color: "var(--white)" },
            mb: 1,
          }}
          onClick={handleToggleBookmark}
          disabled={bookmarkLoading}
          startIcon={<Bookmark size={16} fill={isBookmarked ? 'white' : 'none'} />}
        >
          {isBookmarked ? "Bookmarked" : "Bookmark"}
        </Button>

        <Button
          onClick={handleAskThessa}
          variant="contained"
          fullWidth
          sx={{
            backgroundColor: "black",
            color: "var(--white)",
            fontWeight: "bold",
            borderRadius: "8px",
            padding: { xs: "5px", sm: "6px" },
            fontSize: { xs: "13px", sm: "14px" },
            "&:hover": { backgroundColor: "var(--primary-blue)" },
          }}
          startIcon={<Glasses size={16} />}
        >
          Ask Thessa
        </Button>
      </Box>
    </Drawer>
  );
}