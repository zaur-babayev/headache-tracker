'use client';

import { Nav } from '@/components/nav';
import { StatisticsDashboard } from '@/components/statistics-dashboard';

export default function StatisticsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Nav />
      
      <main className="flex-1 container py-6">
        <h1 className="text-3xl font-bold mb-6">Headache Statistics</h1>
        <StatisticsDashboard />
      </main>
    </div>
  );
}
