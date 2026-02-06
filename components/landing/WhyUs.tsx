"use client";

import { Brain, TrendingUp, UserSearch } from "lucide-react";

export default function WhyUs() {
  const benefits = [
    {
      icon: Brain,
      title: "Work Smarter, Not Harder",
      description:
        "Let AI do the heavy lifting—match your CV with top opportunities in seconds.",
    },
    {
      icon: UserSearch,
      title: "Personalized Job Recommendations",
      description: "Get jobs tailored to your unique skills and experience.",
    },
    {
      icon: TrendingUp,
      title: "Grow Your Career",
      description:
        "Identify skills to improve, spot opportunities, and stay ahead in the job market.",
    },
  ];

  return (
    <div className="flex flex-col justify-center items-center w-full p-5">
      <h2 className="max-w-4xl text-blue-500 text-4xl lg:text-6xl font-bold mb-20 text-center">
        Why Choose JobMatchAI?
      </h2>

      <ul className="grid grid-cols-1 lg:grid-cols-3 gap-10 max-w-7xl mx-auto">
        {benefits.map((b, index) => (
          <li key={index} className="flex flex-col items-center text-center max-w-sm">
            <div className="bg-gray-200 p-3 rounded-full">
             <b.icon className="h-11 w-11 text-blue-800" />
            </div>
            <h3 className="text-2xl font-bold mb-1">
              {b.title}
            </h3>
            <p className="text-gray-600 text-center m-0">
              {b.description}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
