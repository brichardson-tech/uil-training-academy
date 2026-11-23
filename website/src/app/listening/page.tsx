
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

import ListeningTest from "./listening-test";
import { listeningStories } from "./listening-stories";

import type {
  ListeningStory,
  ListeningProgress,
} from "./listening-types";

const storyLibrary = [
  {
    year: "2025-2026",
    titles: [
      "Black Bears in Texas",
      "Texas Pecans",
      "Dragonflies",
      "The Origin of the Hamburger: A History with a Texas Twist",
      "The Nueces River: A Vital Waterway in Texas",
      "Caprock Canyon and the Texas State Bison Herd",
    ],
  },
  {
    year: "2024-2025",
    titles: [
      "White-Tailed Deer",
      "Longhorn Caverns State Park",
      "Lemons - A Sour Favorite",
      "Mrs. Baird's Bread: A Texas Tradition",
      "Microwave Ovens",
      "Vanilla",
    ],
  },
  {
    year: "2023-2024",
    titles: [
      "Texas Bluebonnets",
      "The History of Nail Polish",
      "Emily Warren Roebling - The First Woman Chief Engineer",
      "Bananas",
      "Jelly Beans",
      "The Dust Bowl",
    ],
  },
  {
    year: "2022-2023",
    titles: [
      "The History of Crayons",
      "The History of Play-Doh",
      "Buck Owens",
      "Canton Trade Days",
      "Ferris Wheels",
      "Nellie Bly",
    ],
  },
  {
    year: "2021-2022",
    titles: [
      "Watermelon",
      "Florence Kelley",
      "Chewing Gum",
      "What Is Precipitation?",
      "Buddy Holly",
      "Mariana Trench",
    ],
  },
  {
    year: "2018-2019",
    titles: [
      "Disc Golf",
      "Natural Gas",
      "Yeast",
      "The Green Bank Telescope",
      "Bass Reeves - The Original Lone Ranger",
      "Theodore Roosevelt",
    ],
  },
];

export default function ListeningPage() {
  const [selectedYear, setSelectedYear] =
    useState("all");

  const [activeStory, setActiveStory] =
    useState<ListeningStory | null>(null);

  const [progress, setProgress] = useState<
    Record<string, ListeningProgress>
  >({});

  function loadProgress() {
    const savedProgress: Record<
      string,
      ListeningProgress
    > = {};

    for (const story of listeningStories) {
      try {
        const saved = localStorage.getItem(
          `uil-listening-${story.id}`
        );

        if (saved) {
          savedProgress[story.id] =
            JSON.parse(saved);
        }
      } catch {
        // Ignore unavailable or invalid saved data.
      }
    }

    setProgress(savedProgress);
  }

  useEffect(() => {
    loadProgress();
  }, []);

  function returnToLibrary() {
    loadProgress();
    setActiveStory(null);
    window.scrollTo(0, 0);
  }

  function startStory(story: ListeningStory) {
    setActiveStory(story);
    window.scrollTo(0, 0);
  }

  const totalStories = storyLibrary.reduce(
    (total, group) =>
      total + group.titles.length,
    0
  );

  const completedStories = Object.values(
    progress
  ).filter(
    (item) => item.completed
  ).length;

  const completionPercent = Math.round(
    (completedStories / totalStories) * 100
  );

  const completedResults = Object.values(
    progress
  ).filter(
    (item) => item.completed
  );

  const bestOverallScore =
    completedResults.length > 0
      ? Math.max(
          ...completedResults.map(
            (item) => item.bestScore
          )
        )
      : null;

  const filteredLibrary =
    selectedYear === "all"
      ? storyLibrary
      : storyLibrary.filter(
          (group) => group.year === selectedYear
        );

  if (activeStory) {
    return (
      <ListeningTest
        key={activeStory.id}
        story={activeStory}
        onExit={returnToLibrary}
      />
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      <div className="mx-auto max-w-7xl px-6 py-10">

        <Link
          href="/"
          className="text-blue-400 hover:text-blue-300"
        >
          &larr; Back to Home
        </Link>

        <header className="mb-10 mt-8">

          <p className="mb-2 font-semibold tracking-wider text-blue-400">
            UIL TRAINING ACADEMY
          </p>

          <h1 className="text-4xl font-bold md:text-5xl">
            Listening Skills
          </h1>

          <p className="mt-4 max-w-3xl text-lg text-slate-400">
            Improve your listening comprehension,
            note-taking skills, and attention to
            detail through UIL listening contests.
          </p>

        </header>

        {/* STATISTICS */}

        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">

          <div className="rounded-xl border border-slate-700 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">
              Story Library
            </p>
            <p className="mt-2 text-3xl font-bold text-blue-400">
              {totalStories}
            </p>
          </div>

          <div className="rounded-xl border border-slate-700 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">
              Available Tests
            </p>
            <p className="mt-2 text-3xl font-bold text-blue-400">
              {listeningStories.length}
            </p>
          </div>

          <div className="rounded-xl border border-slate-700 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">
              Completed Tests
            </p>
            <p className="mt-2 text-3xl font-bold text-green-400">
              {completedStories}
            </p>
          </div>

          <div className="rounded-xl border border-slate-700 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">
              Personal Best
            </p>
            <p className="mt-2 text-3xl font-bold text-yellow-400">
              {bestOverallScore ?? "--"}
              <span className="text-lg text-slate-500">
                /75
              </span>
            </p>
          </div>

        </div>

        {/* STUDENT PROGRESS */}

        <section className="mb-8 rounded-xl border border-slate-700 bg-slate-900 p-6">

          <div className="mb-3 flex items-center justify-between">

            <h2 className="text-xl font-bold">
              Your Progress
            </h2>

            <span className="font-semibold text-blue-400">
              {completedStories} / {totalStories}
            </span>

          </div>

          <div className="h-4 overflow-hidden rounded-full bg-slate-700">

            <div
              className="h-full rounded-full bg-blue-500 transition-all"
              style={{
                width: `${completionPercent}%`,
              }}
            />

          </div>

          <p className="mt-3 text-sm text-slate-400">
            {completionPercent}% of the planned
            story library completed.
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Progress is currently saved in this
            browser on this device.
          </p>

        </section>

        {/* CONTEST RULES */}

        <section className="mb-10 rounded-xl border border-slate-700 bg-slate-900 p-6">

          <h2 className="mb-5 text-2xl font-bold">
            How the Contest Works
          </h2>

          <div className="grid gap-6 md:grid-cols-2">

            <div>

              <h3 className="mb-3 font-bold text-blue-400">
                Contest Format
              </h3>

              <ul className="list-disc space-y-2 pl-5 text-slate-300">
                <li>Listen to the entire story.</li>
                <li>Take notes while listening.</li>
                <li>Questions unlock after narration.</li>
                <li>Answer 25 questions in 10 minutes.</li>
                <li>Review your answers after scoring.</li>
              </ul>

            </div>

            <div>

              <h3 className="mb-3 font-bold text-blue-400">
                Scoring
              </h3>

              <div className="space-y-3">

                <div className="flex justify-between rounded-lg bg-green-950 p-3 text-green-400">
                  <span>Correct Answer</span>
                  <span className="font-bold">+3</span>
                </div>

                <div className="flex justify-between rounded-lg bg-red-950 p-3 text-red-400">
                  <span>Incorrect Answer</span>
                  <span className="font-bold">-2</span>
                </div>

                <div className="flex justify-between rounded-lg bg-slate-800 p-3 text-slate-300">
                  <span>Unanswered</span>
                  <span className="font-bold">0</span>
                </div>

              </div>

            </div>

          </div>

        </section>

        {/* YEAR FILTER */}

        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">

          <h2 className="text-3xl font-bold">
            Story Library
          </h2>

          <select
            value={selectedYear}
            onChange={(event) =>
              setSelectedYear(event.target.value)
            }
            className="rounded-lg border border-slate-600 bg-slate-900 px-4 py-3 text-white"
          >

            <option value="all">
              All School Years
            </option>

            {storyLibrary.map((group) => (
              <option
                key={group.year}
                value={group.year}
              >
                {group.year}
              </option>
            ))}

          </select>

        </div>

        {/* STORY CARDS */}

        <div className="space-y-12">

          {filteredLibrary.map((group) => {

            const yearCompleted =
              listeningStories.filter(
                (story) =>
                  story.year === group.year &&
                  progress[story.id]?.completed
              ).length;

            return (

              <section key={group.year}>

                <div className="mb-5 flex items-center justify-between border-b border-slate-700 pb-3">

                  <h3 className="text-2xl font-bold text-blue-400">
                    {group.year}
                  </h3>

                  <span className="text-sm text-slate-400">
                    {yearCompleted} / {group.titles.length} completed
                  </span>

                </div>

                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">

                  {group.titles.map(
                    (title, index) => {

                      const story =
                        listeningStories.find(
                          (item) =>
                            item.year === group.year &&
                            item.title === title
                        );

                      const storyProgress = story
                        ? progress[story.id]
                        : undefined;

                      const isReady =
                        !!story &&
                        story.questions.length === 25 &&
                        !!story.transcript.trim();

                      return (

                        <article
                          key={title}
                          className="flex flex-col rounded-xl border border-slate-700 bg-slate-900 p-6"
                        >

                          <div className="mb-4 flex items-center justify-between">

                            <span className="text-sm text-slate-400">
                              Story {index + 1}
                            </span>

                            {storyProgress?.completed ? (

                              <span className="rounded-full bg-green-950 px-3 py-1 text-xs font-bold text-green-400">
                                Completed
                              </span>

                            ) : isReady ? (

                              <span className="rounded-full bg-blue-950 px-3 py-1 text-xs font-bold text-blue-400">
                                Available
                              </span>

                            ) : (

                              <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-400">
                                Coming Soon
                              </span>

                            )}

                          </div>

                          <h4 className="mb-4 text-xl font-bold">
                            {title}
                          </h4>

                          <div className="mb-5 space-y-2 text-sm text-slate-400">
                            <p>25 Questions</p>
                            <p>10-Minute Test</p>
                            <p>Maximum Score: 75</p>
                          </div>

                          {storyProgress && (

                            <div className="mb-5 rounded-lg bg-slate-800 p-4">

                              <div className="flex justify-between">

                                <span className="text-sm text-slate-400">
                                  Best Score
                                </span>

                                <span className="font-bold text-green-400">
                                  {storyProgress.bestScore}/75
                                </span>

                              </div>

                              <div className="mt-2 flex justify-between">

                                <span className="text-sm text-slate-400">
                                  Last Score
                                </span>

                                <span>
                                  {storyProgress.lastScore}/75
                                </span>

                              </div>

                              <div className="mt-2 flex justify-between">

                                <span className="text-sm text-slate-400">
                                  Attempts
                                </span>

                                <span>
                                  {storyProgress.attempts.length}
                                </span>

                              </div>

                            </div>

                          )}

                          <div className="mt-auto">

                            {isReady && story ? (

                              <button
                                onClick={() =>
                                  startStory(story)
                                }
                                className="w-full rounded-lg bg-blue-600 py-3 font-bold hover:bg-blue-500"
                              >
                                {storyProgress?.completed
                                  ? "Retake Test"
                                  : "Start Test"}
                              </button>

                            ) : (

                              <button
                                disabled
                                className="w-full cursor-not-allowed rounded-lg bg-slate-800 py-3 font-semibold text-slate-500"
                              >
                                Coming Soon
                              </button>

                            )}

                          </div>

                        </article>

                      );

                    }
                  )}

                </div>

              </section>

            );

          })}

        </div>

      </div>

    </main>
  );
}
