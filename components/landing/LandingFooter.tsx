"use client";

import { Earth, MessageSquare, Share2 } from "lucide-react";

export default function LandingFooter() {
  return (
    <div className="container mx-auto flex flex-col items-center px-4 pt-12">
      <div className="flex flex-col md:flex-row justify-between w-full mb-12 gap-10">
        {/* Branding */}
        <div className="flex-1">
          <h2 className="text-2xl font-extrabold mb-4 text-white">
            JobMatchAI
          </h2>
          <p className="text-white/70 max-w-xs leading-relaxed">
            Helping professionals find their next career milestone using
            advanced AI matching algorithms.
          </p>
        </div>

        {/* Links */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
          <div>
            <h4 className="font-bold mb-4 text-white">Platform</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li>
                <a className="hover:text-white transition-colors" href="#">
                  Features
                </a>
              </li>
              <li>
                <a className="hover:text-white transition-colors" href="#">
                  Pricing
                </a>
              </li>
              <li>
                <a className="hover:text-white transition-colors" href="#">
                  Companies
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-white">Resources</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li>
                <a className="hover:text-white transition-colors" href="#">
                  Blog
                </a>
              </li>
              <li>
                <a className="hover:text-white transition-colors" href="#">
                  Guides
                </a>
              </li>
              <li>
                <a className="hover:text-white transition-colors" href="#">
                  Support
                </a>
              </li>
            </ul>
          </div>

          <div className="col-span-2 sm:col-span-1">
            <h4 className="font-bold mb-4 text-white">Follow Us</h4>
            <div className="flex gap-4">
              <a
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors text-white"
                href="#"
              >
                <Earth />
              </a>
              <a
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors text-white"
                href="#"
              >
                <MessageSquare />
              </a>
              <a
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors text-white"
                href="#"
              >
                <Share2 />
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full h-px bg-white/10 mb-8"></div>

      {/* Bottom */}
      <div className="flex flex-col md:flex-row justify-between items-center w-full text-xs text-white/50 gap-4 pb-5">
        <p>© 2026 JobMatchAI Inc. All rights reserved.</p>
        <div className="flex gap-6">
          <a className="hover:text-white transition-colors" href="#">
            Privacy Policy
          </a>
          <a className="hover:text-white transition-colors" href="#">
            Terms of Service
          </a>
          <a className="hover:text-white transition-colors" href="#">
            Cookie Policy
          </a>
        </div>
      </div>
    </div>
  );
}
