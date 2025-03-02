import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, severity, notes, triggers, medications } = body;

    if (!date || !severity) {
      return NextResponse.json(
        { error: 'Date and severity are required' },
        { status: 400 }
      );
    }

    const headacheEntry = await prisma.headacheEntry.create({
      data: {
        date: new Date(date),
        severity: Number(severity),
        notes,
        triggers,
        medications: {
          create: medications?.map((med: { name: string; dosage?: string }) => ({
            name: med.name,
            dosage: med.dosage || null,
          })) || [],
        },
      },
      include: {
        medications: true,
      },
    });

    return NextResponse.json(headacheEntry, { status: 201 });
  } catch (error) {
    console.error('Error creating headache entry:', error);
    return NextResponse.json(
      { error: 'Failed to create headache entry' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const headacheEntries = await prisma.headacheEntry.findMany({
      include: {
        medications: true,
      },
      orderBy: {
        date: 'desc',
      },
    });

    return NextResponse.json(headacheEntries);
  } catch (error) {
    console.error('Error fetching headache entries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch headache entries' },
      { status: 500 }
    );
  }
}
