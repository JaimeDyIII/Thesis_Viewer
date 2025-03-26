import { createContext, useContext, useState, ReactNode } from "react";

type Thesis = {
  id: number;
  title: string;
  description: string | null;
  author: string;
  category: string | null;
  pdf_url: string | null;
};

type ThesisContextType = {
  selectedThesis: Thesis | null;
  setSelectedThesis: (thesis: Thesis | null) => void;
};

const ThesisContext = createContext<ThesisContextType | undefined>(undefined);

export function ThesisProvider({ children }: { children: ReactNode }) {
  const [selectedThesis, setSelectedThesis] = useState<Thesis | null>(null);

  return (
    <ThesisContext.Provider value={{ selectedThesis, setSelectedThesis }}>
      {children}
    </ThesisContext.Provider>
  );
}

export function useThesis() {
  const context = useContext(ThesisContext);
  if (!context) {
    throw new Error("useThesis must be used within a ThesisProvider");
  }
  return context;
}
