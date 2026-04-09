import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  
  // Get hostname of request (e.g. notes.vayl.in, nta.vayl.in, notes.localhost:3000)
  const hostname = req.headers.get("host") || "";
  
  // Define subdomains we support
  const isNotesSubdomain =
    hostname.includes("notes.vayl.in") || hostname.includes("notes.localhost");
    
  // NTA Subdomain - redirects to Rickroll YouTube link as requested
  const isNtaSubdomain = 
    hostname.includes("nta.vayl.in") || hostname.includes("nta.localhost");

  // Syllabus Subdomain - rewrites to /syllabus
  const isSyllabusSubdomain = 
    hostname.includes("syllabus.vayl.in") || hostname.includes("syllabus.localhost");

  // 418 Subdomain - rewrites to /418
  const isTeapotSubdomain = 
    hostname.includes("418.vayl.in") || hostname.includes("418.localhost");

  const searchParams = req.nextUrl.searchParams.toString();
  const path = `${url.pathname}${
    searchParams.length > 0 ? `?${searchParams}` : ""
  }`;

  // Handle NTA subdomain redirect
  if (isNtaSubdomain) {
    return NextResponse.redirect(new URL("https://youtu.be/dQw4w9WgXcQ?si=W7xdj3OAuN0G5P02"), {
      status: 307 // Temporary redirect
    });
  }

  // Handle Syllabus subdomain rewrite
  if (isSyllabusSubdomain) {
    return NextResponse.rewrite(
      new URL(`/syllabus${path === "/" ? "" : path}`, req.url)
    );
  }

  // Handle Teapot subdomain rewrite
  if (isTeapotSubdomain) {
    return NextResponse.rewrite(
      new URL(`/418${path === "/" ? "" : path}`, req.url)
    );
  }

  // Handle Notes subdomain rewrite
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
     * - notes/pdfs (static notes pdfs)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|notes/pdfs).*)",
  ],
};
