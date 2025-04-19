import { useState, useEffect } from "react";
import { 
  Container, TextField, Select, MenuItem, Box, Typography, 
  Grid, Card, CardContent, CardHeader, CircularProgress, IconButton,
  Button,  FormControl
} from "@mui/material";
import { Header } from "../components/Global/Header";
import ThesisSidebar from "../components/ThesisRepository/ThesisSidebar";
import { Search, ArrowUpDown, Bookmark } from "lucide-react";
import "../styles/View.css";
import { supabase } from "../lib/supabase";

type Thesis = {
  id: number;
  title: string;
  description: string | null;
  pdf_url: string | null;
  category: string | null;
  author: string;
  publishing_year: number;
};

export default function ViewThesis() {
  const [searchQuery, setSearchQuery] = useState("");
  const [thesisList, setThesisList] = useState<Thesis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedThesis, setSelectedThesis] = useState<Thesis | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // State for bookmarked filter
  const [showBookmarked, setShowBookmarked] = useState(false);
  const [bookmarkedThesisIds, setBookmarkedThesisIds] = useState<number[]>([]);
  const [isBookmarkUpdated, setIsBookmarkUpdated] = useState(false);
  const [selectedYear, setSelectedYear] = useState("");

  // Fetch all theses based on filters      
  useEffect(() => {
    const fetchThesis = async () => {
      setIsLoading(true);
      try {
        let query = supabase
          .from("Thesis")
          .select("id, title, description, pdf_url, category, author, publishing_year, isActive")
          .eq("isActive", true);

        if (selectedCategory) query = query.eq("category", selectedCategory);
        
        if (selectedYear) {
          if (selectedYear === "older") {
            query = query.lt("publishing_year", 2010);
          } else {
            query = query.eq("publishing_year", parseInt(selectedYear));
          }
        }
  
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
  }, [selectedCategory, selectedYear]);

  // Fetch bookmarked theses
  const fetchBookmarks = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) return;

      const { data, error } = await supabase
        .from("bookmarks")
        .select("thesis_id")
        .eq("user_id", userData.user.id);

      if (error) throw error;

      setBookmarkedThesisIds(data.map(item => item.thesis_id));
    } catch (err) {
      console.error("Failed to fetch bookmarks:", err);
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, [isBookmarkUpdated]);
  
  const handleSortToggle = () => {
    setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
  };

  const sortedThesis = [...thesisList].sort((a, b) => {
    return sortOrder === 'asc' 
      ? a.title.localeCompare(b.title) 
      : b.title.localeCompare(a.title);
  });

  // Filter theses based on search and bookmarks
  const filteredThesis = sortedThesis.filter(
    (thesis) => {
      const matchesSearch = 
        thesis.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        thesis.author.toLowerCase().includes(searchQuery.toLowerCase());
      
      // If bookmark filter is on, only show bookmarked theses
      if (showBookmarked) {
        return matchesSearch && bookmarkedThesisIds.includes(thesis.id);
      }
      
      return matchesSearch;
    }
  );

  const handleCardClick = (thesis: Thesis) => {
    setSelectedThesis(thesis);
    setSidebarOpen(true);
  };

  const toggleBookmarkFilter = () => {
    setShowBookmarked(!showBookmarked);
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

          {/* Bookmark Filter Button - Removing hover effect and 3D appearance */}
          <Box className="filter-box">
            <Button
              onClick={toggleBookmarkFilter}
              startIcon={<Bookmark size={20} />}
              variant="text"
              disableElevation
              disableRipple
              sx={{
                bgcolor: 'transparent',
                color: 'black',
                boxShadow: 'none',
                '&:hover': {
                  bgcolor: 'transparent',
                  boxShadow: 'none'
                },
                textTransform: 'none',
                px: 2,
                borderRadius: 1
              }}
            >
              {showBookmarked ? "Bookmarks" : "Bookmarks"}
            </Button>
          </Box>
          
          {/* Year Filter Dropdown */}    
          <Box className="filter-box">
            <FormControl>
              <Select
                value={selectedYear || ""}
                displayEmpty
                onChange={(e) => setSelectedYear(e.target.value)}
                sx={{
                  bgcolor: 'white',
                  minWidth: '120px',
                  '& .MuiSelect-select': {
                    padding: '8px 14px'
                  }
                }}
              >
                <MenuItem value="">All Years</MenuItem>
                <MenuItem value="2025">2025</MenuItem>
                <MenuItem value="2024">2024</MenuItem>
                <MenuItem value="2023">2023</MenuItem>
                <MenuItem value="2022">2022</MenuItem>
                <MenuItem value="2021">2021</MenuItem>
                <MenuItem value="2020">2020</MenuItem>
                <MenuItem value="2019">2019</MenuItem>
                <MenuItem value="2018">2018</MenuItem>
                <MenuItem value="2017">2017</MenuItem>
                <MenuItem value="2016">2016</MenuItem>
                <MenuItem value="2015">2015</MenuItem>
                <MenuItem value="2014">2014</MenuItem>
                <MenuItem value="2013">2013</MenuItem>
                <MenuItem value="2012">2012</MenuItem>
                <MenuItem value="2011">2011</MenuItem>
                <MenuItem value="2010">2010</MenuItem>
                <MenuItem value="older">Before 2010</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Categories Dropdown */}
          <Box className="filter-box">
            <FormControl>
              <Select
                value={selectedCategory || ""}
                displayEmpty
                onChange={(e) => setSelectedCategory(e.target.value || null)}
                sx={{
                  bgcolor: 'white',
                  minWidth: '150px',
                  '& .MuiSelect-select': {
                    padding: '8px 14px'
                  }
                }}
              >
                <MenuItem value="">All Categories</MenuItem>
                <MenuItem value="Science">Science</MenuItem>
                <MenuItem value="Technology">Technology</MenuItem>
                <MenuItem value="Mathematics">Mathematics</MenuItem>
              </Select>
            </FormControl>
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
                    action={
                      bookmarkedThesisIds.includes(thesis.id) ? (
                        <Bookmark size={16} color="var(--primary)" />
                      ) : null
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
              {showBookmarked 
                ? "No bookmarked thesis yet."
                : "No thesis found matching your search."
              }
            </Typography>
          </Box>
        )}

        {/* Sidebar */}
        <ThesisSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} thesis={selectedThesis} onBookmarkToggle={() => setIsBookmarkUpdated(prev => !prev)} />
      </Container>
    </div>
  );}