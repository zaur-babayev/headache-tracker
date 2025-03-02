import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useTheme } from 'next-themes';

type StatisticsData = {
  totalHeadaches: number;
  monthlyFrequency: {
    month: string;
    count: number;
    averageSeverity: number;
  }[];
  severityDistribution: number[];
  medicationStats: {
    name: string;
    count: number;
  }[];
};

export function StatisticsDashboard() {
  const [statistics, setStatistics] = useState<StatisticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { theme } = useTheme();
  
  // Determine if we're in dark mode
  const isDarkMode = theme === 'dark';

  // Colors for charts that work in both light and dark modes
  const chartColors = {
    headacheCount: isDarkMode ? '#60a5fa' : '#3b82f6',
    severity: isDarkMode ? '#fb923c' : '#f97316',
    grid: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    text: isDarkMode ? '#e5e7eb' : '#374151',
    medication: isDarkMode ? '#a78bfa' : '#8884d8',
  };

  // Severity colors that work in both modes
  const SEVERITY_COLORS = [
    isDarkMode ? '#4ade80' : '#22c55e', // Level 1
    isDarkMode ? '#60a5fa' : '#3b82f6', // Level 2
    isDarkMode ? '#facc15' : '#eab308', // Level 3
    isDarkMode ? '#fb923c' : '#f97316', // Level 4
    isDarkMode ? '#f87171' : '#ef4444', // Level 5
  ];

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const response = await fetch('/api/statistics');
        
        if (!response.ok) {
          throw new Error('Failed to fetch statistics');
        }
        
        const data = await response.json();
        setStatistics(data);
      } catch (error) {
        console.error('Error fetching statistics:', error);
        setError('Failed to load statistics. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading statistics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>No statistics available.</p>
      </div>
    );
  }

  // Prepare data for severity distribution pie chart
  const severityPieData = statistics.severityDistribution.map((count, index) => ({
    name: `Level ${index + 1}`,
    value: count,
  }));

  // Custom tooltip styles for better visibility in dark mode
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border p-2 rounded shadow-md">
          <p className="text-sm font-medium text-foreground">{`${label || payload[0].name}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`item-${index}`} className="text-sm text-muted-foreground">
              {`${entry.name}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col items-center justify-center rounded-lg bg-card py-3 text-card-foreground shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Total Headaches</p>
          <p className="mt-1 text-xl font-semibold">{statistics.totalHeadaches}</p>
        </div>
        
        <div className="flex flex-col items-center justify-center rounded-lg bg-card py-3 text-card-foreground shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Common Severity</p>
          <p className="mt-1 text-xl font-semibold">
            {statistics.severityDistribution.indexOf(Math.max(...statistics.severityDistribution)) + 1}
          </p>
        </div>
        
        <div className="flex flex-col items-center justify-center rounded-lg bg-card py-3 text-card-foreground shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Top Medication</p>
          <p className="mt-1 text-xl font-semibold truncate max-w-[120px]">
            {statistics.medicationStats.length > 0 
              ? statistics.medicationStats[0].name 
              : 'None'}
          </p>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <div className="rounded-lg bg-card py-4 text-card-foreground shadow-sm">
          <h3 className="text-base font-medium mb-3">Monthly Headache Frequency</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={statistics.monthlyFrequency}
                margin={{ top: 20, right: 15, left: -15, bottom: 50 }}
                barSize={30}
                maxBarSize={40}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} vertical={false} />
                <XAxis 
                  dataKey="month" 
                  angle={-45} 
                  textAnchor="end" 
                  height={60} 
                  tick={{ fill: chartColors.text, fontSize: 12 }}
                  interval={0}
                  tickMargin={5}
                  axisLine={{ stroke: chartColors.grid }}
                />
                <YAxis 
                  tick={{ fill: chartColors.text }} 
                  allowDecimals={false}
                  domain={[0, 'auto']}
                  width={20}
                  axisLine={false}
                  tickLine={false}
                  dx={-5}
                />
                <Tooltip 
                  content={<CustomTooltip />}
                  cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
                />
                <Bar 
                  dataKey="count" 
                  fill={chartColors.headacheCount} 
                  name="Headache Count"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg bg-card py-4 text-card-foreground shadow-sm">
          <h3 className="text-base font-medium mb-3">Average Severity by Month</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={statistics.monthlyFrequency}
                margin={{ top: 20, right: 15, left: -15, bottom: 50 }}
                barSize={30}
                maxBarSize={40}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} vertical={false} />
                <XAxis 
                  dataKey="month" 
                  angle={-45} 
                  textAnchor="end" 
                  height={60} 
                  tick={{ fill: chartColors.text, fontSize: 12 }}
                  interval={0}
                  tickMargin={5}
                  axisLine={{ stroke: chartColors.grid }}
                />
                <YAxis 
                  domain={[0, 5]} 
                  tick={{ fill: chartColors.text }}
                  ticks={[0, 1, 2, 3, 4, 5]}
                  width={20}
                  axisLine={false}
                  tickLine={false}
                  dx={-5}
                />
                <Tooltip 
                  content={<CustomTooltip />}
                  cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
                />
                <Bar 
                  dataKey="averageSeverity" 
                  fill={chartColors.severity} 
                  name="Average Severity"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg bg-card py-4 text-card-foreground shadow-sm lg:col-span-2">
          <h3 className="text-base font-medium mb-3">Severity Distribution</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <Pie
                  data={severityPieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  label={({ name, value, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={{ stroke: chartColors.text, strokeWidth: 1 }}
                >
                  {severityPieData.map((_, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={SEVERITY_COLORS[index]} 
                      strokeWidth={1}
                    />
                  ))}
                </Pie>
                <Tooltip 
                  content={<CustomTooltip />}
                  formatter={(value) => [`${value} occurrences`, 'Count']}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value) => (
                    <span style={{ color: isDarkMode ? '#e5e7eb' : '#374151' }}>
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
