import { NextRequest, NextResponse } from "next/server";
import { AdzunaSearch } from "@/lib/adzuna/adzunaSearch";
import { getUser } from "@/lib/auth";
import { rankJobsWithGroq } from "@/lib/groq/jobMatch";

export async function POST(req: NextRequest) {
  try {
    // User check
    const user = await getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Get cv and keywords
    const body = await req.json().catch(() => ({}));
    const parsedCV = body.cv;
    const { keyword = "", location = "" } = body;

    if (!keyword) {
      return NextResponse.json(
        { error: "Keyword is required" },
        { status: 400 },
      );
    }

    // Fetch jobs Adzuna by keyword
    const adzunaJobs = await AdzunaSearch(keyword, location);

    // Rank jobs via Groq
    const rankJobs = await rankJobsWithGroq(parsedCV, adzunaJobs);

    return NextResponse.json({ rankJobs: [...rankJobs] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
