"use client";

import { useEffect, useState } from "react";
import DashNav from "../../../components/dashboard/DashNav";
import UploadCV from "@/components/UploadCV";
import { useUser } from "@/context/UserContext";
import { createClient } from "@/lib/supabase/client";

export default function UploadCVPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [url, setUrl] = useState("");
  const { user } = useUser();

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload-cv", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      if (!data.userId) {
        throw new Error("Invalid user session");
      }

      if (data.fileUrl) {
        setUrl(data.fileUrl);
        setFile(null);
      }

      if (typeof window !== "undefined" && data.parsed) {
        const key = `parsedCV_${data.userId}`;
        const { skills, experience, education } = data.parsed;

        sessionStorage.setItem(
          key,
          JSON.stringify({ skills, experience, education }),
        );
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    const supabase = createClient();

    const fetchCV = async () => {
      if (!user) return;

      const { data } = await supabase
        .from("cvs")
        .select("file_url")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data?.file_url) {
        setUrl(data.file_url);
      }
    };

    fetchCV();
  }, []);

  return (
    <div className="flex flex-col justify-center items-center h-screen w-full p-5">
      <DashNav />
      {url ? (
        <>
          <iframe src={url} className="h-3/4 w-full max-w-xl"></iframe>
          <button
            onClick={() => setUrl("")} // reset URL
            className="mt-3 px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800"
          >
            Update
          </button>
        </>
      ) : (
        <>
          <UploadCV onSelect={setFile} />

          {file && (
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="mt-5 px-6 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 disabled:opacity-50"
            >
              {uploading ? "Uploading..." : "Upload CV"}
            </button>
          )}
        </>
      )}
    </div>
  );
}
