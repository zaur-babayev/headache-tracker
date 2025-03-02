'use client';

import { useMemo } from 'react';
import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, LabelList, Pie, PieChart, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface StatisticsDashboardProps {
  entries: HeadacheEntry[]
}

type HeadacheEntry = {
  id: string;
  date: string;
  severity: number;
  notes?: string;
  triggers: string[];
  medications: string[];
  createdAt: string;
  updatedAt: string;
};

interface Statistics {
  totalHeadaches: number
  severityDistribution: number[]
  monthlyFrequency: { month: string; count: number; averageSeverity: number }[]
  medicationStats: { name: string; count: number }[]
}

const MEDICATION_NAMES: Record<string, string> = {
  'ibuprofen': 'Ibuprofen',
  'paracetamol': 'Paracetamol',
};

const calculateStatistics = (entries: HeadacheEntry[]): Statistics => {
  const totalHeadaches = entries.length
  const severityDistribution = [0, 0, 0, 0, 0]
  const monthlyFrequency: { month: string; count: number; averageSeverity: number }[] = []
  const medicationCounts = new Map<string, number>()

  entries.forEach((entry) => {
    // Severity distribution
    if (entry.severity && entry.severity >= 1 && entry.severity <= 5) {
      severityDistribution[entry.severity - 1]++
    }

    // Monthly frequency
    if (entry.date) {
      const month = new Date(entry.date).toLocaleString('default', { month: 'long' })
      const existingMonth = monthlyFrequency.find((freq) => freq.month === month)
      if (existingMonth) {
        existingMonth.count++
        existingMonth.averageSeverity = (existingMonth.averageSeverity * (existingMonth.count - 1) + (entry.severity || 0)) / existingMonth.count
      } else {
        monthlyFrequency.push({ month, count: 1, averageSeverity: entry.severity || 0 })
      }
    }

    // Medication stats
    if (entry.medications && Array.isArray(entry.medications)) {
      entry.medications.forEach((medId) => {
        if (medId) {
          const medName = MEDICATION_NAMES[medId] || medId;
          medicationCounts.set(medName, (medicationCounts.get(medName) || 0) + 1);
        }
      });
    }
  })

  // Sort monthly frequency by date
  monthlyFrequency.sort((a, b) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    return months.indexOf(a.month) - months.indexOf(b.month)
  })

  // Sort medications by count and convert to array
  const medicationStats = Array.from(medicationCounts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)

  return { totalHeadaches, severityDistribution, monthlyFrequency, medicationStats }
}

export function StatisticsDashboard({ entries }: StatisticsDashboardProps) {
  const statistics = useMemo(() => calculateStatistics(entries || []), [entries])

  const headacheChartConfig = {
    count: {
      label: "Headache Count",
      color: "#60A5FA", // bright blue
    },
  } as ChartConfig;

  const severityChartConfig = {
    averageSeverity: {
      label: "Average Severity",
      color: "#F87171", // bright red
    },
  } as ChartConfig;

  const severityDistributionConfig = {
    colors: [
      "#FFE4E4", // Level 1 - Very light red
      "#FFB5B5", // Level 2 - Light red
      "#FF8585", // Level 3 - Medium red
      "#FF5252", // Level 4 - Dark red
      "#FF0000", // Level 5 - Very dark red
    ],
  } as ChartConfig;

  const pieChartData = statistics.severityDistribution.map((count, index) => ({
    name: `Level ${index + 1}`,
    count,
  }));

  const totalSeverity = pieChartData.reduce((acc, curr) => acc + curr.count, 0);
  const mostCommonSeverityIndex = statistics.severityDistribution.findIndex(
    (count) => count === Math.max(...statistics.severityDistribution)
  );
  const mostCommonSeverity = mostCommonSeverityIndex !== -1 ? mostCommonSeverityIndex + 1 : 0;
  const percentChange = 0; // Calculate this if you have historical data

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
            {mostCommonSeverity || 'N/A'}
          </p>
        </div>
        
        <div className="flex flex-col items-center justify-center rounded-lg bg-card py-3 text-card-foreground shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Top Medication</p>
          <p className="mt-1 text-xl font-semibold truncate max-w-[120px] text-center">
            {statistics.medicationStats.length > 0 
              ? statistics.medicationStats[0].name 
              : 'None'}
          </p>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Headache Frequency</CardTitle>
            <CardDescription>Showing headache count by month</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={headacheChartConfig}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={statistics.monthlyFrequency}
                  margin={{
                    top: 20,
                    right: 10,
                    left: 10,
                    bottom: 20,
                  }}
                >
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => value.slice(0, 3)}
                    stroke="rgba(255,255,255,0.5)"
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    fontSize={12}
                    className="fill-muted-foreground"
                    tick={false}
                    width={0}
                    domain={[0, 4]}
                    tickCount={8}
                  />
                  <ChartTooltip
                    cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Bar dataKey="count" fill="#60A5FA" radius={[4, 4, 0, 0]}>
                    <LabelList
                      dataKey="count"
                      position="top"
                      offset={10}
                      fill="#FFFFFF"
                      fontSize={12}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col items-start gap-2 text-sm">
            <div className="flex gap-2 font-medium leading-none">
              {statistics.monthlyFrequency.length > 0 ? 
                `${statistics.monthlyFrequency[statistics.monthlyFrequency.length - 1].month} had ${statistics.monthlyFrequency[statistics.monthlyFrequency.length - 1].count} headaches` : 
                "No monthly data available"}
            </div>
            <div className="leading-none text-muted-foreground">
              Showing headache frequency over time
            </div>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Severity by Month</CardTitle>
            <CardDescription>Monthly severity trends</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={severityChartConfig}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={statistics.monthlyFrequency}
                  margin={{
                    top: 20,
                    right: 10,
                    left: 10,
                    bottom: 20,
                  }}
                >
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => value.slice(0, 3)}
                    stroke="rgba(255,255,255,0.5)"
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    fontSize={12}
                    className="fill-muted-foreground"
                    tick={false}
                    width={0}
                    domain={[0, 5]}
                    tickCount={8}
                  />
                  <ChartTooltip
                    cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Bar dataKey="averageSeverity" fill="#F87171" radius={[4, 4, 0, 0]}>
                    <LabelList
                      dataKey="averageSeverity"
                      position="top"
                      offset={10}
                      fill="#FFFFFF"
                      fontSize={12}
                      formatter={(value: number) => value.toFixed(1)}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col items-start gap-2 text-sm">
            <div className="flex gap-2 font-medium leading-none">
              {statistics.monthlyFrequency.length > 0 ? 
                `Average severity: ${(statistics.monthlyFrequency.reduce((acc, curr) => acc + curr.averageSeverity, 0) / statistics.monthlyFrequency.length).toFixed(1)}` : 
                "No severity data available"}
            </div>
            <div className="leading-none text-muted-foreground">
              Showing average severity levels by month
            </div>
          </CardFooter>
        </Card>

        <Card className="lg:col-span-2 flex flex-col">
          <CardHeader>
            <CardTitle>Severity Distribution</CardTitle>
            <CardDescription>Distribution of headache severity levels</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={severityDistributionConfig}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart 
                  data={pieChartData}
                  margin={{ top: 16, right: 16, bottom: 0, left: 0 }}
                >
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    horizontal={true}
                    vertical={false}
                    className="stroke-muted"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    fontSize={12}
                    className="fill-muted-foreground"
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    fontSize={12}
                    className="fill-muted-foreground"
                    tick={false}
                    width={0}
                    domain={[0, 4]}
                    tickCount={8}
                  />
                  <Bar
                    dataKey="count"
                    radius={[4, 4, 0, 0]}
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={severityDistributionConfig.colors[index % severityDistributionConfig.colors.length]}
                      />
                    ))}
                    <LabelList
                      dataKey="count"
                      position="top"
                      className="fill-foreground text-xs"
                      formatter={(value: number) => value}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col items-start gap-1 text-sm">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Most common: Level {mostCommonSeverity || 'N/A'}
            </div>
            <div className="text-muted-foreground">
              Showing severity distribution across {totalSeverity} headache entries
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
