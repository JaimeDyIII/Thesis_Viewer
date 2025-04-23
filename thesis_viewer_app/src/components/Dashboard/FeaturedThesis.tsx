import { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import { getFeaturedThesis } from "../../api/bookmarks/queries";
import type { FeaturedThesis } from "../../api/bookmarks/types";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useView } from "../../hooks/useView";

type Props = {
  permissions: any;
  navigate: (path: string) => void;
  userRole: string;
};

export default function FeaturedThesis({ navigate }: Props) {
  const [featured, setFeatured] = useState<FeaturedThesis[]>([]);
  const { session } = useAuth();
  const { recordView } = useView();

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

  const handleViewPDF = (thesis: { id: number; title: string }) => {
    if (!session) return console.error("No session found!");
    if (!thesis?.id) return console.error("No thesis ID found");

    window.open(`/pdf-viewer/${encodeURIComponent(thesis.title)}`);
    recordView(thesis.id);
  };

  return (
    <Box className="dashboard-display-section">
      <Typography variant="h5" className="text-heading">
        Featured Theses
      </Typography>
      <Box className="dashboard-display-grid">
        {featured.map((item) => {
          const thesis = Array.isArray(item.Thesis) ? item.Thesis[0] : item.Thesis;
          if (!thesis) return null;

          return (
            <Box key={`${item.thesis_id}`} className="dashboard-display-card-wrapper">
              <motion.div
                whileHover={{
                  y: -5,
                  boxShadow: "0 5px 15px rgba(0, 0, 0, 0.1)",
                }}
                transition={{ duration: 0.3 }}
                className="dashboard-display-card"
                onClick={() => handleViewPDF(thesis)}
              >
                <img
                  src="/bookcover.png"
                  alt="Thesis Cover"
                  className="dashboard-display-cover"
                />
                <Typography variant="subtitle2" fontWeight={500} sx={{ fontSize: '0.9rem' }}>
                  {thesis?.title || "Untitled Thesis"}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, color: "#444", fontSize: '0.75rem' }}>
                  {thesis?.author?.substring(0, 100) || "No author available."}
                </Typography>
              </motion.div>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}