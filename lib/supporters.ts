/**
 * Benefactor tiers — "The Black Budget." Funding is clandestine financing, and
 * the reward is status: a permanent mark on your dossier + a place on the Wall
 * of Patrons. Granting is server-side only (see the supporters table).
 */
export type SupporterTier = "informant" | "handler" | "architect";

export interface TierInfo {
  key: SupporterTier;
  label: string;
  color: string;
  lineItem: string;
  funds: string;
  blurb: string;
}

export const SUPPORTER_TIERS: TierInfo[] = [
  {
    key: "informant",
    label: "Informant",
    color: "#f5a524",
    lineItem: "a burner phone",
    funds: "Keeps a light on.",
    blurb: "You slipped us something useful. The file remembers.",
  },
  {
    key: "handler",
    label: "Handler",
    color: "#e5484d",
    lineItem: "the safehouse rent",
    funds: "Keeps the operation running.",
    blurb: "You keep the doors open and the lights low.",
  },
  {
    key: "architect",
    label: "Architect",
    color: "#eab308",
    lineItem: "the whole operation",
    funds: "Bankrolls the wall itself.",
    blurb: "You see the whole board. So do we, now.",
  },
];

export function tierInfo(tier: string | null | undefined): TierInfo | null {
  if (!tier) return null;
  return SUPPORTER_TIERS.find((t) => t.key === tier) ?? null;
}
