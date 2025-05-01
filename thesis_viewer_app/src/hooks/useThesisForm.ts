import { useState } from 'react';
import { ThesisCreateInput } from '../api/thesis/types';
import { useMutation } from '@tanstack/react-query';
import { createThesis } from '../api/thesis/mutations';
import { ThesisFileService } from '../services/ThesisFileService';
import { useAuth } from '../context/AuthContext';
import { ThesisNotificationService } from '../services/ThesisNotificationService';
import { addLogEntry, Subsystem, ActionType } from '../components/Global/CheckLogs';

interface FormErrors {
  title?: string;
  description?: string;
  author?: string;
  category?: string;
  publishing_year?: string;
  file?: string;
}

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
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const { session } = useAuth();
  const user_id = session?.user?.id;

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    let isValid = true;

    if (!formData.title.trim()) {
      errors.title = "Title is required";
      isValid = false;
    }

    if (!formData.description.trim()) {
      errors.description = "Description is required";
      isValid = false;
    }

    if (!formData.author.trim()) {
      errors.author = "Author is required";
      isValid = false;
    }

    if (!formData.category) {
      errors.category = "Category is required";
      isValid = false;
    }

    if (!formData.publishing_year) {
      errors.publishing_year = "Publishing year is required";
      isValid = false;
    } else if (formData.publishing_year < 1900 || formData.publishing_year > new Date().getFullYear()) {
      errors.publishing_year = `Publishing year must be between 1900 and ${new Date().getFullYear()}`;
      isValid = false;
    }

    if (!selectedFile) {
      errors.file = "PDF file is required";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

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
    
    if (!validateForm()) {
      return;
    }

    await createThesisMutation.mutateAsync(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error when user starts typing
    if (formErrors[name as keyof FormErrors]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
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
    setFormErrors({});
  };

  return {
    formData,
    selectedFile,
    setSelectedFile,
    handleChange,
    handleSubmit,
    resetForm,
    isLoading: createThesisMutation.isPending,
    error: createThesisMutation.error,
    formErrors
  };
}; 