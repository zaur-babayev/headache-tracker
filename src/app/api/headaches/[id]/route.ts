import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const headacheEntry = await prisma.headacheEntry.findUnique({
      where: { id },
      include: {
        medications: true,
      },
    });

    if (!headacheEntry) {
      return NextResponse.json(
        { error: 'Headache entry not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(headacheEntry);
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
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();
    const { date, severity, notes, triggers, medications } = body;

    // Check if the headache entry exists
    const existingEntry = await prisma.headacheEntry.findUnique({
      where: { id },
    });

    if (!existingEntry) {
      return NextResponse.json(
        { error: 'Headache entry not found' },
        { status: 404 }
      );
    }

    // Update the headache entry
    const updatedEntry = await prisma.$transaction(async (tx) => {
      // Delete existing medications
      await tx.medication.deleteMany({
        where: { headacheEntryId: id },
      });

      // Update the headache entry
      return tx.headacheEntry.update({
        where: { id },
        data: {
          date: date ? new Date(date) : undefined,
          severity: severity ? Number(severity) : undefined,
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
    });

    return NextResponse.json(updatedEntry);
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
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    // Check if the headache entry exists
    const existingEntry = await prisma.headacheEntry.findUnique({
      where: { id },
    });

    if (!existingEntry) {
      return NextResponse.json(
        { error: 'Headache entry not found' },
        { status: 404 }
      );
    }

    // Delete the headache entry (medications will be deleted due to cascade)
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
