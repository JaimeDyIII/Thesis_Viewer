import { useState, useEffect } from "react";
import { Container, TextField, Select, MenuItem, Box, Typography, Grid, Card, CardContent, CardHeader, CircularProgress, Button } from "@mui/material";
import { AdminHeader } from "../components/AdminHeader";
import { Search } from "lucide-react";
import "../styles/Admin.css";
import { supabase } from "../lib/supabase";

type Thesis = {
  id: string;
  title: string;
  description: string | null;
  pdf_url: string | null;
  category: string | null;
};

export default function ViewThesis() {
  const [searchQuery, setSearchQuery] = useState("");
  const [thesisList, setThesisList] = useState<Thesis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);

  useEffect(() => {
    const fetchThesis = async () => {
      setIsLoading(true);
      try {
        let query = supabase
          .from("Thesis")
          .select("id, title, description, pdf_url, category, isActive")
          .eq("isActive", true);

        if (selectedCategory) query = query.eq("category", selectedCategory);
        if (selectedDepartment) query = query.eq("department", selectedDepartment);
        if (selectedCourse) query = query.eq("course", selectedCourse);

        const { data, error } = await query;

        if (!error) setThesisList(data || []);
      } catch (err) {
        console.error("Failed to fetch thesis data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchThesis();
  }, [selectedCategory, selectedDepartment, selectedCourse]);

  const filteredThesis = searchQuery
    ? thesisList.filter(
        (thesis) =>
          thesis.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (thesis.description && thesis.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : thesisList;

  return (
    <div className="admin-dashboard">
      <div className="admin-background-gradient"></div>
      <div className="admin-background-blur"></div>
      <div className="admin-background-radial"></div>

      <AdminHeader />

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h5" color="var(--primary)" fontWeight="bold" gutterBottom>
          View Thesis
        </Typography>

        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        
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

        {/* Filters Section */}
        <Box className="filters-wrapper">
          <Box className="filter-box">
            <Select value={selectedCategory || ""} displayEmpty onChange={(e) => setSelectedCategory(e.target.value || null)}>
              <MenuItem value="">All Categories</MenuItem>
              <MenuItem value="Science">Science</MenuItem>
              <MenuItem value="Technology">Technology</MenuItem>
            </Select>
          </Box>

          <Box className="filter-box">
            <Select value={selectedDepartment || ""} displayEmpty onChange={(e) => setSelectedDepartment(e.target.value || null)}>
              <MenuItem value="">All Departments</MenuItem>
              <MenuItem value="Computer Science">Computer Science</MenuItem>
            </Select>
          </Box>

          <Box className="filter-box">
            <Select value={selectedCourse || ""} displayEmpty onChange={(e) => setSelectedCourse(e.target.value || null)}>
              <MenuItem value="">All Courses</MenuItem>
              <MenuItem value="BSIT">BSIT</MenuItem>
            </Select>
          </Box>
        </Box>
      </Box>

      {/* Thesis Cards */}
      {isLoading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="300px">
          <CircularProgress color="secondary" />
        </Box>
      ) : filteredThesis.length > 0 ? (
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {filteredThesis.map((thesis) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={thesis.id}>
              <Card className="card-hover" sx={{ height: 150 }}>
                <CardHeader title={<Typography variant="h6" className="card-title-text">{thesis.title}</Typography>} />
                <CardContent>
                  <Typography className="card-description">{thesis.description || "No description available."}</Typography>
                  {thesis.pdf_url && (
                    <Button className="view-pdf-btn" href={thesis.pdf_url} target="_blank">
                      View PDF
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box display="flex" justifyContent="center" alignItems="center" height="200px">
          <Typography variant="h6" color="textSecondary">
            No thesis found matching your search.
          </Typography>
        </Box>
      )}

      </Container>
    </div>
  );
}