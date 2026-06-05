import Link from "next/link";

/**
 * MentionedText — renders body text with `@shadow_name` mentions turned into
 * links to the operative's dossier. Whitespace is preserved by the caller's
 * `whitespace-pre-wrap`; this only swaps handles for anchors.
 */
export function MentionedText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const re = /@([a-zA-Z0-9_.-]{3,24})/g;
  const parts: React.ReactNode[] = [];
  let last = 0;
  let key = 0;
  let m: RegExpExecArray | null;

  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const handle = m[1];
    parts.push(
      <Link
        key={key++}
        href={`/dossier/${handle}`}
        className="text-redthread hover:underline"
      >
        @{handle}
      </Link>,
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));

  return <span className={className}>{parts}</span>;
}
