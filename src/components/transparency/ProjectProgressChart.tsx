import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

interface ProjectProgressChartProps {
  data: Array<{
    status: string;
    count: number;
    total_budget?: number;
  }>;
  type: 'bar' | 'pie';
  title: string;
  height?: number;
}

const ProjectProgressChart: React.FC<ProjectProgressChartProps> = ({
  data,
  type,
  title,
  height = 300,
}) => {
  const statusColors: Record<string, string> = {
    planned: '#9CA3AF',
    approved: '#F59E0B',
    in_progress: '#3B82F6',
    completed: '#10B981',
    on_hold: '#EF4444',
    cancelled: '#6B7280',
  };

  const formatBudget = (value: number) => `$${(value / 1000000).toFixed(1)}M`;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium capitalize">{label}</p>
          <p style={{ color: payload[0].color }}>
            Projects: {data.count}
          </p>
          {data.total_budget && (
            <p style={{ color: payload[0].color }}>
              Total Budget: {formatBudget(data.total_budget)}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  if (type === 'pie') {
    return (
      <div className="w-full">
        <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ status, count }) => `${status}: ${count}`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="count"
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={statusColors[entry.status] || `hsl(${index * 45}, 70%, 60%)`} 
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="status" 
            stroke="#9CA3AF"
            tick={{ fill: '#9CA3AF' }}
            tickFormatter={(value) => value.replace('_', ' ')}
          />
          <YAxis 
            stroke="#9CA3AF"
            tick={{ fill: '#9CA3AF' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="count" 
            fill="#3B82F6" 
            radius={[4, 4, 0, 0]}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={statusColors[entry.status] || '#3B82F6'} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProjectProgressChart;
