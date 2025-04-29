import React, { createContext, useContext, ReactNode } from 'react';
import { getThesisStats, getAllTheses } from '../api/ThesisAPI';
import { getTotalUsersCount, getUserRoleStats } from '../api/users/queries';
import { getAllThesisViewCounts } from '../api/views/queries';
import { getAllThesisBookmarkCounts } from '../api/bookmarks/queries';

export interface Thesis {
  id: number;
  title: string;
  category: string;
  isActive: boolean;
  publishing_year: string;
  author?: string;
}

export interface ThesisWithMetrics extends Thesis {
  view_count: number;
  bookmark_count: number;
}

export interface CategoryMetrics {
  category: string;
  total: number;
  active: number;
  inactive: number;
  views: number;
  bookmarks: number;
}

export interface UserRoleStats {
  role: string;
  count: number;
}

export interface AnalyticsData {
  thesisStats: {
    total: number;
    active: number;
    inactive: number;
  };
  userCount: number;  // Changed from userStats to match implementation
  userRoleStats: UserRoleStats[];
  categoryMetrics: CategoryMetrics[];
  mostViewedTheses: ThesisWithMetrics[];
  mostBookmarkedTheses: ThesisWithMetrics[];
  thesesByCategory: Record<string, ThesisWithMetrics[]>;
  topCategories: string[];
}

interface AnalyticsContextType {
  fetchAnalyticsData: () => Promise<AnalyticsData>;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

interface AnalyticsProviderProps {
  children: ReactNode;
}

export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({ children }) => {
  const fetchAnalyticsData = async (): Promise<AnalyticsData> => {
    // Parallelize API calls where possible
    const [thesisStats, userCount, userRoleStats, thesesData, viewCounts, bookmarkCounts] = await Promise.all([
      getThesisStats(),
      getTotalUsersCount(),
      getUserRoleStats(),
      getAllTheses(),
      getAllThesisViewCounts(),
      getAllThesisBookmarkCounts()
    ]);

    const thesesWithMetrics: ThesisWithMetrics[] = thesesData.map(thesis => ({
      ...thesis,
      view_count: viewCounts[thesis.id] || 0,
      bookmark_count: bookmarkCounts[thesis.id] || 0
    }));

    // Process data
    const mostViewedTheses = [...thesesWithMetrics]
      .sort((a, b) => b.view_count - a.view_count)
      .slice(0, 10);

    const mostBookmarkedTheses = [...thesesWithMetrics]
      .sort((a, b) => b.bookmark_count - a.bookmark_count)
      .slice(0, 10);

    const { thesesByCategory, categoryStats } = processCategories(thesesWithMetrics);
    const categoryMetrics = createCategoryMetrics(categoryStats);
    const topCategories = getTopCategories(categoryStats);

    return {
      thesisStats,
      userCount,
      userRoleStats,
      categoryMetrics,
      mostViewedTheses,
      mostBookmarkedTheses,
      thesesByCategory,
      topCategories
    };
  };

  return (
    <AnalyticsContext.Provider value={{ fetchAnalyticsData }}>
      {children}
    </AnalyticsContext.Provider>
  );
};

// Helper functions
const processCategories = (theses: ThesisWithMetrics[]) => {
  const thesesByCategory: Record<string, ThesisWithMetrics[]> = {};
  const categoryStats: Record<string, {
    total: number;
    active: number;
    inactive: number;
    views: number;
    bookmarks: number;
  }> = {};

  theses.forEach(thesis => {
    const category = thesis.category || 'Uncategorized';
    
    if (!thesesByCategory[category]) {
      thesesByCategory[category] = [];
      categoryStats[category] = {
        total: 0,
        active: 0,
        inactive: 0,
        views: 0,
        bookmarks: 0
      };
    }

    thesesByCategory[category].push(thesis);
    categoryStats[category].total++;
    
    if (thesis.isActive) {
      categoryStats[category].active++;
      categoryStats[category].views += thesis.view_count;
      categoryStats[category].bookmarks += thesis.bookmark_count;
    } else {
      categoryStats[category].inactive++;
    }
  });

  // Sort theses within each category
  Object.values(thesesByCategory).forEach(theses => 
    theses.sort((a, b) => b.view_count - a.view_count)
  );

  return { thesesByCategory, categoryStats };
};

const createCategoryMetrics = (categoryStats: Record<string, {
  total: number;
  active: number;
  inactive: number;
  views: number;
  bookmarks: number;
}>) => {
  return Object.entries(categoryStats).map(([category, stats]) => ({
    category,
    ...stats
  }));
};

const getTopCategories = (categoryStats: Record<string, any>) => {
  return Object.keys(categoryStats)
    .sort((a, b) => categoryStats[b].total - categoryStats[a].total)
    .slice(0, 5);
};

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};