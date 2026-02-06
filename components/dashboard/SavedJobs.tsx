"use client";

import { useSavedJobs } from "@/context/SavedJobContext";
import { useEffect, useState } from "react";
import { AnalysisResult, Job } from "@/types/job";
import JobCard from "./JobCard";

export default function SavedJobs() {
  const { savedJobs, toggleSave, isSaved } = useSavedJobs();
  const [viewAll, setViewAll] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<
    Record<string, AnalysisResult>
  >({});
  const savedJobsArray = Object.values(savedJobs)
    .map((item) => item.job_data)
    .filter((job): job is Job => !!job);
  const displayedJobs = viewAll ? savedJobsArray : savedJobsArray.slice(0, 5);

  useEffect(() => {
    const cached = sessionStorage.getItem("analysisResults");
    if (cached) {
      setAnalysisResults(JSON.parse(cached));
    }
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-2xl font-semibold mb-5">Saved Jobs</h2>
        {savedJobsArray.length > 5 && (
          <div className="flex justify-center">
            <button
              className="text-blue-500 hover:text-blue-800 font-semibold"
              onClick={() => setViewAll(!viewAll)}
            >
              {viewAll ? "View Less" : "View More"}
            </button>
          </div>
        )}
      </div>

      {savedJobsArray.length === 0 ? (
        <div className="flex justify-center py-6">
          <p className="text-gray-500 font-semibold text-2xl max-w-lg text-center p-5">
            No job saved yet.
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5 pb-24">
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
      )}
    </div>
  );
}
