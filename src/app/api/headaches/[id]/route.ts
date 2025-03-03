import { prisma } from '@/lib/db';
import { auth, currentUser } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`GET /api/headaches/${params.id}: Starting auth check`);
    
    // Try to get the current user
    const user = await currentUser();
    console.log('Current user:', user ? `ID: ${user.id}` : 'No user found');
    
    // Also try the auth method
    const { userId } = auth();
    console.log('Auth userId:', userId);
    
    const effectiveUserId = user?.id || userId;
    
    // Always require authentication, even in development
    if (!effectiveUserId) {
      console.log('Unauthorized: No user ID found');
      return new NextResponse('Unauthorized', { status: 401 });
    }
    
    const headacheEntry = await prisma.headacheEntry.findFirst({
      where: {
        id: params.id,
        userId: effectiveUserId
      },
    });
    
    if (!headacheEntry) {
      return new NextResponse('Entry not found', { status: 404 });
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
    return new NextResponse('Server Error', { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`PUT /api/headaches/${params.id}: Starting auth check`);
    
    // Try to get the current user
    const user = await currentUser();
    console.log('Current user:', user ? `ID: ${user.id}` : 'No user found');
    
    // Also try the auth method
    const { userId } = auth();
    console.log('Auth userId:', userId);
    
    const effectiveUserId = user?.id || userId;
    
    // Always require authentication, even in development
    if (!effectiveUserId) {
      console.log('Unauthorized: No user ID found');
      return new NextResponse('Unauthorized', { status: 401 });
    }
    
    const body = await request.json();
    const { date, severity, notes, triggers, medications } = body;

    // Check if the headache entry exists and belongs to the user
    const existingEntry = await prisma.headacheEntry.findFirst({
      where: { 
        id: params.id,
        userId: effectiveUserId
      },
    });

    if (!existingEntry) {
      return new NextResponse('Entry not found', { status: 404 });
    }

    // Update the headache entry
    const updatedEntry = await prisma.headacheEntry.update({
      where: { id: params.id },
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
    return new NextResponse('Server Error', { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`DELETE /api/headaches/${params.id}: Starting auth check`);
    
    // Try to get the current user
    const user = await currentUser();
    console.log('Current user:', user ? `ID: ${user.id}` : 'No user found');
    
    // Also try the auth method
    const { userId } = auth();
    console.log('Auth userId:', userId);
    
    const effectiveUserId = user?.id || userId;
    
    // Always require authentication, even in development
    if (!effectiveUserId) {
      console.log('Unauthorized: No user ID found');
      return new NextResponse('Unauthorized', { status: 401 });
    }
    
    // Check if the headache entry exists and belongs to the user
    const existingEntry = await prisma.headacheEntry.findFirst({
      where: { 
        id: params.id,
        userId: effectiveUserId
      },
    });

    if (!existingEntry) {
      return new NextResponse('Entry not found', { status: 404 });
    }

    // Delete the headache entry
    await prisma.headacheEntry.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Headache entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting headache entry:', error);
    return new NextResponse('Server Error', { status: 500 });
  }
}
