import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  console.log("========================================")
  console.log("🔐 AUTH CALLBACK ROUTE HANDLER EXECUTED!")
  console.log("========================================")

  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const next = requestUrl.searchParams.get("next") ?? "/"

  console.log("🔐 Auth callback received:", {
    url: requestUrl.toString(),
    code: code?.substring(0, 10) + "...",
    next
  })

  // Create response first
  const response = NextResponse.redirect(new URL(next, requestUrl.origin))

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            // Set cookies on the response object
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options)
            })
          },
        },
      }
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error("❌ Error exchanging code for session:", error)
      return NextResponse.redirect(new URL("/login?error=auth_failed", requestUrl.origin))
    }

    console.log("✅ Session created successfully:", { userId: data.user?.id, email: data.user?.email })
  }

  console.log("➡️ Redirecting to:", next)
  return response
}
