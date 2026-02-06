export type ParsedCV = {
  skills: string[] | string;
  experience: {
    title?: string;
    description?: string;
  }[];
  education: {
    degree?: string;
    field?: string;
  }[];
};

export function preScoreJob(
  job: {
    title: string;
    description: string;
    location?: string;
  },
  jobSkills: string[] | string, // extracted skills from job
  cv: ParsedCV,
) {

  const cvSkills = Array.isArray(cv.skills) ? cv.skills.map((s) => s.toLowerCase()) : [cv.skills.toLowerCase()];
  const requiredSkills = Array.isArray(jobSkills) ? jobSkills.map((s) => s.toLowerCase()) : [jobSkills.toLowerCase()];

  /* ---------------- SKILL SCORE (0–70) ---------------- */
  const matchedSkills = requiredSkills.filter((skill) =>
    cvSkills.includes(skill),
  );

  const skillScore =
    requiredSkills.length > 0
      ? (matchedSkills.length / requiredSkills.length) * 70
      : 0;

  /* ------------- EXPERIENCE SCORE (0–20) -------------- */
  const expText = cv.experience
    .map((e) => `${e.title ?? ""} ${e.description ?? ""}`)
    .join(" ")
    .toLowerCase();

  const experienceMatch =
    expText && job.title
      ? job.title
          .toLowerCase()
          .split(" ")
          .some((word) => expText.includes(word))
      : false;

  const experienceScore = experienceMatch ? 20 : 0;

  /* -------------- EDUCATION SCORE (0–10) --------------- */
  const eduText = cv.education
    .map((e) => `${e.degree ?? ""} ${e.field ?? ""}`)
    .join(" ")
    .toLowerCase();

  // Generic education keywords untuk semua bidang
  const genericEduKeywords = [
    "computer", "informatics", "software", "engineering",
    "culinary", "hospitality", "food",
    "business", "management", "marketing", "finance",
    "arts", "design", "creative",
    "science", "mathematics", "physics", "biology",
    "law", "education", "nursing", "health", "medicine",
    "social", "psychology", "communication"
  ];

  const educationScore = eduText && genericEduKeywords.some((k) => eduText.includes(k)) ? 10 : 0;

  /* ---------------- FINAL SCORE ---------------- */
  const totalScore = skillScore + experienceScore + educationScore;

  return Math.max(0, Math.min(100, Math.round(totalScore)));
}
