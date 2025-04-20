export interface Thesis {
    id: number;
    created_at: string;
    title: string;
    description: string | null;
    category: string | null;
    pdf_url: string | null;
    isActive: boolean;
    author: string;
    creatorID: string;
    publishing_year: number | null;
  }

export interface ThesisStats {
    total: number;
    active: number;
    inactive: number;
}

export interface ThesisFilters {
    category?: string;
    isActive?: boolean;
    searchTerm?: string;
    year?: number;
}

export interface ThesisCreateInput {
    title: string;
    description?: string;
    author: string;
    category?: string;
    pdf_url?: string;
    publishing_year?: number;
    isActive: boolean;
    }

export interface ThesisUpdateInput {
    title?: string;
    description?: string;
    author?: string;
    category?: string;
    pdf_url?: string;
    publishing_year?: number;
    isActive?: boolean;
}