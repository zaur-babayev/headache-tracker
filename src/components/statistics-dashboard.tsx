import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

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

  const SEVERITY_COLORS = ['#4ade80', '#60a5fa', '#facc15', '#fb923c', '#f87171'];

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Monthly Headache Frequency</CardTitle>
          <CardDescription>Number of headaches per month</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={statistics.monthlyFrequency}
              margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" angle={-45} textAnchor="end" height={50} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" name="Headache Count" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Average Severity by Month</CardTitle>
          <CardDescription>Average headache severity (1-5 scale)</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={statistics.monthlyFrequency}
              margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" angle={-45} textAnchor="end" height={50} />
              <YAxis domain={[0, 5]} />
              <Tooltip />
              <Bar dataKey="averageSeverity" fill="#f97316" name="Average Severity" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Severity Distribution</CardTitle>
          <CardDescription>Distribution of headache severity levels</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={severityPieData}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {severityPieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={SEVERITY_COLORS[index % SEVERITY_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Medication Usage</CardTitle>
          <CardDescription>Most commonly used medications</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={statistics.medicationStats}
              layout="vertical"
              margin={{ top: 10, right: 30, left: 50, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" name="Usage Count" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex flex-col items-center justify-center p-4 bg-blue-50 rounded-lg">
              <h3 className="text-xl font-semibold">Total Headaches</h3>
              <p className="text-3xl font-bold mt-2">{statistics.totalHeadaches}</p>
            </div>
            
            <div className="flex flex-col items-center justify-center p-4 bg-green-50 rounded-lg">
              <h3 className="text-xl font-semibold">Most Common Severity</h3>
              <p className="text-3xl font-bold mt-2">
                {statistics.severityDistribution.indexOf(Math.max(...statistics.severityDistribution)) + 1}
              </p>
            </div>
            
            <div className="flex flex-col items-center justify-center p-4 bg-purple-50 rounded-lg">
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
    </div>
  );
}
