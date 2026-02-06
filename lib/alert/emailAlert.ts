import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export const fetchAlert = cache(async (token: string) => {
  const supabase = await createClient();
  const { data: row, error } = await supabase
    .from("job_alerts_sent")
    .select("jobs, expires_at")
    .eq("token", token)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return row;
});
