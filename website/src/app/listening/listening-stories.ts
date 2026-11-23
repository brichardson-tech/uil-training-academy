
import type { ListeningStory } from "./listening-types";

import { stories20252026 } from "./stories/2025-2026";

export const listeningStories: ListeningStory[] = [
  ...stories20252026,
];

export function getListeningStory(id: string) {
  return listeningStories.find((story) => story.id === id);
}

export function getStoriesByYear(year: string) {
  return listeningStories.filter((story) => story.year === year);
}

export function getAvailableYears() {
  return [...new Set(listeningStories.map((story) => story.year))]
    .sort()
    .reverse();
}
