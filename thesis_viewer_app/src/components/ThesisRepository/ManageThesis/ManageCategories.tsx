import { useState, useEffect } from "react";
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
  IconButton,
  Typography,
  TableCell,
  Paper,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  Table,
} from '@mui/material';
import { Edit, Trash2, Plus } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../context/AuthContext';
import { addLogEntry, Subsystem, ActionType } from '../../Global/CheckLogs';

interface Category {
  id: number;
  name: string;
  created_at?: string;
}

const ManageCategories: React.FC<{
  open: boolean;
  onClose: () => void;
}> = ({ open, onClose }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [newCategory, setNewCategory] = useState({ name: '' });
  const { session } = useAuth();
  const user_id = session?.user?.id;

  const fetchCategories = async () => {
    try {
      console.log('Fetching categories...');
      const { data, error } = await supabase
        .from('category')
        .select('id, name, created_at')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Fetched categories:', data);
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  useEffect(() => {
    console.log('Dialog opened:', open);
    if (open) {
      fetchCategories();
    }
  }, [open]);

  const handleAddCategory = async () => {
    if (!user_id || !newCategory.name.trim()) return;

    try {
      const { data, error } = await supabase
        .from('category')
        .insert({
          name: newCategory.name.trim(),
          is_active: true
        })
        .select();

      if (error) throw error;

      // Log the action with clear, string-based details
      await addLogEntry(
        Subsystem.THESIS_REPOSITORY,
        ActionType.EDIT_CATEGORIES,
        user_id,
        null,
        null,
        data[0].id,
        { 
          action: 'add',
          category: newCategory.name
        }
      );

      setNewCategory({ name: '' });
      fetchCategories();
    } catch (error) {
      console.error('Error adding category:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleUpdateCategory = async () => {
    if (!editCategory || !user_id) return;

    try {
      const { data: oldCategory, error: fetchError } = await supabase
        .from('category')
        .select('name')
        .eq('id', editCategory.id)
        .single();

      if (fetchError) throw fetchError;

      const { error } = await supabase
        .from('category')
        .update({
          name: editCategory.name
        })
        .eq('id', editCategory.id);

      if (error) throw error;

      // Log the action with clear, string-based details
      await addLogEntry(
        Subsystem.THESIS_REPOSITORY,
        ActionType.EDIT_CATEGORIES,
        user_id,
        null,
        null,
        editCategory.id,
        { 
          action: 'edit',
          category: `${oldCategory.name} → ${editCategory.name}`
        }
      );

      setEditCategory(null);
      fetchCategories();
    } catch (error) {
      console.error('Error updating category:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDeleteCategory = async (categoryId: number, categoryName: string) => {
    if (!user_id) return;

    try {
      const { error } = await supabase
        .from('category')
        .update({ is_active: false })
        .eq('id', categoryId);

      if (error) throw error;

      // Log the action with clear, string-based details
      await addLogEntry(
        Subsystem.THESIS_REPOSITORY,
        ActionType.EDIT_CATEGORIES,
        user_id,
        null,
        null,
        categoryId,
        { 
          action: 'delete',
          category: categoryName
        }
      );

      fetchCategories();
    } catch (error) {
      console.error('Error deactivating category:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h6" fontWeight="bold">Manage Categories</Typography>
      </DialogTitle>
      <DialogContent>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
          <TextField
            label="Category Name"
            value={newCategory.name}
            onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
            fullWidth
            variant="outlined"
          />
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleAddCategory}
            disabled={!newCategory.name.trim()}
            startIcon={<Plus size={18} />}
          >
            Add Category
          </Button>
        </div>

        {categories.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Typography>No categories found. Add a new category to get started.</Typography>
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    {editCategory?.id === category.id ? (
                      <>
                        <TableCell>{category.id}</TableCell>
                        <TableCell>
                          <TextField
                            value={editCategory.name}
                            onChange={(e) => setEditCategory({ ...editCategory, name: e.target.value })}
                            fullWidth
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Button 
                            onClick={handleUpdateCategory} 
                            color="primary" 
                            variant="contained"
                            disabled={!editCategory.name.trim()}
                          >
                            Save
                          </Button>
                          <Button 
                            onClick={() => setEditCategory(null)} 
                            color="secondary"
                            variant="outlined"
                            sx={{ ml: 1 }}
                          >
                            Cancel
                          </Button>
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell>{category.id}</TableCell>
                        <TableCell>{category.name}</TableCell>
                        <TableCell>
                          <IconButton 
                            onClick={() => setEditCategory(category)}
                            color="primary"
                            title="Edit Category"
                          >
                            <Edit size={20} />
                          </IconButton>
                          <IconButton 
                            onClick={() => handleDeleteCategory(category.id, category.name)}
                            color="error"
                            title="Delete Category"
                          >
                            <Trash2 size={20} />
                          </IconButton>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary" variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ManageCategories;