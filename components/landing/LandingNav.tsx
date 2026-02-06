"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { HiMenu, HiX } from "react-icons/hi";

export default function LandingNav() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const menu = [
    { name: "Home", id: "home", type: "scroll" },
    { name: "How it Works", id: "how-it-works", type: "scroll" },
    { name: "Upload CV", id: "upload-cv", type: "scroll" },
    { name: "Why Us", id: "why-us", type: "scroll" },
    {
      name: "Sign In",
      type: "route",
      onclick: () => router.push("/auth/login"),
    },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full bg-blue-800 shadow z-50">
      <div className="container mx-auto px-4 flex justify-between items-center p-2">
        {/* Logo */}
        <h1 className="text-3xl text-white font-bold">JobMatchAI</h1>

        {/* Desktop menu */}
        <ul className="hidden md:flex gap-8">
          {menu.map((item, i) => (
            <li key={item.id ?? i}>
              <button
                onClick={() => {
                  if (item.type === "route") {
                    item.onclick?.();
                  } else {
                    const el = document.getElementById(item.id!);
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                className="text-white hover:text-gray-300 font-semibold text-start"
              >
                {item.name}
              </button>
            </li>
          ))}
        </ul>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-2xl text-white"
          onClick={() => setOpen(!open)}
        >
          {open ? <HiX /> : <HiMenu />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <ul className="md:hidden flex flex-col bg-white shadow-lg">
          {menu.map((item, i) => (
            <li key={item.id ?? i} className="border-b border-gray-200">
              {item.type === "route" ? (
                <button
                  onClick={() => {
                    item.onclick?.();
                    setOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 text-blue-600 font-semibold"
                >
                  {item.name}
                </button>
              ) : (
                <a
                  href={`#${item.id}`}
                  onClick={() => setOpen(false)}
                  className="block px-4 py-3 text-blue-600 font-semibold text-start"
                >
                  {item.name}
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}
