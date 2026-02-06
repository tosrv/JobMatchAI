export interface Job {
  id?: string;
  title: string;
  company: string;
  location: string;
  description?: string;
  created?: string;
  redirect_url?: string;
  matchScore?: number;
}

export interface CV {
  name?: string;
  email?: string;
  phone?: string;
  skills?: string[];
  experience?: string[];
  education?: string[];
}

export interface Alerts {
  id: string;
  user_id: string;
  job_title: string;
  location: string;
  email: string;
  is_remote: boolean;
  frequency: string;
  min_match_score: number;
  is_active: boolean;
}

export interface AnalysisResult {
  strengths?: string[];
  weaknesses?: string[];
  suggestions?: string[];
  error?: string;
}

export const countries = [
  { label: "Singapore", value: "sg" },
  { label: "United States", value: "us" },
  { label: "United Kingdom", value: "gb" },
  { label: "Australia", value: "au" },
];
