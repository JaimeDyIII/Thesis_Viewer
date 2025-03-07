import React, { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button, Typography, Box, MenuItem } from "@mui/material";
import { styled } from "@mui/system";
import { supabase } from "../lib/supabase";

interface Thesis {
  id: number;
  title: string;
  description: string;
  author: string;
  category: string;
  pdf_url?: string | null;
}

interface EditThesisFormProps {
  open: boolean;
  handleClose: () => void;
  thesis: Thesis;
  onUpdate: () => void;
}

const UploadButton = styled("label")({
  display: "inline-block",
  padding: "10px 16px",
  backgroundColor: "#6a1b9a",
  color: "#fff",
  borderRadius: "4px",
  cursor: "pointer",
  textAlign: "center",
  marginTop: "10px",
  transition: "all 0.3s ease",
  '&:hover': {
    backgroundColor: "#5a0cb5",
    boxShadow: "0px 4px 10px rgba(106, 13, 173, 0.5)",
    transform: "scale(1.05)",
  }
});

const PdfButton = styled(Button)({
  backgroundColor: "#6a0dad",
  color: "white",
  transition: "all 0.3s ease",
  '&:hover': {
    backgroundColor: "#5a0cb5",
    boxShadow: "0px 4px 10px rgba(106, 13, 173, 0.5)",
    transform: "scale(1.05)",
  }
});

const StyledMenuItem = styled(MenuItem)({
  '&:hover': {
    backgroundColor: "rgba(106, 13, 173, 0.2)",
  },
  '&.Mui-selected': {
    backgroundColor: "transparent !important",
    color: "#6a0dad",
  }
});

const EditThesisForm: React.FC<EditThesisFormProps> = ({ open, handleClose, thesis, onUpdate }) => {
  const [formData, setFormData] = useState({ ...thesis });
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (thesis) {
      setFormData({ ...thesis });
    }
  }, [thesis]);

  const handleChange = (e: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    setFormData({ ...formData, [e.target.name as string]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSave = async () => {
    let pdfUrl = formData.pdf_url;
    
    if (file) {
      const { data, error } = await supabase.storage.from("thesis_pdfs").upload(`theses/${thesis.id}.pdf`, file, { upsert: true });
      if (error) {
        console.error("Error uploading file:", error.message);
        return;
      }
      pdfUrl = data?.path ? supabase.storage.from("thesis_pdfs").getPublicUrl(data.path).data.publicUrl : null;
    }
    
    const { error } = await supabase
      .from("Thesis")
      .update({
        title: formData.title,
        description: formData.description,
        author: formData.author,
        category: formData.category,
        pdf_url: pdfUrl,
      })
      .eq("id", thesis.id);

    if (error) {
      console.error("Error updating thesis:", error.message);
    } else {
      onUpdate();
      handleClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth>
      <DialogTitle>
        <Typography variant="h6" color="primary" fontWeight="bold">
          Edit Thesis
        </Typography>
      </DialogTitle>
      <DialogContent>
        <TextField label="Title" name="title" value={formData.title} onChange={handleChange} fullWidth margin="dense" />
        <TextField label="Description" name="description" value={formData.description} onChange={handleChange} fullWidth margin="dense" />
        <TextField select label="Category" name="category" value={formData.category} onChange={handleChange} fullWidth margin="dense" 
          sx={{
            '& .MuiOutlinedInput-root': {
              '&.Mui-focused fieldset': {
                borderColor: "#6a0dad",
              },
            },
          }}>
          <StyledMenuItem value="Technology">Technology</StyledMenuItem>
          <StyledMenuItem value="Science">Science</StyledMenuItem>
          <StyledMenuItem value="Mathematics">Mathematics</StyledMenuItem>
        </TextField>
        <TextField label="Author" name="author" value={formData.author} onChange={handleChange} fullWidth margin="dense" />
        
        <Box display="flex" alignItems="center" mt={2}>
          <input type="file" id="upload-pdf" accept="application/pdf" hidden onChange={handleFileChange} />
          <UploadButton htmlFor="upload-pdf">UPLOAD PDF</UploadButton>
          {file && (
            <Typography variant="body2" color="textSecondary" ml={2}>
              {file.name}
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} sx={{ color: "#6a0dad" }}>CANCEL</Button>
        <PdfButton onClick={handleSave} variant="contained">SUBMIT</PdfButton>
      </DialogActions>
    </Dialog>
  );
};

export default EditThesisForm;