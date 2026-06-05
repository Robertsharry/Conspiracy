import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getProfileByShadowName,
  getCurrentProfile,
} from "@/lib/data/profiles";
import { RankBadge } from "@/components/redthread/rank-badge";
import { PaperPanel } from "@/components/redthread/paper-panel";
import { RedactedText } from "@/components/redthread/redacted-text";
import { Avatar } from "@/components/redthread/avatar";
import { AvatarUploader } from "@/components/profile/avatar-uploader";
import { ButtonLink } from "@/components/ui/button-link";
import { BioEditor } from "@/components/profile/bio-editor";
import { getBoardsByCreator, getRecentActivity } from "@/lib/data/dossier";
import { getSupporterTier } from "@/lib/data/supporters";
import { BenefactorMark } from "@/components/redthread/benefactor-mark";
import { nextRank } from "@/lib/ranks";
import Link from "next/link";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ shadow_name: string }>;
}): Promise<Metadata> {
  const { shadow_name } = await params;
  return { title: `Dossier — ${decodeURIComponent(shadow_name)}` };
}

export default async function DossierPage({
  params,
}: {
  params: Promise<{ shadow_name: string }>;
}) {
  const { shadow_name } = await params;
  const name = decodeURIComponent(shadow_name);

  const profile = await getProfileByShadowName(name);
  if (!profile) notFound();

  const me = await getCurrentProfile();
  const isMe = me?.id === profile.id;
  const [boards, activity, supporterTier] = await Promise.all([
    getBoardsByCreator(profile.id),
    getRecentActivity(profile.id),
    getSupporterTier(profile.id),
  ]);
  const upcoming = nextRank(profile.credibility);
  const joined = new Date(profile.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12">
      {/* File header (on the dark board) */}
      <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
        Subject Dossier · File {profile.id.slice(0, 8).toUpperCase()}
      </p>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar url={profile.avatar_url} name={profile.shadow_name} size={64} />
          <h1 className="font-typewriter text-4xl uppercase text-foreground sm:text-5xl">
            {profile.shadow_name}
          </h1>
        </div>
        {isMe ? (
          <span className="font-mono text-[10px] uppercase tracking-widest text-redthread">
            ▍ this is you
          </span>
        ) : me ? (
          <ButtonLink
            href={`/inmail/${encodeURIComponent(profile.shadow_name)}`}
            size="sm"
            variant="outline"
            className="font-mono text-xs uppercase tracking-wider"
          >
            Send InMail
          </ButtonLink>
        ) : null}
      </div>
      {isMe && (
        <div className="mt-4">
          <AvatarUploader
            userId={profile.id}
            name={profile.shadow_name}
            currentUrl={profile.avatar_url}
            compact
          />
        </div>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <RankBadge credibility={profile.credibility} />
        <BenefactorMark tier={supporterTier} />
        <span className="font-mono text-xs text-muted-foreground">
          credibility {profile.credibility}
        </span>
        <span className="font-mono text-xs text-muted-foreground">
          inducted {joined}
        </span>
      </div>
      {upcoming && (
        <p className="mt-2 font-mono text-[11px] text-muted-foreground/80">
          {Math.max(upcoming.min - profile.credibility, 0)} more credibility to{" "}
          <span className="text-ochre">{upcoming.label}</span>.
        </p>
      )}

      <div className="thread-rule my-8 h-px" />

      {/* Field notes */}
      <div className="grid gap-6 md:grid-cols-3">
        <PaperPanel tilt={-0.6} className="md:col-span-1">
          <h2 className="mb-3 font-typewriter text-lg uppercase text-ink">
            Field Notes
          </h2>
          {isMe ? (
            <BioEditor initial={profile.bio} />
          ) : profile.bio ? (
            <p className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-paper-foreground/85">
              {profile.bio}
            </p>
          ) : (
            <p className="font-mono text-xs leading-relaxed text-paper-foreground/70">
              No statement on file.{" "}
              <RedactedText>subject declined to comment</RedactedText>.
            </p>
          )}
        </PaperPanel>

        <PaperPanel tilt={0.5} className="md:col-span-2">
          <h2 className="mb-3 font-typewriter text-lg uppercase text-ink">
            Case Files Opened
          </h2>
          {boards.length ? (
            <ul className="space-y-2">
              {boards.map((b) => (
                <li key={b.id}>
                  <Link
                    href={`/boards/${b.slug}`}
                    className="flex items-center justify-between gap-3 rounded-sm border border-ink/15 px-2.5 py-2 transition-colors hover:bg-ink/5"
                  >
                    <span className="truncate font-typewriter text-sm text-ink">
                      {b.title}
                    </span>
                    <span className="shrink-0 font-mono text-[10px] uppercase tracking-widest text-ink-faded">
                      {b.category} · {b.node_count} pins
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="font-mono text-xs leading-relaxed text-paper-foreground/70">
              No case files yet.{" "}
              {isMe ? "Open one — someone has to go first." : "This operative hasn't surfaced a board."}
            </p>
          )}
        </PaperPanel>
      </div>

      <PaperPanel tilt={-0.3} className="mt-6">
        <h2 className="mb-3 font-typewriter text-lg uppercase text-ink">
          Recent Activity
        </h2>
        {activity.length ? (
          <ul className="space-y-2">
            {activity.map((a, i) => (
              <li
                key={i}
                className="border-b border-ink/10 pb-2 font-mono text-xs leading-relaxed last:border-0"
              >
                <span className="text-ink-faded">
                  {a.kind === "pin" ? "pinned a lead on " : "filed a note on "}
                </span>
                <Link
                  href={`/boards/${a.boardSlug}`}
                  className="text-ink underline-offset-2 hover:underline"
                >
                  {a.boardTitle}
                </Link>
                <span className="text-paper-foreground/70">
                  {" "}
                  — {a.snippet.length > 90 ? `${a.snippet.slice(0, 90)}…` : a.snippet}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="font-mono text-xs leading-relaxed text-paper-foreground/70">
            The trail is cold for now. Pins, strings, and case-notes will appear
            here as this operative works the wall.
          </p>
        )}
      </PaperPanel>
    </div>
  );
}
