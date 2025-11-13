import { type NextRequest, NextResponse } from "next/server"

export function middleware(request: NextRequest) {
  const isLoggedIn = request.cookies.get("isLoggedIn")?.value === "true"
  const userRole = request.cookies.get("userRole")?.value

  const { pathname } = request.nextUrl

  // Allow access to login and signup pages
  if (pathname === "/" || pathname === "/signup") {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL(`/dashboard/${userRole}`, request.url))
    }
    return NextResponse.next()
  }

  // Protect dashboard routes
  if (pathname.startsWith("/dashboard")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/", request.url))
    }
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/", "/signup", "/dashboard/:path*"],
}
