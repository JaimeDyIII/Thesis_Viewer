import { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { Header } from "../../components/Global/Header";
import "../../styles/View.css";
import { supabase } from "../../lib/supabase";
import { useCategories } from "../../hooks/useCategories";
import { useView } from '../../hooks/useView';
import ThesisFilters from "../../components/ThesisRepository/ViewThesis/ThesisFilters";
import ThesisGrid from "../../components/ThesisRepository/ViewThesis/ThesisGrid";

type Thesis = {
  id: number;
  title: string;
  description: string | null;
  pdf_url: string | null;
  category: string | null;
  author: string;
  publishing_year: number;
};

export default function Bookmarks() {
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

  // Fetch only bookmarked theses based on filters
  useEffect(() => {
    const fetchBookmarkedTheses = async () => {
      setIsLoading(true);
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // First get all bookmarks for this user
        const { data: bookmarks, error: bookmarkError } = await supabase
          .from("bookmarks")
          .select("thesis_id")
          .eq("user_id", user.id);

        if (bookmarkError) throw bookmarkError;
        
        const bookmarkIds = bookmarks.map(b => b.thesis_id);
        setBookmarkedThesisIds(bookmarkIds);

        // Then get thesis data for these bookmarks
        let query = supabase
          .from("Thesis")
          .select("id, title, description, pdf_url, category, author, publishing_year, isActive")
          .eq("isActive", true)
          .in("id", bookmarkIds);

        if (selectedCategory) query = query.eq("category", selectedCategory);
        
        if (selectedYear) {
          if (selectedYear === "older") {
            query = query.lt("publishing_year", 2010);
          } else {
            query = query.eq("publishing_year", parseInt(selectedYear));
          }
        }

        const { data: theses, error: thesisError } = await query;
        if (thesisError) throw thesisError;

        setThesisList(theses || []);
      } catch (err) {
        console.error("Failed to fetch bookmarked theses:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookmarkedTheses();
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
  const filteredThesis = sortedThesis.filter((thesis) => {
    return thesis.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
           thesis.author.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleCardClick = (thesis: Thesis) => {
    setSelectedThesis(thesis);
    setSidebarOpen(true);
  };

  const fetchBookmarks = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("bookmarks")
        .select("thesis_id")
        .eq("user_id", user.id);

      if (error) throw error;
      setBookmarkedThesisIds(data?.map(item => item.thesis_id) || []);
    } catch (err) {
      console.error("Failed to fetch bookmarks:", err);
      setBookmarkedThesisIds([]);
    }
  };

  // Refresh bookmarks when sidebar closes
  useEffect(() => {
    if (sidebarOpen === false) {
      fetchBookmarks();
    }
  }, [sidebarOpen]);

  // Fetch view data for bookmarked theses
  useEffect(() => {
    const fetchViewData = async () => {
      const counts: Record<number, number> = {};
      const statuses: Record<number, boolean> = {};
      
      for (const thesis of thesisList) {
        try {
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
          My Bookmarked Theses
        </Typography>

        <ThesisFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          sortOrder={sortOrder}
          handleSortToggle={handleSortToggle}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          categories={categories}
        />

        <ThesisGrid
          isLoading={isLoading}
          filteredThesis={filteredThesis}
          viewedStatus={viewedStatus}
          viewCounts={viewCounts}
          bookmarkedThesisIds={bookmarkedThesisIds}
          handleCardClick={handleCardClick}
          selectedThesis={selectedThesis}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          fetchBookmarks={fetchBookmarks}
          emptyMessage={
            thesisList.length === 0 
              ? "You haven't bookmarked any theses yet." 
              : "No bookmarks match your search."
          }
        />
      </Box>
    </Box>
  );
}