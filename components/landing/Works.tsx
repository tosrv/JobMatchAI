"use client";

import { BellIcon, BoltIcon, CloudArrowUpIcon } from "@heroicons/react/24/outline";
import { Card } from "../ui/card";

export default function Works() {
  const works = [
    {
      title: "Upload CV",
      description:
        "Upload your PDF resume and let our AI parses your skills and experience instantly.",
      icon: CloudArrowUpIcon,
    },
    {
      title: "Match with Jobs",
      description:
        "AI finds high-intent roles that perfectly align with your skills and goals.",
      icon: BoltIcon,
    },
    {
      title: "Setup Alert",
      description:
        "Skip jobs you applied to yourself. Receive alerts only for jobs recommended for you.",
      icon: BellIcon,
    },
  ];

  return (
    <div>
      <h2 className="max-w-4xl text-blue-500 text-4xl lg:text-6xl font-bold mb-10 text-center">
        How It Works
      </h2>

      <ul className="flex flex-wrap justify-center gap-10">
        {works.map((work, index) => (
          <li key={index}>
            <Card className="bg-gray-100 border max-w-80 p-5 flex flex-col justify-center items-center hover:scale-105 transform transition-transform duration-300 ease-in-out">
              <div className="bg-gray-200 p-3 rounded-full">
                <work.icon className="h-11 w-11 text-blue-800" />
              </div>
              <h3 className="text-2xl font-bold mb-1">{work.title}</h3>
              <p className="text-gray-600 text-center m-0">
                {work.description}
              </p>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
