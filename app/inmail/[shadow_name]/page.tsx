import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentProfile } from "@/lib/data/profiles";
import { getConversation } from "@/lib/data/messages";
import { ConversationView } from "@/components/inmail/conversation-view";
import { ButtonLink } from "@/components/ui/button-link";
import { PaperPanel } from "@/components/redthread/paper-panel";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ shadow_name: string }>;
}): Promise<Metadata> {
  const { shadow_name } = await params;
  return { title: `InMail — ${decodeURIComponent(shadow_name)}` };
}

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ shadow_name: string }>;
}) {
  const { shadow_name } = await params;
  const name = decodeURIComponent(shadow_name);
  const me = await getCurrentProfile();

  if (!me) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-16">
        <PaperPanel pinned className="w-full max-w-md text-center">
          <p className="font-mono text-xs text-paper-foreground/85">
            Initiate to open this channel.
          </p>
          <ButtonLink
            href="/initiation"
            className="mt-3 font-mono uppercase tracking-wider"
          >
            Begin initiation
          </ButtonLink>
        </PaperPanel>
      </div>
    );
  }

  const { other, messages } = await getConversation(name);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10">
      <Link
        href="/inmail"
        className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground hover:text-foreground"
      >
        ← all drops
      </Link>
      <h1 className="mt-2 font-typewriter text-3xl uppercase text-foreground">
        {name}
      </h1>
      <div className="thread-rule my-5 h-px" />

      {other ? (
        <ConversationView other={name} initialMessages={messages} />
      ) : (
        <p className="font-mono text-sm text-muted-foreground">
          No operative answers to that shadow name.
        </p>
      )}
    </div>
  );
}
