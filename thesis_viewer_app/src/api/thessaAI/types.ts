export interface Message {
    id: number;
    conversation_id: number;
    role: string;
    content: string;
    created_at: Date;
}
  
export interface ChatSession {
    id: number;
    user_id: string;
    title: string;
    created_at: Date;
    updated_at: Date;
}

export interface Thesis {
    id: number;
    title: string;
    description: string | null;
    category: string | null;
    author: string;
    publishing_year: number;
}
  
export interface ThessaAIState {
    messages: Message[];
    inputValue: string;
    query: string;
    isLoading: boolean;
    isAIResponseLoading: boolean;
    conversations: ChatSession[];
    currentConversationId: number | null;
    pdfContext: string | null;
    sidebarOpen: boolean;
    drawerOpen: boolean;
    thesisList: Thesis[];
} 