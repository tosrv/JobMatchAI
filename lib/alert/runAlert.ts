import { supabaseAdmin } from "@/lib/supabase/admin";
import { processJobAlert } from "./processJob";

export async function runAlerts(frequency: "daily" | "weekly") {
  const { data: alerts } = await supabaseAdmin
    .from("job_alerts")
    .select("*")
    .eq("is_active", true)
    .eq("frequency", frequency);

  console.log(alerts);

  for (const alert of alerts ?? []) {
    await processJobAlert(alert);
  }
}
