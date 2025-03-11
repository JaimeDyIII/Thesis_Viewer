import { Drawer, Typography, Box, Button } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DefaultBookCover from "../components/DefaultBookCover.png"; // Import book cover

type Thesis = {
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

      {/* View PDF Button */}
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
          }}
          href={thesis.pdf_url}
          target="_blank"
        >
          View PDF
        </Button>
      )}
    </Drawer>
  );
}
