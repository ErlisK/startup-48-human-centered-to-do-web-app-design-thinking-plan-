import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );
  const { data: { user } } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;
  const isAppRoute = pathname.startsWith("/app") || pathname.startsWith("/onboarding");
  const isAuthRoute = pathname.startsWith("/auth");

  if (isAppRoute && !user) return NextResponse.redirect(new URL("/auth/signup", request.url));
  if (isAuthRoute && user && pathname !== "/auth/callback") return NextResponse.redirect(new URL("/app/today", request.url));
  return response;
}

export const config = { matcher: ["/app/:path*", "/onboarding/:path*", "/auth/:path*"] };
