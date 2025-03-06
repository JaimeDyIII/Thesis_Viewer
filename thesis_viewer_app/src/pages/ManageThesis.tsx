import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import AddThesisForm from "../components/AddThesisForm";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { supabase } from "../config";
import { AdminHeader } from "../components/AdminHeader";
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
  const [theses, setTheses] = useState<Thesis[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchTheses();
  }, [selectedCategory, selectedStatus]);

  const fetchTheses = async () => {
    setLoading(true);
    let query = supabase.from("Thesis").select("*");

    if (selectedCategory) query = query.eq("category", selectedCategory);
    if (selectedStatus !== null)
      query = query.eq("isActive", selectedStatus === "Active");

    const { data, error } = await query;
    if (error) console.error("Error fetching theses:", error);
    else setTheses(data);

    setLoading(false);
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
      <AdminHeader />

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
              value={selectedCategory || ""}
              displayEmpty
              onChange={(e) => setSelectedCategory(e.target.value || null)}
            >
              <MenuItem value="">All Categories</MenuItem>
              <MenuItem value="Science">Science</MenuItem>
              <MenuItem value="Technology">Technology</MenuItem>
            </Select>

            <Select
              className="status-filter"
              value={selectedStatus || ""}
              displayEmpty
              onChange={(e) => setSelectedStatus(e.target.value || null)}
            >
              <MenuItem value="">All Status</MenuItem>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
            </Select>

            <Button
              onClick={() => setFormOpen(true)}
              className="add-thesis-btn"
              variant="contained"
            >
              <Plus size={18} />
              <span>Add Thesis</span>
            </Button>
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
                    <TableCell>
                      <IconButton color="primary">
                        <Edit size={20} />
                      </IconButton>
                      <IconButton color="error">
                        <Trash2 size={20} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <AddThesisForm open={formOpen} setOpen={setFormOpen} refreshTheses={fetchTheses} />
      </div>
    </>
  );
};

export default ManageThesis;