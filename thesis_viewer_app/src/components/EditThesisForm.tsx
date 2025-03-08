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
  const [uploadError, setUploadError] = useState<string | null>(null);

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
      const selectedFile = e.target.files[0];
      
      // Check file size (limit to 5MB)
      if (selectedFile.size > 50 * 1024 * 1024) {
        setUploadError("File is too large. Maximum size is 50MB.");
        return;
      }
      
      // Check file type
      if (!selectedFile.type.includes('pdf')) {
        setUploadError("Only PDF files are allowed.");
        return;
      }
      
      setFile(selectedFile);
      setUploadError(null);
    }
  };

  const handleSave = async () => {
    let pdfUrl = formData.pdf_url;
    
    if (file) {
      // Create a more unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${thesis.id}_${Date.now()}.${fileExt}`;
      const filePath = `theses/${fileName}`;
      
      console.log("Uploading file:", filePath);
      
      try {
        const { data, error } = await supabase.storage
  .from("thesis_pdfs")
  .upload(filePath, file, { 
    upsert: true,
    cacheControl: '3600'
  });

if (data) {
  console.log("Upload successful:", data);
}
          
        if (error) {
          console.error("Upload error details:", error);
          setUploadError(`Error uploading file: ${error.message}`);
          return;
        }
        
        // Get the public URL
        const { data: urlData } = supabase.storage
          .from("thesis_pdfs")
          .getPublicUrl(filePath);
          
        pdfUrl = urlData?.publicUrl || null;
        console.log("Generated PDF URL:", pdfUrl);
      } catch (uploadErr) {
        console.error("Unexpected upload error:", uploadErr);
        setUploadError("An unexpected error occurred during upload");
        return;
      }
    }
    
    try {
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
        console.error("Database update error:", error);
        setUploadError(`Error updating thesis: ${error.message}`);
      } else {
        onUpdate();
        handleClose();
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setUploadError("An unexpected error occurred");
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
        
        <Box display="flex" flexDirection="column" mt={2}>
          <Box display="flex" alignItems="center">
            <input type="file" id="upload-pdf" accept="application/pdf" hidden onChange={handleFileChange} />
            <UploadButton htmlFor="upload-pdf">UPLOAD PDF</UploadButton>
            {file && (
              <Typography variant="body2" color="textSecondary" ml={2}>
                {file.name}
              </Typography>
            )}
          </Box>
          
          {uploadError && (
            <Typography variant="body2" color="error" mt={1}>
              {uploadError}
            </Typography>
          )}
          
          {formData.pdf_url && !file && (
            <Typography variant="body2" color="textSecondary" mt={1}>
              Current PDF: {formData.pdf_url.split('/').pop()}
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} sx={{ color: "#6a0dad" }}>CANCEL</Button>
        <PdfButton onClick={handleSave} variant="contained" disabled={!!uploadError}>SUBMIT</PdfButton>
      </DialogActions>
    </Dialog>
  );
};

export default EditThesisForm;