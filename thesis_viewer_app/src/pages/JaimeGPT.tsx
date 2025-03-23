import { useState, useRef, useEffect } from 'react';
import { Box, TextField, IconButton, Typography, Drawer, List, ListItem, Divider } from '@mui/material';
import { Send, Glasses, History, ChevronLeft, Menu } from 'lucide-react';
import { Header } from "../components/Header";
import "../styles/JaimeGPT.css";

// Define proper TypeScript interfaces
interface Message {
  text: string;
  sender: 'user' | 'jaime';
}

interface ChatSession {
  id: string;
  title: string;
  date: string;
  preview: string;
}

export default function JaimeGPT() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([
    { id: '1', title: 'Thesis Structure Help', date: 'Mar 22, 2025', preview: 'How should I structure my literature review...' },
    { id: '2', title: 'APA Citation Format', date: 'Mar 20, 2025', preview: 'Can you show me how to cite a journal...' },
    { id: '3', title: 'Research Methodology', date: 'Mar 18, 2025', preview: 'What methodology would work best for...' },
    { id: '4', title: 'Statistical Analysis', date: 'Mar 15, 2025', preview: 'How do I interpret these regression results...' },
  ]);
  
  // Sidebar state (open/closed)
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Mobile drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      // Add user message
      const newUserMessage: Message = { text: inputValue, sender: 'user' };
      setMessages([...messages, newUserMessage]);
      
      // Simulate response (replace with actual API call)
      setTimeout(() => {
        const jaimeResponse: Message = { 
          text: getJaimeResponse(inputValue), 
          sender: 'jaime' 
        };
        setMessages(prev => [...prev, jaimeResponse]);
      }, 1000);
      
      setInputValue('');
    }
  };

  // Simple response generator (replace with actual AI integration)
  const getJaimeResponse = (userMessage: string) => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return "Hello! I'm Jaime, your thesis assistant. How can I help you today?";
    } else if (lowerMessage.includes('thesis')) {
      return "I can help you with various aspects of your thesis. Would you like help with research, formatting, citations, or something else?";
    } else if (lowerMessage.includes('reference') || lowerMessage.includes('citation')) {
      return "For APA style citations, remember to include author, year, title, and source. For example: Smith, J. (2023). Title of the work. Publisher.";
    } else {
      return "I'm here to assist with your thesis. Could you provide more details about what you need help with?";
    }
  };

  // Toggle sidebar function
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="jaime-gpt-container">
      {/* Background layers */}
      <div className="jaime-background-gradient"></div>
      <div className="jaime-background-blur"></div>
      <div className="jaime-background-radial"></div>
      
      <Header />
      
      {/* Full-width layout with collapsible sidebar */}
      <Box sx={{ 
        display: 'flex',
        height: 'calc(100vh - 64px)',
        width: '100%',
        position: 'relative'
      }}>
        {/* Collapsible sidebar for desktop */}
        <Box 
          sx={{ 
            width: sidebarOpen ? 255 : 0,
            height: '100%',
            bgcolor: '#f6f2f9',
            borderRight: '1px solid #e9e0f0',
            display: { xs: 'none', md: 'block' },
            transition: 'width 0.3s ease',
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            pr: 1
          }}>
            <Typography 
              variant="h6" 
              sx={{ 
                p: 2, 
                pl: 3, 
                fontWeight: 600, 
                fontSize: '1.1rem',
                color: '#9c27b0'  
              }}
            >
              Chat History
            </Typography>
            
            {/* Close sidebar button */}
            <IconButton onClick={toggleSidebar} size="small">
              <ChevronLeft size={20} color="#7a1b86" />
            </IconButton>
          </Box>
          
          <Divider />
          
          {/* Chat history items */}
          <List sx={{ p: 0 }}>
            {chatHistory.map((chat) => (
              <ListItem 
                key={chat.id} 
                disablePadding 
                sx={{ 
                  display: 'block',
                  borderBottom: '1px solid #f0e6f5',
                  '&:hover': {
                    bgcolor: 'rgba(156, 39, 176, 0.04)'
                  }
                }}
              >
                <Box sx={{ p: 2, pl: 3 }}>
                  <Typography 
                    sx={{ 
                      fontWeight: 600, 
                      fontSize: '0.95rem',
                      color: '#6a1b9a',
                      mb: 0.5
                    }}
                  >
                    {chat.title}
                  </Typography>
                  
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: '#666',
                      display: 'block',
                      mb: 0.75
                    }}
                  >
                    {chat.date}
                  </Typography>
                  
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: '#666',
                      fontSize: '0.8rem',
                      lineHeight: 1.4
                    }}
                  >
                    {chat.preview}
                  </Typography>
                </Box>
              </ListItem>
            ))}
          </List>
        </Box>

        {/* Toggle sidebar button for desktop */}
        {!sidebarOpen && (
          <IconButton
            onClick={toggleSidebar}
            sx={{ 
              display: { xs: 'none', md: 'flex' }, 
              position: 'absolute',
              top: 10,
              left: 10,
              zIndex: 10,
              bgcolor: 'rgba(211, 99, 255, 0.1)',
              '&:hover': { bgcolor: 'rgba(211, 99, 255, 0.2)' }
            }}
          >
            <Menu size={24} color="#7a1b86" />
          </IconButton>
        )}

        {/* Mobile toggle button */}
        <IconButton
          onClick={() => setDrawerOpen(true)}
          sx={{ 
            display: { xs: 'flex', md: 'none' }, 
            position: 'fixed',
            top: 80,
            left: 16,
            zIndex: 10,
            bgcolor: 'rgba(211, 99, 255, 0.1)',
            '&:hover': { bgcolor: 'rgba(211, 99, 255, 0.2)' }
          }}
        >
          <History size={24} color="#7a1b86" />
        </IconButton>

        {/* Mobile drawer */}
        <Drawer
          anchor="left"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: 255,
              bgcolor: '#f6f2f9'
            },
          }}
        >
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            pr: 1
          }}>
            <Typography 
              variant="h6" 
              sx={{ 
                p: 2, 
                pl: 3, 
                fontWeight: 600, 
                fontSize: '1.1rem',
                color: '#9c27b0'  
              }}
            >
              Chat History
            </Typography>
            
            <IconButton onClick={() => setDrawerOpen(false)} size="small">
              <ChevronLeft size={20} color="#7a1b86" />
            </IconButton>
          </Box>
          
          <Divider />
          
          <List sx={{ p: 0 }}>
            {chatHistory.map((chat) => (
              <ListItem 
                key={chat.id} 
                disablePadding 
                sx={{ 
                  display: 'block',
                  borderBottom: '1px solid #f0e6f5',
                  '&:hover': {
                    bgcolor: 'rgba(156, 39, 176, 0.04)'
                  }
                }}
              >
                <Box sx={{ p: 2, pl: 3 }}>
                  <Typography 
                    sx={{ 
                      fontWeight: 600, 
                      fontSize: '0.95rem',
                      color: '#6a1b9a',
                      mb: 0.5
                    }}
                  >
                    {chat.title}
                  </Typography>
                  
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: '#666',
                      display: 'block',
                      mb: 0.75
                    }}
                  >
                    {chat.date}
                  </Typography>
                  
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: '#666',
                      fontSize: '0.8rem',
                      lineHeight: 1.4
                    }}
                  >
                    {chat.preview}
                  </Typography>
                </Box>
              </ListItem>
            ))}
          </List>
        </Drawer>

        {/* Main content area - direct messages display without container */}
        <Box sx={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          p: { xs: 2, md: 3 },
          bgcolor: 'rgba(237, 231, 246, 0.4)'
        }}>
          <Typography 
            variant="h2" 
            className="jaime-title" 
            sx={{ 
              textAlign: 'center',
              mb: 4,
              fontSize: { xs: '2.2rem', md: '2.6rem' },
              color: '#7a1b86'
            }}
          >
            JaimeGPT
          </Typography>
          
          {/* Messages directly in the main area without container */}
          <Box 
            sx={{
              flex: 1,
              maxWidth: '850px',
              mx: 'auto',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto',
              mb: 2
            }}
          >
            {messages.length === 0 ? (
              <Box 
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  height: '100%',
                  gap: 1,
                  p: 3,
                  color: '#666'
                }}
              >
                <Glasses size={45} color="#9c27b0" />
                <Typography variant="h6" sx={{ mt: 1, color: '#7a1b86' }}>Ask Jaime anything</Typography>
                <Typography variant="body2">Your thesis assistant is ready to help</Typography>
              </Box>
            ) : (
              messages.map((message, index) => (
                <Box 
                  key={index} 
                  className={message.sender === 'user' ? 'user-message' : 'jaime-message'}
                  sx={{
                    maxWidth: '75%',
                    alignSelf: message.sender === 'user' ? 'flex-end' : 'flex-start',
                    mb: 2
                  }}
                >
                  <Typography>{message.text}</Typography>
                </Box>
              ))
            )}
            <div ref={messagesEndRef} />
          </Box>
          
          {/* Input area */}
          <Box 
            component="form" 
            onSubmit={handleSubmit}
            sx={{
              display: 'flex',
              alignItems: 'center',
              p: 2,
              maxWidth: '850px',
              mx: 'auto',
              width: '100%',
              borderRadius: '20px',
              bgcolor: 'rgba(255, 255, 255, 0.5)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
            }}
          >
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Type a message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '20px',
                  bgcolor: '#fafafa',
                }
              }}
            />
            <IconButton 
              type="submit" 
              disabled={!inputValue.trim()}
              sx={{
                ml: 1,
                bgcolor: inputValue.trim() ? '#9c27b0' : '#e1bee7',
                color: 'white',
                '&:hover': {
                  bgcolor: '#7b1fa2'
                },
                '&.Mui-disabled': {
                  bgcolor: '#f3e5f5',
                  color: '#bdbdbd'
                }
              }}
            >
              <Send size={18} />
            </IconButton>
          </Box>
        </Box>
      </Box>
    </div>
  );
}