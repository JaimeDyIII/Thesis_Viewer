import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Snackbar,
  Alert,
  Box,
  MenuItem,
} from "@mui/material";
import "../../../styles/Manage.css";
import { useThesisForm } from "../../../hooks/useThesisForm";
import { useCategories } from "../../../hooks/useCategories";
import { FileUpload } from "./FileUpload";

interface AddThesisFormProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  refreshTheses: () => void;
}

const AddThesisForm: React.FC<AddThesisFormProps> = ({ open, setOpen, refreshTheses }) => {
  const { categories, loading: categoriesLoading } = useCategories();
  const {
    formData,
    selectedFile,
    setSelectedFile,
    handleChange,
    handleSubmit,
    resetForm,
    isLoading,
    error
  } = useThesisForm(() => {
    resetForm();
    setOpen(false);
    refreshTheses();
  });

  const handleClose = () => {
    setOpen(false);
    resetForm();
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
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
              disabled={categoriesLoading}
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

            <FileUpload selectedFile={selectedFile} onFileChange={setSelectedFile} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} className="cancel-btn">
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant="contained" className="submit-btn" disabled={isLoading}>
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!error} autoHideDuration={5000} onClose={() => {}}>
        <Alert severity="error" onClose={() => {}}>
          {error?.message || "Error saving thesis"}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AddThesisForm;