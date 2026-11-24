
import type { ListeningStory } from "./listening-types";
import { originalStories } from "./stories/original-stories";

export const listeningStories: ListeningStory[] = [
  ...originalStories,
];

export function getListeningStory(id: string) {
  return listeningStories.find((story) => story.id === id);
}

export function getStoriesByYear(year: string) {
  return listeningStories.filter((story) => story.year === year);
}

export function getAvailableYears() {
  return [...new Set(listeningStories.map((story) => story.year))];
}
