import { Job } from "@/types/job";
import axios from "axios";

export const analyzeJobWithGroq = async (cvText: string, jobData: Job) => {
  const response = await axios.post(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      model: "llama-3.1-8b-instant",
      temperature: 0,
      max_tokens: 1200,
      messages: [
        {
          role: "system",
          content: "You are an expert recruiter AI. Compare CV with job description and return JSON.",
        },
        {
          role: "user",
          content: `
Compare the CV below with this job:

CV:
${cvText}

Job:
Title: ${jobData.title}
Company: ${jobData.company}
Location: ${jobData.location}
Description: ${jobData.description}

Return EXACTLY JSON:
{
  "score": number, // 0-100
  "strengths": string[], 
  "weaknesses": string[], 
  "suggestions": string[]
}

Rules:
- JSON only, no explanation
- Valid JSON only
        `.trim(),
        },
      ],
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  const text = response.data?.choices?.[0]?.message?.content;
  if (!text) throw new Error("Groq returned empty response");

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Groq returned invalid JSON format");

  return JSON.parse(jsonMatch[0]);
};
