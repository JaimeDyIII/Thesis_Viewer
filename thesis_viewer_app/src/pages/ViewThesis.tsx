import { useState, useEffect } from "react";
import { 
  Container, TextField, Select, MenuItem, Box, Typography, 
  Grid, Card, CardContent, CardHeader, CircularProgress, IconButton,
  FormControl, Paper
} from "@mui/material";
import { Header } from "../components/Global/Header";
import ThesisSidebar from "../components/ThesisRepository/ViewThesis/ThesisSidebar";
import { Search, ArrowUpDown, Bookmark, Eye } from "lucide-react";
import "../styles/View.css";
import { supabase } from "../lib/supabase";
import { useCategories } from "../hooks/useCategories";
import { useView } from '../hooks/useView';

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
  const [selectedYear, setSelectedYear] = useState("");
  const [bookmarkedThesisIds, setBookmarkedThesisIds] = useState<number[]>([]);
  const { categories, loading: categoriesLoading } = useCategories();
  const [viewCounts, setViewCounts] = useState<Record<number, number>>({});
  const [viewedStatus, setViewedStatus] = useState<Record<number, boolean>>({});
  const { getViewCount, hasUserViewed } = useView();

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
  
  const handleSortToggle = () => {
    setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
  };

  const sortedThesis = [...thesisList].sort((a, b) => {
    return sortOrder === 'asc' 
      ? a.title.localeCompare(b.title) 
      : b.title.localeCompare(a.title);
  });

  // Filter theses based on search
  const filteredThesis = sortedThesis.filter(
    (thesis) => {
      return thesis.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
             thesis.author.toLowerCase().includes(searchQuery.toLowerCase());
    }
  );

  const handleCardClick = (thesis: Thesis) => {
    setSelectedThesis(thesis);
    setSidebarOpen(true);
  };

  // Keep the fetchBookmarks function to show which theses are bookmarked
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
  }, []);

  // Remove the old checkViewStatus effect and add this new one
  useEffect(() => {
    const fetchViewData = async () => {
      const counts: Record<number, number> = {};
      const statuses: Record<number, boolean> = {};
      
      for (const thesis of thesisList) {
        try {
          // Get both view count and view status in parallel
          const [count, viewed] = await Promise.all([
            getViewCount(thesis.id),
            hasUserViewed(thesis.id)
          ]);
          
          counts[thesis.id] = count;
          statuses[thesis.id] = viewed;
        } catch (error) {
          console.error('Error fetching view data:', error);
          counts[thesis.id] = 0;
          statuses[thesis.id] = false;
        }
      }
      
      setViewCounts(counts);
      setViewedStatus(statuses);
    };

    if (thesisList.length > 0) {
      fetchViewData();
    }
  }, [thesisList]);

  return (
    <Box sx={{ background: 'var(--card-cream)' }}>
      <Header />
      <Box className="content-container">
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          View Thesis
        </Typography>

        {/* Search and Filters Section */}
        <Box className="search-controls">
          {/* Search and Sort Group - Left Side */}
          <Box className="search-group">
            <Box className="search-box">
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

            <IconButton 
              onClick={handleSortToggle}
              sx={{ color: 'var(--heading-blue)' }}
            >
              <ArrowUpDown size={25} />
            </IconButton>
          </Box>

          {/* Filters Group - Right Side */}
          <Box className="filters-group">
            {/* Year Filter */}    
            <Box className="filter-box">
              <FormControl>
                <Select
                  value={selectedYear || ""}
                  displayEmpty
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="filter-select"
                >
                  <MenuItem value="">All Years</MenuItem>
                  {Array.from({ length: 16 }, (_, i) => 2025 - i).map((year) => (
                    <MenuItem key={year} value={year.toString()}>
                      {year}
                    </MenuItem>
                  ))}
                  <MenuItem value="older">Before 2010</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Categories Filter */}
            <Box className="filter-box">
              <FormControl>
                <Select
                  value={selectedCategory || ""}
                  displayEmpty
                  onChange={(e) => setSelectedCategory(e.target.value || null)}
                  className="filter-select"
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.name}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>
        </Box>

        {/* White Container for Cards */}
        <Paper className="white-container" elevation={3}>
          {isLoading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height="300px">
              <CircularProgress sx={{ color: 'var(--heading-blue)' }} />
            </Box>
          ) : filteredThesis.length > 0 ? (
            <Grid container spacing={3}>
              {filteredThesis.map((thesis) => (
                <Grid item xs={6} sm={6} md={4} lg={3} key={thesis.id}>
                  <Card className="card-hover" onClick={() => handleCardClick(thesis)}>
                    <CardHeader
                      title={
                        <Typography className="card-title-text">
                          {thesis.title}
                        </Typography>
                      }
                    />
                    <CardContent>
                      <Typography className="card-author">
                        {thesis.author}
                      </Typography>
                    </CardContent>
                    <Box className="card-footer">
                      <Box className={`view-count ${viewedStatus[thesis.id] ? 'viewed' : ''}`}>
                        <Eye 
                          className="eye-icon"
                          strokeWidth={viewedStatus[thesis.id] ? 3 : 2}
                          color={viewedStatus[thesis.id] ? 'var(--button-hover-blue)' : 'var(--light-text)'}
                        />
                        <span>{viewCounts[thesis.id] || 0}</span>
                      </Box>
                      {bookmarkedThesisIds.includes(thesis.id) && (
                        <Bookmark 
                          size={16} 
                          color="var(--heading-blue)" 
                          fill="var(--heading-blue)" 
                        />
                      )}
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box display="flex" justifyContent="center" alignItems="center" height="200px">
              <Typography variant="h6" sx={{ color: 'var(--light-text)' }}>
                No thesis found matching your search.
              </Typography>
            </Box>
          )}
        </Paper>

        {/* Sidebar */}
        <ThesisSidebar 
          open={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
          thesisId={selectedThesis?.id || 0}
          onBookmarkToggle={fetchBookmarks}
        />
      </Box>
    </Box>
  );
}