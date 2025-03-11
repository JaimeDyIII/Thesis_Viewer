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
} from "@mui/material";
import AddThesisForm from "../components/AddThesisForm";
import EditThesisForm from "../components/EditThesisForm";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { supabase } from "../lib/supabase";
import { Header } from "../components/Header";
import { usePermissions } from "../context/PermissionsContext";
import "../styles/ManageThesis.css";

interface Thesis {
  id: number;
  title: string;
  description: string;
  author: string;
  category: string;
  pdf_url?: string | null;
  isActive: boolean;
}

const ManageThesis: React.FC = () => {
  const [formOpen, setFormOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedThesis, setSelectedThesis] = useState<Thesis | null>(null);

  const [theses, setTheses] = useState<Thesis[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  const { permissions } = usePermissions();

  // Use useCallback to memoize the fetchTheses function
  const fetchTheses = useCallback(async () => {
    setLoading(true);
    let query = supabase.from("Thesis").select("*");

    if (selectedCategory) query = query.eq("category", selectedCategory);
    if (selectedStatus === "Active") query = query.eq("isActive", true);
    if (selectedStatus === "Inactive") query = query.eq("isActive", false);

    const { data, error } = await query;
    if (error) console.error("Error fetching theses:", error);
    else setTheses(data || []);

    setLoading(false);
  }, [selectedCategory, selectedStatus]);

  useEffect(() => {
    fetchTheses();
  }, [fetchTheses]); // Now fetchTheses is properly included in the dependency array

  const handleEditClick = (thesis: Thesis) => {
    setSelectedThesis(thesis);
    setEditOpen(true);
  };

  const handleCategoryChange = (event: SelectChangeEvent<string>) => {
    setSelectedCategory(event.target.value);
  };

  const handleStatusChange = (event: SelectChangeEvent<string>) => {
    setSelectedStatus(event.target.value);
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
                <TableCell>Status</TableCell>
                <TableCell>PDF</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : filteredTheses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
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
                    <TableCell>
                      {thesis.isActive ? (
                        <span style={{ color: "green", fontWeight: "bold" }}>Active</span>
                      ) : (
                        <span style={{ color: "gray", fontWeight: "bold" }}>Inactive</span>
                      )}
                    </TableCell>
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
                        <IconButton color="error" onClick={() => { }}>
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
            onUpdate={fetchTheses} // Refresh the list after update
          />
        )}
      </div>
    </>
  );
};

export default ManageThesis;