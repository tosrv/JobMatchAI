"use client";

import { Camera, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>(
    "https://www.rcpch.ac.uk/themes/rcpch/images/profile.jpg",
  );
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Fetch current user info
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setCurrentUser(user);
        setAvatarUrl((user.user_metadata as any)?.avatar_url || avatarUrl);
        setFullname((user.user_metadata as any)?.display_name || "");
        setEmail(user.email || "");
        setBio((user.user_metadata as any)?.bio || "");
      }
    };
    fetchUser();
  }, []);

  // Preview avatar when file selected
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setAvatarFile(file);
    setAvatarUrl(URL.createObjectURL(file));
  };

  // Cleanup blob URLs
  useEffect(() => {
    return () => {
      if (avatarUrl.startsWith("blob:")) URL.revokeObjectURL(avatarUrl);
    };
  }, [avatarUrl]);

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setIsLoading(true);
    setError(null);

    try {
      let avatarPublicUrl = avatarUrl;

      if (avatarFile) {
        const fileName = `avatars/${Date.now()}_${avatarFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(fileName, avatarFile, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: publicData } = supabase.storage
          .from("avatars")
          .getPublicUrl(fileName);

        avatarPublicUrl = publicData.publicUrl;
      }

      // Update metadata (name, bio, avatar)
      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          display_name: fullname,
          bio,
          avatar_url: avatarPublicUrl,
        },
      });

      if (metadataError) throw metadataError;

      // Update email
      if (email && email !== currentUser.email) {
        const res = await fetch("/api/update-email", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Failed to update email");
          setIsLoading(false);
          return;
        }
      }

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen">
      <header className="w-full z-50 fixed top-0 pt-5 flex justify-center py-3 backdrop-blur-3xl">
        <nav className="container grid grid-cols-3 w-full mx-auto">
          <section
            className="hover:cursor-pointer text-gray-500 hover:text-black"
            onClick={() => router.push("/dashboard")}
          >
            <ChevronLeft />
          </section>
          <h2 className="font-semibold text-2xl text-center">Edit Profile</h2>
        </nav>
      </header>

      <form
        className="w-full max-w-[30rem] mt-24 p-5"
        onSubmit={handleSaveChanges}
      >
        <section className="flex flex-col space-y-5 items-center mb-10">
          <div className="relative inline-block">
            <div className="h-32 w-32 rounded-full border-2 border-blue-800 overflow-hidden cursor-pointer">
              <img
                src={avatarUrl}
                alt="avatar"
                className="h-full w-full object-cover"
              />
            </div>
            <label className="absolute bottom-0 right-0 transform -translate-x-1 translate-y-1 bg-blue-800 rounded-full p-2 text-white shadow-md cursor-pointer">
              <Camera />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          </div>
        </section>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        {/* Fullname */}
        <label className="flex flex-col mb-5">
          <span className="text-sm font-medium pb-2">Fullname</span>
          <input
            type="text"
            className="w-full rounded-lg border outline-none p-3 h-14"
            placeholder="Your fullname"
            value={fullname}
            onChange={(e) => setFullname(e.target.value)}
          />
        </label>

        {/* Email */}
        <label className="flex flex-col mb-5">
          <span className="text-sm font-medium pb-2">Email</span>
          <input
            type="email"
            className="w-full rounded-lg border outline-none p-3 h-14"
            placeholder="Update email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        {/* Professional Bio */}
        <label className="flex flex-col mb-5">
          <span className="text-sm font-medium pb-2">Professional Bio</span>
          <textarea
            className="w-full rounded-lg border outline-none p-3 resize-none h-36"
            placeholder="Briefly describe your experience and what you're looking for"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </label>

        {/* Save Button */}
        <div className="flex justify-center">
          <button
            type="submit"
            className="w-1/2 bg-blue-800 hover:bg-blue-500 active:bg-blue-800 text-white text-xl font-bold py-4 rounded-xl shadow-lg transition-colors"
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
