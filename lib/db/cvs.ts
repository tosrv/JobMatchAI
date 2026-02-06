import { createClient } from "@/lib/supabase/server";
import { CV } from "@/types/job";

export async function saveCV(
  userId: string,
  rawText: string,
  parsedData: CV,
  file?: { url?: string; name?: string },
) {
  const supabase = await createClient();

  const { error } = await supabase.from("cvs").upsert(
    [
      {
        user_id: userId,
        file_url: file?.url || undefined,
        file_name: file?.name || undefined,
        raw_text: rawText,
        parsed_data: parsedData,
        skills: parsedData.skills || undefined,
        experience: parsedData.experience || undefined,
        education: parsedData.education || undefined,
      },
    ],
    {
      onConflict: "user_id",
    }
  );

  if (error) throw error;

  return true;
}
