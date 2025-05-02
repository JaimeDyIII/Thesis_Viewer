import { supabase } from "../../lib/supabase";
import { Message, ChatSession, Thesis } from "./types";
import pdfToText from 'react-pdftotext';

export const extractPdfText = async (pdfUrl: string, maxCharacters = 50000): Promise<string> => {
  try {
    const response = await fetch(pdfUrl);
    const pdfBlob = await response.blob();
    const text = await pdfToText(pdfBlob);
    return text.substring(0, maxCharacters).trim();
  } catch (error) {
    console.error('Error extracting PDF text:', error);
    return '';
  }
};

export const fetchActiveThesis = async (): Promise<Thesis[]> => {
  try {
    const { data, error } = await supabase
      .from("Thesis")
      .select("id, title, description, category, author, publishing_year")
      .eq("isActive", true);

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("Failed to fetch thesis data:", err);
    return [];
  }
};

export const fetchConversations = async (userId: string): Promise<ChatSession[]> => {
  try {
    const { data, error } = await supabase
      .from('conversation')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return [];
  }
};

export const fetchMessages = async (conversationId: number, userId: string): Promise<{ messages: Message[], pdfContext: string | null }> => {
  try {
    const { data: conversationData, error: conversationError } = await supabase
      .from('conversation')
      .select('*')
      .eq('id', conversationId)
      .eq('user_id', userId)
      .single();
    
    if (conversationError) throw conversationError;
    
    if (!conversationData) {
      throw new Error("Unauthorized access to conversation");
    }

    let pdfContext = null;
    if (conversationData?.context_pdf_url) {
      pdfContext = await extractPdfText(conversationData.context_pdf_url);
    }
    
    const { data, error } = await supabase
      .from('message')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    
    return {
      messages: data || [],
      pdfContext
    };
  } catch (error) {
    console.error("Error fetching messages:", error);
    return { messages: [], pdfContext: null };
  }
};

export const checkForSameTitleThenGiveNumberedTitleIfItExists = async (title: string): Promise<string> => {
  const { data: exactMatches, error: exactError } = await supabase
    .from('conversation')
    .select('title')
    .eq('title', title);

  if (exactError) throw exactError;

  if (!exactMatches || exactMatches.length === 0) {
    return title;
  }

  const { data: numberedMatches, error: numberedError } = await supabase
    .from('conversation')
    .select('title')
    .like('title', `${title} (%)`);

  if (numberedError) throw numberedError;

  const nextNumber = (numberedMatches?.length || 0) + 1;
  return `${title} (${nextNumber})`;
};

export const createNewConversation = async (firstMessage: string, userId: string, pdfUrl: string | null): Promise<number | null> => {
  try {
    const title = firstMessage.substring(0, 30) + (firstMessage.length > 30 ? '...' : '');
    const uniqueTitle = await checkForSameTitleThenGiveNumberedTitleIfItExists(title);

    const { data: conversationData, error: conversationError } = await supabase
      .from('conversation')
      .insert([
        { 
          title: uniqueTitle,
          user_id: userId,
          context_pdf_url: pdfUrl
        }
      ])
      .select();
    
    if (conversationError) throw conversationError;
    
    if (conversationData && conversationData.length > 0) {
      return conversationData[0].id;
    }
    return null;
  } catch (error) {
    console.error("Error creating conversation:", error);
    return null;
  }
};

export const saveMessage = async (messageData: Omit<Message, 'id'>): Promise<Message | null> => {
  try {
    const { data, error } = await supabase
      .from('message')
      .insert([messageData])
      .select();
    
    if (error) throw error;
    
    if (messageData.conversation_id) {
      await supabase
        .from('conversation')
        .update({ updated_at: new Date() })
        .eq('id', messageData.conversation_id);
    }
    
    return data?.[0] || null;
  } catch (error) {
    console.error("Error saving message:", error);
    return null;
  }
};

export const clearHistory = async (userId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('conversation')
      .delete()
      .eq('user_id', userId);
    
    if (error) throw error;
  } catch (error) {
    console.error("Error clearing history:", error);
    throw error;
  }
};

export const fetchAIResponse = async (
  messages: Message[],
  pdfContext: string | null,
  thesisList: Thesis[],
  OPEN_ROUTER_KEY: string
): Promise<string> => {
  const apiMessages = messages.map(message => ({
    role: message.role,
    content: message.content,
  }));

  // Add system messages
  apiMessages.unshift({
    role: 'system',
    content: `This is a context for your task, do not assume that this is a user query.
              You are an A.I. assistant for the New Era University Thesis Knowledge Management System.
              Your name is ThessaAI 
              Answer the queries to the best of your capabilities. 
              You will not answer anything outside the scope of your task.
              You will only answer questions regarding the New Era University Thesis Knowledge Management System and nothing else
              If question is asked, unless otherwise stated, assume the intent is about the thesis repository
              You do not need to give anything related to the system, just answer the query of the user about the thesis repository
              Examples of question you don't want to answer: Who is the president? Recommend me places to visit? does hitler have a cat? 
              Examples of question you want to answer: Recommend me thesis, elaborate on that, summarize this thesis, or questions that might seem general but work in context(if and only if it is within the thesis scope).
              You are to aid user in answering queries that they might need in learning about the theses documents not any general queries.
              The current hosting of the website is https://thesis-viewer.vercel.app/ and the thesis repository viewing is in https://thesis-viewer.vercel.app/view-thesis but make it a link with the name View Thesis, if they want thesis context direct them to view-thesis and tell them find the thesis they want to ask you about and click the ask Thessa button`
  });

  apiMessages.unshift({
    role: 'system',
    content: `This is a context for your task, do not assume that this is a user query.
              Do not and I repeat do not provide user any information regarding the database including but not limited to the link of the thesis.
              Here is all the active theses in the database, if anyone asked anything about general theses, refer to this:
              ${JSON.stringify(thesisList)}`
  });

  if (pdfContext) {
    apiMessages.unshift({
      role: 'system',
      content: `
      This is the entire Thesis PDF Document taken directly from the thesis repository: ${pdfContext}. 
      
      This is the context for the thesis the user want to ask question about.
      Please use this context to answer the following query precisely and relevantly. 
      But do not share it to the user, we do not want them to be able to copy or save this due to the intellectual property act. 
      Just answer their questions you can give summarization or other things but not the entire document.
      If the user asked other specific thesis, direct them to go to the Thesis Repository then View Thesis and ask them to find the specific thesis to ask you about it.`
    });
  }

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPEN_ROUTER_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      "model": "meta-llama/llama-4-maverick:free",
      "messages": apiMessages
    })
  });

  if (!res.ok) {
    throw new Error(`HTTP Error! Status: ${res.status}`);
  }

  const data = await res.json();
  return data.choices[0].message.content;
};

export const deleteConversation = async (conversationId: number) => {
  const { error } = await supabase
    .from('conversation')
    .delete()
    .eq('id', conversationId);

  if (error) throw error;
}; 