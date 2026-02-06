import { CV } from "@/types/job";
import axios from "axios";

function normalizeCV(parsed: CV) {
  return {
    name: parsed.name ?? undefined,
    email: parsed.email ?? undefined,
    phone: parsed.phone ?? undefined,

    skills: Array.isArray(parsed.skills)
      ? [
          ...new Set(
            parsed.skills
              .map((s: string) => s.toLowerCase().trim())
              .filter(
                (s: string) =>
                  s.length > 1 &&
                  s.length < 30 &&
                  !s.includes("skill") &&
                  !s.includes("ability"),
              ),
          ),
        ].slice(0, 20)
      : [],

    experience: Array.isArray(parsed.experience)
      ? parsed.experience
          .map((e: string) => e.toLowerCase().trim())
          .filter(
            (e: string) =>
              e.length > 2 &&
              e.split(" ").length <= 5 &&
              !e.includes("worked") &&
              !e.includes("responsible"),
          )
          .slice(0, 5)
      : [],

    education: Array.isArray(parsed.education)
      ? parsed.education
          .map((e: string) => e.toLowerCase().trim())
          .filter((e: string) => e.length > 2 && e.length < 40)
          .slice(0, 3)
      : [],
  };
}

export const parseWithGroq = async (cvText: string) => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY not found");
  }

  const response = await axios.post(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      model: "llama-3.1-8b-instant",
      temperature: 0,
      max_tokens: 1200,
      messages: [
        {
          role: "system",
          content: "You extract structured CV data and return valid JSON only.",
        },
        {
          role: "user",
          content: `
Extract CV information and return EXACTLY this JSON:

{
  "name": string | undefined,
  "email": string | undefined,
  "phone": string | undefined,
  "skills": string[],
  "experience": string[],
  "education": string[]
}

STRICT RULES:
- skills: ONLY technical/hard skills (tools, languages, frameworks)
- skills: lowercase, no soft skills, max 20 items
- skills: no duplicates

- experience: ONLY job titles or roles
- experience: short (2–5 words)
- experience: max 5 items
- experience: no company names, no dates, no descriptions

- education: ONLY degree or major
- education: short (2–5 words)
- education: max 3 items

- Return ONLY valid JSON
- No explanation
- No markdown
- No extra text

CV TEXT:
${cvText}
`.trim(),
        },
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

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Groq returned invalid JSON");

  const rawParsed = JSON.parse(jsonMatch[0]);
  const cleanParsed = normalizeCV(rawParsed);

  return cleanParsed;
};
