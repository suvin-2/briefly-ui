import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    },
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const isLoginPage = request.nextUrl.pathname === "/login"

  console.log("🔍 MIDDLEWARE:", {
    path: request.nextUrl.pathname,
    hasSession: !!session,
    isLoginPage,
  })

  // 로그인하지 않은 사용자가 보호된 페이지에 접근하려는 경우
  if (!session && !isLoginPage) {
    console.log("🚫 No session, redirecting to /login")
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // 이미 로그인한 사용자가 로그인 페이지에 접근하려는 경우
  if (session && isLoginPage) {
    console.log("✅ Has session, redirecting to /")
    return NextResponse.redirect(new URL("/", request.url))
  }

  console.log("✅ MIDDLEWARE: Allowing request")

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - /auth/ (auth callbacks)
     */
    "/((?!_next/static|_next/image|favicon.ico|auth/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
