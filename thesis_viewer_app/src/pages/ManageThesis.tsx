import React, { useState, useEffect, useCallback } from "react";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  TextField,
  Select,
  MenuItem,
  Box,
  IconButton,
  SelectChangeEvent,
  Snackbar,
  Alert,
} from "@mui/material";
import AddThesisForm from "../components/ThesisRepository/AddThesisForm";
import EditThesisForm from "../components/ThesisRepository/EditThesisForm";
import DeletionAlert from "../components/Global/DeletionAlert";
import CheckLogs from "../components/Global/CheckLogs";
import { DeleteThesis } from "../components/ThesisRepository/DeleteThesis";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { supabase } from "../lib/supabase";
import { Header } from "../components/Global/Header";
import { usePermissions } from "../context/PermissionsContext";
import { useAuth } from "../context/AuthContext";
import "../styles/Manage.css";
import ManageCategories from "../components/ThesisRepository/ManageCategories";

interface Thesis {
  id: number;
  title: string;
  description: string;
  author: string;
  category: string;
  pdf_url?: string | null;
  isActive: boolean;
  publishing_year: number;
}

interface UserProfile {
  role: string;
}

const ManageThesis: React.FC = () => {
  const [logsOpen, setLogsOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedThesis, setSelectedThesis] = useState<Thesis | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [thesisToDelete, setThesisToDelete] = useState<Thesis | null>(null);

  const [theses, setTheses] = useState<Thesis[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });
  const { deleteThesis } = DeleteThesis();
  const { permissions } = usePermissions();
  const { session } = useAuth();
  const [categoriesOpen, setCategoriesOpen] = useState(false);

  // Fetch user profile to determine role
  useEffect(() => {
    if (session && session.user) {
      const fetchProfile = async () => {
        const { data, error } = await supabase
          .from("users")
          .select("role")
          .eq("id", session.user.id)
          .single();
        if (error) {
          console.error("Error fetching profile:", error.message);
        } else {
          setProfile(data);
        }
      };
      fetchProfile();
    } else {
      setProfile(null);
    }
  }, [session]);

  const isAdmin = profile?.role === "Admin";
  const isLibrarian = profile?.role === "Librarian";

  // Use useCallback to memoize the fetchTheses function
  const fetchTheses = useCallback(async () => {
    setLoading(true);
    let query = supabase.from("Thesis").select("*");

    // For librarians, only show active theses
    if (isLibrarian) {
      query = query.eq("isActive", true);
    } else {
      // For admin, apply status filter if selected
      if (selectedStatus === "Active") query = query.eq("isActive", true);
      if (selectedStatus === "Inactive") query = query.eq("isActive", false);
    }

    // Apply category filter for all roles
    if (selectedCategory) query = query.eq("category", selectedCategory);

    const { data, error } = await query;
    if (error) console.error("Error fetching theses:", error);
    else setTheses(data || []);

    setLoading(false);
  }, [selectedCategory, selectedStatus, isLibrarian]);

  useEffect(() => {
    fetchTheses();
  }, [fetchTheses, profile]); // Added profile to dependencies

  const handleEditClick = (thesis: Thesis) => {
    setSelectedThesis(thesis);
    setEditOpen(true);
  };

  const handleDeleteClick = (thesis: Thesis) => {
    setThesisToDelete(thesis);
    setDeleteDialogOpen(true);
  };

    const handleDeleteConfirm = async () => {
      if (!thesisToDelete || !session?.user?.id) return;

      const result = await deleteThesis(
        thesisToDelete,
        isAdmin,
        session.user.id
      );

      setSnackbar({
        open: true,
        message: result.message,
        severity: result.success ? "success" : "error",
      });

      if (result.success) {
        // Refresh theses list
        fetchTheses();
      }
      
      setDeleteDialogOpen(false);
      setThesisToDelete(null);
  };

  const handleCategoryChange = (event: SelectChangeEvent<string>) => {
    setSelectedCategory(event.target.value);
  };

  const handleStatusChange = (event: SelectChangeEvent<string>) => {
    setSelectedStatus(event.target.value);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const filteredTheses = searchQuery
    ? theses.filter(
        (thesis) =>
          thesis.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (thesis.description &&
            thesis.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : theses;

  return (
    <>
      <Header />

      <div className="manage-thesis">
        <div className="manage-background-gradient"></div>
        <div className="manage-background-blur"></div>
        <div className="manage-background-radial"></div>

        <h1 className="title">Manage Theses</h1>

        {!isLibrarian && (
          <Box display="flex" gap= "10px" justifyContent="flex-end" width="100%">
            <Button
              onClick={() => setLogsOpen(true)}
              className="add-thesis-btn"
              variant="contained"
            >
              View Logs
            </Button>
            {permissions?.ThesisRepository_edit && (
              <Button
                onClick={() => setCategoriesOpen(true)}
                className="add-thesis-btn"
                variant="contained"
              >
                Manage Categories
              </Button>
              )}
          </Box>
        )}

        <CheckLogs open={logsOpen} onClose={() => setLogsOpen(false)} context="thesis" />
        <ManageCategories open={categoriesOpen} onClose={() => setCategoriesOpen(false)} />

        {/* Filters & Search */}
        <div className="filters-wrapper">
          {/* Search Bar */}
          <Box className="search-box">
            <TextField
              fullWidth
              variant="standard"
              placeholder="Search thesis..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{ disableUnderline: true, className: "search-field" }}
            />
            <Search size={25} className="search-icon" />
          </Box>

          {/* Filters & Add Button horizontally aligned */}
          <div className="filters-right">
            <Select
              className="category-filter"
              value={selectedCategory}
              displayEmpty
              onChange={handleCategoryChange}
            >
              <MenuItem value="">All Categories</MenuItem>
              <MenuItem value="Science">Science</MenuItem>
              <MenuItem value="Technology">Technology</MenuItem>
              <MenuItem value="Mathematics">Mathematics</MenuItem>
            </Select>

            {!isLibrarian && (
              <Select
                className="status-filter"
                value={selectedStatus}
                displayEmpty
                onChange={handleStatusChange}
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
              </Select>
            )}
            
            {permissions?.ThesisRepository_add ? (
              <Button
                onClick={() => setFormOpen(true)}
                className="add-thesis-btn"
                variant="contained"
              >
                <Plus size={18} />
                <span>Add Thesis</span>
              </Button>
            ) : null}
          </div>
        </div>

        {/* Thesis Table */}
        <TableContainer component={Paper} className="content">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Author</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Publishing Year</TableCell>
                {!isLibrarian && <TableCell>Status</TableCell>}
                <TableCell>PDF</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={isLibrarian ? 6 : 7} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : filteredTheses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isLibrarian ? 6 : 7} align="center">
                    No theses found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredTheses.map((thesis) => (
                  <TableRow key={thesis.id}>
                    <TableCell>{thesis.title}</TableCell>
                    <TableCell>{thesis.description}</TableCell>
                    <TableCell>{thesis.author}</TableCell>
                    <TableCell>{thesis.category}</TableCell>
                    <TableCell>{thesis.publishing_year || 'No publishing year added'}</TableCell>
                    {!isLibrarian && (
                      <TableCell>
                        {thesis.isActive ? (
                          <span style={{ color: "green", fontWeight: "bold" }}>Active</span>
                        ) : (
                          <span style={{ color: "gray", fontWeight: "bold" }}>Inactive</span>
                        )}
                      </TableCell>
                    )}
                    <TableCell>
                      {thesis.pdf_url ? (
                        <a href={thesis.pdf_url} target="_blank" rel="noopener noreferrer">
                          View PDF
                        </a>
                      ) : (
                        "No PDF"
                      )}
                    </TableCell>
                    {(permissions?.ThesisRepository_edit || permissions?.ThesisRepository_delete) ? (
                    <TableCell>
                      {permissions?.ThesisRepository_edit ? (
                        <IconButton color="primary" onClick={() => handleEditClick(thesis)}>
                          <Edit size={20} />
                        </IconButton>
                      ) : null}
                      
                      {permissions?.ThesisRepository_delete ? (
                        <IconButton color="error" onClick={() => handleDeleteClick(thesis)}>
                          <Trash2 size={20} />
                        </IconButton>
                      ) : null}
                    </TableCell>
                    ) : (
                      <TableCell>No Actions Allowed!</TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <AddThesisForm open={formOpen} setOpen={setFormOpen} refreshTheses={fetchTheses} />
        {editOpen && selectedThesis && (
          <EditThesisForm
            open={editOpen}
            handleClose={() => setEditOpen(false)}
            thesis={selectedThesis}
            onUpdate={fetchTheses}
            isLibrarian={isLibrarian} // Pass role to disable status toggle for librarians
          />
        )}

        {/* Delete Confirmation Dialog */}
        <DeletionAlert
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          onConfirm={handleDeleteConfirm}
          title="Delete Thesis"
          message={
            isAdmin
              ? "Are you sure you want to permanently delete this thesis? This action cannot be undone."
              : "Are you sure you want to delete this thesis? It will no longer be visible to users."
          }
        />

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </div>
    </>
  );
};

export default ManageThesis;