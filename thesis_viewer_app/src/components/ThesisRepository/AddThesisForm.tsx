import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Snackbar,
  Alert,
  Typography,
  Box,
  IconButton,
  MenuItem,
} from "@mui/material";
import { Upload, X } from "lucide-react";
import "../styles/Manage.css";
import { addLogEntry, Subsystem, ActionType } from '../CheckLogs';
import { useAuth } from "../../context/AuthContext";

// Interface for Category
interface Category {
  id: number;
  name: string;
  is_active?: boolean;
}

interface Thesis {
  title: string;
  description: string;
  author: string;
  category: string;
  pdf_url: string;
  isActive: boolean;
  publishing_year: number | null;
}

interface AddThesisFormProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  refreshTheses: () => void;
}

const AddThesisForm: React.FC<AddThesisFormProps> = ({ open, setOpen, refreshTheses }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState<Thesis>({
    title: "",
    description: "",
    author: "",
    category: "", // Default to empty string
    pdf_url: "",
    isActive: true,
    publishing_year: null
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  // Fetch active categories when form opens
  useEffect(() => {
    const fetchActiveCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('category')
          .select('id, name')
          .eq('is_active', true)
          .order('name');

        if (error) throw error;

        setCategories(data || []);

        // Set first category as default if categories exist
        if (data && data.length > 0) {
          setFormData(prev => ({
            ...prev, 
            category: data[0].name
          }));
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        setSnackbar({ 
          open: true, 
          message: "Failed to load categories", 
          severity: "error" 
        });
      }
    };

    if (open) {
      fetchActiveCategories();
    }
  }, [open]);

  const uploadPDF = async (file: File) => {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const { error } = await supabase.storage.from("thesis_pdfs").upload(fileName, file);

      if (error) throw error;

      const { publicUrl } = supabase.storage.from("thesis_pdfs").getPublicUrl(fileName).data;
      return publicUrl;
    } catch (error: any) {
      console.error("Error uploading PDF:", error);
      setSnackbar({ open: true, message: "Error uploading PDF", severity: "error" });
      throw error;
    }
  };

  const { session } = useAuth();
  const user_id = session?.user?.id;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user_id) {
      console.error("User is not authenticated, cannot log action.");
      setSnackbar({ open: true, message: "User not authenticated", severity: "error" });
      return;
    }

    try {
      let pdfUrl = formData.pdf_url;

      if (selectedFile) {
        pdfUrl = await uploadPDF(selectedFile);
      }

      // Insert the thesis into the database
      const { data, error } = await supabase
        .from("Thesis")
        .insert([{ ...formData, pdf_url: pdfUrl }])
        .select();

      if (error) throw error;

      const newThesis = data?.[0];

      if (!newThesis) {
        throw new Error("Failed to retrieve newly inserted thesis.");
      }

      const thesisId = newThesis.id;

      // Log the action
      await addLogEntry(
        Subsystem.THESIS_REPOSITORY,
        ActionType.ADD_THESIS,
        user_id,
        thesisId,
        null,
        null,
        {
          author: formData.author,
          category: formData.category
        }
      );

      setSnackbar({ open: true, message: "Thesis created successfully", severity: "success" });

      setFormData({
        title: "",
        description: "",
        author: "",
        category: categories.length > 0 ? categories[0].name : "",
        pdf_url: "",
        isActive: true,
        publishing_year: null
      });
      setSelectedFile(null);
      setOpen(false);

      refreshTheses();

    } catch (error: any) {
      console.error("Error saving thesis:", error);
      setSnackbar({ open: true, message: error.message || "Error saving thesis", severity: "error" });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        setSnackbar({ open: true, message: "Please upload a PDF file", severity: "error" });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <>
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle className="dialog-title">Add New Thesis</DialogTitle>
        <DialogContent>
          <Box className="form-container">
            <TextField
              fullWidth
              margin="dense"
              label="Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="custom-input"
            />
            <TextField
              fullWidth
              margin="dense"
              label="Description"
              name="description"
              multiline
              rows={3}
              value={formData.description}
              onChange={handleChange}
              className="custom-input"
            />
            <TextField
              select
              label="Category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              fullWidth
              margin="dense"
              className="custom-input"
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: "#6a0dad",
                  },
                },
              }}
            >
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.name}>
                  {category.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              margin="dense"
              label="Author"
              name="author"
              value={formData.author}
              onChange={handleChange}
              className="custom-input"
            />
            <TextField
              fullWidth
              margin="dense"
              label="Publishing Year"
              name="publishing_year"
              type="number"
              value={formData.publishing_year || ""}
              onChange={handleChange}
              className="custom-input"
              inputProps={{ min: 1900, max: new Date().getFullYear() }}
            />

            {/* File Upload */}
            <Box className="file-upload">
              <input type="file" accept="application/pdf" id="upload-button" onChange={handleFileChange} hidden />
              <label htmlFor="upload-button">
                <Button variant="contained" component="span" className="upload-btn">
                  <Upload size={18} />
                  Upload PDF
                </Button>
              </label>
              {selectedFile && (
                <Box className="file-preview">
                  <Typography>{selectedFile.name}</Typography>
                  <IconButton onClick={() => setSelectedFile(null)}>
                    <X size={18} />
                  </IconButton>
                </Box>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} className="cancel-btn">
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant="contained" className="submit-btn">
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={5000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AddThesisForm;