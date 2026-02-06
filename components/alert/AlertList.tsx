"use client";

import { Bookmark, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardAction, CardDescription, CardTitle } from "../ui/card";
import { AnalysisResult, Job } from "@/types/job";
import JobAnalysis from "../dashboard/JobAnalysis";
import { useEffect, useState } from "react";
import { useSavedJobs } from "@/context/SavedJobContext";

interface Props {
  job: Job[];
}

export default function AlertList({ job }: Props) {
  const [analysisResults, setAnalysisResults] = useState<
    Record<string, AnalysisResult>
  >({});
  const { toggleSave, isSaved } = useSavedJobs();

  useEffect(() => {
    const cached = sessionStorage.getItem("analysisResults");
    if (cached) {
      setAnalysisResults(JSON.parse(cached));
    }
  }, []);

  if (!job || job.length === 0)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-2xl text-gray-500">Jobs not found or expired.</p>
      </div>
    );

  return (
    <div className="flex flex-col justify-center items-center min-h-screen w-full p-5">
      <div className="max-w-7xl mx-auto mt-24">
        <h2 className="text-2xl text-center font-bold mb-5">
          Your Job Recommendations
        </h2>
        <ul className="pb-24 grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
          {job.map((job, i) => (
            <li key={i}>
              <Card className="p-5 hover:shadow-lg w-full max-w-xl h-full flex flex-col justify-between">
                <div className="flex justify-between">
                  <Badge className="bg-green-500/70">
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

                <CardAction className="flex justify-around items-center w-full gap-2">
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
      </div>
    </div>
  );
}
