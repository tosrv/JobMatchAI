"use client";

import { useEffect, useState } from "react";
import { Spinner } from "../ui/spinner";
import { getParsedCV } from "@/lib/cv/parsedCV";
import { AnalysisResult, Job } from "@/types/job";
import { useSavedJobs } from "@/context/SavedJobContext";
import JobCard from "./JobCard";
import { useUser } from "@/context/UserContext";

export default function Recommendations() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useUser();

  const [analysisResults, setAnalysisResults] = useState<
    Record<string, AnalysisResult>
  >({});
  const [viewAll, setViewAll] = useState(false);
  const displayedJobs = viewAll ? jobs : jobs.slice(0, 5);

  const { toggleSave, isSaved } = useSavedJobs();

  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  useEffect(() => {
    const loadJobs = async () => {
      setLoading(true);
      try {
        if (!user) return;

        const userId = user.id;
        const cachedCV = await getParsedCV(userId);
        if (!cachedCV) throw new Error("CV not found");

        const cached = sessionStorage.getItem("bestJobs");
        if (cached) {
          setJobs(JSON.parse(cached));
          return;
        }

        const res = await fetch("/api/best-jobs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cv: cachedCV }),
        });

        await sleep(12000);

        const data = await res.json();

        const filtered = (data.jobs || [])
          .filter((job: Job, index: number) => index !== 0 && job.title)
          .filter((job: Job) => job.matchScore! >= 70)
          .sort((a: Job, b: Job) => b.matchScore! - a.matchScore!);

        setJobs(filtered);
        sessionStorage.setItem("bestJobs", JSON.stringify(filtered));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false); 
      }
    };

    loadJobs();
  }, []);

  useEffect(() => {
    const cached = sessionStorage.getItem("analysisResults");
    if (cached) {
      setAnalysisResults(JSON.parse(cached));
    }
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-2xl font-semibold mb-5">Recommendations</h2>
        {jobs.length > 5 && (
          <div className="flex justify-center mt-4">
            <button
              className="text-blue-500 hover:text-blue-800 font-semibold"
              onClick={() => setViewAll(!viewAll)}
            >
              {viewAll ? "View Less" : "View More"}
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <Spinner className="w-10 h-10 text-blue-600" />
        </div>
      ) : jobs.length === 0 ? (
        <div className="flex justify-center py-6">
          <p className="text-gray-500 font-semibold text-2xl max-w-lg text-center p-5">
            Add skills to your profile to get personalized job recommendations.
          </p>
        </div>
      ) : null}

      <ul className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5">
        {displayedJobs.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            toggleSave={toggleSave}
            isSaved={isSaved}
            analysisResults={analysisResults}
            setAnalysisResults={setAnalysisResults}
          />
        ))}
      </ul>
    </div>
  );
}
