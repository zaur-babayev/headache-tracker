import { clerkMiddleware } from "@clerk/nextjs/server";

// Log the request path for debugging
const debugMiddleware = (req: Request) => {
  console.log(`Middleware processing: ${req.method} ${new URL(req.url).pathname}`);
  return null;
};

export default clerkMiddleware({
  // Routes that can be accessed while signed out
  publicRoutes: [
    "/sign-in", 
    "/sign-up", 
    "/api/public", 
    "/api/test-auth",
    // For development, make the headaches API public
    "/api/headaches"
  ],
  // Routes that can always be accessed, and have no authentication information
  ignoredRoutes: ["/api/public"],
  debug: true, // Enable Clerk debug mode
  beforeAuth: (req) => {
    return debugMiddleware(req);
  },
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
