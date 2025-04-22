export interface Bookmarks {
    user_id: string;
    thesis_id: number;
    bookmarked_at: string;
  }

  export interface FeaturedThesis {
    thesis_id: number;
    bookmarked_at: string;
    Thesis: {
      id: number;
      title: string;
      author: string;
    }[];
  }  