import { useState, useEffect } from 'react';
import { Drawer, Typography, Box, Button, CircularProgress, Alert } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Bookmark, FileText, Glasses } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from '@tanstack/react-query';
import { getThesisById } from '../../../api/thesis/queries';
import { useView } from '../../../hooks/useView';
import { useBookmark } from '../../../hooks/useBookmark';
import { Thesis } from '../../../api/thesis/types';
import { useAuth } from '../../../context/AuthContext';

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
  
  const { recordView, getViewCount } = useView();
  const { toggleBookmark, checkBookmark } = useBookmark();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [viewCount, setViewCount] = useState<number>(0);
  const { session } = useAuth();

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

  useEffect(() => {
    const fetchViewCount = async () => {
      if (!thesisId) return;
      try {
        const count = await getViewCount(thesisId);
        setViewCount(count);
      } catch (error) {
        console.error('Error fetching view count:', error);
      }
    };
    fetchViewCount();
  }, [thesisId, getViewCount]);

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
    navigate(`/chatbot?thesisId=${thesis.id}`);
  };

  const handleViewPDF = () => {
    if(!session) return console.error("no session found!");
    if(!thesis?.id) return console.error("no thesis id found");

    window.open(`/pdf-viewer/${encodeURIComponent(thesis.title)}`);
    recordView(thesis.id);
  }

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 2 }}>
        <CircularProgress sx={{ color: 'white' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error" sx={{ backgroundColor: 'rgba(255,255,255,0.9)' }}>
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
          background: "linear-gradient(to bottom, rgb(136, 84, 239), #7b50a3)",
          color: "white",
          padding: { xs: "16px", sm: "20px" },
          borderRadius: { xs: "10px 0 0 10px" },
          boxSizing: "border-box",
        },
      }}
    >
      <Box display="flex" justifyContent="flex-end">
        <CloseIcon 
          onClick={onClose} 
          sx={{ 
            cursor: "pointer", 
            fontSize: { xs: "22px", sm: "24px" } 
          }} 
        />
      </Box>

      {/* Book Cover */}
      <Box display="flex" justifyContent="center" mb={1}>
        <img
          src={'/DefaultBookCover.png'}
          alt="Book Cover"
          style={{ 
            width: "100px", 
            height: "140px",
            maxWidth: "30%"
          }}
        />
      </Box>

      <Typography 
        variant="h6" 
        fontWeight="bold" 
        textAlign="center" 
        sx={{ 
          fontSize: { xs: "15px", sm: "16px" },
          mb: 0.5
        }}
      >
        {thesis?.title || "No Title Available"}
      </Typography>

      <Typography 
        fontStyle="italic" 
        textAlign="center" 
        sx={{ 
          mb: 1, 
          fontSize: { xs: "13px", sm: "14px" } 
        }}
      >
        {thesis?.author || "Unknown Author"}
      </Typography>

      {/* Content sections */}
      <Box sx={{ mb: 2 }}>
        <Typography fontWeight="bold" fontSize={{ xs: "13px", sm: "14px" }}>
          Category:
        </Typography>
        <Typography fontSize={{ xs: "13px", sm: "14px" }}>
          {thesis?.category || "Not Specified"}
        </Typography>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography fontWeight="bold" fontSize={{ xs: "13px", sm: "14px" }}>
          Description:
        </Typography>
        <Typography 
          fontSize={{ xs: "13px", sm: "14px" }}
          sx={{ 
            maxHeight: { xs: "120px", sm: "none" },
            overflowY: { xs: "auto", sm: "visible" }
          }}
        >
          {thesis?.description || "No description provided."}
        </Typography>
      </Box>
      
      <Box sx={{ mb: 2 }}>
        <Typography fontWeight="bold" fontSize={{ xs: "13px", sm: "14px" }}>
          Publishing Year:
        </Typography>
        <Typography fontSize={{ xs: "13px", sm: "14px" }}>
          {thesis?.publishing_year}
        </Typography>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography fontWeight="bold" fontSize={{ xs: "13px", sm: "14px" }}>
          Views:
        </Typography>
        <Typography fontSize={{ xs: "13px", sm: "14px" }}>
          {viewCount}
        </Typography>
      </Box>

      {/* Buttons */}
      <Box sx={{ mt: { xs: 1, sm: 2 } }}>
        {thesis?.pdf_url && (
          <Button
            variant="contained"
            fullWidth
            sx={{
              backgroundColor: "white",
              color: "#6828e9",
              fontWeight: "bold",
              borderRadius: "8px",
              padding: { xs: "5px", sm: "6px" },
              fontSize: { xs: "13px", sm: "14px" },
              "&:hover": { backgroundColor: "#6828e9", color: "white" },
              mb: 1,
            }}
            onClick={handleViewPDF}
            startIcon={<FileText size={16} />}
          >
            View PDF
          </Button>
        )}

        {/* Bookmark Button */}
        {isBookmarked ? (
          <Button
            variant="contained"
            fullWidth
            sx={{
              backgroundColor: "#4caf50",
              color: "white",
              fontWeight: "bold",
              borderRadius: "8px",
              padding: { xs: "5px", sm: "6px" },
              fontSize: { xs: "13px", sm: "14px" },
              "&:hover": { backgroundColor: "#388e3c", color: "white" },
              mb: 1,
            }}
            onClick={handleToggleBookmark}
            disabled={bookmarkLoading}
            startIcon={<Bookmark fill={'white'} size={16} />}
          >
            Bookmarked
          </Button>
        ) : (
          <Button
            variant="contained"
            fullWidth
            sx={{
              backgroundColor: "#b38ddb",
              color: "black",
              fontWeight: "bold",
              borderRadius: "8px",
              padding: { xs: "5px", sm: "6px" },
              fontSize: { xs: "13px", sm: "14px" },
              "&:hover": { backgroundColor: "#7b50a3", color: "white" },
              mb: 1,
            }}
            onClick={handleToggleBookmark}
            disabled={bookmarkLoading}
            startIcon={<Bookmark size={16} />}
          >
            Bookmark
          </Button>
        )}

        {/* Ask Thessa Button */}
        <Button
          onClick={handleAskThessa}
          variant="contained"
          fullWidth
          sx={{
            backgroundColor: "black",
            color: "white",
            fontWeight: "bold",
            borderRadius: "8px",
            padding: { xs: "5px", sm: "6px" },
            fontSize: { xs: "13px", sm: "14px" },
            "&:hover": { backgroundColor: "#6828e9" },
          }}
          startIcon={<Glasses size={16} />}
        >
          Ask Thessa
        </Button>
      </Box>
    </Drawer>
  );
}