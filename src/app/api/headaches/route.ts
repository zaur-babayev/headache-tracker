import { sql } from '@vercel/postgres';
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

    const { rows } = await sql`
      SELECT * FROM headaches 
      WHERE user_id = ${userId}
      ORDER BY date DESC
    `;

    return NextResponse.json(rows);
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

    const { rows } = await sql`
      INSERT INTO headaches (user_id, date, severity, notes, triggers, medications)
      VALUES (${userId}, ${date}, ${severity}, ${notes}, ${triggers}, ${medications})
      RETURNING *
    `;

    return NextResponse.json(rows[0], { status: 201 });
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

    const { rows } = await sql`
      UPDATE headaches 
      SET date = ${date},
          severity = ${severity},
          notes = ${notes},
          triggers = ${triggers},
          medications = ${medications},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING *
    `;

    if (rows.length === 0) {
      return new NextResponse('Not Found', { status: 404 });
    }

    return NextResponse.json(rows[0]);
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

    const { rows } = await sql`
      DELETE FROM headaches 
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING *
    `;

    if (rows.length === 0) {
      return new NextResponse('Not Found', { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Database Error:', error);
    return new NextResponse('Database Error', { status: 500 });
  }
}
