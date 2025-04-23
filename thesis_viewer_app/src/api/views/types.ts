export interface Views {
    id: string;
    user_id: string;
    thesis_id: number;
    viewed_at: string;
  }

  export interface RecentlyRead {
    user_id: string;
    thesis_id: number;
    viewed_at: string;
    Thesis: {
      id: number;
      title: string;
      author: string;
    } | null;
  }  