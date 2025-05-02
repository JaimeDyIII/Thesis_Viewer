import { Box, TextField, IconButton } from '@mui/material';
import { Send } from 'lucide-react';

interface ChatInputProps {
  inputValue: string;
  isLoading: boolean;
  isAIResponseLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onInputChange: (value: string) => void;
}

export const ChatInput = ({
  inputValue,
  isLoading,
  isAIResponseLoading,
  onSubmit,
  onInputChange
}: ChatInputProps) => {
  const isDisabled = isLoading || isAIResponseLoading;

  return (
    <Box 
      component="form" 
      onSubmit={onSubmit}
      className="bot-input-container"
    >
      <TextField
        fullWidth
        variant="outlined"
        placeholder={isDisabled ? "Please wait for the response..." : "Type a message..."}
        value={inputValue}
        onChange={(e) => onInputChange(e.target.value)}
        size="small"
        className="bot-input-field"
        disabled={isDisabled}
      />
      <IconButton 
        type="submit" 
        disabled={!inputValue.trim() || isDisabled}
        className={`bot-send-button ${inputValue.trim() && !isDisabled ? 'bot-send-button-enabled' : 'bot-send-button-disabled'}`}
      >
        <Send size={18} />
      </IconButton>
    </Box>
  );
}; 