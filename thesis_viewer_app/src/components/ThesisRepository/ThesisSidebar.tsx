import { Drawer, Typography, Box, Button, Switch, Checkbox } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Bookmark, FileText, Glasses } from "lucide-react";
import DefaultBookCover from "../components/DefaultBookCover.png";
import { useNavigate } from "react-router-dom";
import { useThesis } from "../../context/ThesisContext";
import { useView } from "../../context/ViewContext";
import { useAuth } from "../../context/AuthContext";
import { useBookmark } from "../../context/BookmarkContext";
import { useEffect, useState } from "react";

type Thesis = {
  id: number;
  title: string;
  description: string | null;
  author: string;
  category: string | null;
  pdf_url: string | null;
  publishing_year: number | null;
};

type ThesisSidebarProps = {
  open: boolean;
  onClose: () => void;
  thesis: Thesis | null;
  onBookmarkToggle?: () => void;
};

export default function ThesisSidebar({ open, onClose, thesis, onBookmarkToggle  }: ThesisSidebarProps) {
  const navigate = useNavigate();
  const { setSelectedThesis } = useThesis();
  const { recordView } = useView();
  const { session } = useAuth();
  const { getViewCount } = useView();
  const { checkBookmark, toggleBookmark } = useBookmark();
  const [viewCount, setViewCount] = useState<number>(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  
  useEffect(() => {
    const fetchViews = async () => {
      if(!thesis || !thesis.id) return console.error('Thesis not found!');

      const count = await getViewCount(thesis?.id);
      setViewCount(count);
    }

    fetchViews();
  }, [thesis?.id])

  useEffect(() => {
    if (!thesis?.id || !session?.user?.id) return;
    
    checkBookmark(session.user.id, thesis.id).then(setIsBookmarked);
  }, [thesis?.id, session?.user?.id]);


  const handleToggleBookmark = async () => {
    if (!thesis?.id || !session?.user?.id) return;
  
    setBookmarkLoading(true);
    await toggleBookmark(session.user.id, thesis.id, isBookmarked);
    const updated = await checkBookmark(session.user.id, thesis.id);
    setIsBookmarked(updated);
    setBookmarkLoading(false);
  
    if (onBookmarkToggle) {
      onBookmarkToggle();
    }
  };

  
  const handleAskThessa = () => {
    if (thesis) {
      setSelectedThesis(thesis);
      navigate("/thessaAI");
    }
  };
  
  const handleViewPDF = (thesis: Thesis) => {
    if(!session) return console.error("no session found!");
    if(!thesis.id) return console.error("no thesis id found");

    window.open(`/pdf-viewer/${encodeURIComponent(thesis.title)}`);
    recordView(session?.user.id, thesis?.id);
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
            onClick={() => handleViewPDF(thesis)}
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
