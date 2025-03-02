import { clerkMiddleware } from "@clerk/nextjs/server";
 
export default clerkMiddleware({
  // Allow signed out users to access the public home page
  publicRoutes: ["/"],
  // Add routes that can be accessed without authentication
  ignoredRoutes: ["/api/public"]
});
 
export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
