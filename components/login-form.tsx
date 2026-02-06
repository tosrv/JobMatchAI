"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkSession = async () => {
      await new Promise((res) => setTimeout(res, 50));
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) router.push("/dashboard");
    };
    checkSession();
  }, []);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const inputs = [
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
  ];

  return (
    <div className="flex flex-col w-full justify-center items-center min-h-screen p-5 bg-gradient-to-br from-red-100/70 via-purple-50/50 to-blue-100/70">
      {/* Header */}
      <nav className="fixed top-0 pt-5 flex items-center justify-center gap-3 w-full py-1 backdrop-blur-3xl shadow-sm z-50">
        <span
          className="fixed left-1 top-4 hover:cursor-pointer text-gray-500 hover:text-black"
          onClick={() => router.push("/")}
        >
          <ChevronLeft />
        </span>
        <h2 className="font-semibold text-2xl">JobMatchAI</h2>
      </nav>

      {/* Title */}
      <h3 className="text-4xl font-bold mt-20">Welcome Back</h3>
      <p className="text-gray-500 mb-6">Log in to find your perfect match</p>

      {/* Error */}
      <div className="min-h-[24px] mb-2">
        {error && <p className="text-red-500">{error}</p>}
      </div>

      {/* Card */}
      <Card className="p-8 w-full max-w-md space-y-5">
        <form onSubmit={handleLogin} className="space-y-5">
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

          <Button
            type="submit"
            className="w-full h-10 text-lg bg-blue-800 hover:bg-blue-600 active:bg-blue-800"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </Button>
        </form>

      </Card>

      {/* Register */}
      <p className="text-center mt-6">
        Don&apos;t have an account?{" "}
        <span
          className="text-blue-500 font-semibold hover:text-black cursor-pointer"
          onClick={() => router.push("/auth/sign-up")}
        >
          Sign Up
        </span>
      </p>
    </div>
  );
}
