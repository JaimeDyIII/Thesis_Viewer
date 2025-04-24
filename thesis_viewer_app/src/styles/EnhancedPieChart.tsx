import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Typography, Box } from '@mui/material';

const COLORS = ['#4682A9', '#749BC2', '#91C8E4', '#F6F4EB'];

const sampleData = [
  { name: 'Science', value: 400 },
  { name: 'Technology', value: 300 },
  { name: 'Engineering', value: 300 },
  { name: 'Mathematics', value: 200 },
];

type EnhancedPieChartProps = {
  onCategorySelect: (category: string | null) => void;
  selectedCategory: string | null;
};

const EnhancedPieChart: React.FC<EnhancedPieChartProps> = ({ onCategorySelect, selectedCategory }) => {
  const handleClick = (data: any) => {
    onCategorySelect(data?.name || null);
  };

  return (
    <Box>
      <Typography variant="h6" className="text-heading" mb={2}>
        Thesis Categories
      </Typography>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={sampleData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
            onClick={handleClick}
          >
            {sampleData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
                cursor="pointer"
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default EnhancedPieChart;
