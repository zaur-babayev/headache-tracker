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
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
            <div className="flex flex-col items-center justify-center p-4 bg-primary/10 rounded-lg">
              <h3 className="text-xl font-semibold">Total Headaches</h3>
              <p className="text-3xl font-bold mt-2">{statistics.totalHeadaches}</p>
            </div>
            
            <div className="flex flex-col items-center justify-center p-4 bg-primary/10 rounded-lg">
              <h3 className="text-xl font-semibold">Most Common Severity</h3>
              <p className="text-3xl font-bold mt-2">
                {statistics.severityDistribution.indexOf(Math.max(...statistics.severityDistribution)) + 1}
              </p>
            </div>
            
            <div className="flex flex-col items-center justify-center p-4 bg-primary/10 rounded-lg">
              <h3 className="text-xl font-semibold">Top Medication</h3>
              <p className="text-3xl font-bold mt-2">
                {statistics.medicationStats.length > 0 
                  ? statistics.medicationStats[0].name 
                  : 'None'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Headache Frequency</CardTitle>
          <CardDescription>Number of headaches per month</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={statistics.monthlyFrequency}
              margin={{ top: 10, right: 10, left: 0, bottom: 40 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
              <XAxis 
                dataKey="month" 
                angle={-45} 
                textAnchor="end" 
                height={60} 
                tick={{ fill: chartColors.text, fontSize: 12 }}
              />
              <YAxis tick={{ fill: chartColors.text }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill={chartColors.headacheCount} name="Headache Count" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Average Severity by Month</CardTitle>
          <CardDescription>Average headache severity (1-5 scale)</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={statistics.monthlyFrequency}
              margin={{ top: 10, right: 10, left: 0, bottom: 40 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
              <XAxis 
                dataKey="month" 
                angle={-45} 
                textAnchor="end" 
                height={60} 
                tick={{ fill: chartColors.text, fontSize: 12 }}
              />
              <YAxis domain={[0, 5]} tick={{ fill: chartColors.text }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="averageSeverity" fill={chartColors.severity} name="Average Severity" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Severity Distribution</CardTitle>
          <CardDescription>Distribution of headache severity levels</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={severityPieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {severityPieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={SEVERITY_COLORS[index % SEVERITY_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend formatter={(value) => <span style={{ color: chartColors.text }}>{value}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Medication Usage</CardTitle>
          <CardDescription>Most commonly used medications</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={statistics.medicationStats}
              layout="vertical"
              margin={{ top: 10, right: 10, left: 50, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
              <XAxis type="number" tick={{ fill: chartColors.text }} />
              <YAxis 
                dataKey="name" 
                type="category" 
                width={100} 
                tick={{ fill: chartColors.text, fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill={chartColors.medication} name="Usage Count" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
