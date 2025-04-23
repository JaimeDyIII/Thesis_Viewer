import { Box, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { getLatestUploads } from "../../api/thesis/queries";
import { Thesis } from "../../api/thesis/types";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useView } from "../../hooks/useView";

type Props = {
  permissions: any;
  navigate: (path: string) => void;
  userRole: string;
};

export default function LatestUploads({ navigate }: Props) {
  const [latestTheses, setLatestTheses] = useState<Thesis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { session } = useAuth();
  const { recordView } = useView();

  useEffect(() => {
    const fetchLatestTheses = async () => {
      try {
        setLoading(true);
        const theses = await getLatestUploads();
        setLatestTheses(theses);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch latest theses");
        console.error("Error fetching latest theses:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestTheses();
  }, []);

  const handleViewPDF = (thesis: Thesis) => {
    if (!session) return console.error("No session found!");
    if (!thesis?.id) return console.error("No thesis ID found");

    window.open(`/pdf-viewer/${encodeURIComponent(thesis.title)}`);
    recordView(thesis.id);
  };

  if (loading) return <div>Loading latest uploads...</div>;
  if (error) return <div>Error: {error}</div>;
  if (latestTheses.length === 0) return <div>No recent uploads found</div>;

  return (
    <Box className="dashboard-display-section">
      <Typography variant="h5" className="text-heading">
        Latest Uploads
      </Typography>
      <Box className="dashboard-display-grid">
        {latestTheses.map((thesis) => (
          <Box key={thesis.id} className="dashboard-display-card-wrapper">
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
                {thesis.title || "Untitled Thesis"}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, color: "#444", fontSize: '0.75rem' }}>
                {thesis.author?.substring(0, 100) || "No author available."}
              </Typography>
            </motion.div>
          </Box>
        ))}
      </Box>
    </Box>
  );
}