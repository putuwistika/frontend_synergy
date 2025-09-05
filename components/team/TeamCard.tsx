"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import { Github, Linkedin, Globe, Twitter } from "lucide-react";
import type { TeamMember } from "./TeamGrid";

/** Tailwind-aware class merger */
function cn(...inputs: Array<string | false | null | undefined>) {
  return twMerge(clsx(inputs));
}

export type TeamCardProps = {
  member: TeamMember;
  className?: string;
  /** Show biography paragraph if provided */
  showBio?: boolean;
};

export default function TeamCard({ member, className, showBio = true }: TeamCardProps) {
  const [imgError, setImgError] = React.useState(false);

  const initials = getInitials(member.name);
  const hasPhoto = Boolean(member.imgSrc && !imgError);

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg transition-colors hover:border-white/20",
        className
      )}
    >
      {/* Glow background on hover */}
      <div className="pointer-events-none absolute -inset-24 -z-10 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-30"
        style={{
          background:
            "radial-gradient(40rem 20rem at 20% 10%, rgba(99,102,241,0.25), transparent 60%), radial-gradient(30rem 20rem at 80% 120%, rgba(236,72,153,0.25), transparent 60%)",
        }}
      />

      {/* Header */}
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="relative h-16 w-16 shrink-0 rounded-2xl ring-1 ring-white/20">
          {hasPhoto ? (
            <Image
              src={member.imgSrc!}
              alt={member.name}
              width={64}
              height={64}
              className="h-16 w-16 rounded-2xl object-cover"
              onError={() => setImgError(true)}
              priority={false}
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/50 to-fuchsia-500/50 text-lg font-semibold text-white">
              {initials}
            </div>
          )}
        </div>

        {/* Name, role */}
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold">
            {member.name}
          </h3>
          <p className="mt-0.5 text-sm text-white/75">{member.role}</p>

          {/* Socials */}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {member.socials?.linkedin && (
              <IconLink href={member.socials.linkedin} label="LinkedIn">
                <Linkedin className="h-4 w-4" />
              </IconLink>
            )}
            {member.socials?.github && (
              <IconLink href={member.socials.github} label="GitHub">
                <Github className="h-4 w-4" />
              </IconLink>
            )}
            {member.socials?.twitter && (
              <IconLink href={member.socials.twitter} label="Twitter / X">
                <Twitter className="h-4 w-4" />
              </IconLink>
            )}
            {member.socials?.website && (
              <IconLink href={member.socials.website} label="Website">
                <Globe className="h-4 w-4" />
              </IconLink>
            )}
          </div>
        </div>
      </div>

      {/* Bio */}
      {showBio && member.bio && (
        <p className="mt-4 line-clamp-4 text-sm text-white/80">{member.bio}</p>
      )}
    </article>
  );
}

/* ------------------------------------------------------------------ */
/* Subcomponents                                                       */
/* ------------------------------------------------------------------ */

function IconLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  const isExternal = /^https?:\/\//i.test(href);
  return (
    <Link
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      aria-label={label}
      className={cn(
        "inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/80",
        "transition hover:border-white/20 hover:bg-white/10 hover:text-white"
      )}
    >
      {children}
      <span className="hidden sm:inline">{label}</span>
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

function getInitials(name: string) {
  // Take first letter of first two words
  const parts = name.trim().split(/\s+/);
  const a = parts[0]?.[0] ?? "";
  const b = parts[1]?.[0] ?? "";
  return (a + b).toUpperCase();
}
