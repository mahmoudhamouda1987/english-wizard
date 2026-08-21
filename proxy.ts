import { NextResponse, type NextRequest } from "next/server";

const protectedPath = [
  "/dashboard", "/learn", "/learning-path", "/practice", "/progress", "/mistakes",
  "/achievements", "/settings", "/vocabulary", "/conversation", "/community",
  "/diagnostic", "/review", "/speaking", "/worlds", "/reading", "/english-ear", "/say-it-better",
];

export function proxy(req: NextRequest) {
  if (protectedPath.some((path) => req.nextUrl.pathname === path || req.nextUrl.pathname.startsWith(`${path}/`)) && !req.cookies.get("ew_session")) {
    const url = req.nextUrl.clone();
    url.pathname = "/auth";
    return NextResponse.redirect(url);
  }
  const response = NextResponse.next();
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*", "/learn/:path*", "/learning-path/:path*", "/practice/:path*", "/progress/:path*",
    "/mistakes/:path*", "/achievements/:path*", "/settings/:path*", "/vocabulary/:path*",
    "/conversation/:path*", "/community/:path*", "/diagnostic/:path*", "/review/:path*", "/speaking/:path*",
    "/worlds/:path*", "/reading/:path*", "/english-ear/:path*", "/say-it-better/:path*",
  ],
};
