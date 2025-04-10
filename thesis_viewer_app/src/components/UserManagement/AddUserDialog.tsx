import React, { useState } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  CircularProgress,
} from "@mui/material";
import { supabase } from "../../lib/supabase";
import { addLogEntry, Subsystem, ActionType } from "../../components/CheckLogs";

interface AddUserDialogProps {
  open: boolean;
  onClose: () => void;
  onUserAdded: (data: { message: string; newUser: any }) => void;
  currentUserId: string | undefined;
}

interface FormDataType {
  name: string;
  email: string;
  role: string;
}

const AddUserDialog: React.FC<AddUserDialogProps> = ({ open, onClose, onUserAdded, currentUserId }) => {
  const [formData, setFormData] = useState<FormDataType>({
    name: "",
    email: "",
    role: "User", // Default role
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement> | { target: { name?: string; value: unknown } }) => {
    if ("target" in e) {
      const { name, value } = e.target as HTMLInputElement;
      if (name) {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
        }));
      }
    }
  };
  

  const validateEmail = (email: string): boolean => {
    const re = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
    return re.test(email);
  };

  const handleSubmit = async (): Promise<void> => {
    // Reset error message
    setErrorMessage("");

    // Validate required fields
    if (!formData.name.trim() || !formData.email.trim() || !formData.role) {
      setErrorMessage("All fields are required");
      return;
    }

    // Validate email format
    if (!validateEmail(formData.email)) {
      setErrorMessage("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      // Check if email already exists
      const { data: existingUsers, error: checkError } = await supabase
        .from("users")
        .select("email")
        .eq("email", formData.email);

      if (checkError) {
        throw checkError;
      }

      if (existingUsers && existingUsers.length > 0) {
        setErrorMessage("A user with this email already exists");
        setLoading(false);
        return;
      }

      // Insert new user into the database
      const { data, error } = await supabase
        .from("users")
        .insert({
          name: formData.name,
          email: formData.email,
          role: formData.role,
        })
        .select();

      if (error) {
        throw error;
      }

      const newUser = data[0];

      // Define default permissions for the selected role
      const defaultPermissions: Record<string, Record<string, string[]>> = {
        "Admin": {
          "ThesisRepository": ["view", "add", "edit", "delete"],
          "UserManagement": ["view", "add", "edit", "delete"]
        },
        "Librarian": {
          "ThesisRepository": ["view", "add", "delete"],
          "UserManagement": ["view"]
        },
        "User": {
          "ThesisRepository": ["view"],
          "UserManagement": []
        }
      };

      // Insert permissions for the new user
      const permissions = defaultPermissions[formData.role];
      
      for (const [subsystem, actions] of Object.entries(permissions)) {
        for (const action of actions) {
          await supabase
            .from("user_permissions")
            .insert({
              user_id: newUser.id,
              subsystem: subsystem,
              action: action,
              created_by: currentUserId
            });
        }
      }

      // Add log entry
      await addLogEntry(
        Subsystem.USER_MANAGEMENT,
        ActionType.ADD_USER,
        currentUserId as string,
        null,
        newUser.id,
        null,
        {
          name: newUser.name,
          email: newUser.email,
          role: newUser.role
        }
      );

      // Success - close dialog and refresh user list
      onUserAdded({
        message: `User ${newUser.name} added successfully ✅`,
        newUser
      });
      
      // Reset form data
      setFormData({
        name: "",
        email: "",
        role: "User",
      });
      
      onClose();
    } catch (error: any) {
      console.error("Error adding user:", error);
      setErrorMessage(error.message || "Failed to add user. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New User</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField
            name="name"
            label="Full Name"
            value={formData.name}
            onChange={handleChange}
            fullWidth
            required
          />
          <TextField
            name="email"
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={handleChange}
            fullWidth
            required
          />
          <FormControl fullWidth required>
            <InputLabel>Role</InputLabel>
            <Select
              name="role"
              value={formData.role}
              onChange={handleChange}
              label="Role"
            >
              <MenuItem value="Admin">Admin</MenuItem>
              <MenuItem value="Librarian">Librarian</MenuItem>
              <MenuItem value="User">User</MenuItem>
            </Select>
          </FormControl>
          {errorMessage && (
            <Box sx={{ color: "error.main", mt: 1 }}>{errorMessage}</Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? "Adding..." : "Add User"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddUserDialog;