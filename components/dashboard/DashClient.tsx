"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

export default function DashClient() {
  const supabase = createClient();
  const [fullname, setFullname] = useState("User");

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setFullname((user.user_metadata.display_name || "") as string);
      }
    };
    fetchUser();
  }, []);

  return <h1 className="font-bold text-4xl">Hello, {fullname}</h1>;
}
