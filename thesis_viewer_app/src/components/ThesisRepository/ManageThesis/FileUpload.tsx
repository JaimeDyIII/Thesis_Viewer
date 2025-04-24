import { Box, Button, Typography, IconButton } from "@mui/material";
import { Upload, X } from "lucide-react";
import React from "react";

interface FileUploadProps {
  selectedFile: File | null;
  onFileChange: (file: File | null) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ selectedFile, onFileChange }) => {
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
        <Button variant="contained" component="span" className="upload-btn">
          <Upload size={18} />
          Upload PDF
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
    </Box>
  );
};
