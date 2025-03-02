import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

type HeadacheEntry = {
  date: string;
  severity: number;
  notes?: string;
  triggers?: string[];
  medications: string[];
};

export async function GET() {
  try {
    const entries = await prisma.headacheEntry.findMany({
      orderBy: { date: 'desc' },
    });
    
    // Parse JSON strings back to arrays
    const parsedEntries = entries.map(entry => ({
      ...entry,
      medications: JSON.parse(entry.medications),
      triggers: JSON.parse(entry.triggers),
    }));
    
    return NextResponse.json(parsedEntries);
  } catch (error) {
    console.error('Error fetching headache entries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch headache entries' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: HeadacheEntry = await request.json();
    const { date, severity, notes, triggers, medications } = body;

    if (!date || !severity) {
      return NextResponse.json(
        { error: 'Date and severity are required' },
        { status: 400 }
      );
    }

    const entry = await prisma.headacheEntry.create({
      data: {
        date: new Date(date),
        severity: Number(severity),
        notes,
        triggers: JSON.stringify(triggers || []),
        medications: JSON.stringify(medications || []),
      },
    });

    // Parse JSON strings back to arrays for response
    return NextResponse.json({
      ...entry,
      medications: JSON.parse(entry.medications),
      triggers: JSON.parse(entry.triggers),
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating headache entry:', error);
    return NextResponse.json(
      { error: 'Failed to create headache entry' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, date, severity, notes, triggers, medications } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Entry ID is required' },
        { status: 400 }
      );
    }

    const entry = await prisma.headacheEntry.update({
      where: { id },
      data: {
        date: new Date(date),
        severity: Number(severity),
        notes,
        triggers: JSON.stringify(triggers || []),
        medications: JSON.stringify(medications || []),
      },
    });

    // Parse JSON strings back to arrays for response
    return NextResponse.json({
      ...entry,
      medications: JSON.parse(entry.medications),
      triggers: JSON.parse(entry.triggers),
    });
  } catch (error) {
    console.error('Error updating headache entry:', error);
    return NextResponse.json(
      { error: 'Failed to update headache entry' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Entry ID is required' },
        { status: 400 }
      );
    }

    await prisma.headacheEntry.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting headache entry:', error);
    return NextResponse.json(
      { error: 'Failed to delete headache entry' },
      { status: 500 }
    );
  }
}
