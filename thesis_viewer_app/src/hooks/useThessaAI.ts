import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useThesis } from '../context/ThesisContext';
import { Message, ChatSession, Thesis, ThessaAIState } from '../api/thessaAI/types';
import { supabase } from '../lib/supabase';
import {
  fetchActiveThesis,
  fetchConversations,
  fetchMessages,
  createNewConversation,
  saveMessage,
  clearHistory,
  fetchAIResponse,
  extractPdfText,
  deleteConversation as apiDeleteConversation
} from '../api/thessaAI/thessaAI';

const OPEN_ROUTER_KEY = process.env.REACT_APP_OPENROUTER_API_KEY || '';

export const useThessaAI = () => {
  const { session } = useAuth();
  const { selectedThesis, setSelectedThesis } = useThesis();
  
  const [state, setState] = useState<ThessaAIState>({
    messages: [],
    inputValue: '',
    query: '',
    isLoading: false,
    isAIResponseLoading: false,
    conversations: [],
    currentConversationId: null,
    pdfContext: null,
    sidebarOpen: true,
    drawerOpen: false,
    thesisList: []
  });

  useEffect(() => {
    const loadActiveThesis = async () => {
      setState(prev => ({ ...prev, isLoading: true }));
      try {
        const thesisList = await fetchActiveThesis();
        setState(prev => ({ ...prev, thesisList }));
      } catch (err) {
        console.error("Failed to fetch thesis data:", err);
      } finally {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    loadActiveThesis();
  }, []);

  useEffect(() => {
    if (!selectedThesis?.id) return;
    
    const loadPdfContext = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true }));
        const { data } = await supabase
          .from('Thesis')
          .select('pdf_url')
          .eq('id', selectedThesis.id)
          .single();

        if (data?.pdf_url) {
          const pdfText = await extractPdfText(data.pdf_url);
          setState(prev => ({ ...prev, pdfContext: pdfText }));
        } else {
          setState(prev => ({ ...prev, pdfContext: null }));
        }
      } catch (error) {
        console.error("Error fetching PDF context:", error);
      } finally {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    loadPdfContext();
  }, [selectedThesis?.id]);

  useEffect(() => {
    const loadConversations = async () => {
      if (!session?.user?.id) return;
      try {
        const conversations = await fetchConversations(session.user.id);
        setState(prev => ({ ...prev, conversations }));
      } catch (error) {
        console.error("Error fetching conversations:", error);
      }
    };

    loadConversations();
  }, [session?.user?.id]);

  useEffect(() => {
    if (state.pdfContext && selectedThesis && !state.currentConversationId) {
      setState(prev => ({
        ...prev,
        query: `"${selectedThesis.title}", I have a question regarding this specific thesis.`
      }));
    }
  }, [state.pdfContext, selectedThesis, state.currentConversationId]);

  useEffect(() => {
    if (state.query !== '' && !state.isAIResponseLoading) {
      handleFetchResponse();
    }
  }, [state.query, state.isAIResponseLoading]);

  const handleFetchResponse = async () => {
    if (state.isAIResponseLoading || !session?.user?.id) return;

    try {
      setState(prev => ({ ...prev, isAIResponseLoading: true }));
      
      let conversationId = state.currentConversationId;
      
      if (!conversationId) {
        conversationId = await createNewConversation(
          state.query,
          session.user.id,
          selectedThesis?.pdf_url || null
        );
        if (!conversationId) throw new Error("Failed to create conversation");
        setState(prev => ({ ...prev, currentConversationId: conversationId }));
      }

      const userMsg: Omit<Message, 'id'> = {
        conversation_id: conversationId,
        role: "user",
        content: state.query,
        created_at: new Date()
      };

      const savedUserMsg = await saveMessage(userMsg);
      if (!savedUserMsg) throw new Error("Failed to save user message");
      
      setState(prev => ({
        ...prev,
        messages: [...prev.messages, savedUserMsg]
      }));

      let responseContent: string;
      try {
        responseContent = await fetchAIResponse(
          [...state.messages, savedUserMsg],
          state.pdfContext,
          state.thesisList,
          OPEN_ROUTER_KEY
        );
      } catch (error) {
        console.error("Error fetching AI response:", error);
        responseContent = "I apologize, but I encountered an error while processing your request. Please try again.";
      }

      const assistantMsg: Omit<Message, 'id'> = {
        conversation_id: conversationId,
        role: "assistant",
        content: responseContent,
        created_at: new Date()
      };

      const savedAssistantMsg = await saveMessage(assistantMsg);
      if (!savedAssistantMsg) throw new Error("Failed to save assistant message");

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, savedAssistantMsg],
        query: ''
      }));

      const conversations = await fetchConversations(session.user.id);
      setState(prev => ({ ...prev, conversations }));

    } catch (error) {
      console.error("Error in chat response flow:", error);
      
      if (state.currentConversationId) {
        const errorMsg: Omit<Message, 'id'> = {
          conversation_id: state.currentConversationId,
          role: "assistant",
          content: "An unexpected error occurred. Please try again.",
          created_at: new Date()
        };
        
        try {
          const savedErrorMsg = await saveMessage(errorMsg);
          if (savedErrorMsg) {
            setState(prev => ({
              ...prev,
              messages: [...prev.messages, savedErrorMsg]
            }));
          }
        } catch (saveError) {
          console.error("Error saving error message:", saveError);
        }
      }
    } finally {
      setState(prev => ({ ...prev, isAIResponseLoading: false }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (state.inputValue.trim()) {
      setState(prev => ({
        ...prev,
        query: prev.inputValue,
        inputValue: ''
      }));
    }
  };

  const handleClearHistory = async () => {
    if (!session?.user?.id) return;
    
    if (window.confirm("Are you sure you want to clear all chat history? This cannot be undone.")) {
      try {
        await clearHistory(session.user.id);
        setState(prev => ({
          ...prev,
          messages: [],
          conversations: [],
          currentConversationId: null,
          drawerOpen: false
        }));
      } catch (error) {
        console.error("Error clearing history:", error);
      }
    }
  };

  const handleStartNewConversation = () => {
    setState(prev => ({
      ...prev,
      messages: [],
      currentConversationId: null
    }));
    setSelectedThesis(null);
  };

  const handleFetchMessages = async (conversationId: number) => {
    if (!session?.user?.id) return;
    
    try {
      const { messages, pdfContext } = await fetchMessages(conversationId, session.user.id);
      setState(prev => ({
        ...prev,
        messages,
        currentConversationId: conversationId,
        pdfContext
      }));
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const toggleSidebar = () => {
    setState(prev => ({ ...prev, sidebarOpen: !prev.sidebarOpen }));
  };

  const setDrawerOpen = (open: boolean) => {
    setState(prev => ({ ...prev, drawerOpen: open }));
  };

  const setInputValue = (value: string) => {
    setState(prev => ({ ...prev, inputValue: value }));
  };

  const deleteConversation = async (conversationId: number) => {
    try {
      await apiDeleteConversation(conversationId);
      setState(prev => ({
        ...prev,
        conversations: prev.conversations.filter(conv => conv.id !== conversationId),
        messages: prev.currentConversationId === conversationId ? [] : prev.messages,
        currentConversationId: prev.currentConversationId === conversationId ? null : prev.currentConversationId
      }));
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    }
  };

  return {
    state,
    handleSubmit,
    handleClearHistory,
    handleStartNewConversation,
    handleFetchMessages,
    toggleSidebar,
    setDrawerOpen,
    setInputValue,
    deleteConversation
  };
}; 