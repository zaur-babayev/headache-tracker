import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check if Prisma client is initialized
    if (!prisma) {
      console.error('Health check: Prisma client is not initialized');
      return NextResponse.json({
        status: 'error',
        message: 'Prisma client not initialized',
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

    // Try to query the database
    try {
      // Simple query to check database connectivity
      await prisma.$queryRaw`SELECT 1`;
      
      console.log('Health check: Database connection successful');
      return NextResponse.json({
        status: 'ok',
        database: 'connected',
        timestamp: new Date().toISOString()
      });
    } catch (dbError: any) {
      console.error('Health check: Database connection error:', dbError.message);
      return NextResponse.json({
        status: 'error',
        database: 'disconnected',
        error: dbError.message,
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Health check error:', error.message);
    return NextResponse.json({
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
