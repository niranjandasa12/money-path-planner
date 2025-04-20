
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  AreaChart, 
  Area, 
  BarChart as RechartsBarChart, 
  Bar, 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend 
} from 'recharts';

interface ChartCardProps {
  title: string;
  type: 'area' | 'bar' | 'pie';
  data: any[];
  dataKey?: string;
  nameKey?: string;
  colors?: string[];
  height?: number;
}

const defaultColors = [
  '#0F4C81', // Deep blue
  '#36b9cc', // Teal
  '#1cc88a', // Green
  '#f6c23e', // Yellow
  '#e74a3b', // Red
  '#4e73df', // Blue
  '#5a5c69', // Dark gray
];

const ChartCard: React.FC<ChartCardProps> = ({ 
  title, 
  type, 
  data, 
  dataKey = 'value', 
  nameKey = 'name',
  colors = defaultColors,
  height = 300
}) => {
  const renderChart = () => {
    switch (type) {
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors[0]} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={colors[0]} stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <XAxis dataKey={nameKey} />
              <YAxis />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey={dataKey} 
                stroke={colors[0]} 
                fillOpacity={1} 
                fill="url(#colorValue)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        );
        
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <RechartsBarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <XAxis dataKey={nameKey} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey={dataKey} fill={colors[0]} />
            </RechartsBarChart>
          </ResponsiveContainer>
        );
        
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <RechartsPieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey={dataKey}
                nameKey={nameKey}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </RechartsPieChart>
          </ResponsiveContainer>
        );
        
      default:
        return <div>Invalid chart type</div>;
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="py-4">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {renderChart()}
      </CardContent>
    </Card>
  );
};

export default ChartCard;
