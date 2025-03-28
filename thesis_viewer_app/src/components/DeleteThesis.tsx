import React, { useState } from "react";
import { supabase } from "../lib/supabase";
import { addLogEntry, ActionType, Subsystem } from "./CheckLogs";
import DeletionAlert from "./DeletionAlert";

interface Thesis {
  id: number;
  title: string;
  description: string;
  author: string;
  category: string;
  pdf_url?: string | null;
  isActive: boolean;
}

interface DeletionResult {
  success: boolean;
  message: string;
}

interface ThesisDeletionProps {
  thesis: Thesis | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  isAdmin: boolean;
  userId: string;
}

export const DeleteThesis = () => {
    const deleteThesis = async (
      thesis: Thesis,
      isAdmin: boolean,
      userId: string
    ): Promise<DeletionResult> => {
      try {
        if (isAdmin) {
          // 🔹 Fetch thesis details before deletion
          const { data: thesisData, error: fetchError } = await supabase
            .from("Thesis")
            .select("title, author, category, isActive")
            .eq("id", thesis.id)
            .single();
  
          if (fetchError || !thesisData) {
            console.error("Error fetching thesis details before deletion:", fetchError);
            throw fetchError;
          }
  
          // 🔹 Log the deletion *before* deleting the thesis
          await addLogEntry(
            Subsystem.THESIS_REPOSITORY,
            ActionType.DELETE_THESIS,
            userId,
            null, // ID still exists at this point
            null,
            null,
            {
              deletion_type: "permanent",
              thesis_id: thesis.id,
              title: thesisData.title,
              author: thesisData.author,
              category: thesisData.category
            }
          );
  
          // 🔹 Remove foreign key references (set to NULL)
          await supabase
            .from("system_logs")
            .update({ thesis_id: null })
            .eq("thesis_id", thesis.id);
  
          // 🔹 Proceed with actual deletion
          const { error: deleteError } = await supabase
            .from("Thesis")
            .delete()
            .eq("id", thesis.id);
  
          if (deleteError) throw deleteError;
  
          return {
            success: true,
            message: "Thesis permanently deleted successfully!"
          };
        } else {
          // 🔹 Librarian: Set to inactive
          const { error } = await supabase
            .from("Thesis")
            .update({ isActive: false })
            .eq("id", thesis.id);
  
          if (error) throw error;
  
          // 🔹 Log soft deletion before update
          await addLogEntry(
            Subsystem.THESIS_REPOSITORY,
            ActionType.DELETE_THESIS,
            userId,
            thesis.id,
            null,
            null,
            {
              deletion_type: "set to inactive"
            }
          );
  
          return {
            success: true,
            message: "Thesis deleted successfully!"
          };
        }
      } catch (error) {
        console.error("Error deleting thesis:", error);
        return {
          success: false,
          message: `Error deleting thesis: ${error instanceof Error ? error.message : "Unknown error"}`
        };
      }
    };
  
    return { deleteThesis };
  };  

export const ThesisDeletionService: React.FC<ThesisDeletionProps> = ({
  thesis,
  isOpen,
  onClose,
  onSuccess,
  isAdmin,
  userId
}) => {
  const { deleteThesis } = DeleteThesis();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    if (!thesis) return;
    
    setIsDeleting(true);
    
    try {
      const result = await deleteThesis(thesis, isAdmin, userId);
      
      if (result.success) {
        onSuccess();
      } else {
        console.error(result.message);
      }
    } catch (error) {
      console.error("Error in delete operation:", error);
    } finally {
      setIsDeleting(false);
      onClose();
    }
  };

  return (
    <DeletionAlert
      open={isOpen}
      onClose={onClose}
      onConfirm={handleConfirmDelete}
      title="Delete Thesis"
      message={
        isAdmin
          ? "Are you sure you want to permanently delete this thesis? This action cannot be undone."
          : "Are you sure you want to delete this thesis? It will no longer be visible to users."
      }
    />
  );
};