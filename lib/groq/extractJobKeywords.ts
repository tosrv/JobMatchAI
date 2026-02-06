import { CV } from "@/types/job";
import axios from "axios";

export async function extractJobKeywordsWithGroq(
  parsedCV: CV
): Promise<string[]> {
  const textToAnalyze = `
Skills: ${parsedCV.skills?.join(", ") || ""}
Experience: ${parsedCV.experience?.join(", ") || ""}
Education: ${parsedCV.education?.join(", ") || ""}
`.trim();

  const response = await axios.post(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      model: "llama-3.1-8b-instant",
      temperature: 0,
      max_tokens: 150,
      messages: [
        {
          role: "system",
          content:
            "You extract job search keywords from a CV. Return JSON only.",
        },
        {
          role: "user",
          content: `
Extract EXACTLY 5 job search keywords.

Return ONLY this JSON format:

{
  "keywords": ["string", "string", "string", "string", "string"]
}

Rules:
- Must be job titles or core skills
- Short phrases
- No duplicates
- No explanation

CV:
${textToAnalyze}
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
  if (!text) throw new Error("Groq empty response");

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Invalid Groq JSON");

  const parsed = JSON.parse(jsonMatch[0]);

  if (!Array.isArray(parsed.keywords)) {
    throw new Error("Groq keywords is not array");
  }

  return parsed.keywords.slice(0, 5);
}
