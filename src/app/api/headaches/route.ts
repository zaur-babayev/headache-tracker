import { prisma } from '@/lib/db';
import { getAuth } from '@clerk/nextjs/server';
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
    const { userId } = getAuth();
    
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const entries = await prisma.headacheEntry.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });

    // Parse the JSON strings back to arrays
    const parsedEntries = entries.map(entry => ({
      ...entry,
      medications: JSON.parse(entry.medications),
      triggers: JSON.parse(entry.triggers)
    }));

    return NextResponse.json(parsedEntries);
  } catch (error) {
    console.error('Database Error:', error);
    return new NextResponse('Database Error', { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = getAuth();
    
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body: HeadacheEntry = await request.json();
    const { date, severity, notes, triggers, medications } = body;

    if (!date || !severity) {
      return NextResponse.json(
        { error: 'Date and severity are required' },
        { status: 400 }
      );
    }

    const newEntry = await prisma.headacheEntry.create({
      data: {
        userId,
        date: new Date(date),
        severity,
        notes: notes || null,
        triggers: JSON.stringify(triggers || []),
        medications: JSON.stringify(medications || []),
      },
    });

    // Parse the JSON strings back to arrays for the response
    const parsedEntry = {
      ...newEntry,
      medications: JSON.parse(newEntry.medications),
      triggers: JSON.parse(newEntry.triggers)
    };

    return NextResponse.json(parsedEntry, { status: 201 });
  } catch (error) {
    console.error('Database Error:', error);
    return new NextResponse('Database Error', { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId } = getAuth();
    
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { id, date, severity, notes, triggers, medications } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Entry ID is required' },
        { status: 400 }
      );
    }

    // Check if the entry exists and belongs to the user
    const existingEntry = await prisma.headacheEntry.findFirst({
      where: {
        id,
        userId
      }
    });

    if (!existingEntry) {
      return NextResponse.json(
        { error: 'Entry not found or unauthorized' },
        { status: 404 }
      );
    }

    const updatedEntry = await prisma.headacheEntry.update({
      where: { id },
      data: {
        date: date ? new Date(date) : undefined,
        severity: severity !== undefined ? severity : undefined,
        notes: notes !== undefined ? notes : undefined,
        triggers: triggers ? JSON.stringify(triggers) : undefined,
        medications: medications ? JSON.stringify(medications) : undefined,
      },
    });

    // Parse the JSON strings back to arrays for the response
    const parsedEntry = {
      ...updatedEntry,
      medications: JSON.parse(updatedEntry.medications),
      triggers: JSON.parse(updatedEntry.triggers)
    };

    return NextResponse.json(parsedEntry);
  } catch (error) {
    console.error('Database Error:', error);
    return new NextResponse('Database Error', { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = getAuth();
    
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return new NextResponse('Missing id', { status: 400 });
    }

    // Check if the entry exists and belongs to the user
    const existingEntry = await prisma.headacheEntry.findFirst({
      where: {
        id,
        userId
      }
    });

    if (!existingEntry) {
      return NextResponse.json(
        { error: 'Entry not found or unauthorized' },
        { status: 404 }
      );
    }

    const deletedEntry = await prisma.headacheEntry.delete({
      where: { id },
    });

    return NextResponse.json(deletedEntry);
  } catch (error) {
    console.error('Database Error:', error);
    return new NextResponse('Database Error', { status: 500 });
  }
}
