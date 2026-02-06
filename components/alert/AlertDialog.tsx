"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import toast, { Toaster } from "react-hot-toast";
import { Alerts, countries } from "@/types/job";

type JobAlertDialogProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  alertData?: Alerts;
  onSave?: (newAlert: Alerts) => void;
};

export function JobAlertDialog({
  open,
  setOpen,
  alertData,
  onSave,
}: JobAlertDialogProps) {
  const [email, setEmail] = useState("");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [country, setCountry] = useState("sg");
  const [keyword, setKeyword] = useState("");
  const [frequency, setFrequency] = useState("weekly");
  const [matchScore, setMatchScore] = useState(70);
  const [userId, setUserId] = useState("");
  const supabase = createClient();

  useEffect(() => {
    const fetchEmail = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email || "");
        setUserId(user.id);
      }
    };
    fetchEmail();

    if (alertData) {
      setKeyword(alertData.job_title);
      setCountry(alertData.location);
      setRemoteOnly(alertData.is_remote);
      setFrequency(alertData.frequency);
      setMatchScore(alertData.min_match_score);
    }
  }, [alertData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (alertData) {
      // UPDATE existing alert
      const { error } = await supabase
        .from("job_alerts")
        .update({
          job_title: keyword,
          location: country,
          is_remote: remoteOnly,
          frequency,
          min_match_score: matchScore,
        })
        .eq("id", alertData.id);

      if (!error) {
        toast.success("Job alert updated successfully!");
        setOpen(false);
        onSave?.({
          ...alertData,
          job_title: keyword,
          location: country,
          is_remote: remoteOnly,
          frequency,
          min_match_score: matchScore,
        });
      }
    } else {
      // CREATE new alert
      const { data, error } = await supabase
        .from("job_alerts")
        .insert({
          user_id: userId,
          job_title: keyword,
          location: country,
          is_remote: remoteOnly,
          frequency,
          email,
          min_match_score: matchScore,
        })
        .select("*")
        .single();

      if (!error && data) {
        toast.success("Job alert set up successfully!");
        setOpen(false);
        onSave?.(data); 
      }
    }
  };

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg w-fit">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold tracking-tight text-center">
              Set Up Job Alert
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500 mt-1 text-center">
              Get notified of new AI-matched opportunities
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 px-2 pt-2">
            {/* Job Title */}
            <div className="space-y-1">
              <Label className="text-[11px] font-bold uppercase tracking-wider">
                Job Title
              </Label>
              <Input
                placeholder="e.g. Fullstack Developer"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="border focus:ring-0 !ring-0 focus:outline-none h-10 rounded-lg px-3 w-full"
              />
            </div>

            {/* Email */}
            <div className="space-y-1">
              <Label className="text-[11px] font-bold uppercase tracking-wider">
                Email
              </Label>
              <Input
                type="email"
                value={email}
                disabled
                className="bg-gray-100 text-gray-500 border outline-none h-10 rounded-lg px-3 w-full"
              />
            </div>

            <div className="flex flex-wrap gap-4">
              {/* Location */}
              <div className="space-y-1 w-52">
                <Label className="text-[11px] font-bold uppercase tracking-wider">
                  Location
                </Label>
                <div className="flex-1 flex items-center px-4 border rounded-xl">
                  <MapPin className="text-gray-400" />
                  <Select value={country} onValueChange={setCountry}>
                    <SelectTrigger className="border-0">
                      <SelectValue placeholder="Singapore" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country.value} value={country.value}>
                          {country.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Frequency */}
              <div className="space-y-1">
                <Label className="text-[11px] font-bold uppercase tracking-wider">
                  Frequency
                </Label>
                <Select value={frequency} onValueChange={setFrequency}>
                  <SelectTrigger className="rounded-xl px-3 py-3">
                    <SelectValue placeholder="Weekly" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              {/* Label & Current Value */}
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-bold uppercase tracking-wider">
                  Min. AI Match Score
                </label>
                <span className="text-sm font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  {matchScore}%
                </span>
              </div>

              {/* Range Slider */}
              <input
                type="range"
                min={50}
                max={100}
                value={matchScore}
                onChange={(e) => setMatchScore(Number(e.target.value))}
                className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
              />

              {/* Min & Max Labels */}
              <div className="flex justify-between text-[10px] text-gray-400 px-1">
                <span>50% Match</span>
                <span>100% Match</span>
              </div>
            </div>

            {/* Remote Only */}
            <div className="flex items-end pb-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="peer border-gray-300 text-primary focus:ring-primary transition-all cursor-pointer"
                  checked={remoteOnly}
                  onChange={(e) => setRemoteOnly(e.target.checked)}
                />
                <span className="font-medium text-gray-700">Remote only</span>
              </label>
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-3 mt-4">
              <Button
                type="submit"
                className="w-full bg-blue-800 text-lg hover:bg-blue-600 active:bg-blue-800"
              >
                Create Alert
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
