import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashNav from "../../components/dashboard/DashNav";
import Recommendations from "@/components/dashboard/Recommend";
import DashClient from "@/components/dashboard/DashClient";
import SavedJobs from "@/components/dashboard/SavedJobs";

async function UserDetails() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  return JSON.stringify(data.claims, null, 2);
}

export default function DashPage() {
  return (
    <div className="flex flex-col items-center">
      <DashNav />

      <div className="container pt-20 px-5 grid grid-rows-[auto] gap-10 min-h-screen">
        <DashClient />
        <Recommendations />
        <SavedJobs />
      </div>
    </div>
  );
}
