import { clerkMiddleware } from "@clerk/nextjs/server";
 
export default clerkMiddleware({
  // Routes that can be accessed while signed out
  publicRoutes: ["/sign-in", "/sign-up", "/api/public"],
  // Routes that can always be accessed, and have no authentication information
  ignoredRoutes: ["/api/public"]
});
 
export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
