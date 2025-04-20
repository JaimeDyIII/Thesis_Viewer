import { useState } from 'react';
import { ThesisCreateInput } from '../api/thesis/types';
import { useMutation } from '@tanstack/react-query';
import { createThesis } from '../api/thesis/mutations';
import { ThesisFileService } from '../services/ThesisFileService';
import { useAuth } from '../context/AuthContext';
import { ThesisNotificationService } from '../services/ThesisNotificationService';
import { addLogEntry, Subsystem, ActionType } from '../components/Global/CheckLogs';

export const useThesisForm = (onSuccess?: () => void) => {
  const [formData, setFormData] = useState<ThesisCreateInput>({
    title: "",
    description: "",
    author: "",
    category: "",
    pdf_url: "",
    isActive: true,
    publishing_year: undefined
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { session } = useAuth();
  const user_id = session?.user?.id;

  const createThesisMutation = useMutation({
    mutationFn: async (data: ThesisCreateInput) => {
      let pdfUrl = data.pdf_url;
      if (selectedFile) {
        pdfUrl = await ThesisFileService.uploadPDF(selectedFile);
      }
      return createThesis({ ...data, pdf_url: pdfUrl });
    },
    onSuccess: async (data) => {
      if (user_id) {
        await ThesisNotificationService.notifyThesisUpload(formData.title, user_id);
        await addLogEntry(
          Subsystem.THESIS_REPOSITORY,
          ActionType.ADD_THESIS,
          user_id,
          data.id,
          null,
          null,
          {
            author: formData.author,
            category: formData.category
          }
        );
      }
      onSuccess?.();
    }
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user_id) {
      throw new Error("User not authenticated");
    }
    await createThesisMutation.mutateAsync(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      author: "",
      category: "",
      pdf_url: "",
      isActive: true,
      publishing_year: undefined
    });
    setSelectedFile(null);
  };

  return {
    formData,
    selectedFile,
    setSelectedFile,
    handleChange,
    handleSubmit,
    resetForm,
    isLoading: createThesisMutation.isPending,
    error: createThesisMutation.error
  };
}; 