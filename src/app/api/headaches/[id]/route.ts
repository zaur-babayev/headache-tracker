import { prisma } from '@/lib/db';
import { getAuth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { userId } = getAuth();
    
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    
    const id = context.params.id;
    const headacheEntry = await prisma.headacheEntry.findFirst({
      where: { 
        id,
        userId 
      },
    });

    if (!headacheEntry) {
      return NextResponse.json(
        { error: 'Headache entry not found' },
        { status: 404 }
      );
    }

    // Parse the JSON strings back to arrays
    const parsedEntry = {
      ...headacheEntry,
      medications: JSON.parse(headacheEntry.medications),
      triggers: JSON.parse(headacheEntry.triggers)
    };

    return NextResponse.json(parsedEntry);
  } catch (error) {
    console.error('Error fetching headache entry:', error);
    return NextResponse.json(
      { error: 'Failed to fetch headache entry' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { userId } = getAuth();
    
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    
    const id = context.params.id;
    const body = await request.json();
    const { date, severity, notes, triggers, medications } = body;

    // Check if the headache entry exists and belongs to the user
    const existingEntry = await prisma.headacheEntry.findFirst({
      where: { 
        id,
        userId 
      },
    });

    if (!existingEntry) {
      return NextResponse.json(
        { error: 'Headache entry not found' },
        { status: 404 }
      );
    }

    // Update the headache entry
    const updatedEntry = await prisma.headacheEntry.update({
      where: { id },
      data: {
        date: date ? new Date(date) : undefined,
        severity: severity ? Number(severity) : undefined,
        notes,
        triggers: JSON.stringify(triggers || []),
        medications: JSON.stringify(medications || []),
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
    console.error('Error updating headache entry:', error);
    return NextResponse.json(
      { error: 'Failed to update headache entry' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { userId } = getAuth();
    
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    
    const id = context.params.id;

    // Check if the headache entry exists and belongs to the user
    const existingEntry = await prisma.headacheEntry.findFirst({
      where: { 
        id,
        userId 
      },
    });

    if (!existingEntry) {
      return NextResponse.json(
        { error: 'Headache entry not found' },
        { status: 404 }
      );
    }

    // Delete the headache entry
    await prisma.headacheEntry.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Headache entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting headache entry:', error);
    return NextResponse.json(
      { error: 'Failed to delete headache entry' },
      { status: 500 }
    );
  }
}
