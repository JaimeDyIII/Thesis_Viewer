import * as React from 'react';
import { useState, useEffect } from 'react';
import { PieChart } from '@mui/x-charts/PieChart';
import { Box, Paper, Typography, CircularProgress } from '@mui/material';
import { supabase } from '../../lib/supabase';

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

  // Match the bar-chart accents: purple, teal, then gray tones
  const colors = [
    '#8E44AD', // slice 1
    '#1ABC9C', // slice 2
    '#888888', // slice 3
    '#555555', // slice 4
    '#8E44AD', // cycle if more slices
    '#1ABC9C',
    '#888888',
    '#555555',
  ];

  const valueFormatter = (item: any) => `Theses: ${item.value}`;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: thesesData, error } = await supabase
          .from('Thesis')
          .select('category')
          .eq('isActive', true)
          .not('category', 'is', null);
        if (error) throw error;

        const counts: Record<string, number> = {};
        thesesData.forEach((t: any) => {
          counts[t.category] = (counts[t.category] || 0) + 1;
        });

        const pieData: PieChartData[] = Object.entries(counts).map(
          ([label, value], i) => ({ id: i, label, value })
        );
        setChartData(pieData);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getChartData = () =>
    chartData.map((item, i) => ({
      ...item,
      color: selectedCategory
        ? item.label === selectedCategory
          ? colors[i % colors.length]
          : '#DDDDDD'
        : colors[i % colors.length],
    }));

  const handlePieClick = (_: any, pieItem: any) => {
    const idx = pieItem.dataIndex;
    if (idx >= 0 && idx < chartData.length) {
      const clicked = chartData[idx].label;
      onCategorySelect(clicked === selectedCategory ? null : clicked);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={300}>
        <CircularProgress />
      </Box>
    );
  }
  if (!chartData.length) {
    return (
      <Paper sx={{ p: 3, borderRadius: 2, textAlign: 'center' }}>
        <Typography>No active theses with categories found</Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3, borderRadius: 2, minHeight: 500 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Thesis Distribution by Category
      </Typography>
      <Box
        sx={{
          height: 400,
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <PieChart
          series={[
            {
              data: getChartData(),
              highlightScope: { fade: 'global', highlight: 'item' },
              faded: { innerRadius: 30, additionalRadius: -30, color: '#F0F0F0' },
              arcLabel: (i) => `${i.label}: ${i.value}`,
              arcLabelMinAngle: 15,
              valueFormatter,
              innerRadius: 0,   // full pie
              outerRadius: 140,
              paddingAngle: 2,
            },
          ]}
          height={400}
          width={500}
          margin={{ top: 20, bottom: 80, left: 20, right: 20 }}
          onItemClick={handlePieClick}
          slotProps={{
            legend: {
              direction: 'row',
              position: { vertical: 'bottom', horizontal: 'middle' },
              labelStyle: { fill: '#333', fontWeight: 500 },
              itemMarkWidth: 12,
              itemMarkHeight: 12,
              markGap: 6,
            },
          }}
        />
      </Box>
    </Paper>
  );
};

export default CategoryChart;
