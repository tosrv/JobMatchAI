import { NextRequest, NextResponse } from "next/server";
import { analyzeJobWithGroq } from "@/lib/groq/analyze";
import { getUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    // User check
    const user = await getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Get job data
    const body = await req.json().catch(() => ({}));

    const jobData = body.job;
    if (!jobData)
      return NextResponse.json({ error: "Missing job data" }, { status: 400 });

    // Get user cv
    const parsedCV = body.cv;

    const parsedCVText = `
    Name: ${parsedCV.name}
    Email: ${parsedCV.email}
    Phone: ${parsedCV.phone}

    Skills: ${parsedCV.skills.join(", ")}

    Education:
    ${parsedCV.education.join("\n")}

    Experience:
    ${parsedCV.experience.join("\n")}
    `;

    // Analyze match cv and job with Groq
    const analysis = await analyzeJobWithGroq(parsedCVText, jobData);

    return NextResponse.json({ analysis }, { status: 200 });
  } catch (err: unknown) {
    console.error(err);

    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
