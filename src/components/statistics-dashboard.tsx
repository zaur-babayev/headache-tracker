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

import { MEDICATION_NAMES } from '@/lib/constants';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface StatisticsDashboardProps {
  entries: HeadacheEntry[]
  isLoading?: boolean
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

export function StatisticsDashboard({ entries, isLoading = false }: StatisticsDashboardProps) {
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
      color: "#6366F1", // bright blue
    },
  } as ChartConfig;

  const severityDistributionConfig = {
    colors: [
      "#FFFFFF", // Level 1 - White
      "#BFE9FF", // Level 2 - Light blue (blue-200)
      "#60A5FA", // Level 3 - Medium blue (blue-400)
      "#2563EB", // Level 4 - Dark blue (blue-600)
      "#1E40AF", // Level 5 - Very dark blue (blue-800)
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

  // Helper function to get severity color (blue shades)
  const getSeverityColor = (severity: number) => {
    switch (severity) {
      case 1: return 'bg-white';
      case 2: return 'bg-blue-200';
      case 3: return 'bg-blue-400';
      case 4: return 'bg-blue-600';
      case 5: return 'bg-blue-800';
      default: return 'bg-gray-300';
    }
  };

  // Helper function to render severity circles
  const renderSeverityCircles = (severity: number) => {
    const circles = [];
    for (let i = 1; i <= 5; i++) {
      circles.push(
        <div 
          key={i} 
          className={`w-5 h-5 rounded-full ${i <= severity ? getSeverityColor(i) : 'bg-gray-700'}`}
        />
      );
    }
    return (
      <div className="flex space-x-2">
        {circles}
      </div>
    );
  };

  return (
    <div className="relative">
      {/* Skeleton */}
      <div className={cn(
        "absolute inset-0 transition-opacity duration-300",
        isLoading 
          ? "opacity-100"
          : "opacity-0 pointer-events-none"
      )}>
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="flex flex-col items-center justify-center rounded-lg bg-card py-6 text-card-foreground shadow-sm">
                <Skeleton className="h-7 w-16" /> {/* Value */}
                <Skeleton className="h-3 w-24 mt-1" /> {/* Label */}
              </div>
            ))}
          </div>

          {/* Charts Grid */}
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            {/* Monthly Frequency Card */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" /> {/* Title */}
                <Skeleton className="h-4 w-64 mt-1" /> {/* Description */}
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[300px] w-full rounded-lg" /> {/* Chart */}
              </CardContent>
            </Card>

            {/* Severity Distribution Card */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" /> {/* Title */}
                <Skeleton className="h-4 w-64 mt-1" /> {/* Description */}
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[300px] w-full rounded-lg" /> {/* Chart */}
              </CardContent>
            </Card>

            {/* Medication Usage Card */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" /> {/* Title */}
                <Skeleton className="h-4 w-64 mt-1" /> {/* Description */}
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((_, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <Skeleton className="h-4 w-32" /> {/* Medication name */}
                      <Skeleton className="h-4 w-16" /> {/* Count */}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Triggers Card */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" /> {/* Title */}
                <Skeleton className="h-4 w-64 mt-1" /> {/* Description */}
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((_, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <Skeleton className="h-4 w-32" /> {/* Trigger name */}
                      <Skeleton className="h-4 w-16" /> {/* Count */}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Actual content */}
      <div className={cn(
        "absolute inset-0 transition-opacity duration-300",
        isLoading 
          ? "opacity-0"
          : "opacity-100"
      )}>
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col items-center justify-center rounded-lg bg-card py-6 text-card-foreground shadow-sm">
              <p className="text-xl font-regular">{statistics.totalHeadaches}</p>
              <p className="text-xs text-muted-foreground">total headaches</p>
            </div>
            
            <div className="flex flex-col items-center justify-center rounded-lg bg-card py-6 text-card-foreground shadow-sm">
              <p className="text-xl font-regular">L{mostCommonSeverity || 'N/A'}</p>
              <p className="text-xs text-muted-foreground">total average sev.</p>
            </div>
            
            <div className="flex flex-col items-center justify-center rounded-lg bg-card py-6 text-card-foreground shadow-sm">
              <p className="text-xl font-regular truncate max-w-[120px] text-center">
                {statistics.medicationStats.length > 0 
                  ? statistics.medicationStats[0].name 
                  : 'None'}
              </p>
              <p className="text-xs text-muted-foreground">total top meds.</p>
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
                      <Bar dataKey="count" fill="#8CBA80" radius={[4, 4, 0, 0]}>
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
                      <Bar dataKey="averageSeverity" fill="#C492B1" radius={[4, 4, 0, 0]}>
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
      </div>

      {/* Spacer div to maintain height */}
      <div className="invisible" aria-hidden="true">
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="flex flex-col items-center justify-center rounded-lg bg-card py-6 text-card-foreground shadow-sm">
                <div className="h-7 w-16" />
                <div className="h-3 w-24 mt-1" />
              </div>
            ))}
          </div>

          {/* Charts Grid */}
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <div className="h-6 w-48" />
                <div className="h-4 w-64 mt-1" />
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="h-6 w-48" />
                <div className="h-4 w-64 mt-1" />
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full" />
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="h-6 w-48" />
                <div className="h-4 w-64 mt-1" />
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
