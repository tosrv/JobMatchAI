"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function Hero() {
  const router = useRouter();

  return (
    <div className="container mx-auto">
      <h2 className="max-w-4xl text-blue-500 text-4xl lg:text-6xl font-bold mb-4">
        Find Your Dream Career with JobMatchAI
      </h2>
      <p className="max-w-xl text-xl">
        JobMatchAI helps you discover jobs that match your skills and interests.
        Sign up now, create your profile, and let our technology match you with
        the best opportunities in the industry
      </p>
      <div className="p-5">
        <Button
          onClick={() => router.push("/auth/sign-up")}
          className="bg-blue-600 hover:bg-blue-500 active:bg-blue-800 text-2xl px-3 py-5"
        >
          Get Started
        </Button>
      </div>
    </div>
  );
}
