import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import { extractTextFromCV } from "@/lib/cv/extractPdf"; 
import { parseWithGroq } from "@/lib/groq/extractCV"; 
import { saveCV } from "@/lib/db/cvs";

export const POST = async (req: NextRequest) => {
  try {
    // User check
    const user = await getUser();

    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Get PDF from formData
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file)
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

    const supabase = await createClient();

    // Generate unique filename & upload to Storage
    const fileName = `${user.id}-${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("cvs")
      .upload(fileName, file, { cacheControl: "3600", upsert: true });

    if (uploadError) throw uploadError;

    // Get public URL PDF file
    const { data: publicUrlData } = supabase.storage
      .from("cvs")
      .getPublicUrl(fileName);
    const fileUrl = publicUrlData.publicUrl;

    // Parse PDF to text
    const rawText = await extractTextFromCV(file);

    // Parse text with Groq to structured JSON
    const parsedCV = await parseWithGroq(rawText);

    // Save CV to DB
    await saveCV(user.id, rawText, parsedCV, { url: fileUrl, name: file.name });

    const { skills, experience, education } = parsedCV;
    return NextResponse.json({
      fileUrl,
      userId: user.id,
      parsed: {
        skills,
        experience,
        education,
      },
    }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: message || "Internal Server Error" },
      { status: 500 },
    );
  }
};
