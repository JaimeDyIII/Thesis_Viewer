import { Box, Typography, IconButton, List, ListItem, Divider } from '@mui/material';
import { ChevronLeft, Trash2 } from 'lucide-react';
import { ChatSession } from '../../api/thessaAI/types';

interface ChatSidebarProps {
  conversations: ChatSession[];
  currentConversationId: number | null;
  onClearHistory: () => void;
  onStartNewConversation: () => void;
  onFetchMessages: (conversationId: number) => void;
  onToggleSidebar: () => void;
  onDeleteConversation: (conversationId: number) => void;
}

export const ChatSidebar = ({
  conversations,
  currentConversationId,
  onClearHistory,
  onStartNewConversation,
  onFetchMessages,
  onToggleSidebar,
  onDeleteConversation
}: ChatSidebarProps) => {
  return (
    <Box className="bot-sidebar">
      <Box className="bot-sidebar-header">
        <Typography className="bot-sidebar-title">Chat History</Typography>
        
        <Box display="flex">
          <IconButton onClick={onClearHistory} size="small" className="bot-sidebar-action" title="Clear History">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18"></path>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
            </svg>
          </IconButton>
          
          <IconButton onClick={onToggleSidebar} size="small" className="bot-sidebar-toggle">
            <ChevronLeft size={20} />
          </IconButton>
        </Box>
      </Box>
      
      <Divider />
      
      <Box onClick={onStartNewConversation} className="bot-new-chat">
        <Typography className="bot-new-chat-text">+ New Chat</Typography>
      </Box>
      
      <Divider />
      
      <List className="bot-chat-list">
        {conversations.map((chat) => (
          <ListItem 
            key={chat.id} 
            disablePadding 
            className={`bot-chat-item ${currentConversationId === chat.id ? 'bot-chat-item-active' : ''}`}
            secondaryAction={
              <IconButton
                edge="end"
                size="small"
                aria-label="Delete conversation"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteConversation(chat.id);
                }}
              >
                <Trash2 size={16} />
              </IconButton>
            }
            onClick={() => onFetchMessages(chat.id)}
          >
            <Box className="bot-chat-item-content">
              <Typography className="bot-chat-item-title">
                {chat.title}
              </Typography>
              
              <Typography variant="caption" className="bot-chat-item-date">
                {new Date(chat.updated_at).toLocaleDateString()}
              </Typography>
            </Box>
          </ListItem>
        ))}
      </List>
    </Box>
  );
}; 