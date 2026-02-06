"use client";

import { Job } from "@/types/job";
import { Card, CardAction, CardDescription, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Bookmark } from "lucide-react";
import JobAnalysis from "./JobAnalysis";

interface JobCardProps {
  job: Job;
  toggleSave: (job: Job) => void;
  isSaved: (job: Job) => boolean;
  analysisResults: any;
  setAnalysisResults: (results: any) => void;
}

export default function JobCard({
  job,
  toggleSave,
  isSaved,
  analysisResults,
  setAnalysisResults,
}: JobCardProps) {
  return (
    <li>
      <Card className="p-5 h-full flex flex-col justify-between hover:shadow-lg gap-3">
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
                isSaved(job) ? "fill-blue-600 text-blue-600" : "text-gray-500"
              }
            />
          </button>
        </div>

        <CardTitle className="mt-3">{job.title}</CardTitle>
        <CardDescription>
          <p>{job.company}</p>
          <p>{job.location}</p>
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
  );
}
