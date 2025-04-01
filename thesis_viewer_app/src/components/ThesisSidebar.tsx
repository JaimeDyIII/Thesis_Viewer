import { Drawer, Typography, Box, Button, Switch, Checkbox } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { FileText, Glasses } from "lucide-react";
import DefaultBookCover from "../components/DefaultBookCover.png";
import { useNavigate } from "react-router-dom";
import { useThesis } from "../context/ThesisContext";
import { useView } from "../context/ViewContext";
import { useAuth } from "../context/AuthContext";
import { useBookmark } from "../context/BookmarkContext";
import { useEffect, useState } from "react";

type Thesis = {
  id: number;
  title: string;
  description: string | null;
  author: string;
  category: string | null;
  pdf_url: string | null;
};

type ThesisSidebarProps = {
  open: boolean;
  onClose: () => void;
  thesis: Thesis | null;
};

export default function ThesisSidebar({ open, onClose, thesis }: ThesisSidebarProps) {
  const navigate = useNavigate();
  const { setSelectedThesis } = useThesis();
  const { recordView } = useView();
  const { session } = useAuth();
  const { getViewCount } = useView();
  const { checkBookmark, toggleBookmark } = useBookmark();
  const [viewCount, setViewCount] = useState<number>(0);
  const [isBookmarked, setIsBookmarked] = useState(false);

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
  
    await toggleBookmark(session.user.id, thesis.id, isBookmarked);
    setIsBookmarked((prev) => !prev);
  };

  const handleAskJaime = () => {
    if (thesis) {
      setSelectedThesis(thesis);
      navigate("/jaimeGPT");
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
          width: "400px",
          background: "linear-gradient(to bottom,rgb(136, 84, 239), #7b50a3)",
          color: "white",
          padding: "40px",
          borderRadius: "10px 0 0 10px",
        },
      }}
    >
      <Box display="flex" justifyContent="flex-end">
        <CloseIcon onClick={onClose} sx={{ cursor: "pointer", fontSize: "28px" }} />
      </Box>

      {/* Book Cover */}
      <Box display="flex" justifyContent="center" mb={2}>
        <img src={DefaultBookCover} alt="Book Cover" style={{ width: "150px", height: "210px" }} />
      </Box>

      <Typography variant="h6" fontWeight="bold" textAlign="center">
        {thesis?.title || "No Title Available"}
      </Typography>
      
      <Typography fontStyle="italic" textAlign="center" mb={2}>
        {thesis?.author || "Unknown Author"}
      </Typography>

      <Typography fontWeight="bold">Category:</Typography>
      <Typography mb={1}>{thesis?.category || "Not Specified"}</Typography>

      <Typography fontWeight="bold">Description:</Typography>
      <Typography mb={3}>{thesis?.description || "No description provided."}</Typography>

      <Typography fontWeight="bold">Views:</Typography>
      <Typography mb={3}>{viewCount}</Typography>

      <Typography fontWeight="bold">Bookmark:</Typography>
      <Checkbox
        checked={isBookmarked}
        onChange={handleToggleBookmark}
      />

      {/* Buttons */}
      {thesis?.pdf_url && (
        <Button
          variant="contained"
          fullWidth
          sx={{
            backgroundColor: "white",
            color: "#6828e9",
            fontWeight: "bold",
            borderRadius: "8px",
            padding: "10px",
            "&:hover": { backgroundColor: "#6828e9", color: "white" },
            mb: 2,
          }}
          onClick={() => handleViewPDF(thesis)}
          startIcon={<FileText size={18} />}
        >
          View PDF
        </Button>
      )}

      {/* Ask Jaime Button */}
      <Button onClick={handleAskJaime}
        variant="contained"
        fullWidth
        sx={{
          backgroundColor: "black",
          color: "white",
          fontWeight: "bold",
          borderRadius: "8px",
          padding: "10px",
          "&:hover": { backgroundColor: "#6828e9"},
        }}
        startIcon={<Glasses size={18} />}
      >
        Ask Jaime
      </Button>
    </Drawer>
  );
}
