"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { updateAvatar } from "@/lib/actions/profile-actions";
import { Avatar } from "@/components/redthread/avatar";

const MAX_BYTES = 2 * 1024 * 1024; // 2MB — keep gifs SMALL
const ACCEPT = ["image/png", "image/jpeg", "image/webp", "image/gif"];

/**
 * AvatarUploader — pick an image / small gif, upload to the `avatars` bucket
 * under the operative's uid folder, then point the profile at the public URL.
 *
 * @param compact hide the preview (e.g. when the page already shows the avatar).
 */
export function AvatarUploader({
  userId,
  name,
  currentUrl,
  compact = false,
}: {
  userId: string;
  name: string;
  currentUrl: string | null;
  compact?: boolean;
}) {
  const router = useRouter();
  const [url, setUrl] = useState(currentUrl);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    if (!ACCEPT.includes(file.type)) {
      setError("Images or small gifs only.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Too big — keep it under 2MB (small gifs only).");
      return;
    }

    setBusy(true);
    const supabase = createClient();
    const ext = file.name.split(".").pop()?.toLowerCase() || "png";
    const path = `${userId}/avatar.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true, cacheControl: "3600", contentType: file.type });
    if (upErr) {
      setBusy(false);
      setError(upErr.message);
      return;
    }
    const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
    const publicUrl = `${pub.publicUrl}?v=${Date.now()}`; // cache-bust
    const res = await updateAvatar(publicUrl);
    setBusy(false);
    if ("error" in res) {
      setError(res.error);
      return;
    }
    setUrl(publicUrl);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-4">
      {!compact && <Avatar url={url} name={name} size={72} />}
      <div>
        <label className="inline-block cursor-pointer rounded-sm border border-border bg-card px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-foreground transition-colors hover:bg-accent">
          {busy ? "Uploading…" : "Change avatar"}
          <input
            type="file"
            accept={ACCEPT.join(",")}
            className="hidden"
            onChange={onPick}
            disabled={busy}
          />
        </label>
        <p className="mt-1 font-mono text-[10px] text-muted-foreground">
          PNG / JPG / WEBP / GIF · under 2MB · small gifs ok
        </p>
        {error && (
          <p className="mt-1 font-mono text-[10px] text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
