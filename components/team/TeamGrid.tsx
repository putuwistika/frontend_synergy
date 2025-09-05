"use client";

import * as React from "react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import TeamCard from "./TeamCard";

/** Tailwind-aware class merger */
function cn(...inputs: Array<string | false | null | undefined>) {
  return twMerge(clsx(inputs));
}

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

export type TeamMember = {
  name: string;
  role: string;
  /** Public path under /public, e.g. /assets/team/ferry.jpg */
  imgSrc?: string;
  bio?: string;
  socials?: {
    linkedin?: string;
    github?: string;
    website?: string;
    twitter?: string;
  };
};

export type TeamGridProps = {
  title?: string;
  subtitle?: string;
  members?: TeamMember[];
  className?: string;
};

/* ------------------------------------------------------------------ */
/* Defaults                                                           */
/* ------------------------------------------------------------------ */

const defaultTeam: TeamMember[] = [
  {
    name: "I Putu Ferry Wistika",
    role: "ML Engineer",
    imgSrc: "/assets/team/ferry.png",
    socials: {
      linkedin: "",
      github: "",
    },
  },
  {
    name: "Lukas Y. Gunawan",
    role: "Business Research & Data Insight",
    imgSrc: "/assets/team/lukas.jpeg",
    socials: {
      linkedin: "",
      github: "",
    },
  },
  {
    name: "Haikal Firdaus",
    role: "ML Developer",
    imgSrc: "/assets/team/haikal.jpeg",
    socials: {
      linkedin: "",
      github: "",
    },
  },
];

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */

export default function TeamGrid({
  title = "Team Synergy Squad",
  subtitle = "Building a delightful, data-driven hotel revenue forecasting platform.",
  members = defaultTeam,
  className,
}: TeamGridProps) {
  return (
    <section
      aria-labelledby="team-heading"
      className={cn("rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8", className)}
    >
      <header className="mb-6 md:mb-8">
        <h2 id="team-heading" className="text-xl font-bold md:text-2xl">
          {title}
        </h2>
        {subtitle && <p className="mt-1 text-sm text-white/70">{subtitle}</p>}
      </header>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {members.map((m, idx) => (
          <TeamCard key={`${m.name}-${idx}`} member={m} />
        ))}
      </div>
    </section>
  );
}
