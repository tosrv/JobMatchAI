"use client";

import { ChevronLeft, MapPin, PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import {
  Card,
  CardAction,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { JobAlertDialog } from "@/components/alert/AlertDialog";
import toast, { Toaster } from "react-hot-toast";
import { Alerts, countries } from "@/types/job";
import { useUser } from "@/context/UserContext";

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [alerts, setAlerts] = useState<Alerts[]>([]);
  const [alertOpen, setAlertOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<Alerts | null>(null);
  const supabase = createClient();
  const { user } = useUser();

  useEffect(() => {
    const fetchAlerts = async () => {
      setLoading(true);
      try {
        if (!user) return;

        const { data, error } = await supabase
          .from("job_alerts")
          .select("*")
          .eq("user_id", user.id);

        if (!data || data.length === 0) {
          setAlertOpen(true);
        }

        if (error) {
          console.error("Failed to fetch job alerts", error);
          return;
        }

        setAlerts(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, []);

  const handleDeleteAlert = async (id: string) => {
    try {
      const { error } = await supabase.from("job_alerts").delete().eq("id", id);
      if (error) {
        console.error("Failed to delete job alert", error);
        return;
      }
      setAlerts((prevAlerts) => prevAlerts.filter((alert) => alert.id !== id));

      setTimeout(() => {
        toast.success("Job alert deleted successfully!");
      }, 500);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleAlert = async (alertId: string, currentStatus: boolean) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("job_alerts")
        .update({ is_active: !currentStatus })
        .eq("id", alertId);

      if (error) {
        console.error("Failed to update alert status", error);
        return;
      }

      setAlerts((prev) =>
        prev.map((a) =>
          a.id === alertId ? { ...a, is_active: !currentStatus } : a,
        ),
      );

    } catch (err) {
      console.error(err);
    }
  };

  const handleAlertSaved = (newAlert: Alerts) => {
    setAlerts((prev) => [newAlert, ...prev]);
  };

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />

      <div className="flex justify-center items-start min-h-screen">
        <header className="w-full z-50 fixed top-0 pt-5 flex justify-center py-3 backdrop-blur-3xl shadow-sm">
          <nav className="container grid grid-cols-[auto_1fr_auto] w-full mx-auto items-baseline">
            <section
              className="hover:cursor-pointer text-gray-500 hover:text-black"
              onClick={() => router.push("/dashboard")}
            >
              <ChevronLeft />
            </section>
            <h2 className="font-semibold text-2xl text-center">
              Manage Alerts
            </h2>

            <section className="flex justify-end p-1">
              <button
                onClick={() => setAlertOpen(true)}
                className="bg-blue-500 rounded-full text-white font-semibold py-1 px-1 sm:px-3  hover:bg-blue-600 w-fit"
              >
                <span className="hidden md:inline">New Alert</span>
                <PlusCircle className="inline md:hidden" />
              </button>
            </section>
          </nav>
        </header>

        {loading && (
          <div className="fixed inset-0 flex justify-center items-center z-50">
            <Spinner className="w-10 h-10 text-blue-600" />
          </div>
        )}

        <div className="w-full flex justify-center">
          <ul className="w-full max-w-xl mx-auto flex flex-col gap-4 px-4 mt-24 mb-24">
            {alerts.map((alert) => (
              <li key={alert.id}>
                <Card className="p-5 w-full shadow hover:shadow-lg">
                  <CardTitle className="text-2xl">{alert.job_title}</CardTitle>
                  <CardDescription className="flex justify-between flex-wrap gap-4">
                    <div className="">
                      <section className="flex mb-1">
                        <span className="p-1">
                          <MapPin className="w-5 h-5" />
                        </span>
                        <div>
                          <p className="font-semibold text-xl">
                            {
                              countries.find((c) => c.value === alert.location)
                                ?.label
                            }
                          </p>
                          <p>{alert.is_remote ? "Remote" : "Onsite"}</p>
                        </div>
                      </section>
                      <section className="flex gap-2">
                        <p className="font-semibold text-blue-700 bg-blue-300/50 rounded-full px-3 py-1 w-fit">
                          AI Score &gt; {alert.min_match_score}%
                        </p>
                        <p className="font-medium bg-gray-300/50 rounded-full px-3 py-1 w-fit">
                          {alert.frequency}
                        </p>
                      </section>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">
                        {alert.is_active ? "Active" : "Inactive"}
                      </span>

                      <button
                        onClick={() =>
                          handleToggleAlert(alert.id, alert.is_active)
                        }
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                          alert.is_active ? "bg-green-500" : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                            alert.is_active ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  </CardDescription>
                  <CardAction className="w-full flex justify-end gap-2">
                    <button
                      onClick={() => {
                        setSelectedAlert(alert);
                        setAlertOpen(true);
                      }}
                      className="bg-blue-500 rounded-full text-white font-semibold py-1 px-3 hover:bg-blue-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteAlert(alert.id)}
                      className="bg-red-500 rounded-full text-white font-semibold py-1 px-3 hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </CardAction>
                </Card>
              </li>
            ))}
          </ul>
        </div>
        <JobAlertDialog
          open={alertOpen}
          setOpen={setAlertOpen}
          alertData={selectedAlert || undefined}
          onSave={(newAlert) => setAlerts((prev) => [newAlert, ...prev])}
        />
      </div>
    </>
  );
}
