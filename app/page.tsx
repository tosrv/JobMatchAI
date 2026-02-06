"use client";

import LandingNav from "@/components/landing/LandingNav";
import LandingFooter from "@/components/landing/LandingFooter";
import WhyUs from "@/components/landing/WhyUs";
import Hero from "@/components/landing/Hero";
import Works from "@/components/landing/Works";
import Upload from "@/components/landing/Upload";

export default function Home() {
  return (
    <main className="flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        <LandingNav />
        <main className="w-full">
          <section
            id="home"
            className="px-5 lg:px-30 h-screen flex flex-col justify-center bg-cover bg-center"
            style={{ backgroundImage: "url('/images/hero.jpg')" }}
          >
            <Hero />
          </section>
          <section
            id="how-it-works"
            className="w-full bg-white flex flex-col justify-center items-center my-20 py-32"
          >
            <Works />
          </section>
          <section
            id="upload-cv"
            className="flex justify-center items-center bg-gray-100 h-screen p-5"
          >
            <Upload />
          </section>

          <section id="why-us" className="bg-white my-20 py-32">
            <WhyUs />
          </section>
        </main>

        <footer className="bg-blue-800 w-full">
          <LandingFooter />
        </footer>
      </div>
    </main>
  );
}
