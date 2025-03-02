import { clerkMiddleware } from "@clerk/nextjs/server";

// Log the request path for debugging
const debugMiddleware = (req: Request) => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  if (isDevelopment) {
    console.log(`Middleware processing: ${req.method} ${new URL(req.url).pathname}`);
  }
  return null;
};

// Determine if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development';

export default clerkMiddleware({
  // Routes that can be accessed while signed out
  publicRoutes: [
    "/sign-in", 
    "/sign-up", 
    "/api/public", 
    // Only include test endpoints in development
    ...(isDevelopment ? ["/api/test-auth"] : []),
    // Only make the headaches API public in development
    ...(isDevelopment ? ["/api/headaches"] : [])
  ],
  // Routes that can always be accessed, and have no authentication information
  ignoredRoutes: ["/api/public"],
  debug: isDevelopment, // Only enable Clerk debug mode in development
  beforeAuth: (req) => {
    return debugMiddleware(req);
  },
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
