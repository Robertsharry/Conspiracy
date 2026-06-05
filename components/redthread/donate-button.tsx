"use client";

import { useState } from "react";
import { startDonation } from "@/lib/actions/donate-actions";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** The CTA that opens Stripe Checkout for a pay-what-you-want contribution. */
export function DonateButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function go() {
    setLoading(true);
    setError("");
    const res = await startDonation();
    if ("url" in res) {
      window.location.href = res.url;
      return;
    }
    setError(res.error);
    setLoading(false);
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={go}
        disabled={loading}
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 px-8 font-mono text-sm uppercase tracking-wider disabled:opacity-60",
        )}
      >
        {loading ? "Opening the channel…" : "Fund the operation ↗"}
      </button>
      {error && (
        <span className="font-mono text-xs text-destructive" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
