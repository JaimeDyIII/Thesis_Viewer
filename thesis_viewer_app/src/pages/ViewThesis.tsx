import { useState, useEffect } from "react";
import { 
  Container, TextField, Select, MenuItem, Box, Typography, 
  Grid, Card, CardContent, CardHeader, CircularProgress, IconButton
} from "@mui/material";
import { Header } from "../components/Header";
import ThesisSidebar from "../components/ThesisSidebar";
import { Search, ArrowUpDown } from "lucide-react";
import "../styles/View.css";
import { supabase } from "../lib/supabase";

type Thesis = {
  id: string;
  title: string;
  description: string | null;
  pdf_url: string | null;
  category: string | null;
  author: string;
};

export default function ViewThesis() {
  const [searchQuery, setSearchQuery] = useState("");
  const [thesisList, setThesisList] = useState<Thesis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedThesis, setSelectedThesis] = useState<Thesis | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchThesis = async () => {
      setIsLoading(true);
      try {
        let query = supabase
          .from("Thesis")
          .select("id, title, description, pdf_url, category, author, isActive")
          .eq("isActive", true);

        if (selectedCategory) query = query.eq("category", selectedCategory);
  
        const { data, error } = await query;
        if (error) throw error;

        setThesisList(data || []);
      } catch (err) {
        console.error("Failed to fetch thesis data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchThesis();
  }, [selectedCategory]);

  const handleSortToggle = () => {
    setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
  };

  const sortedThesis = [...thesisList].sort((a, b) => {
    return sortOrder === 'asc' 
      ? a.title.localeCompare(b.title) 
      : b.title.localeCompare(a.title);
  });

  const filteredThesis = sortedThesis.filter(
    (thesis) =>
      thesis.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      thesis.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCardClick = (thesis: Thesis) => {
    setSelectedThesis(thesis);
    setSidebarOpen(true);
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-background-gradient"></div>
      <div className="admin-background-blur"></div>
      <div className="admin-background-radial"></div>

      <Header />

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h5" color="var(--primary)" fontWeight="bold" gutterBottom>
          View Thesis
        </Typography>

        <Box display="flex" alignItems="center" gap={2} width="100%">
        {/* Search Box & Sort Group */}
        <Box display="flex" alignItems="center" flexGrow={1} className="search-box">
          <TextField
            fullWidth
            variant="standard"
            placeholder="Search thesis..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              disableUnderline: true,
              className: "search-field",
            }}
          />
          <Search size={25} className="search-icon" />
        </Box>

          <IconButton onClick={handleSortToggle}>
            <ArrowUpDown size={25} />
          </IconButton>

        {/* Categories Dropdown at the End */}
        <Box className="filter-box" sx={{ marginLeft: "auto" }}>
          <Select
            value={selectedCategory || ""}
            displayEmpty
            onChange={(e) => setSelectedCategory(e.target.value || null)}
          >
            <MenuItem value="">All Categories</MenuItem>
            <MenuItem value="Science">Science</MenuItem>
            <MenuItem value="Technology">Technology</MenuItem>
          </Select>
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
                <Card className="card-hover" sx={{ height: 180 }} onClick={() => handleCardClick(thesis)}>
                  <CardHeader
                    title={
                      <Typography variant="h6" sx={{ fontSize: "1rem" }} className="card-title-text">
                        {thesis.title}
                      </Typography>
                    }
                  />
                  <CardContent>
                    <Typography variant="body2" color="textSecondary">
                      {thesis.author}
                    </Typography>
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

        {/* Sidebar */}
        <ThesisSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} thesis={selectedThesis} />
      </Container>
    </div>
  );
}
