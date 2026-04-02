/**
 * Security guard helpers for API routes.
 *
 * Pattern:
 *   const { user, error } = await requireAuth(request);
 *   if (error) return error;
 */

import { type NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

// Re-export pure sanitisation functions (testable without Next.js globals)
export { sanitizeText, sanitizePriority, sanitizeDate, sanitizeTags } from "./sanitize";

export interface AuthResult {
  user: { id: string; email?: string } | null;
  error: NextResponse | null;
}

/** Verify the request has a valid Supabase session. Returns user or 401. */
export async function requireAuth(req: NextRequest): Promise<AuthResult> {
  void req;
  try {
    const supabase = await getSupabaseServer();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any).auth.getUser();
    if (error || !data?.user) {
      return { user: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
    }
    return { user: { id: data.user.id, email: data.user.email }, error: null };
  } catch {
    return { user: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
}

/** Reject request bodies larger than maxBytes. Returns 413 or null. */
export function guardInputSize(body: string | null, maxBytes: number): NextResponse | null {
  if (body && body.length > maxBytes) {
    return NextResponse.json(
      { error: `Request body too large (max ${(maxBytes / 1024).toFixed(0)} KB)` },
      { status: 413 }
    );
  }
  return null;
}

/** Only allow specific HTTP methods. Returns 405 or null. */
export function guardMethod(req: NextRequest, allowed: string[]): NextResponse | null {
  if (!allowed.includes(req.method)) {
    return NextResponse.json(
      { error: `Method ${req.method} not allowed` },
      { status: 405, headers: { Allow: allowed.join(", ") } }
    );
  }
  return null;
}
