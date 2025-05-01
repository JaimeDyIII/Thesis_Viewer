import { Box, Button, Typography, IconButton } from "@mui/material";
import { Upload, X } from "lucide-react";
import React from "react";

interface FileUploadProps {
  selectedFile: File | null;
  onFileChange: (file: File | null) => void;
  required?: boolean;
  error?: boolean;
  helperText?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({ 
  selectedFile, 
  onFileChange, 
  required = false,
  error = false,
  helperText
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        alert("Please upload a PDF file");
        return;
      }
      onFileChange(file);
    }
  };

  return (
    <Box className="file-upload">
      <input
        type="file"
        accept="application/pdf"
        id="upload-button"
        onChange={handleFileChange}
        hidden
      />
      <label htmlFor="upload-button">
        <Button 
          variant="contained" 
          component="span" 
          className="upload-btn"
          sx={{
            border: error ? '1px solid #d32f2f' : 'none',
            '&:hover': {
              border: error ? '1px solid #d32f2f' : 'none',
            }
          }}
        >
          <Upload size={18} />
          {required ? "Upload PDF *" : "Upload PDF"}
        </Button>
      </label>
      {selectedFile && (
        <Box className="file-preview" sx={{ display: 'flex', alignItems: 'center', gap: 1, marginTop: 1 }}>
          <Typography>{selectedFile.name}</Typography>
          <IconButton onClick={() => onFileChange(null)}>
            <X size={18} />
          </IconButton>
        </Box>
      )}
      {error && helperText && (
        <Typography color="error" variant="caption" sx={{ display: 'block', mt: 0.5 }}>
          {helperText}
        </Typography>
      )}
    </Box>
  );
};
