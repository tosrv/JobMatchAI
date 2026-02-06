"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Job } from "@/types/job";

type SavedJobsMap = Record<
  string,
  {
    savedId: string;
    job_data: Job;
  }
>;

type SavedJobsContextType = {
  savedJobs: SavedJobsMap;
  toggleSave: (job: Job) => Promise<void>;
  isSaved: (job: Job) => boolean;
};

const SavedJobsContext = createContext<SavedJobsContextType | null>(null);

export const SavedJobsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const supabase = createClient();
  const [savedJobs, setSavedJobs] = useState<SavedJobsMap>({});

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("saved_jobs")
        .select("id, job_url, job_data")
        .eq("user_id", user.id);

      if (!data) return;

      const map: SavedJobsMap = {};
      data.forEach((j) => {
        map[j.job_url] = { savedId: j.id, job_data: j.job_data };
      });

      setSavedJobs(map);
    };

    load();
  }, []);

  const toggleSave = async (job: Job) => {
    const jobUrl = job.redirect_url;
    if (!jobUrl) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    if (savedJobs[jobUrl]) {
      // UNSAVE
      try {
        const { error } = await supabase
          .from("saved_jobs")
          .delete()
          .eq("id", savedJobs[jobUrl].savedId);

        if (error) console.error("Failed to unsave job:", error);

        setSavedJobs((prev) => {
          const next = { ...prev };
          delete next[jobUrl];
          return next;
        });
      } catch (err) {
        console.error("Unexpected error:", err);
      }
    } else {
      // SAVE
      try {
        const { data, error } = await supabase
          .from("saved_jobs")
          .insert({
            user_id: user.id,
            job_id: job.id,
            job_title: job.title,
            company: job.company,
            location: job.location,
            match_score: job.matchScore,
            job_url: jobUrl,
            job_data: job,
          })
          .select("id")
          .single();

        if (error) {
          console.error("Failed to save job:", error);
          return;
        }

        setSavedJobs((prev) => ({
          ...prev,
          [jobUrl]: { savedId: data.id, job_data: job },
        }));
      } catch (err) {
        console.error("Unexpected error:", err);
      }
    }
  };

  const isSaved = (job: Job) => {
    if (!job.redirect_url) return false;
    return !!savedJobs[job.redirect_url];
  };

  return (
    <SavedJobsContext.Provider value={{ savedJobs, toggleSave, isSaved }}>
      {children}
    </SavedJobsContext.Provider>
  );
};

export const useSavedJobs = () => {
  const ctx = useContext(SavedJobsContext);
  if (!ctx) throw new Error("useSavedJobs must be used inside provider");
  return ctx;
};
