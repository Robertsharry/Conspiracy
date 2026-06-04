import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Next.js 16 Proxy (formerly Middleware). Runs before cached responses on the
 * Node.js runtime. Its sole job in REDTHREAD is to keep the Supabase auth
 * session fresh by rotating cookies on each request.
 */
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  /**
   * Run on everything except static assets and image files. Keep this in sync
   * with any new public asset routes.
   */
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
