export type Priority = 1 | 2 | 3 | 4;

export interface Task {
  id: string;
  user_id: string;
  title: string;
  tags: string[];
  priority: Priority | null;
  due_at: string | null;
  completed_at: string | null;
  deleted_at: string | null;
  time_estimate_minutes: number | null;
  created_at: string;
}

export type TaskInsert = Omit<Task, "created_at"> & { created_at?: string };
export type TaskUpdate = Partial<Omit<Task, "id" | "user_id" | "created_at">>;

// Use a generic Supabase client without strict DB typing to avoid overload conflicts
// The strict typing is handled at the application layer via the Task interface above
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];
