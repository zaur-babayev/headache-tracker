import { auth, currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('GET /api/test-auth: Starting auth check');
    
    // Try to get the current user
    const user = await currentUser();
    console.log('Current user:', user ? `ID: ${user.id}` : 'No user found');
    
    // Also try the auth method
    const authResult = auth();
    console.log('Auth result:', authResult);
    
    return NextResponse.json({
      message: 'Auth test',
      user: user ? { id: user.id, email: user.emailAddresses[0]?.emailAddress } : null,
      authUserId: authResult.userId,
      isAuthorized: !!user || !!authResult.userId
    });
  } catch (error) {
    console.error('Error in test-auth:', error);
    return NextResponse.json({ error: 'Auth test failed' }, { status: 500 });
  }
}
