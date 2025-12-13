import { ItemCategory } from "@/types";

export const categories = [
  { id: "TOOLS", emoji: "🔧", name: "Outils" },
  { id: "KITCHEN", emoji: "🍳", name: "Cuisine" },
  { id: "SPORTS", emoji: "⚽", name: "Sport" },
  { id: "ELECTRONICS", emoji: "💻", name: "Électronique" },
  { id: "BOOKS", emoji: "📚", name: "Livres" },
  { id: "GAMES", emoji: "🎮", name: "Jeux" },
  { id: "CAMPING", emoji: "🏕️", name: "Camping" },
  { id: "OTHER", emoji: "📦", name: "Autre" },
] as const;

export function getCategoryLabel(category: ItemCategory): string {
  return categories.find((c) => c.id === category)?.name || category;
}

export function getCategoryEmoji(category: ItemCategory): string {
  return categories.find((c) => c.id === category)?.emoji || "📦";
}
