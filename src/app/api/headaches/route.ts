import { prisma } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
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
    const { userId } = auth();
    
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
    const { userId } = auth();
    
    if (!userId) {
      console.log('Unauthorized: No userId found in auth');
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const data: HeadacheEntry = await request.json();
    console.log('Received data:', data);

    // Validate required fields
    if (!data.date || data.severity === undefined || !data.medications) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    try {
      // Convert arrays to JSON strings for storage
      const entry = await prisma.headacheEntry.create({
        data: {
          userId,
          date: data.date,
          severity: data.severity,
          notes: data.notes || '',
          medications: JSON.stringify(data.medications || []),
          triggers: JSON.stringify(data.triggers || [])
        }
      });

      console.log(`Created new entry with ID: ${entry.id}`);
      return NextResponse.json(entry);
    } catch (dbError: any) {
      console.error('Database create error:', dbError.message);
      return new NextResponse(`Database Create Error: ${dbError.message}`, { status: 500 });
    }
  } catch (error: any) {
    console.error('POST /api/headaches error:', error.message);
    return new NextResponse(`Server Error: ${error.message}`, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      console.log('Unauthorized: No userId found in auth');
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const data = await request.json();
    console.log('Update data:', data);

    // Validate required fields
    if (!data.id || !data.date || data.severity === undefined || !data.medications) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    try {
      // First verify this entry belongs to the user
      const existingEntry = await prisma.headacheEntry.findUnique({
        where: { id: data.id }
      });

      if (!existingEntry) {
        return new NextResponse('Entry not found', { status: 404 });
      }

      if (existingEntry.userId !== userId) {
        console.log(`Unauthorized: User ${userId} attempted to update entry ${data.id} belonging to ${existingEntry.userId}`);
        return new NextResponse('Unauthorized', { status: 401 });
      }

      // Convert arrays to JSON strings for storage
      const updatedEntry = await prisma.headacheEntry.update({
        where: { id: data.id },
        data: {
          date: data.date,
          severity: data.severity,
          notes: data.notes || '',
          medications: JSON.stringify(data.medications || []),
          triggers: JSON.stringify(data.triggers || [])
        }
      });

      console.log(`Updated entry with ID: ${updatedEntry.id}`);
      return NextResponse.json(updatedEntry);
    } catch (dbError: any) {
      console.error('Database update error:', dbError.message);
      return new NextResponse(`Database Update Error: ${dbError.message}`, { status: 500 });
    }
  } catch (error: any) {
    console.error('PUT /api/headaches error:', error.message);
    return new NextResponse(`Server Error: ${error.message}`, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      console.log('Unauthorized: No userId found in auth');
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return new NextResponse('Missing required id parameter', { status: 400 });
    }

    try {
      // First verify this entry belongs to the user
      const existingEntry = await prisma.headacheEntry.findUnique({
        where: { id }
      });

      if (!existingEntry) {
        return new NextResponse('Entry not found', { status: 404 });
      }

      if (existingEntry.userId !== userId) {
        console.log(`Unauthorized: User ${userId} attempted to delete entry ${id} belonging to ${existingEntry.userId}`);
        return new NextResponse('Unauthorized', { status: 401 });
      }

      await prisma.headacheEntry.delete({
        where: { id },
      });

      console.log(`Deleted entry with ID: ${id}`);
      return new NextResponse(null, { status: 204 });
    } catch (dbError: any) {
      console.error('Database delete error:', dbError.message);
      return new NextResponse(`Database Delete Error: ${dbError.message}`, { status: 500 });
    }
  } catch (error: any) {
    console.error('DELETE /api/headaches error:', error.message);
    return new NextResponse(`Server Error: ${error.message}`, { status: 500 });
  }
}
