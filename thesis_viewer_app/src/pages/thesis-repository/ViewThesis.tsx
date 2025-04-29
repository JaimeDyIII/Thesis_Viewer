import { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { Header } from "../../components/Global/Header";
import "../../styles/View.css";
import { supabase } from "../../lib/supabase";
import { useCategories } from "../../hooks/useCategories";
import { useView } from '../../hooks/useView';
import ThesisFilters from "../../components/ThesisRepository/ViewThesis/ThesisFilters";
import ThesisGrid from "../../components/ThesisRepository/ViewThesis/ThesisGrid";
import { getAllThesesWithFilters } from "../../api/thesis/queries";
import { Thesis } from "../../api/thesis/types";

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
        const filters = {
          category: selectedCategory || undefined,
          isActive: true,
          year: selectedYear ? 
            selectedYear === "older" ? undefined : parseInt(selectedYear) 
            : undefined,
        };

        const data = await getAllThesesWithFilters(filters);
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
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) return;

      const { data, error } = await supabase
        .from("bookmarks")
        .select("thesis_id")
        .eq("user_id", userData.user.id);

      if (error) throw error;
      setBookmarkedThesisIds(data?.map(item => item.thesis_id) || []);
    } catch (err) {
      console.error("Failed to fetch bookmarks:", err);
      setBookmarkedThesisIds([]);
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, [sidebarOpen]);

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
          View Thesis
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
              ? "No available thesis." 
              : "No thesis found matching your search."
          }
        />
      </Box>
    </Box>
  );
}