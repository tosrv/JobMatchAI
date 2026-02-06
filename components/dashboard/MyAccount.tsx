"use client";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface MyAccountProps {
  open: boolean;
  setOpen: (val: boolean) => void;
}

export function MyAccount({ open, setOpen }: MyAccountProps) {
  const router = useRouter();
  const supabase = createClient();
  const [avatarUrl, setAvatarUrl] = useState<string>(
    "https://www.rcpch.ac.uk/themes/rcpch/images/profile.jpg",
  );

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setAvatarUrl((user.user_metadata as any)?.avatar_url || avatarUrl);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    sessionStorage.clear();
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      {/* Trigger adalah avatar */}
      <DropdownMenuTrigger asChild>
        <img
          src={avatarUrl}
          alt="avatar"
          className="h-full w-full object-cover"
        />
      </DropdownMenuTrigger>

      {/* Content menu */}
      <DropdownMenuContent className="w-40" align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => router.push("/dashboard/profile")}>
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/dashboard/cv")}>
            Upload CV
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/dashboard/jobs")}>
            Jobs
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/dashboard/alert")}>
            Alert
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>
            Settings
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut />
            Log out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
