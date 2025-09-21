import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts';
import { PerformanceMetric } from '../../store/slices/transparencySlice';

interface PerformanceMetricsChartProps {
  data: PerformanceMetric[];
  title: string;
  height?: number;
}

const PerformanceMetricsChart: React.FC<PerformanceMetricsChartProps> = ({
  data,
  title,
  height = 300,
}) => {
  // Transform data for chart
  const chartData = data.map(metric => ({
    name: metric.name.length > 20 ? metric.name.substring(0, 20) + '...' : metric.name,
    current: metric.current_value,
    target: metric.target_value,
    unit: metric.unit,
    is_meeting_target: metric.is_meeting_target,
    full_name: metric.name,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium">{data.full_name}</p>
          <p style={{ color: payload[0].color }}>
            Current: {data.current} {data.unit}
          </p>
          {data.target && (
            <p className="text-yellow-400">
              Target: {data.target} {data.unit}
            </p>
          )}
          <p className={`${data.is_meeting_target ? 'text-green-400' : 'text-red-400'}`}>
            Status: {data.is_meeting_target ? 'Meeting Target' : 'Below Target'}
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomBar = (props: any) => {
    const { payload } = props;
    const color = payload.is_meeting_target ? '#10B981' : '#EF4444';
    return <Bar {...props} fill={color} />;
  };

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="name" 
            stroke="#9CA3AF"
            tick={{ fill: '#9CA3AF' }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis 
            stroke="#9CA3AF"
            tick={{ fill: '#9CA3AF' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="current" 
            radius={[4, 4, 0, 0]}
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.is_meeting_target ? '#10B981' : '#EF4444'} 
              />
            ))}
          </Bar>
          {/* Add reference lines for targets */}
          {chartData.map((entry, index) => 
            entry.target ? (
              <ReferenceLine 
                key={`ref-${index}`}
                y={entry.target} 
                stroke="#F59E0B" 
                strokeDasharray="5 5" 
              />
            ) : null
          )}
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-4 flex items-center justify-center space-x-6 text-sm">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
          <span className="text-gray-400">Meeting Target</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
          <span className="text-gray-400">Below Target</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 border-2 border-yellow-500 border-dashed rounded mr-2"></div>
          <span className="text-gray-400">Target Line</span>
        </div>
      </div>
    </div>
  );
};

export default PerformanceMetricsChart;
