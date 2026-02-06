import { AdzunaJobs } from "../adzuna/AdzunaJobs";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { rankJobsWithGroq } from "../groq/jobMatch";
import resend from "@/lib/resend/mail";
import { dedupeJobs } from "@/app/api/best-jobs/route";
import crypto from "crypto";
import { Alerts, Job } from "@/types/job";

export async function processJobAlert(alertData: Alerts) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  try {
    const today = new Date().toISOString().split("T")[0];

    const { data: existingSent } = await supabaseAdmin
      .from("job_alerts_sent")
      .select("id")
      .eq("alert_id", alertData.id)
      .gte("created_at", today)
      .maybeSingle();

    if (existingSent) {
      console.log("Email sudah dikirim untuk alert ini hari ini.");
      return;
    }

    const { data: cvData } = await supabaseAdmin
      .from("cvs")
      .select("parsed_data")
      .eq("user_id", alertData.user_id)
      .maybeSingle();

    if (!cvData?.parsed_data) return;

    console.log(cvData, "ini cv");

    const allJobs: Job[] = [];

    if (alertData.is_active === true) {
      const jobs = await AdzunaJobs(
        alertData.job_title,
        alertData.location,
        alertData.is_remote,
      );
      if (!jobs.length) return;

      allJobs.push(...jobs);
      const uniqueJobs = dedupeJobs(allJobs);

      console.log(jobs, "hasil search job");

      const jobsForRanking = uniqueJobs.map((job) => ({
        id: job.id,
        title: job.title,
        company: job.company,
        location: job.location,
        description: job.description ?? "",
        redirect_url: job.redirect_url,
      }));

      const rankedJobs = await rankJobsWithGroq(
        cvData.parsed_data,
        jobsForRanking,
      );

      console.log(rankedJobs, "score dari groq");

      const emailJobs = rankedJobs
        .filter((job: Job) => job.matchScore! >= alertData.min_match_score)
        .sort((a: Job, b: Job) => b.matchScore! - a.matchScore!)
        .slice(0, 5)
        .map((job: Job) => ({
          ...job,
          company: job.company || "Unknown Company",
          description: job.description ?? "",
          redirect_url: job.redirect_url ?? "",
        }));
      if (emailJobs.length === 0) return;
      
      console.log(emailJobs, "email jobs");

      const token = crypto.randomUUID();

      await supabaseAdmin.from("job_alerts_sent").insert({
        user_id: alertData.user_id,
        alert_id: alertData.id,
        jobs: emailJobs,
        token,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });

      const emailLink = `${baseUrl}/dashboard/alert/${token}`;

      const html = `
        <h2>Job Recommendations</h2>
        <ul>
          ${emailJobs
            .map(
              (job: Job) => `
            <li>
              <strong>${job.title}</strong><br/>
              Company: ${job.company}<br/>
              Match Score: ${job.matchScore}%
            </li>
          `,
            )
            .join("")}
        </ul>
        <a href="${emailLink}">View in App</a>
      `;

      await resend.emails.send({
        from: "jobmatcher@resend.dev",
        to: alertData.email,
        subject: "Your Job Recommendations",
        html,
      });
    }
  } catch (err) {
    console.error("processJobAlert error:", err);
  }
}
