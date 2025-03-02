import { authMiddleware, redirectToSignIn } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export default authMiddleware({
  // Routes that can be accessed while signed out
  publicRoutes: ["/sign-in", "/sign-up", "/api/health"],
  
  // Routes that can always be accessed, and have
  // no authentication information
  ignoredRoutes: ["/api/webhook"],

  // Custom function to handle authentication
  afterAuth(auth, req) {
    // If the user is not signed in and the route is not public, redirect to sign-in
    if (!auth.userId && !auth.isPublicRoute) {
      return redirectToSignIn({ returnBackUrl: req.url });
    }

    // Allow the user to access the route
    return NextResponse.next();
  },
});

export const config = {
  // Matcher ignoring _next, api/webhook, and static files
  matcher: ["/((?!.+\\.[\\w]+$|_next|api/webhook).*)", "/", "/(api|trpc)(.*)"],
};
