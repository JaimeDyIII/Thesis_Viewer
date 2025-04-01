import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

interface ViewContextType {
    recordView: (userId: string | null, thesisId: number) => void;
    getViewCount: (thesisId: number) => Promise<number>;
}

const ViewContext = createContext<ViewContextType | undefined>(undefined);

export const ViewProvider = ({ children }: { children: React.ReactNode }) => {

  const recordView = async (userId: string | null, thesisId: number) => {
    const { error } = await supabase.from("views").upsert(
      { user_id: userId, thesis_id: thesisId }, 
      { onConflict: 'user_id, thesis_id' });
  
    if (error) console.error("Error recording view:", error);
  };

  const getViewCount = async (thesisId: number) => {
    const { count } = await supabase
        .from("views")
        .select("*", { count: "exact", head: true })
        .eq("thesis_id", thesisId);

    return count || 0;
  };

  return <ViewContext.Provider value={{ recordView, getViewCount }}>{children}</ViewContext.Provider>;
};

export const useView = () => {
  const context = useContext(ViewContext);
  if (!context) throw new Error("useView must be used within a ViewProvider");
  return context;
};
