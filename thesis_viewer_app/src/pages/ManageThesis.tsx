// Keep your imports unchanged
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
  Snackbar,
  Alert,
  Typography,
} from "@mui/material";
import AddThesisForm from "../components/ThesisRepository/ManageThesis/AddThesisForm";
import EditThesisForm from "../components/ThesisRepository/ManageThesis/EditThesisForm";
import DeletionAlert from "../components/Global/DeletionAlert";
import CheckLogs from "../components/Global/CheckLogs";
import { DeleteThesis } from "../components/ThesisRepository/ManageThesis/DeleteThesis";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { supabase } from "../lib/supabase";
import { Header } from "../components/Global/Header";
import { usePermissions } from "../context/PermissionsContext";
import { useAuth } from "../context/AuthContext";
import "../styles/Manage.css";
import ManageCategories from "../components/ThesisRepository/ManageThesis/ManageCategories";

// Interfaces unchanged
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

  useEffect(() => {
    if (session?.user) {
      const fetchProfile = async () => {
        const { data, error } = await supabase
          .from("users")
          .select("role")
          .eq("id", session.user.id)
          .single();
        if (data) setProfile(data);
        else console.error("Error fetching profile:", error?.message);
      };
      fetchProfile();
    } else {
      setProfile(null);
    }
  }, [session]);

  const isAdmin = profile?.role === "Admin";
  const isLibrarian = profile?.role === "Librarian";

  const fetchTheses = useCallback(async () => {
    setLoading(true);
    let query = supabase.from("Thesis").select("*");

    if (isLibrarian) query = query.eq("isActive", true);
    else {
      if (selectedStatus === "Active") query = query.eq("isActive", true);
      if (selectedStatus === "Inactive") query = query.eq("isActive", false);
    }

    if (selectedCategory) query = query.eq("category", selectedCategory);

    const { data, error } = await query;
    if (!error) setTheses(data || []);
    else console.error("Error fetching theses:", error);

    setLoading(false);
  }, [selectedCategory, selectedStatus, isLibrarian]);

  useEffect(() => {
    fetchTheses();
  }, [fetchTheses, profile]);

  const handleDeleteConfirm = async () => {
    if (!thesisToDelete || !session?.user?.id) return;
    const result = await deleteThesis(thesisToDelete, isAdmin, session.user.id);
    setSnackbar({
      open: true,
      message: result.message,
      severity: result.success ? "success" : "error",
    });
    if (result.success) fetchTheses();
    setDeleteDialogOpen(false);
    setThesisToDelete(null);
  };

  const filteredTheses = searchQuery
    ? theses.filter((t) =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.description?.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : theses;

  return (
    <>
      <Header />
      <div className="patterned-background">
        <div className="content-container">
          <div className="white-container">
            <Typography variant="h4" gutterBottom>Manage Theses</Typography>

            {!isLibrarian && (
              <Box display="flex" flexDirection={{ xs: "column", sm: "row" }} gap={2} justifyContent="flex-end">
                <Button onClick={() => setLogsOpen(true)} className="button-primary" variant="contained">View Logs</Button>
                {permissions?.ThesisRepository_edit && (
                  <Button onClick={() => setCategoriesOpen(true)} className="button-primary" variant="contained">Manage Categories</Button>
                )}
              </Box>
            )}

            <CheckLogs open={logsOpen} onClose={() => setLogsOpen(false)} context="thesis" />
            <ManageCategories open={categoriesOpen} onClose={() => setCategoriesOpen(false)} />

            <Box mt={3} display="flex" flexDirection={{ xs: "column", sm: "row" }} gap={2} alignItems={{ xs: "stretch", sm: "center" }}>
              <Box display="flex" flex={1} alignItems="center" gap={1}>
                <TextField
                  fullWidth
                  placeholder="Search thesis..."
                  variant="outlined"
                  size="small"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search />
              </Box>

              <Box display="flex" flexDirection={{ xs: "column", sm: "row" }} gap={2} width={{ xs: "100%", sm: "auto" }}>
                <Select
                  size="small"
                  value={selectedCategory}
                  displayEmpty
                  fullWidth
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <MenuItem value="">All Categories</MenuItem>
                  <MenuItem value="Science">Science</MenuItem>
                  <MenuItem value="Technology">Technology</MenuItem>
                  <MenuItem value="Mathematics">Mathematics</MenuItem>
                </Select>
                {!isLibrarian && (
                  <Select
                    size="small"
                    value={selectedStatus}
                    displayEmpty
                    fullWidth
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    <MenuItem value="">All Status</MenuItem>
                    <MenuItem value="Active">Active</MenuItem>
                    <MenuItem value="Inactive">Inactive</MenuItem>
                  </Select>
                )}
                {permissions?.ThesisRepository_add && (
                  <Button
                    onClick={() => setFormOpen(true)}
                    className="button-primary"
                    variant="contained"
                    fullWidth={window.innerWidth < 600}
                  >
                    <Plus size={16} style={{ marginRight: 4 }} />
                    Add Thesis
                  </Button>
                )}
              </Box>
            </Box>

            <TableContainer component={Paper} sx={{ mt: 3, overflowX: "auto" }}>
              <Table size="small">
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
                      <TableCell colSpan={8} align="center">
                        <CircularProgress />
                      </TableCell>
                    </TableRow>
                  ) : filteredTheses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
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
                        <TableCell>{thesis.publishing_year}</TableCell>
                        {!isLibrarian && (
                          <TableCell>
                            <strong style={{ color: thesis.isActive ? "green" : "gray" }}>
                              {thesis.isActive ? "Active" : "Inactive"}
                            </strong>
                          </TableCell>
                        )}
                        <TableCell>
                          {thesis.pdf_url ? (
                            <a href={thesis.pdf_url} target="_blank" rel="noopener noreferrer">View PDF</a>
                          ) : "No PDF"}
                        </TableCell>
                        <TableCell>
                          {permissions?.ThesisRepository_edit && (
                            <IconButton onClick={() => {
                              setSelectedThesis(thesis);
                              setEditOpen(true);
                            }}>
                              <Edit size={20} />
                            </IconButton>
                          )}
                          {permissions?.ThesisRepository_delete && (
                            <IconButton onClick={() => {
                              setThesisToDelete(thesis);
                              setDeleteDialogOpen(true);
                            }} color="error">
                              <Trash2 size={20} />
                            </IconButton>
                          )}
                        </TableCell>
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
                isLibrarian={isLibrarian}
              />
            )}

            <DeletionAlert
              open={deleteDialogOpen}
              onClose={() => setDeleteDialogOpen(false)}
              onConfirm={handleDeleteConfirm}
              title="Delete Thesis"
              message={isAdmin
                ? "Are you sure you want to permanently delete this thesis? This action cannot be undone."
                : "Are you sure you want to delete this thesis? It will no longer be visible to users."
              }
            />

            <Snackbar
              open={snackbar.open}
              autoHideDuration={6000}
              onClose={() => setSnackbar({ ...snackbar, open: false })}
              anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
              <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
                {snackbar.message}
              </Alert>
            </Snackbar>
          </div>
        </div>
      </div>
    </>
  );
};

export default ManageThesis;
