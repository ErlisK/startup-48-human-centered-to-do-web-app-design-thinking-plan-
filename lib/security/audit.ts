/**
 * Audit log module.
 *
 * Writes structured audit events to the Supabase `audit_log` table.
 * Gracefully degrades: if the table doesn't exist or writes fail,
 * events are logged to stderr (non-blocking).
 *
 * Schema (run migration below):
 *   id          uuid default gen_random_uuid() primary key
 *   user_id     uuid references auth.users(id) on delete set null
 *   action      text not null
 *   resource    text
 *   meta        jsonb
 *   ip          text
 *   user_agent  text
 *   created_at  timestamptz default now()
 *
 * Actions tracked:
 *   auth.login          auth.signup         auth.logout
 *   auth.password_reset auth.magic_link
 *   task.create         task.update         task.complete
 *   task.delete         task.restore
 *   data.export         data.import
 *   account.delete
 */

import { createClient } from "@supabase/supabase-js";

export type AuditAction =
  | "auth.login" | "auth.signup" | "auth.logout"
  | "auth.password_reset" | "auth.magic_link"
  | "task.create" | "task.update" | "task.complete"
  | "task.delete" | "task.restore"
  | "data.export" | "data.import"
  | "account.delete";

export interface AuditEvent {
  action: AuditAction;
  userId?: string | null;
  resource?: string;       // e.g. task ID
  meta?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
}

/** Get the service-role client for audit writes (bypasses RLS) */
function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Write an audit event. Non-blocking — never throws. */
export async function writeAuditLog(event: AuditEvent): Promise<void> {
  const client = getAdminClient();
  if (!client) {
    // Dev mode: just log to console
    console.debug("[audit]", event.action, event.userId, event.meta);
    return;
  }
  try {
    const { error } = await client.from("audit_log").insert({
      user_id:    event.userId ?? null,
      action:     event.action,
      resource:   event.resource ?? null,
      meta:       event.meta ?? null,
      ip:         event.ip ?? null,
      user_agent: event.userAgent ?? null,
    });
    if (error) {
      // Table may not exist yet — log and continue
      console.error("[audit] write failed:", error.message);
    }
  } catch (err) {
    console.error("[audit] unexpected error:", err);
  }
}

/** Extract IP from Next.js request headers */
export function getRequestIp(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    headers.get("x-real-ip") ??
    "unknown"
  );
}

/** Extract user-agent (truncated) */
export function getUserAgent(headers: Headers): string {
  return (headers.get("user-agent") ?? "unknown").slice(0, 200);
}
