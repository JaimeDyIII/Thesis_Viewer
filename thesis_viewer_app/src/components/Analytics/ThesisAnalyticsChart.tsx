import * as React from 'react';
import { useState, useEffect } from 'react';
import { BarChart } from '@mui/x-charts/BarChart';
import { axisClasses } from '@mui/x-charts/ChartsAxis';
import { Box, ToggleButtonGroup, ToggleButton, Paper, Typography, CircularProgress } from '@mui/material';
import { supabase } from "../../lib/supabase";

type ThesisData = {
  id: number;
  title: string;
  view_count: number;
  bookmark_count: number;
  category: string;
};

type SortBy = 'views' | 'bookmarks';

type ThesisAnalyticsChartProps = {
  selectedCategory: string | null;
};

const chartSetting = {
  yAxis: [{ label: 'Count' }],
  height: 400,
  sx: {
    [`.${axisClasses.left} .${axisClasses.label}`]: {
      transform: 'translate(-20px, 0)',
    },
    '.MuiChartsAxis-tick': {
      stroke: 'rgba(0,0,0,0.7)',
    },
    '.MuiChartsAxis-tickLabel': {
      fill: 'rgba(0,0,0,0.9)',
    },
    '.MuiChartsAxis-line': {
      stroke: 'rgba(0,0,0,0.3)',
    },
  },
  margin: { left: 50, right: 30, top: 70, bottom: 70 },
};

const valueFormatter = (value: number | null) => value !== null ? `${value}` : '0';

const ThesisAnalyticsChart = ({ selectedCategory }: ThesisAnalyticsChartProps) => {
  const [chartData, setChartData] = useState<ThesisData[]>([]);
  const [sortedData, setSortedData] = useState<ThesisData[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortBy>('views');
  
  const handleSortChange = (
    event: React.MouseEvent<HTMLElement>,
    newSort: SortBy | null,
  ) => {
    if (newSort !== null) {
      setSortBy(newSort);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: thesesData, error: thesesError } = await supabase
          .from("Thesis")
          .select("id, title, category")
          .eq("isActive", true);
          
        if (thesesError) throw thesesError;
        
        const { data: viewsData, error: viewsError } = await supabase
          .from("views")
          .select("thesis_id");
          
        if (viewsError) throw viewsError;
        
        const { data: bookmarksData, error: bookmarksError } = await supabase
          .from("bookmarks")
          .select("thesis_id");
          
        if (bookmarksError) throw bookmarksError;
        
        const viewCounts = viewsData.reduce((acc: Record<number, number>, view: any) => {
          acc[view.thesis_id] = (acc[view.thesis_id] || 0) + 1;
          return acc;
        }, {});
        
        const bookmarkCounts = bookmarksData.reduce((acc: Record<number, number>, bookmark: any) => {
          acc[bookmark.thesis_id] = (acc[bookmark.thesis_id] || 0) + 1;
          return acc;
        }, {});
        
        const combinedData: ThesisData[] = thesesData.map((thesis: any) => ({
          id: thesis.id,
          title: thesis.title || 'Untitled',
          view_count: viewCounts[thesis.id] || 0,
          bookmark_count: bookmarkCounts[thesis.id] || 0,
          category: thesis.category || 'Uncategorized'
        }));
        
        setChartData(combinedData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  useEffect(() => {
    if (chartData.length === 0) return;

    const sorted = [...chartData].sort((a, b) => {
      if (selectedCategory) {
        const aInCategory = a.category === selectedCategory;
        const bInCategory = b.category === selectedCategory;
        
        if (aInCategory && !bInCategory) return -1;
        if (!aInCategory && bInCategory) return 1;
      }
      
      return sortBy === 'views' 
        ? b.view_count - a.view_count 
        : b.bookmark_count - a.bookmark_count;
    });
    
    setSortedData(sorted);
  }, [chartData, selectedCategory, sortBy]);

  if (loading) {
    return <Box display="flex" justifyContent="center" alignItems="center" height={500}>
      <CircularProgress />
    </Box>;
  }
  
  const chartDataset = sortedData.map(item => {
    const isSelected = !selectedCategory || item.category === selectedCategory;
    
    return {
      thesis: item.title,
      selectedViews: isSelected ? item.view_count : null,
      selectedBookmarks: isSelected ? item.bookmark_count : null,
      nonSelectedViews: !isSelected ? item.view_count : null,
      nonSelectedBookmarks: !isSelected ? item.bookmark_count : null,
    };
  });
  
  return (
    <Paper elevation={3} sx={{ 
      p: 3, 
      borderRadius: 2, 
      bgcolor: 'white', 
      color: 'purple',
      height: 450,
      width: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" component="h2">
          {selectedCategory ? `${selectedCategory} Thesis Analytics` : 'Thesis Analytics'}
        </Typography>
        
        <ToggleButtonGroup
          value={sortBy}
          exclusive
          onChange={handleSortChange}
          aria-label="sort by metric"
          size="small"
        >
          <ToggleButton value="views">Views</ToggleButton>
          <ToggleButton value="bookmarks">Bookmarks</ToggleButton>
        </ToggleButtonGroup>
      </Box>
      
      <Box sx={{ flex: 1, width: '100%', overflow: 'visible' }}>
        {sortedData.length > 0 ? (
          <BarChart
            dataset={chartDataset}
            xAxis={[{ 
              scaleType: 'band', 
              dataKey: 'thesis',
              tickLabelStyle: {
                angle: 45,
                textAnchor: 'start',
                fontSize: 12,
              }
            }]}
            series={[
              { 
                dataKey: 'selectedViews',
                label: 'Views',
                valueFormatter,
                color: '#4C9AFF',
                stack: 'views',
              },
              {
                dataKey: 'selectedBookmarks',
                label: 'Bookmarks',
                valueFormatter,
                color: '#FAAD14',
                stack: 'bookmarks',
              },
              { 
                dataKey: 'nonSelectedViews',
                label: 'External Views',
                valueFormatter,
                color: '#888888',
                stack: 'views',
              },
              {
                dataKey: 'nonSelectedBookmarks',
                label: 'External Bookmarks',
                valueFormatter,
                color: '#555555',
                stack: 'bookmarks',
              }
            ]}
            {...chartSetting}
            sx={{
              height: '100%',
              width: '100%',
              '& .MuiChartsAxis-root': {
                overflow: 'visible',
              },
            }}
          />
        ) : (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            <Typography variant="h6">No thesis data available</Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default ThesisAnalyticsChart;