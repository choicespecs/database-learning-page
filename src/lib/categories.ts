export const CATEGORIES = [
  { id: "fundamentals", title: "Fundamentals" },
  { id: "storage-and-indexing", title: "Storage & Indexing" },
  { id: "scaling", title: "Scaling" },
  { id: "transactions-and-consistency", title: "Transactions & Consistency" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

export function categoryMeta(id: CategoryId) {
  return CATEGORIES.find((c) => c.id === id)!;
}
