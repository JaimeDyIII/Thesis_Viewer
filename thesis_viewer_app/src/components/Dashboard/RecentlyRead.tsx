import { useEffect, useState } from "react";
import { Box, Typography, Skeleton } from "@mui/material";
import { getRecentlyReadThesis } from "../../api/views/queries";
import type { RecentlyRead } from "../../api/views/types";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useView } from "../../hooks/useView";

export default function RecentlyRead() {
  const [recentlyRead, setRecentlyRead] = useState<RecentlyRead[]>([]);
  const [loading, setLoading] = useState(true);

  const { session, profile } = useAuth();
  const { recordView } = useView();

  useEffect(() => {
    const fetchRecentlyRead = async () => {
      if (!profile?.id) return;
      try {
        const data = await getRecentlyReadThesis(profile.id);
        setRecentlyRead(data);
      } catch (err) {
        console.error("Error fetching recently read theses:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentlyRead();
  }, [profile?.id]);

  const handleViewPDF = (thesis: RecentlyRead) => {
    if (!session) return console.error("No session found!");
    if (!thesis?.Thesis?.id) return console.error("No thesis ID found");

    window.open(`/pdf-viewer/${encodeURIComponent(thesis.Thesis.title)}`);
    recordView(thesis.Thesis.id);
  };

  return (
    <Box className="dashboard-display-section">
      <Typography variant="h5" className="text-heading">
        Recently Read
      </Typography>

      <Box className="dashboard-display-grid">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Box key={i} className="dashboard-display-card-wrapper">
              <Skeleton variant="rectangular" width={160} height={220} sx={{ borderRadius: 2 }} />
              <Skeleton width="80%" height={24} sx={{ mt: 1 }} />
              <Skeleton width="60%" height={18} />
            </Box>
          ))
        ) : recentlyRead.length === 0 ? (
          <Typography sx={{ mt: 2, color: "#888", fontStyle: "italic" }}>
            No recently read theses yet.
          </Typography>
        ) : (
          recentlyRead.map((item, index) => {
            const thesis = item.Thesis;

            return (
              <Box key={`${item.thesis_id}-${index}`} className="dashboard-display-card-wrapper">
                <motion.div
                  whileHover={{
                    y: -5,
                    boxShadow: "0 5px 15px rgba(0, 0, 0, 0.1)",
                  }}
                  transition={{ duration: 0.3 }}
                  className="dashboard-display-card"
                  onClick={() => handleViewPDF(item)}
                >
                  <img
                    src="/bookcover.png"
                    alt="Thesis Cover"
                    className="dashboard-display-cover"
                  />
                  <Typography variant="subtitle2" fontWeight={500} sx={{ fontSize: "0.9rem" }}>
                    {thesis?.title || "Untitled Thesis"}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1, color: "#444", fontSize: "0.75rem" }}>
                    {thesis?.author?.substring(0, 100) || "No author available."}
                  </Typography>
                </motion.div>
              </Box>
            );
          })
        )}
      </Box>
    </Box>
  );
}