import React, { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from "@mui/material";

interface ThesisFormData {
  title: string;
  description: string;
  category: string;
  pdfFile?: File | null;
  isActive?: boolean;
}

interface AddThesisFormProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onSubmit: (newThesis: ThesisFormData) => Promise<void>; // Ensure type matches ManageThesis
}

const AddThesisForm: React.FC<AddThesisFormProps> = ({ open, setOpen, onSubmit }) => {
  const [formData, setFormData] = useState<ThesisFormData>({
    title: "",
    description: "",
    category: "",
    pdfFile: null,
    isActive: true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFormData({ ...formData, pdfFile: e.target.files[0] });
    }
  };

  const handleSubmit = async () => {
    await onSubmit(formData);
    setOpen(false);
  };

  return (
    <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
      <DialogTitle>Add New Thesis</DialogTitle>
      <DialogContent>
        <TextField fullWidth margin="dense" label="Title" name="title" value={formData.title} onChange={handleChange} />
        <TextField fullWidth margin="dense" label="Description" name="description" value={formData.description} onChange={handleChange} />
        <TextField fullWidth margin="dense" label="Category" name="category" value={formData.category} onChange={handleChange} />
        <input type="file" accept="application/pdf" onChange={handleFileChange} />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpen(false)}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddThesisForm;
