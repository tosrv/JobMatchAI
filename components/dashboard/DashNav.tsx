"use client";

import { RocketLaunchIcon } from "@heroicons/react/24/outline";
import { MyAccount } from "./MyAccount";
import { useState } from "react";

export default function DashNav() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 border-b w-full flex justify-center bg-white z-50">
      <nav className="container flex justify-between items-center p-2">
        <section className="flex space-x-2 items-center">
          <div className="bg-blue-800 p-2 rounded-full hidden md:block">
            <RocketLaunchIcon className="w-10 h-10 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-xl leading-tight">JobMatchAI</h1>
            <h2 className="font-semibold text-lg text-blue-800 leading-tight">
              Seeker Dashboard
            </h2>
          </div>
        </section>
        <section className="relative">
          <div
            className="h-14 w-14 rounded-full border-2 border-blue-800 overflow-hidden cursor-pointer"
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            <MyAccount open={menuOpen} setOpen={setMenuOpen} />
          </div>
        </section>
      </nav>
    </header>
  );
}
