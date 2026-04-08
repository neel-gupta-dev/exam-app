import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(req: NextRequest) {
  const url = req.nextUrl;
  
  // Get hostname of request (e.g. notes.vayl.in, notes.localhost:3000)
  const hostname = req.headers.get("host") || "";
  
  // Define subdomains we support
  const isNotesSubdomain =
    hostname.includes("notes.vayl.in") || hostname.includes("notes.localhost");

  const searchParams = req.nextUrl.searchParams.toString();
  const path = `${url.pathname}${
    searchParams.length > 0 ? `?${searchParams}` : ""
  }`;

  if (isNotesSubdomain) {
    // Rewrite notes subdomain to the /notes route folder
    return NextResponse.rewrite(
      new URL(`/notes${path === "/" ? "" : path}`, req.url)
    );
  }

  // Prevent direct access to /notes from the main domain
  if (url.pathname.startsWith("/notes")) {
    const newPath = path.replace("/notes", "") || "/";
    return NextResponse.redirect(
      new URL(`https://notes.vayl.in${newPath}`, req.url)
    );
  }

  // Otherwise, proceed to main domain routes
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
