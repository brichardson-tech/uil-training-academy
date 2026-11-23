
export type ListeningQuestion = {
  id: number;
  type: "multiple-choice" | "true-false";
  question: string;
  choices: string[];
  correctAnswer: string;
  evidence: string[];
  explanation?: string;
};

export type ListeningStory = {
  id: string;
  title: string;
  year: string;
  transcript: string;
  questions: ListeningQuestion[];
  narrationRate?: number;
};

export type ListeningResult = {
  storyId: string;
  correct: number;
  incorrect: number;
  unanswered: number;
  score: number;
  completedAt: string;
  answers: Record<number, string>;
  timeUsed: number;
};

export type ListeningProgress = {
  storyId: string;
  attempts: ListeningResult[];
  bestScore: number;
  lastScore: number;
  completed: boolean;
};

export type ListeningPhase =
  | "instructions"
  | "listening"
  | "testing"
  | "results"
  | "review";

export const LISTENING_RULES = {
  questionCount: 25,
  testingTime: 600,
  correctPoints: 3,
  incorrectPoints: -2,
  unansweredPoints: 0,
  maximumScore: 75,
} as const;
