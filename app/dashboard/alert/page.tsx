"use client";

import DashNav from "@/components/dashboard/DashNav";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useUser } from "@/context/UserContext";
import { createClient } from "@/lib/supabase/client";
import { Bell } from "lucide-react";
import { useEffect, useState } from "react";

type Alerts = {
  title: string;
  token: string;
  created_at: string;
};

export default function AlertPage() {
  const supabase = createClient();
  const { user } = useUser();
  const [alerts, setAlerts] = useState<Alerts[]>([]);
  const [loading, setLoading] = useState(false);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  useEffect(() => {
    setLoading(true);
    const fetchAlerts = async () => {
      try {
        if (!user) return;

        const { data: alertSent, error: alertError } = await supabase
          .from("job_alerts_sent")
          .select("alert_id, token, created_at, jobs")
          .eq("user_id", user.id);

        if (alertError) {
          console.error("Failed to fetch job alerts", alertError);
          return;
        }

        if (!alertSent || alertSent.length === 0) {
          setAlerts([]);
          return;
        }

        const alertPromises = alertSent.map((a) =>
          supabase
            .from("job_alerts")
            .select("job_title")
            .eq("id", a.alert_id)
            .single(),
        );

        const alertResults = await Promise.all(alertPromises);
        const alertsData = alertResults.map((res, idx) => ({
          title: res.data?.job_title || "",
          token: alertSent[idx].token,
          created_at: alertSent[idx].created_at,
        }));

        setAlerts(alertsData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, []);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  return (
    <div className="flex flex-col items-center min-h-screen">
      <DashNav />
      <div className="container pt-20 px-5">
        <h1 className="text-4xl font-semibold mb-5">Alert</h1>
        {loading && (
          <div className="fixed inset-0 flex justify-center items-center z-50">
            <Spinner className="w-10 h-10 text-blue-600" />
          </div>
        )}
        {alerts.length === 0 && !loading && (
          <div className="flex justify-center py-6">
            <p className="text-gray-500 font-semibold text-2xl max-w-lg text-center p-5">
              No alerts found.
            </p>
          </div>
        )}
        <ul className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5">
          {alerts.map((a) => (
            <li key={a.token}>
              <a href={`${baseUrl}/dashboard/alert/${a.token}`} target="_blank">
                <Card className="p-5 flex flex-row items-center gap-3 shadow hover:shadow-lg">
                  <Bell className="text-gray-500" />
                  <p className="text-center">
                    <strong>{a.title}</strong>
                    <br />
                    <span>{formatDate(a.created_at)}</span>
                  </p>
                </Card>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
