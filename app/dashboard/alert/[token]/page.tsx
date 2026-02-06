import AlertList from "@/components/alert/AlertList";
import DashNav from "@/components/dashboard/DashNav";
import { fetchAlert } from "@/lib/alert/emailAlert";

interface Props {
  params: Promise<{ token: string }>;
}

export default async function AlertPage({ params }: Props) {
  const { token } = await params;
  const row = await fetchAlert(token);

  const jobs = !row || new Date(row.expires_at) < new Date() ? [] : row.jobs;

  return (
    <div className="flex flex-col min-h-screen">
      <DashNav />
      <AlertList job={jobs} />
    </div>
  );
}
