import { useEffect, useState } from "react";
import { Box, Typography, Grid } from "@mui/material";
import { getFeaturedThesis } from "../../api/bookmarks/queries";
import type { FeaturedThesis } from "../../api/bookmarks/types"; 
import { motion } from "framer-motion";

type Props = {
  permissions: any;
  navigate: (path: string) => void;
  userRole: string;
};

export default function FeaturedThesis({ permissions, navigate }: Props) {
  const [featured, setFeatured] = useState<FeaturedThesis[]>([]);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const data = await getFeaturedThesis();
        setFeatured(data);
      } catch (err) {
        console.error("Error fetching featured theses:", err);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <Box mt={5} px={5}>
      <Typography variant="h5" sx={{ mb: 2, color: "#4682A9", fontWeight: 600, fontSize: '1.25rem' }}>
        Featured Theses
      </Typography>
      <Grid container spacing={3}>
        {featured.map((item) => {
          const thesis = Array.isArray(item.Thesis) ? item.Thesis[0] : item.Thesis; // Handle case when Thesis is an array

          return (
            <Grid item xs={12} sm={6} md={3} key={`${item.thesis_id}-${item.bookmarked_at}`}>
              <motion.div
                whileHover={{
                  y: -8,  // Moves the card up slightly
                  boxShadow: "0 8px 20px rgba(0, 0, 0, 0.15)",  // Applies shadow on hover
                }}
                transition={{ duration: 0.3 }} // Smooth transition for hover effect
                style={{
                  cursor: "pointer",
                  borderRadius: 12,
                  padding: 8,
                  textAlign: "center",
                  height: "auto", // Keeps container height flexible
                  maxHeight: 300, // Set a maximum height for each card
                }}
                onClick={() => navigate(`/thesis/${item.thesis_id}`)}
              >
                <img
                  src="/bookcover.png" // Placeholder for book cover image
                  alt="Thesis Cover"
                  style={{
                    width: "100%",
                    height: 180, // Reduced height for book cover
                    objectFit: "contain",
                    borderRadius: 8,
                    marginBottom: 8,
                  }}
                />
                <Typography variant="subtitle2" fontWeight={500} sx={{ fontSize: '0.9rem' }}>
                  {thesis?.title || "Untitled Thesis"}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, color: "#444", fontSize: '0.75rem' }}>
                  {thesis?.author?.substring(0, 100) || "No author available."}
                </Typography>
              </motion.div>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}