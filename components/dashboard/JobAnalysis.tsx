"use client";

import { useState } from "react";
import { Dialog } from "@headlessui/react";
import { Spinner } from "@/components/ui/spinner";
import { Job } from "@/types/job";
import { useUser } from "@/context/UserContext";
import { getParsedCV } from "@/lib/cv/parsedCV";

interface Props {
  job: Job;
  analysisResults: { [jobId: string]: any };
  setAnalysisResults: React.Dispatch<
    React.SetStateAction<{ [jobId: string]: any }>
  >;
}

export default function JobAnalysis({
  job,
  analysisResults,
  setAnalysisResults,
}: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [loadingJob, setLoadingJob] = useState(false);
  const jobId = job.id ?? `job-${Math.random().toString(36).substring(2, 9)}`;
  const currentAnalysis = analysisResults[jobId];
  const { user } = useUser();

  const handleAnalyze = async () => {
    if (currentAnalysis) {
      setModalOpen(true);
      return;
    }

    setLoadingJob(true);
    setModalOpen(true);

    try {
      if (!user) return;
      const userId = user.id;

      const cachedCV = await getParsedCV(userId);
      if (!cachedCV) throw new Error("CV not found");
      
      const res = await fetch("/api/analyze-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cv: cachedCV,
          job: {
            id: jobId,
            title: job.title,
            company: job.company,
            location: job.location,
            description: job.description,
          },
        }),
      });

      const data = await res.json();

      setAnalysisResults((prev) => {
        const newState = { ...prev, [jobId]: data.analysis };
        sessionStorage.setItem("analysisResults", JSON.stringify(newState));
        return newState;
      });
    } catch (err) {
      console.error(err);
      setAnalysisResults((prev) => {
        const newState = { ...prev, [jobId]: { error: "Unexpected error" } };
        sessionStorage.setItem("analysisResults", JSON.stringify(newState));
        return newState;
      });
    } finally {
      setLoadingJob(false);
    }
  };

  return (
    <>
      <button
        onClick={handleAnalyze}
        className="ml-3 text-white bg-blue-600 px-3 py-1 rounded hover:bg-blue-500"
      >
        Analyze
      </button>

      <Dialog
        key={jobId}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      >
        <div className="bg-white rounded max-w-lg w-full max-h-[80vh] overflow-y-auto p-5">
          <h2 className="text-xl font-bold mb-3">Job Analysis</h2>

          {loadingJob && (
            <div className="flex justify-center py-6">
              <Spinner className="w-10 h-10 text-blue-600" />
            </div>
          )}

          {!loadingJob && currentAnalysis ? (
            currentAnalysis.error ? (
              <p className="text-red-500">{currentAnalysis.error}</p>
            ) : (
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Strengths:</strong>{" "}
                  {currentAnalysis.strengths?.join(", ") ?? "N/A"}
                </p>
                <p>
                  <strong>Weaknesses:</strong>{" "}
                  {currentAnalysis.weaknesses?.join(", ") ?? "N/A"}
                </p>
                <p>
                  <strong>Suggestions:</strong>{" "}
                  {currentAnalysis.suggestions?.join(", ") ?? "N/A"}
                </p>
              </div>
            )
          ) : !loadingJob ? (
            <p className="text-gray-500">No analysis available.</p>
          ) : null}

          <button
            className="mt-4 bg-gray-300 px-3 py-1 rounded"
            onClick={() => setModalOpen(false)}
          >
            Close
          </button>
        </div>
      </Dialog>
    </>
  );
}
