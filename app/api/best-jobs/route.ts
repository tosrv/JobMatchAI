import { NextResponse, NextRequest } from "next/server";
import { getUser } from "@/lib/auth";
import { extractJobKeywordsWithGroq } from "@/lib/groq/extractJobKeywords";
import { AdzunaJobs } from "@/lib/adzuna/AdzunaJobs";
import { rankJobsWithGroq } from "@/lib/groq/jobMatch";
import { preScoreJob } from "@/lib/scoring/preScoreJob";
import { Job } from "@/types/job";

let running = false;

// Prevent duplicate jobs
export function dedupeJobs(jobs: Job[]) {
  const map = new Map<string, Job>();
  for (const job of jobs) {
    if (job.redirect_url && !map.has(job.redirect_url)) {
      map.set(job.redirect_url, job);
    }
  }
  return Array.from(map.values());
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function POST(req: NextRequest) {
  if (running) {
    return NextResponse.json(
      { error: "Server is busy, try again in a few seconds." },
      { status: 429 },
    );
  }

  running = true;
  try {
    // Get user cv
    const { cv: parsedCV } = await req.json();

    // User check
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!parsedCV) {
      return NextResponse.json({ error: "CV data missing" }, { status: 400 });
    }

    // Extract keywords
    const keywords = await extractJobKeywordsWithGroq(parsedCV);
    const safeKeywords = keywords.slice(0, 5);

    // Fetch jobs sequential + delay
    const countries = ["sg", "us"];
    const allJobs: Job[] = [];

    for (const country of countries) {
      for (const keyword of safeKeywords) {
        try {
          const jobs = await AdzunaJobs(keyword, country);
          allJobs.push(...jobs);
          await sleep(1000);
        } catch (err) {
          console.warn(`⚠️ ${country} - ${keyword} failed`, err);
        }
      }
    }

    // Prevent duplicate jobs
    const uniqueJobs = dedupeJobs(allJobs);

    // Pre-score
    const preScoredJobs = uniqueJobs
      .slice(0, 30)
      .map((job) => ({
        ...job,
        preScore: preScoreJob(
          {
            title: job.title,
            description: job.description ?? "",
            location: job.location,
          },
          safeKeywords,
          parsedCV,
        ),
      }))
      .filter((job) => job.preScore >= 40)
      .sort((a, b) => b.preScore - a.preScore);

    // Limit Groq job match
    const jobsForRanking = preScoredJobs.slice(0, 30).map((job) => ({
      id: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      description: job.description ?? "",
      redirect_url: job.redirect_url,
    }));

    // Rank by Groq
    const rankedJobs = await rankJobsWithGroq(parsedCV, jobsForRanking);

    return NextResponse.json({
      jobs: rankedJobs,
    }, { status: 200 });
  } catch (err: unknown) {
    console.error(err);

    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  } finally {
    running = false;
  }
}
