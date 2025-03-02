'use client';

import { useMemo } from 'react';
import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, LabelList, Pie, PieChart, XAxis, YAxis, ResponsiveContainer } from "recharts";

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
  triggers?: string;
  medications: { id: string; name: string; dosage?: string }[];
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
    severityDistribution[entry.severity - 1]++

    // Monthly frequency
    const month = new Date(entry.date).toLocaleString('default', { month: 'long' })
    const existingMonth = monthlyFrequency.find((freq) => freq.month === month)
    if (existingMonth) {
      existingMonth.count++
      existingMonth.averageSeverity = (existingMonth.averageSeverity * (existingMonth.count - 1) + entry.severity) / existingMonth.count
    } else {
      monthlyFrequency.push({ month, count: 1, averageSeverity: entry.severity })
    }

    // Medication stats
    entry.medications.forEach((med) => {
      if (med.name) {
        medicationCounts.set(med.name, (medicationCounts.get(med.name) || 0) + 1)
      }
    })
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
  const statistics = useMemo(() => calculateStatistics(entries), [entries])

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

  const pieChartConfig = {
    count: {
      label: "Count",
    },
    level1: {
      label: "Level 1",
      color: "#60A5FA", // blue
    },
    level2: {
      label: "Level 2",
      color: "#34D399", // green
    },
    level3: {
      label: "Level 3",
      color: "#FBBF24", // yellow
    },
    level4: {
      label: "Level 4",
      color: "#F87171", // red
    },
    level5: {
      label: "Level 5",
      color: "#EF4444", // darker red
    },
  } as ChartConfig;

  const pieChartData = statistics.severityDistribution.map((count, index) => ({
    name: `Level ${index + 1}`,
    count,
    fill: pieChartConfig[`level${index + 1}`].color,
  }));

  const totalSeverity = pieChartData.reduce((acc, curr) => acc + curr.count, 0);
  const mostCommonSeverity = statistics.severityDistribution.indexOf(Math.max(...statistics.severityDistribution)) + 1;
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
            {statistics.severityDistribution.indexOf(Math.max(...statistics.severityDistribution)) + 1}
          </p>
        </div>
        
        <div className="flex flex-col items-center justify-center rounded-lg bg-card py-3 text-card-foreground shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Top Medication</p>
          <p className="mt-1 text-xl font-semibold truncate max-w-[120px] text-center">
            {statistics.medicationStats.length > 0 && statistics.medicationStats[0].name !== "" 
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
                  <YAxis hide />
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
                  <YAxis hide domain={[0, 5]} />
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
          <CardHeader className="items-center pb-0">
            <CardTitle>Severity Distribution</CardTitle>
            <CardDescription>Distribution of headache severity levels</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer
              config={pieChartConfig}
              className="mx-auto aspect-square max-h-[300px] px-0"
            >
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <ChartTooltip
                    content={<ChartTooltipContent nameKey="count" hideLabel />}
                  />
                  <Pie
                    data={pieChartData}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    innerRadius={60}
                    labelLine={true}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col gap-2 text-sm">
            <div className="flex items-center gap-2 font-medium leading-none">
              Most common: Level {mostCommonSeverity} <TrendingUp className="h-4 w-4" />
            </div>
            <div className="leading-none text-muted-foreground">
              Showing severity distribution across {totalSeverity} headache entries
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
