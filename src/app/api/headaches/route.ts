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
      console.log('Unauthorized: No userId found in auth');
      return new NextResponse('Unauthorized', { status: 401 });
    }

    console.log(`Fetching headache entries for user: ${userId}`);
    
    // Check if Prisma client is initialized
    if (!prisma) {
      console.error('Prisma client is not initialized');
      return new NextResponse('Database Error: Prisma client not initialized', { status: 500 });
    }

    try {
      const entries = await prisma.headacheEntry.findMany({
        where: { userId },
        orderBy: { date: 'desc' },
      });

      console.log(`Found ${entries.length} entries for user ${userId}`);

      // Parse the JSON strings back to arrays
      const parsedEntries = entries.map(entry => {
        try {
          return {
            ...entry,
            medications: JSON.parse(entry.medications || '[]'),
            triggers: JSON.parse(entry.triggers || '[]')
          };
        } catch (parseError) {
          console.error(`Error parsing JSON for entry ${entry.id}:`, parseError);
          return {
            ...entry,
            medications: [],
            triggers: []
          };
        }
      });

      return NextResponse.json(parsedEntries);
    } catch (dbError: any) {
      console.error('Database query error:', dbError.message);
      console.error('Database query stack:', dbError.stack);
      return new NextResponse(`Database Query Error: ${dbError.message}`, { status: 500 });
    }
  } catch (error: any) {
    console.error('GET /api/headaches error:', error.message);
    console.error('Stack trace:', error.stack);
    return new NextResponse(`Server Error: ${error.message}`, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = getAuth();
    
    if (!userId) {
      console.log('Unauthorized: No userId found in auth');
      return new NextResponse('Unauthorized', { status: 401 });
    }

    console.log(`Creating headache entry for user: ${userId}`);
    
    // Check if Prisma client is initialized
    if (!prisma) {
      console.error('Prisma client is not initialized');
      return new NextResponse('Database Error: Prisma client not initialized', { status: 500 });
    }

    const body: HeadacheEntry = await request.json();
    const { date, severity, notes, triggers = [], medications = [] } = body;

    if (!date || severity === undefined) {
      console.error('Invalid request: Missing required fields', { date, severity });
      return new NextResponse('Bad Request: Missing required fields', { status: 400 });
    }

    try {
      const entry = await prisma.headacheEntry.create({
        data: {
          userId,
          date: new Date(date),
          severity,
          notes: notes || '',
          medications: JSON.stringify(medications),
          triggers: JSON.stringify(triggers || []),
        },
      });

      console.log(`Created entry with ID: ${entry.id}`);
      return NextResponse.json(entry);
    } catch (dbError: any) {
      console.error('Database create error:', dbError.message);
      console.error('Database create stack:', dbError.stack);
      return new NextResponse(`Database Create Error: ${dbError.message}`, { status: 500 });
    }
  } catch (error: any) {
    console.error('POST /api/headaches error:', error.message);
    console.error('Stack trace:', error.stack);
    return new NextResponse(`Server Error: ${error.message}`, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId } = getAuth();
    
    if (!userId) {
      console.log('Unauthorized: No userId found in auth');
      return new NextResponse('Unauthorized', { status: 401 });
    }

    console.log(`Updating headache entry for user: ${userId}`);
    
    // Check if Prisma client is initialized
    if (!prisma) {
      console.error('Prisma client is not initialized');
      return new NextResponse('Database Error: Prisma client not initialized', { status: 500 });
    }

    const body = await request.json();
    const { id, date, severity, notes, triggers, medications } = body;

    if (!id) {
      console.error('Invalid request: Missing required fields', { id });
      return new NextResponse('Bad Request: Missing required fields', { status: 400 });
    }

    // Check if the entry exists and belongs to the user
    const existingEntry = await prisma.headacheEntry.findFirst({
      where: {
        id,
        userId
      }
    });

    if (!existingEntry) {
      console.error('Entry not found or unauthorized', { id, userId });
      return new NextResponse('Not Found: Entry not found or unauthorized', { status: 404 });
    }

    try {
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

      console.log(`Updated entry with ID: ${updatedEntry.id}`);
      return NextResponse.json(updatedEntry);
    } catch (dbError: any) {
      console.error('Database update error:', dbError.message);
      console.error('Database update stack:', dbError.stack);
      return new NextResponse(`Database Update Error: ${dbError.message}`, { status: 500 });
    }
  } catch (error: any) {
    console.error('PUT /api/headaches error:', error.message);
    console.error('Stack trace:', error.stack);
    return new NextResponse(`Server Error: ${error.message}`, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = getAuth();
    
    if (!userId) {
      console.log('Unauthorized: No userId found in auth');
      return new NextResponse('Unauthorized', { status: 401 });
    }

    console.log(`Deleting headache entry for user: ${userId}`);
    
    // Check if Prisma client is initialized
    if (!prisma) {
      console.error('Prisma client is not initialized');
      return new NextResponse('Database Error: Prisma client not initialized', { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      console.error('Invalid request: Missing required fields', { id });
      return new NextResponse('Bad Request: Missing required fields', { status: 400 });
    }

    // Check if the entry exists and belongs to the user
    const existingEntry = await prisma.headacheEntry.findFirst({
      where: {
        id,
        userId
      }
    });

    if (!existingEntry) {
      console.error('Entry not found or unauthorized', { id, userId });
      return new NextResponse('Not Found: Entry not found or unauthorized', { status: 404 });
    }

    try {
      const deletedEntry = await prisma.headacheEntry.delete({
        where: { id },
      });

      console.log(`Deleted entry with ID: ${deletedEntry.id}`);
      return NextResponse.json(deletedEntry);
    } catch (dbError: any) {
      console.error('Database delete error:', dbError.message);
      console.error('Database delete stack:', dbError.stack);
      return new NextResponse(`Database Delete Error: ${dbError.message}`, { status: 500 });
    }
  } catch (error: any) {
    console.error('DELETE /api/headaches error:', error.message);
    console.error('Stack trace:', error.stack);
    return new NextResponse(`Server Error: ${error.message}`, { status: 500 });
  }
}
