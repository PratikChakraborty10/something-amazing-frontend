import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require authentication
const protectedRoutes = [
  "/campaigns",
  "/global-contacts",
  "/settings",
];

// Routes that should redirect to dashboard if authenticated
const authRoutes = ["/login", "/signup", "/forgot-password"];

// Check if path matches any protected route
function isProtectedRoute(path: string): boolean {
  return protectedRoutes.some(
    (route) => path === route || path.startsWith(route + "/")
  );
}

// Check if path is an auth route
function isAuthRoute(path: string): boolean {
  return authRoutes.some(
    (route) => path === route || path.startsWith(route + "/")
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get token from cookie or authorization header
  // For localStorage-based auth, we use a cookie set by the client
  const token = request.cookies.get("access_token")?.value;
  const isAuthenticated = !!token;

  // Redirect unauthenticated users from protected routes to login
  if (isProtectedRoute(pathname) && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users from auth routes to dashboard
  if (isAuthRoute(pathname) && isAuthenticated) {
    return NextResponse.redirect(new URL("/campaigns", request.url));
  }

  return NextResponse.next();
}

// Configure which paths the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes
     */
    "/((?!_next/static|_next/image|favicon.ico|public|api).*)",
  ],
};
