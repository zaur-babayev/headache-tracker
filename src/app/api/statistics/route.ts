import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';
import { startOfMonth, endOfMonth, format, subMonths } from 'date-fns';

export async function GET() {
  try {
    // Get all headache entries
    const headacheEntries = await prisma.headacheEntry.findMany({
      include: {
        medications: true,
      },
      orderBy: {
        date: 'asc',
      },
    });

    // Calculate frequency by month
    const now = new Date();
    const monthlyData = [];
    
    // Get data for the last 6 months
    for (let i = 0; i < 6; i++) {
      const targetMonth = subMonths(now, i);
      const start = startOfMonth(targetMonth);
      const end = endOfMonth(targetMonth);
      
      const entriesInMonth = headacheEntries.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= start && entryDate <= end;
      });
      
      const monthLabel = format(targetMonth, 'MMM yyyy');
      
      monthlyData.unshift({
        month: monthLabel,
        count: entriesInMonth.length,
        averageSeverity: entriesInMonth.length > 0 
          ? Math.round((entriesInMonth.reduce((sum, entry) => sum + entry.severity, 0) / entriesInMonth.length) * 10) / 10
          : 0
      });
    }

    // Calculate severity distribution
    const severityDistribution = [0, 0, 0, 0, 0]; // For severity levels 1-5
    headacheEntries.forEach(entry => {
      if (entry.severity >= 1 && entry.severity <= 5) {
        severityDistribution[entry.severity - 1]++;
      }
    });

    // Calculate most common medications
    const medicationCounts: Record<string, number> = {};
    headacheEntries.forEach(entry => {
      entry.medications.forEach(med => {
        medicationCounts[med.name] = (medicationCounts[med.name] || 0) + 1;
      });
    });

    const medicationStats = Object.entries(medicationCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5 medications

    return NextResponse.json({
      totalHeadaches: headacheEntries.length,
      monthlyFrequency: monthlyData,
      severityDistribution,
      medicationStats,
    });
  } catch (error) {
    console.error('Error generating statistics:', error);
    return NextResponse.json(
      { error: 'Failed to generate statistics' },
      { status: 500 }
    );
  }
}
