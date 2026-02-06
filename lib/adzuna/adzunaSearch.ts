import { Job } from "@/types/job";
import axios from "axios";

const APP_ID = process.env.ADZUNA_APP_ID!;
const APP_KEY = process.env.ADZUNA_APP_KEY!;

export async function AdzunaSearch(
  skill: string,
  country: string = "sg",
  remoteOnly: boolean = false,
) {
  try {
    if (!skill) return []; 

    let keyword = skill;
    if (remoteOnly) {
      keyword += " remote"; // filter remote jobs
    }

    const url = `https://api.adzuna.com/v1/api/jobs/${country}/search/1?app_id=${APP_ID}&app_key=${APP_KEY}&what=${encodeURIComponent(keyword)}&sort_by=date`;

    console.log(url, "link adzuna");

    const res = await axios.get(url);
    const jobs = res.data?.results || [];

    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - 7);

    const filtered = jobs.filter((job: Job) => {
      if (!job.created) return false;
      return new Date(job.created) >= dateThreshold;
    });

    console.log(jobs, "jobs dari adzuna");

    function getDisplayName(value: string | { display_name: string }): string {
      return typeof value === "string" ? value : value.display_name;
    }

    return filtered.map((job: Job) => ({
      id: job.id,
      title: job.title,
      company: getDisplayName(job.company) || "",
      location: getDisplayName(job.location) || "",
      description: job.description || "",
      redirect_url: job.redirect_url || "",
    }));
  } catch (err) {
    console.error("Adzuna fetch error:", err);
    return [];
  }
}
