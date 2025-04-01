import { useState, useRef, useEffect } from 'react';
import { Box, TextField, IconButton, Typography, Drawer, List, ListItem, Divider } from '@mui/material';
import { Send, Glasses, History, ChevronLeft, Menu } from 'lucide-react';
import pdfToText from 'react-pdftotext';
import { Header } from "../components/Header";
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { useAuth } from "../context/AuthContext";
import "../styles/JaimeGPT.css";
import { supabase } from "../lib/supabase";
import { motion } from "framer-motion";
import { useLocation } from 'react-router-dom';
import { useThesis } from "../context/ThesisContext";

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

// Function to extract text from PDF
const extractPdfText = async (pdfUrl: string, maxCharacters = 50000): Promise<string> => {
  try {
    // Fetch PDF file first
    const response = await fetch(pdfUrl);
    const pdfBlob = await response.blob();

    // Convert PDF to text
    const text = await pdfToText(pdfBlob);

    // Truncate text if it exceeds max characters
    return text.substring(0, maxCharacters).trim();
  } catch (error) {
    console.error('Error extracting PDF text:', error);
    return '';
  }
};
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
  const location = useLocation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAIResponseLoading, setIsAIResponseLoading] = useState(false);
  const [conversations, setConversations] = useState<ChatSession[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);
  const [pdfContext, setPdfContext] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { selectedThesis, setSelectedThesis } = useThesis();

  const OPEN_ROUTER_KEY = process.env.REACT_APP_OPENROUTER_API_KEY;
  
  useEffect(() => {
    // Ensure we have a selected thesis and a PDF URL
    if (!selectedThesis?.id) return;
    
    const fetchPdfContext = async () => {
      try {
        setIsLoading(true);

        const { data, error } = await supabase
          .from('Thesis')
          .select('pdf_url')
          .eq('id', selectedThesis.id)
          .single();

        if (error) throw error;

        if (data?.pdf_url) {
          // Extract text from PDF
          const pdfText = await extractPdfText(data.pdf_url);
          
          // Set PDF context for use in chat
          setPdfContext(pdfText);
        } else {
          setPdfContext(null);
        }
      } catch (error) {
        console.error("Error fetching PDF context:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPdfContext();
  }, [selectedThesis?.id, session?.user?.id]);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if(pdfContext && selectedThesis && !currentConversationId) {
      setQuery(`"${selectedThesis.title}", I have a question regarding this specific thesis.`);
    }
  }, [pdfContext, selectedThesis, currentConversationId]);

  useEffect(() => {
    if(query !== '' && !isAIResponseLoading) {
      fetchResponse();
    }
  }, [query, isAIResponseLoading]);

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

      if (conversationData?.context_pdf_url) {
        // Extract text from PDF
        const pdfText = await extractPdfText(conversationData?.context_pdf_url);
        
        // Set PDF context for the conversation
        setPdfContext(pdfText);
      } else {
        setPdfContext(null);
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

  const checkForSameTitleThenGiveNumberedTitleIfItExists = async (title: string) => {
      // Check for exact matches first
      const { data: exactMatches, error: exactError } = await supabase
      .from('conversation')
      .select('title')
      .eq('title', title);

      if (exactError) throw exactError;

      // If no exact match exists, use the title as is
      if (!exactMatches || exactMatches.length === 0) {
        return title;
      }

      // Otherwise, find all numbered versions to determine the next number
      const { data: numberedMatches, error: numberedError } = await supabase
      .from('conversation')
      .select('title')
      .like('title', `${title} (%)`);

      if (numberedError) throw numberedError;

      // Calculate the next number
      const nextNumber = (numberedMatches?.length || 0) + 1;
      return `${title} (${nextNumber})`;
  } 

  // Create a new conversation
  const createNewConversation = async (firstMessage: string) => {
    try {
      const title = firstMessage.substring(0, 30) + (firstMessage.length > 30 ? '...' : '');

      const uniqueTitle = await checkForSameTitleThenGiveNumberedTitleIfItExists(title);

      const { data: conversationData, error: conversationError } = await supabase
        .from('conversation')
        .insert([
          { 
            title: uniqueTitle,
            user_id: session?.user?.id,
            context_pdf_url: selectedThesis?.pdf_url || null
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
        
        setSelectedThesis(null);
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
    if (isAIResponseLoading) return;

    try {
      setIsAIResponseLoading(true);
      
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

      // AI context on what it is being used for
      apiMessages.unshift({
        role: 'system',
        content: `You are an A.I. assistant for the New Era University Thesis Knowledge Management System. 
                  Answer the queries to the best of your capabilities. 
                  You will not answer anything outside the scope of your task.
                  You will only answer questions regarding the New Era University Thesis Knowledge Management System and nothing else`
      });
        
      // Add PDF context if available
      if (pdfContext) {
        apiMessages.unshift({
          role: 'system',
          content: `
          This is the entire Thesis PDF Document taken directly from the thesis repository: ${pdfContext}. 
          
          Please use this context to answer the following query precisely and relevantly. 
          But do not share it to the user, we do not want them to be able to copy or save this due to the intellectual property act. 
          Just answer their questions you can give summarization or other things but not the entire document.
          If the user asked other specific thesis, direct them to go to the Thesis Repository then View Thesis and ask them to find the specific thesis to ask you about it.`
        });
      }

      // Make API request
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPEN_ROUTER_KEY}`,
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

      setIsAIResponseLoading(false);
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
            <Menu size={2} />
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
                {isAIResponseLoading && (
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