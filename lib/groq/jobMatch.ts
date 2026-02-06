import { CV } from "@/types/job";
import axios from "axios";

export async function rankJobsWithGroq(parsedCV: CV, jobs: any[]) {
  if (!jobs.length) return [];

  const jobsToRank = jobs.slice(0, 30);

  const cvSkills = parsedCV.skills?.join(", ") || "";
  const cvExperience = parsedCV.experience?.join(", ") || "";
  const cvEducation = parsedCV.education?.join(", ") || "";

  console.log(parsedCV, "parsedCV");

  const cvText = `
Skills: ${cvSkills}
Experience: ${cvExperience}
Education: ${cvEducation}
  `.trim();

  const jobsText = jobsToRank
    .map(
      (job, i) =>
        `${i + 1}. Title: ${job.title}\nDescription: ${job.description}`,
    )
    .join("\n\n");

  const prompt = `
Candidate CV:
${cvText}

Jobs:
${jobsText}

Instructions:
- Evaluate how well each job matches the candidate
- Compare jobs RELATIVE to each other
- Use the full range of scores
- Avoid giving too many zeros unless the job is clearly unrelated

Score scale:
0 = clearly unrelated
1 = weak match
2 = partial match
3 = strong match
4 = excellent match

Return:
- JSON array of NUMBERS ONLY
- Length MUST be exactly ${jobsToRank.length}
- Order must match input
- No explanation
`.trim();

  // Panggil Groq
  const response = await axios.post(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      model: "llama-3.1-8b-instant",
      temperature: 0,
      max_tokens: 1200,
      messages: [
        {
          role: "system",
          content:
            "You are a job matching system. Return ONLY valid JSON array of numbers.",
        },
        { role: "user", content: prompt },
      ],
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
    },
  );

  const text = response.data?.choices?.[0]?.message?.content;
  if (!text) throw new Error("Groq returned empty response");

  console.log(text);

  // 🔒 VALIDASI KETAT
  if (!text.startsWith("[") || !text.endsWith("]")) {
    console.error("❌ Groq output invalid:", text);
    throw new Error("Groq response is not valid JSON array");
  }

  const scores: number[] = JSON.parse(text);

  if (scores.length !== jobsToRank.length) {
    throw new Error(
      `Groq returned ${scores.length} scores, expected ${jobsToRank.length}`,
    );
  }

  const tierToScore = [0, 30, 55, 80, 95];

  const rankedJobs = jobsToRank.map((job, i) => ({
    ...job,
    matchScore: tierToScore[scores[i]] ?? 0,
  }));

  console.log("✅ final ranked jobs (Groq matchScore only):", rankedJobs);

  return rankedJobs;
}
