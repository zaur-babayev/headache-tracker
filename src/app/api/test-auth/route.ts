import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Check if we're in development mode
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    // Only allow this endpoint in development mode
    if (!isDevelopment) {
      console.log('Test auth endpoint accessed in production mode');
      return new NextResponse('Not Found', { status: 404 });
    }
    
    const user = await currentUser();
    const { userId, isSignedIn } = auth();
    
    return NextResponse.json({
      message: "Auth test",
      user,
      isAuthorized: !!userId,
      isSignedIn,
      environment: process.env.NODE_ENV
    });
  } catch (error) {
    console.error('Error in test-auth endpoint:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
