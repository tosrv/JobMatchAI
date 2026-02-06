import { SavedJobsProvider } from "@/context/SavedJobContext";
import DashFooter from "../../components/dashboard/DashFooter";
import { Suspense } from "react";
import { UserProvider } from "@/context/UserContext";

export default function DashLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main>
      <UserProvider>
        <SavedJobsProvider>
          <div className="bg-gradient-to-br from-red-100/70 via-purple-50/50 to-blue-100/70">
            {children}
          </div>
        </SavedJobsProvider>
      </UserProvider>
      <footer className="fixed bottom-0 w-full border-t">
        <Suspense>
          <DashFooter />
        </Suspense>
      </footer>
    </main>
  );
}
