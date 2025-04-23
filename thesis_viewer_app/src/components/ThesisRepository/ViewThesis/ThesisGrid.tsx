import { Box, Typography, Card, CardContent, CardHeader, CircularProgress, Paper } from "@mui/material";
import { Bookmark, Eye } from "lucide-react";
import ThesisSidebar from "./ThesisSidebar";

interface ThesisGridProps {
  isLoading: boolean;
  filteredThesis: any[];
  viewedStatus: Record<number, boolean>;
  viewCounts: Record<number, number>;
  bookmarkedThesisIds: number[];
  handleCardClick: (thesis: any) => void;
  selectedThesis: any | null;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  fetchBookmarks: () => void;
  emptyMessage: string;
}

export default function ThesisGrid({
  isLoading,
  filteredThesis,
  viewedStatus,
  viewCounts,
  bookmarkedThesisIds,
  handleCardClick,
  selectedThesis,
  sidebarOpen,
  setSidebarOpen,
  fetchBookmarks,
  emptyMessage
}: ThesisGridProps) {
  return (
    <Paper className="white-container" elevation={3}>
      {isLoading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="300px">
          <CircularProgress sx={{ color: 'var(--heading-blue)' }} />
        </Box>
      ) : filteredThesis.length > 0 ? (
        <Box className="thesis-card-grid">
          {filteredThesis.map((thesis) => (
            <Card className="card-hover" onClick={() => handleCardClick(thesis)} key={thesis.id}>
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
                    className="bookmark-icon active"
                  />
                )}
              </Box>
            </Card>
          ))}
        </Box>
      ) : (
        <Box display="flex" justifyContent="center" alignItems="center" height="200px">
          <Typography variant="h6" sx={{ color: 'var(--light-text)' }}>
          {emptyMessage}
          </Typography>
        </Box>
      )}

      <ThesisSidebar 
        open={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        thesisId={selectedThesis?.id || 0}
        onBookmarkToggle={fetchBookmarks}
      />
    </Paper>
  );
}