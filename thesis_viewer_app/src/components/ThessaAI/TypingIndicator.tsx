import { Box } from '@mui/material';
import { motion } from "framer-motion";

export const TypingIndicator = () => {
  return (
    <Box className="typing-indicator">
      <Box className="typing-indicator-dots">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            initial={{ y: 0 }}
            animate={{ y: [0, -5, 0] }}
            transition={{
              repeat: Infinity,
              duration: 0.8,
              delay: i * 0.15,
              ease: "easeInOut"
            }}
            className="typing-indicator-dot"
          />
        ))}
      </Box>
    </Box>
  );
}; 