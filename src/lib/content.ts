// Shared by server and client code: no database imports here.

export type Post = {
  id: number;
  slug: string;
  title: string;
  title_sec: string;
  label: string;
  numeral: string;
  excerpt: string;
  body: string;
  tags: string;
  art: string;
  palette: string;
  hero: string;
  status: "draft" | "published";
  published_at: string | null;
  author_id: number | null;
  created_at: string;
  updated_at: string;
};

export const ART = [
  "bulb", "podium", "chip", "network", "comet", "bars", "shield", "magnifier", "bubbles",
  "cards", "condense", "week", "trip", "versus", "timeline", "envelope", "orbits", "dayarc",
] as const;

export const ART_MEANING: Record<string, string> = {
  bulb: "Explainers and tips", podium: "Rankings", chip: "Models and hardware", network: "How models work",
  comet: "Speed, launches, free", bars: "Falling prices", shield: "Safety and privacy", magnifier: "Research and review",
  bubbles: "Email and chat", cards: "Lists and notes", condense: "Summaries", week: "Schedules", trip: "Travel",
  versus: "Comparisons", timeline: "History and roadmaps", envelope: "The newsletter", orbits: "Around a numeral",
  dayarc: "Planning a day",
};

export const PALETTES = ["lagoon", "aurora", "orchid", "electric", "twilight"] as const;
export const HEROES = ["sky", "mint", "orchid", "titanium", "white"] as const;
/** The pairings the design system recommends; the editor offers these. */
export const PAIRINGS: { palette: string; hero: string; name: string }[] = [
  { palette: "lagoon", hero: "sky", name: "Lagoon · Sky" },
  { palette: "aurora", hero: "mint", name: "Aurora · Mint" },
  { palette: "orchid", hero: "orchid", name: "Orchid · Orchid" },
  { palette: "electric", hero: "sky", name: "Electric · Sky" },
  { palette: "electric", hero: "titanium", name: "Electric · Titanium" },
  { palette: "twilight", hero: "titanium", name: "Twilight · Titanium" },
  { palette: "twilight", hero: "white", name: "Twilight · White" },
];

export const LABELS = ["Explained", "Top 10", "How to", "Prompt pack", "Weekly AI Wrap", "Compared", "New launch", "Myths"];
