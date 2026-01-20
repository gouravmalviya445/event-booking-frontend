import { NextRequest, NextResponse } from "next/server";

export function proxy(req: NextRequest) {
  // get the token from the cookie
  // server middleware can see this cookies
  const token = req.cookies.get("accessToken")?.value;
  
  // get the path 
  const path = req.nextUrl.pathname;
  const isAuthPage = path === "/login" || path === "/register";
  const isProtectedPage = path.startsWith("/dashboard") || path === "verify-email"

  // redirect to home if logged in
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
  
  // protected page
  if (!token && isProtectedPage) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // allow the req to continue if no redirect was needed
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/login",
    "/register"
  ]
}