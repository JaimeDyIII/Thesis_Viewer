import { Box, Typography } from '@mui/material';
import { Glasses } from 'lucide-react';
import { Message } from '../../api/thessaAI/types';
import { TypingIndicator } from './TypingIndicator';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

interface ChatMessagesProps {
  messages: Message[];
  isAIResponseLoading: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

export const ChatMessages = ({
  messages,
  isAIResponseLoading,
  messagesEndRef
}: ChatMessagesProps) => {
  const renderMarkdown = (content: string) => {
    const rawHtml = marked.parse(content, { async: false }) as string;
    const sanitizedHtml = DOMPurify.sanitize(rawHtml);
    return { __html: sanitizedHtml };
  };

  return (
    <Box className="bot-messages-container">
      {messages.length === 0 ? (
        <Box className="empty-state">
          <Glasses size={45} className="empty-state-icon" />
          <Typography variant="h6" className="empty-state-title">
            Ask ThessaAI anything about the Theses
          </Typography>
          <Typography variant="body2">Your thesis assistant is ready to help</Typography>
        </Box>
      ) : (
        <>
          {messages.map((msg) => (
            <Box 
              key={msg.id} 
              className={msg.role === 'user' ? 'user-message' : 'bot-message'}
            >
              {msg.role === 'user' ? (
                <Typography>{msg.content}</Typography>
              ) : (
                <div dangerouslySetInnerHTML={renderMarkdown(msg.content)} />
              )}
            </Box>
          ))}
          
          {isAIResponseLoading && (
            <Box className="typing-indicator-container">
              <TypingIndicator />
            </Box>
          )}
        </>
      )}
      <div ref={messagesEndRef} />
    </Box>
  );
}; 