"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Camera, ChevronLeft } from "lucide-react";

export function SignUpForm() {
  const [email, setEmail] = useState("");
  const [fullname, setFullname] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>(
    "https://www.rcpch.ac.uk/themes/rcpch/images/profile.jpg",
  );
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  // Preview avatar 
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setAvatarFile(file);
    setAvatarUrl(URL.createObjectURL(file));
  };

  useEffect(() => {
    return () => {
      if (avatarUrl.startsWith("blob:")) URL.revokeObjectURL(avatarUrl);
    };
  }, [avatarUrl]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (password !== repeatPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      // Sign up user
      const { data: signUpData, error: signUpError } =
        await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/dashboard` },
        });

      if (signUpError) throw signUpError;
      if (!signUpData.user) throw new Error("User not created");

      const user = signUpData.user;
      let avatarPublicUrl = avatarUrl;

      // Upload avatar
      if (avatarFile) {
        const fileExt = avatarFile.name.split(".").pop();
        const fileName = `${user.id}_${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(fileName, avatarFile, { upsert: true });

        if (!uploadError) {
          const { data: publicData } = supabase.storage
            .from("avatars")
            .getPublicUrl(fileName);
          avatarPublicUrl = publicData.publicUrl;
        }
      }

      // Update user metadata
      await supabase.auth.updateUser({
        data: {
          display_name: fullname,
          avatar_url: avatarPublicUrl,
        },
      });

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      setIsLoading(false);
    }
  };

  const inputs = [
    {
      id: "display-name",
      label: "Fullname",
      type: "text",
      placeholder: "your fullname",
      value: fullname,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setFullname(e.target.value),
    },
    {
      id: "email",
      label: "Email",
      type: "email",
      placeholder: "you@example.com",
      value: email,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setEmail(e.target.value),
    },
    {
      id: "password",
      label: "Password",
      type: "password",
      placeholder: "Password",
      value: password,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setPassword(e.target.value),
    },
    {
      id: "repeat-password",
      label: "Repeat Password",
      type: "password",
      placeholder: "Repeat Password",
      value: repeatPassword,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setRepeatPassword(e.target.value),
    },
  ];

  return (
    <div className="flex flex-col w-full justify-center items-center min-h-screen p-5 bg-gradient-to-br from-red-100/70 via-purple-50/50 to-blue-100/70">
      {/* Header */}
      <nav className="fixed top-0 pt-5 flex items-center justify-center w-full py-1 backdrop-blur-3xl shadow-sm z-50">
        <ChevronLeft
          className="fixed left-1 top-4 cursor-pointer text-gray-500 hover:text-black"
          onClick={() => router.push("/")}
        />
        <h2 className="font-semibold text-2xl">Sign Up</h2>
      </nav>

      <div className="hidden md:block">
        <h3 className="text-4xl font-bold">Create Your Profile</h3>
        <p className="text-gray-500 mb-4">Let AI find your dream job</p>
      </div>

      {/* Error */}
      <div className="min-h-[24px] mb-2">
        {error && <p className="text-red-500">{error}</p>}
      </div>

      <Card className="p-8 w-full max-w-md space-y-5">
        <form onSubmit={handleSignUp} className="space-y-5">
          {/* Avatar */}
          <section className="flex flex-col space-y-5 items-center">
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

          {/* Form Inputs */}
          {inputs.map((inp) => (
            <div key={inp.id} className="space-y-1">
              <label htmlFor={inp.id}>{inp.label}</label>
              <input
                id={inp.id}
                type={inp.type}
                placeholder={inp.placeholder}
                value={inp.value}
                onChange={inp.onChange}
                required
                className="border outline-none h-10 rounded-lg px-3 w-full"
              />
            </div>
          ))}

          {/* Submit */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-10 bg-blue-800 hover:bg-blue-600 active:bg-blue-800 text-lg"
          >
            {isLoading ? "Creating..." : "Create Account"}
          </Button>
        </form>
      </Card>

      <p className="mt-6 text-center">
        Already have an account?{" "}
        <span
          className="text-blue-500 font-semibold cursor-pointer hover:text-black"
          onClick={() => router.push("/auth/login")}
        >
          Log In
        </span>
      </p>
    </div>
  );
}
