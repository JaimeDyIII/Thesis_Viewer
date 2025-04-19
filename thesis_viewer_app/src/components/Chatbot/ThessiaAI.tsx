// ChatBot.tsx
import { useState, useRef, useEffect } from 'react';
import { Box, TextField, IconButton, Typography, Drawer, List, ListItem, Divider } from '@mui/material';
import { Send, Glasses, History, ChevronLeft, Menu } from 'lucide-react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { motion } from "framer-motion";
import { supabase } from "../../lib/supabase";
import "../styles/ChatBot.css";

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

interface ChatBotProps {
  userId: string;
  pdfContext: string | null;
  pdfUrl: string | null;
  thesisData: any[];
  apiKey: string;
}

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

export const ChatBot = ({ userId, pdfContext, pdfUrl, thesisData, apiKey }: ChatBotProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAIResponseLoading, setIsAIResponseLoading] = useState(false);
  const [conversations, setConversations] = useState<ChatSession[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, [userId]);

  useEffect(() => {
    if(pdfContext && pdfUrl && !currentConversationId) {
      // Extract title from URL or use a default
      const thesisTitle = thesisData.find(t => t.pdf_url === pdfUrl)?.title || "This thesis";
      setQuery(`"${thesisTitle}", I have a question regarding this specific thesis.`);
    }
  }, [pdfContext, pdfUrl, currentConversationId, thesisData]);

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
        .eq('user_id', userId)
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
        .eq('user_id', userId)
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
            user_id: userId,
            context_pdf_url: pdfUrl || null
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
                  You will only answer questions regarding the New Era University Thesis Knowledge Management System and nothing else
                  If question is asked, unless otherwise stated, assume the intent is about the thesis repository`
      });

      // AI context for the active thesis in the database
      apiMessages.unshift({
        role: 'system',
        content: `Here is all the active theses in the database, if anyone asked anything about general theses, refer to this:
                  ${JSON.stringify(thesisData)}`
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
          "Authorization": `Bearer ${apiKey}`,
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

      setQuery('');
    } catch (error) {
      console.error("Error fetching chat response:", error);
      setIsLoading(false);
    } finally {
      setIsAIResponseLoading(false);
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
    <Box className="chatbot-container">
      {/* Background layers */}
      <div className="chatbot-background-gradient"></div>
      <div className="chatbot-background-blur"></div>
      <div className="chatbot-background-radial"></div>
      
      {/* Layout with collapsible sidebar */}
      <Box className="chatbot-layout">
        {/* Collapsible sidebar for desktop */}
        <Box className={`chatbot-sidebar ${sidebarOpen ? 'chatbot-sidebar-expanded' : 'chatbot-sidebar-collapsed'}`}>
          <Box className="chatbot-sidebar-header">
            <Typography className="chatbot-sidebar-title">Chat History</Typography>
            
            {/* Close sidebar button */}
            <IconButton onClick={toggleSidebar} size="small" className="chatbot-sidebar-toggle">
              <ChevronLeft size={20} />
            </IconButton>
          </Box>
          
          <Divider />
          
          {/* New chat button */}
          <Box onClick={startNewConversation} className="chatbot-new-chat">
            <Typography className="chatbot-new-chat-text">+ New Chat</Typography>
          </Box>
          
          <Divider />
          
          {/* Chat history items */}
          <List className="chatbot-chat-list">
            {conversations.map((chat) => (
              <ListItem 
                key={chat.id} 
                disablePadding 
                onClick={() => fetchMessages(chat.id)}
                className={`chatbot-chat-item ${currentConversationId === chat.id ? 'chatbot-chat-item-active' : ''}`}
              >
                <Box className="chatbot-chat-item-content">
                  <Typography className="chatbot-chat-item-title">
                    {chat.title}
                  </Typography>
                  
                  <Typography variant="caption" className="chatbot-chat-item-date">
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
            className="chatbot-desktop-toggle"
          >
            <Menu size={20} />
          </IconButton>
        )}

        {/* Mobile toggle button */}
        <IconButton
          onClick={() => setDrawerOpen(true)}
          className="chatbot-mobile-toggle"
        >
          <History size={24} />
        </IconButton>

        {/* Mobile drawer */}
        <Drawer
          anchor="left"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          className="chatbot-mobile-drawer"
        >
          <Box className="chatbot-drawer-content">
            <Box className="chatbot-sidebar-header">
              <Typography className="chatbot-sidebar-title">Chat History</Typography>
              
              <IconButton onClick={() => setDrawerOpen(false)} size="small" className="chatbot-sidebar-toggle">
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
              className="chatbot-new-chat"
            >
              <Typography className="chatbot-new-chat-text">+ New Chat</Typography>
            </Box>
            
            <Divider />
            
            <List className="chatbot-chat-list">
              {conversations.map((chat) => (
                <ListItem 
                  key={chat.id} 
                  disablePadding 
                  onClick={() => {
                    fetchMessages(chat.id);
                    setDrawerOpen(false);
                  }}
                  className={`chatbot-chat-item ${currentConversationId === chat.id ? 'chatbot-chat-item-active' : ''}`}
                >
                  <Box className="chatbot-chat-item-content">
                    <Typography className="chatbot-chat-item-title">
                      {chat.title}
                    </Typography>
                    
                    <Typography variant="caption" className="chatbot-chat-item-date">
                      {new Date(chat.updated_at).toLocaleDateString()}
                    </Typography>
                  </Box>
                </ListItem>
              ))}
            </List>
          </Box>
        </Drawer>

        {/* Main content area */}
        <Box className="chatbot-content">
          <Typography variant="h4" className="chatbot-title">ThessaAI</Typography>
          
          {/* Messages area */}
          <Box className="chatbot-messages-container">
            {messages.length === 0 ? (
              <Box className="chatbot-empty-state">
                <Glasses size={40} className="chatbot-empty-state-icon" />
                <Typography variant="h6" className="chatbot-empty-state-title">Ask ThessaAI anything about the Theses</Typography>
                <Typography variant="body2">Your thesis assistant is ready to help</Typography>
              </Box>
            ) : (
              <>
                {messages.map((msg, index) => (
                  <Box 
                    key={index} 
                    className={msg.role === 'user' ? 'chatbot-user-message' : 'chatbot-bot-message'}
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
                  <Box className="chatbot-typing-indicator-container">
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
            className="chatbot-input-container"
          >
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Type a message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              size="small"
              className="chatbot-input-field"
            />
            <IconButton 
              type="submit" 
              disabled={!inputValue.trim() || isLoading}
              className={`chatbot-send-button ${inputValue.trim() && !isLoading ? 'chatbot-send-button-enabled' : 'chatbot-send-button-disabled'}`}
            >
              <Send size={18} />
            </IconButton>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};