"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * Step one of initiation: request a magic link. Uses the browser Supabase
 * client (PKCE) and redirects back through /auth/callback.
 */
export function InitiationEmailForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setMessage("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/initiation`,
      },
    });
    if (error) {
      setStatus("error");
      setMessage(error.message);
    } else {
      setStatus("sent");
    }
  }

  if (status === "sent") {
    return (
      <div className="space-y-2 text-center">
        <p className="font-typewriter text-lg text-ink">Transmission sent.</p>
        <p className="font-mono text-xs text-paper-foreground/80">
          A one-time link is on its way to{" "}
          <span className="text-ink">{email}</span>. Check your inbox — and your
          spam folder, in case it was intercepted.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <label className="block font-mono text-[10px] uppercase tracking-widest text-ink-faded">
        Dead-drop address
      </label>
      <Input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="operative@dead.drop"
        autoComplete="email"
        className="border-ink/30 bg-paper-aged/40 font-mono text-ink placeholder:text-ink-faded/60"
      />
      <Button
        type="submit"
        disabled={status === "sending"}
        className="w-full font-mono uppercase tracking-wider"
      >
        {status === "sending" ? "Transmitting…" : "Send the signal"}
      </Button>
      {status === "error" && (
        <p className="font-mono text-xs text-destructive" role="alert">
          {message}
        </p>
      )}
    </form>
  );
}
