import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
  Typography,
  Box,
  MenuItem,
  Switch,
  FormControlLabel,
  Snackbar,
  Alert
} from "@mui/material";
import { styled } from "@mui/system";
import { supabase } from "../../../lib/supabase";
import { addLogEntry, ActionType, Subsystem } from "../../Global/CheckLogs";
import { useAuth } from "../../../context/AuthContext";

interface Thesis {
  id: number;
  title: string;
  description: string;
  author: string;
  category: string;
  pdf_url?: string | null;
  isActive: boolean;
  publishing_year: number | null;
}

interface Category {
  id: number;
  name: string;
  is_active?: boolean;
}

interface EditThesisFormProps {
  open: boolean;
  handleClose: () => void;
  thesis: Thesis;
  onUpdate: () => void;
  isLibrarian?: boolean;
}

const UploadButton = styled("label")({
  display: "inline-block",
  padding: "10px 16px",
  backgroundColor: "var(--heading-blue)",
  color: "var(--white)",
  borderRadius: "4px",
  cursor: "pointer",
  marginTop: "10px",
  transition: "all 0.3s ease",
  '&:hover': {
    backgroundColor: "var(--button-hover-blue)",
    boxShadow: "0px 4px 10px rgba(70, 130, 169, 0.5)",
    transform: "scale(1.05)",
  }
});

const StyledMenuItem = styled(MenuItem)({
  '&:hover': {
    backgroundColor: "rgba(70, 130, 169, 0.1)",
  },
  '&.Mui-selected': {
    backgroundColor: "transparent !important",
    color: "var(--heading-blue)",
  }
});

const EditThesisForm: React.FC<EditThesisFormProps> = ({
  open,
  handleClose,
  thesis,
  onUpdate,
  isLibrarian = false,
}) => {
  const [formData, setFormData] = useState({ ...thesis });
  const [file, setFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from("category")
        .select("id, name")
        .eq("is_active", true)
        .order("name");

      if (error) {
        setSnackbar({ open: true, message: "Failed to load categories", severity: "error" });
      } else {
        setCategories(data || []);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    if (thesis) setFormData({ ...thesis });
  }, [thesis]);

  const handleChange = (e: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    setFormData({ ...formData, [e.target.name as string]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 50 * 1024 * 1024) {
        setUploadError("File is too large. Maximum size is 50MB.");
        return;
      }
      if (!selectedFile.type.includes('pdf')) {
        setUploadError("Only PDF files are allowed.");
        return;
      }
      setFile(selectedFile);
      setUploadError(null);
    }
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, isActive: e.target.checked });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const { session } = useAuth();
  const user_id = session?.user?.id;

  const handleSave = async () => {
    if (!user_id) {
      console.error("User is not authenticated, cannot log action.");
      setSnackbar({ open: true, message: "User not authenticated", severity: "error" });
      return;
    }

    let pdfUrl = formData.pdf_url;
    
    if (file) {
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
          setSnackbar({
            open: true,
            message: `Error uploading file: ${error.message}`,
            severity: "error",
          });
          return;
        }
        
        const { data: urlData } = supabase.storage
          .from("thesis_pdfs")
          .getPublicUrl(filePath);
          
        pdfUrl = urlData?.publicUrl || null;
        console.log("Generated PDF URL:", pdfUrl);
      } catch (uploadErr) {
        console.error("Unexpected upload error:", uploadErr);
        setUploadError("An unexpected error occurred during upload");
        setSnackbar({
          open: true,
          message: "An unexpected error occurred during upload",
          severity: "error",
        });
        return;
      }
    }
    
    try {
      const updateData = {
        title: formData.title,
        description: formData.description,
        author: formData.author,
        category: formData.category,
        pdf_url: pdfUrl,
        isActive: isLibrarian ? thesis.isActive : formData.isActive,
        publishing_year: formData.publishing_year,
      };

      const changes: any = {};

      if (thesis.title !== updateData.title) {
        changes.title = { old: thesis.title, new: updateData.title };
      }
      if (thesis.description !== updateData.description) {
        changes.description = { old: thesis.description, new: updateData.description };
      }
      if (thesis.author !== updateData.author) {
        changes.author = { old: thesis.author, new: updateData.author };
      }
      if (thesis.category !== updateData.category) {
        changes.category = { old: thesis.category, new: updateData.category };
      }
      if (thesis.pdf_url !== pdfUrl) {
        changes.pdf_url = { old: thesis.pdf_url, new: pdfUrl };
      }

      const statusChanged = thesis.isActive !== updateData.isActive;
      const fileUpdated = !!file;

      if (statusChanged) {
        changes.status = { old: thesis.isActive, new: updateData.isActive };
      }

      if (fileUpdated) {
        changes.file_updated = true;
      }

      const { error } = await supabase
        .from("Thesis")
        .update(updateData)
        .eq("id", thesis.id);

      if (error) {
        console.error("Database update error:", error);
        setUploadError(`Error updating thesis: ${error.message}`);
        setSnackbar({
          open: true,
          message: `Error updating thesis: ${error.message}`,
          severity: "error",
        });
      } else {
        await addLogEntry(
          Subsystem.THESIS_REPOSITORY,
          ActionType.EDIT_THESIS,
          user_id,
          thesis.id,
          null,
          null,
          changes
        );

        setSnackbar({
          open: true,
          message: "Thesis updated successfully!",
          severity: "success",
        });
        onUpdate();
        handleClose();
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setUploadError("An unexpected error occurred");
      setSnackbar({
        open: true,
        message: "An unexpected error occurred",
        severity: "error",
      });
    }
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} fullWidth>
        <DialogTitle>
          <Typography variant="h6" sx={{ color: "var(--heading-blue)", fontWeight: 600 }}>
            Edit Thesis
          </Typography>
        </DialogTitle>
        <DialogContent className="white-container">
          <TextField label="Title" name="title" value={formData.title} onChange={handleChange} fullWidth margin="dense" />
          <TextField label="Description" name="description" value={formData.description} onChange={handleChange} fullWidth margin="dense" />
          <TextField
            select
            label="Category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            fullWidth
            margin="dense"
          >
            {categories.map((category) => (
              <StyledMenuItem key={category.id} value={category.name}>
                {category.name}
              </StyledMenuItem>
            ))}
          </TextField>
          <TextField label="Author" name="author" value={formData.author} onChange={handleChange} fullWidth margin="dense" />
          <TextField
            label="Publishing Year"
            name="publishing_year"
            value={formData.publishing_year || ''}
            onChange={handleChange}
            fullWidth
            margin="dense"
            type="number"
            inputProps={{ min: 1900, max: new Date().getFullYear() }}
          />
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

          {!isLibrarian && (
            <Box display="flex" alignItems="center" mt={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={handleStatusChange}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: 'var(--heading-blue)',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: 'var(--heading-blue)',
                      },
                    }}
                  />
                }
                label={
                  <Typography variant="body2" color={formData.isActive ? "success.main" : "error.main"}>
                    {formData.isActive ? "Active" : "Inactive"}
                  </Typography>
                }
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: "space-between", px: 3, pb: 2 }}>
          <Button onClick={handleClose} className="button-text">CANCEL</Button>
          <Button onClick={handleSave} className="button-primary" variant="contained" disabled={!!uploadError}>
            SUBMIT
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default EditThesisForm;
