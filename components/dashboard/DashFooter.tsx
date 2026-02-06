"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BriefcaseBusiness,
  Bell,
  File,
  Settings,
} from "lucide-react";

export default function DashFooter() {
  const pathname = usePathname();
  const router = useRouter();

  const menu = [
    {
      name: "Dashboard",
      id: "dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "CV",
      id: "upload-cv",
      path: "/dashboard/cv",
      icon: File,
    },
    {
      name: "Jobs",
      id: "jobs",
      path: "/dashboard/jobs",
      icon: BriefcaseBusiness,
    },
    { name: "Alert", id: "alert", path: "/dashboard/alert", icon: Bell },
    {
      name: "Settings",
      id: "settings",
      path: "/dashboard/settings",
      icon: Settings,
    },
  ];

  return (
    <div className="flex justify-center bg-white fixed bottom-0 w-full">
      <ul className="flex justify-around w-full max-w-3xl p-2">
        {menu.map((item) => {
          const isActive = pathname === item.path;
          return (
            <li
              key={item.id}
              className="flex flex-col items-center cursor-pointer"
              onClick={() => router.push(item.path)}
            >
              <item.icon
                className={`w-6 h-6 ${isActive ? "text-blue-600" : "text-gray-500"}`}
              />
              <small className={isActive ? "text-blue-800" : "text-gray-500"}>
                {item.name}
              </small>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
