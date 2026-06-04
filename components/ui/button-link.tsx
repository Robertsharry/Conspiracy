import Link from "next/link";
import type { VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

/**
 * ButtonLink — a Next.js `<Link>` styled with the button variants.
 *
 * Use this for navigation actions instead of `<Button render={<Link/>}>`: it
 * renders a real anchor (correct semantics, no Base UI button warning) while
 * sharing the exact same visual variants/sizes as Button.
 */
export function ButtonLink({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof Link> & VariantProps<typeof buttonVariants>) {
  return (
    <Link className={cn(buttonVariants({ variant, size }), className)} {...props} />
  );
}
