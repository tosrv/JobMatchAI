"use client";

import { useEffect, useState } from "react";
import DashNav from "../../../components/dashboard/DashNav";
import { Bookmark, ChevronRight, MapPin, Search } from "lucide-react";
import {
  Card,
  CardAction,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { JobAlertDialog } from "@/components/alert/AlertDialog";
import { AnalysisResult, countries, Job } from "@/types/job";
import { useSavedJobs } from "@/context/SavedJobContext";
import { useUser } from "@/context/UserContext";
import JobAnalysis from "@/components/dashboard/JobAnalysis";
import { getParsedCV } from "@/lib/cv/parsedCV";

export default function JobsPage() {
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState(countries[0].value);
  const [loading, setLoading] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const { toggleSave, isSaved } = useSavedJobs();
  const [jobs, setJobs] = useState<Job[]>([]);
  const { user } = useUser();

  const [analysisResults, setAnalysisResults] = useState<
    Record<string, AnalysisResult>
  >({});

  useEffect(() => {
    const cachedAnalysis = sessionStorage.getItem("analysisResults");
    if (cachedAnalysis) {
      setAnalysisResults(JSON.parse(cachedAnalysis));
    }

    const cachedJobs = sessionStorage.getItem("jobs");
    if (cachedJobs) {
      setJobs(JSON.parse(cachedJobs));
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem("jobs", JSON.stringify(jobs));
  }, [jobs]);

  const searchJobs = async () => {
    setLoading(true);
    try {
      if (!user) return;

      const userId = user.id;
      const cachedCV = await getParsedCV(userId);
      if (!cachedCV) throw new Error("CV not found");

      let url = "/api/search-jobs";
      let options: RequestInit = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      };

      if (keyword || location) {
        options.body = JSON.stringify({ keyword, location, cv: cachedCV });
      }

      const res = await fetch(url, options);
      const text = await res.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        console.error("Failed to parse JSON:", text);
        data = { rankJobs: [] };
      }

      setJobs(data.rankJobs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const supabase = createClient();

    const fetchAlerts = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("job_alerts")
        .select("id")
        .eq("user_id", user.id)
        .limit(1);

      if (error) {
        console.error("Failed to fetch job alerts", error);
        return;
      }

      if (!data || data.length === 0) {
        setAlertOpen(true);
      }
    };

    fetchAlerts();
  }, []);

  return (
    <div className="flex flex-col justify-center items-center min-h-screen w-full p-5">
      <DashNav />
      <div className="max-w-4xl mx-auto">
        <h3 className="text-4xl font-bold mb-8 text-center">
          Quick Job Search
        </h3>

        <div className="flex flex-col sm:flex-row gap-2 bg-white p-2 rounded-xl border border-gray-200 shadow-sm">
          {/* Job Title / Keywords */}
          <div className="flex-1 flex items-center px-4">
            <Search className="text-gray-400" />
            <input
              type="text"
              placeholder="Job title or keywords"
              className="w-full bg-transparent border-none outline-none px-3"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>

          {/* Divider */}
          <div className="hidden sm:block h-8 w-px self-center"></div>

          {/* Location */}
          <div className="flex-1 flex items-center px-4">
            <MapPin className="text-gray-400" />
            <select
              className="w-full bg-transparent border-none outline-none px-2"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            >
              {countries.map((country) => (
                <option key={country.value} value={country.value}>
                  {country.label}
                </option>
              ))}
            </select>
          </div>

          {/* Search Button */}
          <button
            className="bg-blue-600 text-white h-12 px-3 rounded-lg font-bold hover:bg-blue-500 active:bg-blue-800 text-2xl transition-all flex items-center justify-center gap-2"
            disabled={!keyword || !location || loading}
            onClick={searchJobs}
          >
            Search <ChevronRight />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-8">
        {loading ? (
          <div className="flex justify-center py-6">
            <Spinner className="w-10 h-10 text-blue-600" />
          </div>
        ) : !keyword ? (
          <div className="flex justify-center py-6">
            <p className="text-gray-500 font-semibold text-xl">
              Start search for jobs.
            </p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="flex justify-center py-6">
            <p className="text-gray-500 font-semibold text-xl">
              No result found.
            </p>
          </div>
        ) : (
          <ul className="pb-24 grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
            {[...jobs]
              .sort((a: Job, b: Job) => b.matchScore! - a.matchScore!)
              .map((job, idx) => (
                <li key={job.id ?? idx}>
                  <Card className="p-5 hover:shadow-lg w-full max-w-xl h-full flex flex-col justify-between">
                    <div className="flex justify-between">
                      <Badge className="bg-green-500/70 hover:bg-green-500/70 w-fit">
                        <span>{job.matchScore}% Match</span>
                      </Badge>
                      <button
                        onClick={() => toggleSave(job)}
                        className="text-gray-500 hover:text-blue-600 transition"
                      >
                        <Bookmark
                          className={
                            isSaved(job)
                              ? "fill-blue-600 text-blue-600"
                              : "text-gray-500"
                          }
                        />
                      </button>
                    </div>
                    <CardTitle className="mt-3 space-y-2">
                      <h3 className="font-semibold">{job.title}</h3>
                      <p className="text-gray-500 font-semibold">
                        {job.company}
                      </p>
                    </CardTitle>
                    <CardDescription>
                      <div className="text-gray-500 flex items-center space-x-2">
                        <MapPin className="h-4 w-4" />
                        <p>{job.location}</p>
                      </div>
                      <p className="text-gray-500">{job.description}</p>
                    </CardDescription>

                    <CardAction>
                      <a
                        href={job.redirect_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600"
                      >
                        View Detail
                      </a>
                      <JobAnalysis
                        job={job}
                        analysisResults={analysisResults}
                        setAnalysisResults={setAnalysisResults}
                      />
                    </CardAction>
                  </Card>
                </li>
              ))}
          </ul>
        )}

        <JobAlertDialog open={alertOpen} setOpen={setAlertOpen} />
      </div>
    </div>
  );
}
