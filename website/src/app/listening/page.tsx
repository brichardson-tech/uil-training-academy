
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ListeningTest from "./listening-test";
import { listeningStories } from "./listening-stories";
import type { ListeningStory, ListeningProgress } from "./listening-types";

export default function ListeningPage() {
  const [activeStory, setActiveStory] = useState<ListeningStory | null>(null);
  const [progress, setProgress] = useState<Record<string, ListeningProgress>>({});

  function loadProgress() {
    const next: Record<string, ListeningProgress> = {};

    for (const story of listeningStories) {
      try {
        const saved = localStorage.getItem(`uil-listening-${story.id}`);
        if (saved) next[story.id] = JSON.parse(saved);
      } catch {
        /* Ignore unavailable or invalid local storage. */
      }
    }

    setProgress(next);
  }

  useEffect(() => {
    loadProgress();
  }, []);

  if (activeStory) {
    return (
      <ListeningTest
        key={activeStory.id}
        story={activeStory}
        onExit={() => {
          setActiveStory(null);
          loadProgress();
        }}
      />
    );
  }

  const completed = listeningStories.filter(
    s => progress[s.id]?.completed
  ).length;

  const scores = listeningStories
    .filter(s => progress[s.id]?.completed)
    .map(s => progress[s.id].bestScore);

  const best = scores.length ? Math.max(...scores) : null;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">

        <Link
          href="/"
          className="text-sm font-semibold text-cyan-400 hover:underline"
        >
          ← Back to Academy
        </Link>

        <h1 className="mt-5 text-4xl font-bold tracking-tight">
          Listening Skills
        </h1>

        <p className="mt-2 text-slate-400">
          Choose an original listening practice test. Listen, take notes,
          then answer 25 questions.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">

          <div className="rounded-xl border border-slate-700 bg-slate-800 p-5">
            <p className="text-sm text-slate-400">Available tests</p>
            <p className="text-3xl font-bold">
              {listeningStories.length}
            </p>
          </div>

          <div className="rounded-xl border border-slate-700 bg-slate-800 p-5">
            <p className="text-sm text-slate-400">Completed</p>
            <p className="text-3xl font-bold">
              {completed} / {listeningStories.length}
            </p>
          </div>

          <div className="rounded-xl border border-slate-700 bg-slate-800 p-5">
            <p className="text-sm text-slate-400">Personal best</p>
            <p className="text-3xl font-bold text-cyan-400">
              {best === null ? "—" : `${best} / 75`}
            </p>
          </div>

        </div>

        <div
          className="mt-4 h-2 overflow-hidden rounded-full bg-slate-700"
          role="progressbar"
          aria-label="Tests completed"
          aria-valuenow={completed}
          aria-valuemin={0}
          aria-valuemax={listeningStories.length}
        >
          <div
            className="h-full rounded-full bg-green-500 transition-all"
            style={{
              width: `${
                listeningStories.length
                  ? completed / listeningStories.length * 100
                  : 0
              }%`
            }}
          />
        </div>

        <h2 className="mb-4 mt-8 text-2xl font-bold">
          Choose a test
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

          {listeningStories.map((story, index) => {
            const saved = progress[story.id];

            return (
              <article
                key={story.id}
                className="flex flex-col rounded-xl border border-slate-700 bg-slate-800 p-5 shadow-sm transition-colors hover:border-cyan-400"
              >

                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="font-semibold text-slate-400">
                    Test {index + 1}
                  </span>

                  <span
                    className={
                      saved?.completed
                        ? "font-semibold text-green-400"
                        : "text-slate-400"
                    }
                  >
                    {saved?.completed ? "Completed" : "Available"}
                  </span>
                </div>

                <h3 className="mt-3 text-xl font-bold">
                  {story.title}
                </h3>

                <p className="mt-2 text-sm text-slate-300">
                  25 questions · 10-minute answer period
                </p>

                {saved?.completed && (
                  <p className="mt-2 text-sm text-cyan-400">
                    Best: {saved.bestScore} / 75 · Attempts:{" "}
                    {saved.attempts?.length ?? 0}
                  </p>
                )}

                <div className="flex-1" />

                <button
                  type="button"
                  onClick={() => setActiveStory(story)}
                  className="mt-5 rounded-lg bg-cyan-500 px-4 py-3 font-bold text-black transition-colors hover:bg-cyan-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400"
                >
                  {saved?.completed ? "Retake Test" : "Start Test"}
                </button>

              </article>
            );
          })}

        </div>

        <p className="mt-10 border-t border-slate-700 pt-4 text-xs text-slate-400">
          Independent educational practice materials. Not affiliated with,
          sponsored by, or endorsed by the University Interscholastic
          League (UIL). Progress is saved in this browser.
        </p>

      </div>
    </main>
  );
}
