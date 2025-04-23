import { 
    TextField, Select, MenuItem, Box, IconButton,
    FormControl
  } from "@mui/material";
  import { Search, ArrowUpDown } from "lucide-react";
  
  interface ThesisFiltersProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    sortOrder: 'asc' | 'desc';
    handleSortToggle: () => void;
    selectedYear: string;
    setSelectedYear: (year: string) => void;
    selectedCategory: string | null;
    setSelectedCategory: (category: string | null) => void;
    categories: { id: number; name: string }[];
  }
  
  export default function ThesisFilters({
    searchQuery,
    setSearchQuery,
    sortOrder,
    handleSortToggle,
    selectedYear,
    setSelectedYear,
    selectedCategory,
    setSelectedCategory,
    categories
  }: ThesisFiltersProps) {
    return (
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
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 48 * 4.5,
                    },
                  },
                }}
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
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 48 * 4.5,
                    },
                  },
                }}
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
    );
  }