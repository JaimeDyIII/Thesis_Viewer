import { createContext, useContext } from "react";
import { supabase } from "../lib/supabase";

interface BookmarkContextType {
  checkBookmark: (userId: string, thesisId: number) => Promise<boolean>;
  toggleBookmark: (userId: string, thesisId: number, currentState: boolean) => Promise<void>;
}

const BookmarkContext = createContext<BookmarkContextType | undefined>(undefined);

export const BookmarkProvider = ({ children }: { children: React.ReactNode }) => {
  const checkBookmark = async (userId: string, thesisId: number): Promise<boolean> => {
    const { data, error } = await supabase
      .from("bookmarks")
      .select("user_id")
      .eq("user_id", userId)
      .eq("thesis_id", thesisId)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error checking bookmark:", error);
    }

    return !!data;
  };

  const toggleBookmark = async (userId: string, thesisId: number, currentState: boolean) => {
    if (currentState) {
      await supabase
        .from("bookmarks")
        .delete()
        .eq("user_id", userId)
        .eq("thesis_id", thesisId);
    } else {
      await supabase
        .from("bookmarks")
        .upsert([{ user_id: userId, thesis_id: thesisId }], {
          onConflict: "user_id, thesis_id",
        });
    }
  };

  return <BookmarkContext.Provider value={{ checkBookmark, toggleBookmark }}>{children}</BookmarkContext.Provider>;
};

export const useBookmark = () => {
  const context = useContext(BookmarkContext);
  if (!context) throw new Error("useBookmark must be used within a BookmarkProvider");
  return context;
};
