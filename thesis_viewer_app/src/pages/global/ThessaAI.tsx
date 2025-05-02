import { useRef } from 'react';
import { Box, Typography, IconButton, Drawer } from '@mui/material';
import { Menu, ChevronRight, ChevronLeft } from 'lucide-react';
import { Header } from "../../components/Global/Header";
import { useThessaAI } from '../../hooks/useThessaAI';
import { ChatSidebar } from '../../components/ThessaAI/ChatSidebar';
import { ChatMessages } from '../../components/ThessaAI/ChatMessages';
import { ChatInput } from '../../components/ThessaAI/ChatInput';
import "../../styles/ThessaAI.css";

export default function ThessaAI() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const {
    state,
    handleSubmit,
    handleClearHistory,
    handleStartNewConversation,
    handleFetchMessages,
    toggleSidebar,
    setDrawerOpen,
    setInputValue,
    deleteConversation
  } = useThessaAI();

  return (
    <div className="bot-gpt-container">
      {/* Background layers */}
      <div className="bot-background-gradient"></div>
      <div className="bot-background-blur"></div>
      <div className="bot-background-radial"></div>
      
      <Header />
      
      {/* Full-width layout with sidebar */}
      <Box className="bot-gpt-layout">
        {/* Sidebar toggle button for desktop */}
        <IconButton 
          onClick={toggleSidebar}
          className="bot-desktop-toggle"
          title={state.sidebarOpen ? "Hide sidebar" : "Show sidebar"}
        >
          {state.sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </IconButton>
        
        {/* Sidebar for desktop - conditionally visible */}
        <Box className={`bot-sidebar ${state.sidebarOpen ? 'bot-sidebar-expanded' : 'bot-sidebar-collapsed'}`}>
          <ChatSidebar
            conversations={state.conversations}
            currentConversationId={state.currentConversationId}
            onClearHistory={handleClearHistory}
            onStartNewConversation={handleStartNewConversation}
            onFetchMessages={handleFetchMessages}
            onToggleSidebar={toggleSidebar}
            onDeleteConversation={deleteConversation}
          />
        </Box>

        {/* Mobile burger menu button */}
        <IconButton
          onClick={() => setDrawerOpen(true)}
          className="bot-mobile-toggle"
          sx={{ display: { md: 'none' } }}
        >
          <Menu size={20} />
        </IconButton>

        {/* Mobile drawer */}
        <Drawer
          anchor="left"
          open={state.drawerOpen}
          onClose={() => setDrawerOpen(false)}
          className="bot-mobile-drawer"
        >
          <ChatSidebar
            conversations={state.conversations}
            currentConversationId={state.currentConversationId}
            onClearHistory={handleClearHistory}
            onStartNewConversation={() => {
              handleStartNewConversation();
              setDrawerOpen(false);
            }}
            onFetchMessages={(conversationId) => {
              handleFetchMessages(conversationId);
              setDrawerOpen(false);
            }}
            onToggleSidebar={() => setDrawerOpen(false)}
            onDeleteConversation={deleteConversation}
          />
        </Drawer>

        {/* Main content area - adjusted based on sidebar state */}
        <Box className={`bot-content ${!state.sidebarOpen ? 'bot-content-expanded' : ''}`}>
          <Typography variant="h2" className="bot-title">ThessaAI</Typography>
          
          <ChatMessages
            messages={state.messages}
            isAIResponseLoading={state.isAIResponseLoading}
            messagesEndRef={messagesEndRef as React.RefObject<HTMLDivElement>}
          />
          
          <ChatInput
            inputValue={state.inputValue}
            isLoading={state.isLoading}
            isAIResponseLoading={state.isAIResponseLoading}
            onSubmit={handleSubmit}
            onInputChange={setInputValue}
          />
        </Box>
      </Box>
    </div>
  );
}