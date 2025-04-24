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
        <DialogTitle sx={{ color: '#4682A9', fontWeight: '600' }}>Add New Thesis</DialogTitle>
        <DialogContent>
          <Box sx={{ backgroundColor: '#F6F4EB', borderRadius: '16px', padding: '2rem', marginBottom: '3rem' }}>
            <TextField
              fullWidth
              margin="dense"
              label="Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              sx={{
                backgroundColor: 'white', 
                marginBottom: '1rem',
                '& .MuiInputBase-root': { borderRadius: '8px' },
              }}
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
              sx={{
                backgroundColor: 'white', 
                marginBottom: '1rem',
                '& .MuiInputBase-root': { borderRadius: '8px' },
              }}
            />
            <TextField
              select
              label="Category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              fullWidth
              margin="dense"
              sx={{
                backgroundColor: 'white', 
                marginBottom: '1rem',
                '& .MuiInputBase-root': { borderRadius: '8px' },
              }}
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
              sx={{
                backgroundColor: 'white', 
                marginBottom: '1rem',
                '& .MuiInputBase-root': { borderRadius: '8px' },
              }}
            />
            <TextField
              fullWidth
              margin="dense"
              label="Publishing Year"
              name="publishing_year"
              type="number"
              value={formData.publishing_year || ""}
              onChange={handleChange}
              sx={{
                backgroundColor: 'white', 
                marginBottom: '1rem',
                '& .MuiInputBase-root': { borderRadius: '8px' },
              }}
              inputProps={{ min: 1900, max: new Date().getFullYear() }}
            />
            <FileUpload selectedFile={selectedFile} onFileChange={setSelectedFile} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'space-between', padding: '1rem' }}>
          <Button onClick={handleClose} sx={{ backgroundColor: 'transparent', color: '#4682A9', fontWeight: 'normal' }}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            sx={{
              backgroundColor: '#4682A9', 
              color: '#fff', 
              fontWeight: 'bold',
              '&:hover': { backgroundColor: '#749BC2' }
            }} 
            disabled={isLoading}
          >
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
