import { useState, useRef, useEffect } from 'react';
import { Box, TextField, IconButton, Typography, Drawer, List, ListItem, Divider } from '@mui/material';
import { Send, Glasses, History, ChevronLeft, Menu } from 'lucide-react';
import { Header } from "../components/Header";
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { useAuth } from "../context/AuthContext";
import "../styles/JaimeGPT.css";
import { supabase } from "../lib/supabase";
import { motion } from "framer-motion";

// Define TypeScript interfaces for our data
interface Message {
  id: number;
  conversation_id: number;
  role: string;
  content: string;
  created_at: Date;
}

interface ChatSession {
  id: number;
  user_id: string;
  title: string;
  created_at: Date;
  updated_at: Date;
}

// Typing indicator component using Framer Motion
const TypingIndicator = () => {
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

export default function JaimeGPT() {
  const { session } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversations, setConversations] = useState<ChatSession[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  const OPENROUTER_API_KEY = ''; // Replace with your API key

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if(query !== '') fetchResponse();
  }, [query]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const fetchConversations = async () => {
    try {
      const { data, error } = await supabase
        .from('conversation')
        .select('*')
        .eq('user_id', session?.user?.id)
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        setConversations(data);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    }
  };

  const fetchMessages = async (conversationId: number) => {
    try {
      // First verify this conversation belongs to the current user
      const { data: conversationData, error: conversationError } = await supabase
        .from('conversation')
        .select('*')
        .eq('id', conversationId)
        .eq('user_id', session?.user?.id)
        .single();
      
      if (conversationError) throw conversationError;
      
      if (!conversationData) {
        console.error("Unauthorized access to conversation");
        return;
      }
      
      const { data, error } = await supabase
        .from('message')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      if (data) {
        setMessages(data);
        setCurrentConversationId(conversationId);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  // Create a new conversation
  const createNewConversation = async (firstMessage: string) => {
    try {
      const { data: conversationData, error: conversationError } = await supabase
        .from('conversation')
        .insert([
          { 
            title: firstMessage.substring(0, 30) + (firstMessage.length > 30 ? '...' : ''),
            user_id: session?.user?.id
          }
        ])
        .select();
      
      if (conversationError) throw conversationError;
      
      if (conversationData && conversationData.length > 0) {
        const newConversationId = conversationData[0].id;
        setCurrentConversationId(newConversationId);
        
        await saveMessage({
          conversation_id: newConversationId,
          role: 'user',
          content: firstMessage,
          created_at: new Date()
        });
        
        fetchConversations();
        
        return newConversationId;
      }
    } catch (error) {
      console.error("Error creating conversation:", error);
      return null;
    }
  };

  // Save a message to Supabase
  const saveMessage = async (messageData: Omit<Message, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('message')
        .insert([messageData])
        .select();
      
      if (error) throw error;
      
      // Update conversation's updated_at timestamp
      if (messageData.conversation_id) {
        await supabase
          .from('conversation')
          .update({ updated_at: new Date() })
          .eq('id', messageData.conversation_id);
      }
      
      return data;
    } catch (error) {
      console.error("Error saving message:", error);
      return null;
    }
  };

  // Fetch response from API
  const fetchResponse = async () => {
    try {
      setIsLoading(true);
      
      let conversationId = currentConversationId;
      
      // If no current conversation, create a new one
      if (!conversationId) {
        conversationId = await createNewConversation(query);
        if (!conversationId) throw new Error("Failed to create conversation");
      } else {
        // Add user message to existing conversation
        await saveMessage({
          conversation_id: conversationId,
          role: 'user',
          content: query,
          created_at: new Date()
        });
      }
      
      // Add user message to UI state
      const userMsg: Message = {
        id: messages.length,
        conversation_id: conversationId,
        role: "user",
        content: query,
        created_at: new Date()
      };

      setMessages(prevMessages => [...prevMessages, userMsg]);

      // Prepare messages for API
      const apiMessages = [...messages, userMsg].map(message => ({
        role: message.role,
        content: message.content,
      }));

      // Make API request
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "model": "deepseek/deepseek-r1:free",
          "messages": apiMessages
        })
      });

      if (!res.ok) {
        throw new Error(`HTTP Error! Status: ${res.status}`);
      }

      const data = await res.json();
      const responseContent = data.choices[0].message.content;

      // Save assistant response to Supabase
      await saveMessage({
        conversation_id: conversationId,
        role: "assistant",
        content: responseContent,
        created_at: new Date()
      });

      // Add assistant response to UI state
      const assistantMsg: Message = {
        id: messages.length + 1,
        conversation_id: conversationId,
        role: "assistant",
        content: responseContent,
        created_at: new Date()
      };
  
      setMessages(prevMessages => [...prevMessages, assistantMsg]);

      // Update conversations list after the message exchange
      fetchConversations();

      setIsLoading(false);
      setQuery('');
    } catch (error) {
      console.error("Error fetching chat response:", error);
      setIsLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setQuery(inputValue);
      setInputValue('');
    }
  };

  // Render markdown
  const renderMarkdown = (content: string) => {
    const rawHtml = marked.parse(content, { async: false }) as string;
    const sanitizedHtml = DOMPurify.sanitize(rawHtml);
    return { __html: sanitizedHtml };
  };

  // Toggle sidebar function
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Start a new conversation
  const startNewConversation = () => {
    setMessages([]);
    setCurrentConversationId(null);
  };

  return (
    <div className="bot-gpt-container">
      {/* Background layers */}
      <div className="bot-background-gradient"></div>
      <div className="bot-background-blur"></div>
      <div className="bot-background-radial"></div>
      
      <Header />
      
      {/* Full-width layout with collapsible sidebar */}
      <Box className="bot-gpt-layout">
        {/* Collapsible sidebar for desktop */}
        <Box className={`bot-sidebar bot-sidebar-hidden ${sidebarOpen ? 'bot-sidebar-expanded' : 'bot-sidebar-collapsed'}`}>
          <Box className="bot-sidebar-header">
            <Typography className="bot-sidebar-title">Chat History</Typography>
            
            {/* Close sidebar button */}
            <IconButton onClick={toggleSidebar} size="small" className="bot-sidebar-toggle">
              <ChevronLeft size={20} />
            </IconButton>
          </Box>
          
          <Divider />
          
          {/* New chat button */}
          <Box onClick={startNewConversation} className="bot-new-chat">
            <Typography className="bot-new-chat-text">+ New Chat</Typography>
          </Box>
          
          <Divider />
          
          {/* Chat history items */}
          <List className="bot-chat-list">
            {conversations.map((chat) => (
              <ListItem 
                key={chat.id} 
                disablePadding 
                onClick={() => fetchMessages(chat.id)}
                className={`bot-chat-item ${currentConversationId === chat.id ? 'bot-chat-item-active' : ''}`}
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

        {/* Toggle sidebar button for desktop */}
        {!sidebarOpen && (
          <IconButton
            onClick={toggleSidebar}
            className="bot-desktop-toggle"
          >
            <Menu size={24} />
          </IconButton>
        )}

        {/* Mobile toggle button */}
        <IconButton
          onClick={() => setDrawerOpen(true)}
          className="bot-mobile-toggle"
        >
          <History size={24} />
        </IconButton>

        {/* Mobile drawer */}
        <Drawer
          anchor="left"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          className="bot-mobile-drawer"
        >
          <Box className="bot-sidebar-header">
            <Typography className="bot-sidebar-title">Chat History</Typography>
            
            <IconButton onClick={() => setDrawerOpen(false)} size="small" className="bot-sidebar-toggle">
              <ChevronLeft size={20} />
            </IconButton>
          </Box>
          
          <Divider />
          
          {/* New chat button in mobile drawer */}
          <Box
            onClick={() => {
              startNewConversation();
              setDrawerOpen(false);
            }}
            className="bot-new-chat"
          >
            <Typography className="bot-new-chat-text">+ New Chat</Typography>
          </Box>
          
          <Divider />
          
          <List className="bot-chat-list">
            {conversations.map((chat) => (
              <ListItem 
                key={chat.id} 
                disablePadding 
                onClick={() => {
                  fetchMessages(chat.id);
                  setDrawerOpen(false);
                }}
                className={`bot-chat-item ${currentConversationId === chat.id ? 'bot-chat-item-active' : ''}`}
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
        </Drawer>

        {/* Main content area */}
        <Box className="bot-content">
          <Typography variant="h2" className="bot-title">JaimeGPT</Typography>
          
          {/* Messages area */}
          <Box className="bot-messages-container">
            {messages.length === 0 ? (
              <Box className="empty-state">
                <Glasses size={45} className="empty-state-icon" />
                <Typography variant="h6" className="empty-state-title">Ask Jaime anything</Typography>
                <Typography variant="body2">Your thesis assistant is ready to help</Typography>
              </Box>
            ) : (
              <>
                {messages.map((msg, index) => (
                  <Box 
                    key={index} 
                    className={msg.role === 'user' ? 'user-message' : 'bot-message'}
                  >
                    {msg.role === 'user' ? (
                      <Typography>{msg.content}</Typography>
                    ) : (
                      <div dangerouslySetInnerHTML={renderMarkdown(msg.content)} />
                    )}
                  </Box>
                ))}
                
                {/* Show typing indicator while loading */}
                {isLoading && (
                  <Box className="typing-indicator-container">
                    <TypingIndicator />
                  </Box>
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </Box>
          
          {/* Input area */}
          <Box 
            component="form" 
            onSubmit={handleSubmit}
            className="bot-input-container"
          >
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Type a message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              size="small"
              className="bot-input-field"
            />
            <IconButton 
              type="submit" 
              disabled={!inputValue.trim() || isLoading}
              className={`bot-send-button ${inputValue.trim() && !isLoading ? 'bot-send-button-enabled' : 'bot-send-button-disabled'}`}
            >
              <Send size={18} />
            </IconButton>
          </Box>
        </Box>
      </Box>
    </div>
  );
}