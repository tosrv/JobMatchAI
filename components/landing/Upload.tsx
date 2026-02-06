"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import UploadCV from "../UploadCV";
import { useRouter } from "next/navigation";

export default function Upload() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  return (
    <Card className="flex flex-col items-center p-5 md:w-3/4 lg:w-1/2 space-y-5">
      <h2 className="text-4xl font-bold text-center">Upload CV</h2>
      <p className="text-gray-600 text-center">
        Let our AI analyze your profile for the best matches.
      </p>
      <UploadCV onSelect={setFile} />
      <Button
        onClick={() => router.push("/auth/sign-up")}
        className="bg-blue-600 hover:bg-blue-500 active:bg-blue-800 text-2xl px-3 py-5"
      >
        Match
      </Button>
    </Card>
  );
}
