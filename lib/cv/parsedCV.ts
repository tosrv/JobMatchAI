import { CV } from "@/types/job";
import { createClient } from "../supabase/client";

export async function getParsedCV(userId: string): Promise<CV> {

  const key = `parsedCV_${userId}`;

  const cached = sessionStorage.getItem(key);
  if (cached) {
    try {
      return JSON.parse(cached) as CV;
    } catch {
      sessionStorage.removeItem(key);
    }
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("cvs")
    .select("parsed_data")
    .eq("user_id", userId)
    .limit(1)
    .single();

  if (error || !data.parsed_data) {
    throw new Error("CV not found");
  }

  sessionStorage.setItem(key, JSON.stringify(data.parsed_data));
  return data.parsed_data;
}
