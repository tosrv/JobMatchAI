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
    if (!user) return;
    const supabase = createClient();

    const fetchLatestCV = async () => {
      const { data: files, error: listError } = await supabase.storage
        .from("cvs")
        .list(`${user.id}`, {
          limit: 1,
          sortBy: { column: "created_at", order: "desc" },
        });

      if (listError) {
        console.error(listError);
        return;
      }

      if (files && files.length > 0) {
        const { data } = supabase.storage
          .from("cvs")
          .getPublicUrl(`${user.id}/${files[0].name}`);

        setUrl(data.publicUrl);
      }
    };

    fetchLatestCV();
  }, [user]);

  return (
    <div className="flex flex-col justify-center items-center h-screen w-full p-5">
      <DashNav />
      {url ? (
        <div className="h-3/4 w-full max-w-xl p-5">
          <iframe src={url} className="w-full h-full"></iframe>
          <div className="flex justify-center">
            <button
              onClick={() => setUrl("")}
              className="mt-3 px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800"
            >
              Update
            </button>
          </div>
        </div>
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
