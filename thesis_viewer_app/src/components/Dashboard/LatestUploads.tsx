import { Box, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { getLatestUploads } from "../../api/thesis/queries";
import { Thesis } from "../../api/thesis/types";
import { motion } from "framer-motion";

type Props = {
  permissions: any;
  navigate: (path: string) => void;
  userRole: string;
};

export default function LatestUploads({ permissions, navigate, userRole }: Props) {
  const [latestTheses, setLatestTheses] = useState<Thesis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLatestTheses = async () => {
      try {
        setLoading(true);
        const theses = await getLatestUploads(); // fetch top 4 active
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

  if (loading) return <div>Loading latest uploads...</div>;
  if (error) return <div>Error: {error}</div>;
  if (latestTheses.length === 0) return <div>No recent uploads found</div>;

  return (
    <Box mt={8} px={5}>
      <Typography variant="h5" sx={{ mb: 2, color: "#4682A9", fontWeight: 600, fontSize: '1.25rem' }}>
        Latest Uploads
      </Typography>
      <Box
        sx={{
          display: "flex",
          overflowX: "auto",
          gap: 3,
          paddingBottom: 2,
        }}
      >
        {latestTheses.map((thesis) => (
          <motion.div
            key={thesis.id}
            whileHover={{
              y: -8,
              boxShadow: "0 8px 20px rgba(0, 0, 0, 0.15)",
            }}
            transition={{ duration: 0.3 }}
            style={{
              cursor: "pointer",
              borderRadius: 12,
              padding: 8,
              textAlign: "center",
              flex: "0 0 auto",
              width: 200,
              maxHeight: 300,
            }}
            onClick={() => navigate(`/thesis-repository/${thesis.id}`)}
          >
            <img
              src="/bookcover.png"
              alt="Thesis Cover"
              style={{
                width: "100%",
                height: 180,
                objectFit: "contain",
                borderRadius: 8,
                marginBottom: 8,
              }}
            />
            <Typography variant="subtitle2" fontWeight={500} sx={{ fontSize: '0.9rem' }}>
              {thesis.title || "Untitled Thesis"}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, color: "#444", fontSize: '0.75rem' }}>
              {thesis.description?.substring(0, 100) || "No description available."}
            </Typography>
          </motion.div>
        ))}
      </Box>
    </Box>
  );
}