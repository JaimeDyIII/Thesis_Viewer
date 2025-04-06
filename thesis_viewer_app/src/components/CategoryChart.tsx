import * as React from 'react';
import { useState, useEffect } from 'react';
import { PieChart } from '@mui/x-charts/PieChart';
import { Box, Paper, Typography, CircularProgress } from '@mui/material';
import { supabase } from "../lib/supabase";

type PieChartData = {
  id: number;
  value: number;
  label: string;
};

type CategoryChartProps = {
  onCategorySelect: (category: string | null) => void;
  selectedCategory: string | null;
};

const CategoryChart = ({ onCategorySelect, selectedCategory }: CategoryChartProps) => {
  const [chartData, setChartData] = useState<PieChartData[]>([]);
  const [loading, setLoading] = useState(true);

  // Color palette for the pie chart
  const colors = ['#4C9AFF', '#FF5630', '#36B37E', '#FFAB00', '#6554C0', '#00B8D9', '#FF7452', '#57D9A3'];

  const valueFormatter = (item: any) => `Theses: ${item.value}`;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Get only active theses and their categories
        const { data: thesesData, error: thesesError } = await supabase
          .from("Thesis")
          .select("category")
          .eq("isActive", true)
          .not("category", "is", null);
          
        if (thesesError) throw thesesError;
        
        const categoryCounts: Record<string, number> = {};
        
        thesesData.forEach((thesis: {category: string}) => {
          if (thesis.category) {
            categoryCounts[thesis.category] = (categoryCounts[thesis.category] || 0) + 1;
          }
        });
        
        const pieData: PieChartData[] = Object.entries(categoryCounts).map(([category, count], index) => ({
          id: index,
          label: category,
          value: count
        }));
        
        setChartData(pieData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const getChartData = () => {
    return chartData.map((item, index) => ({
      ...item,
      color: selectedCategory 
        ? selectedCategory === item.label 
          ? colors[index % colors.length]
          : '#888888'
        : colors[index % colors.length]
    }));
  };

  const handlePieClick = (event: React.MouseEvent, pieItemIdentifier: any) => {
    const clickedIndex = pieItemIdentifier.dataIndex;
    if (clickedIndex >= 0 && clickedIndex < chartData.length) {
      const clickedCategory = chartData[clickedIndex].label;
      onCategorySelect(clickedCategory === selectedCategory ? null : clickedCategory);
    }
  };

  if (loading) {
    return <Box display="flex" justifyContent="center" alignItems="center" height={300}>
      <CircularProgress />
    </Box>;
  }

  if (chartData.length === 0) {
    return <Paper elevation={3} sx={{ p: 3, borderRadius: 2, bgcolor: 'white', color: '#6a1b9a', textAlign: 'center' }}>
      <Typography variant="h6">No active theses with categories found</Typography>
    </Paper>;
  }

  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 2, bgcolor: 'white', color: '#6a1b9a', minHeight: '500' }}>
      <Typography variant="h5" component="h2" sx={{ color: '#6a1b9a', mb: 2 }}>
        Thesis Distribution by Category
      </Typography>
      
      <Box sx={{ 
        height: 400,
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'visible'
      }}>
        <PieChart
          series={[{
            data: getChartData(),
            highlightScope: { fade: 'global', highlight: 'item' },
            faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
            valueFormatter,
            arcLabelMinAngle: 10,
            outerRadius: 200,
            paddingAngle: 1
          }]}
          height={400}
          width={550}
          margin={{ 
            top: 40,
            bottom: 120,
            left: 40, 
            right: 40 
          }}
          onItemClick={handlePieClick}
          slotProps={{
            legend: {
              direction: 'row',
              position: { vertical: 'bottom', horizontal: 'middle' },
              padding: { top: 20 },
              labelStyle: { 
                fill: '#36454F'
              },
              itemMarkWidth: 10,
              itemMarkHeight: 10
            },
          }}
        />
      </Box>
    </Paper>
  );
};

export default CategoryChart;