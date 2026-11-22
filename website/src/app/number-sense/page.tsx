
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const topics = [
  {
    name: "Multiplying by 11",
    lesson: "For a two-digit number, add its digits and place the sum between them. Carry when the sum is 10 or more.",
    example: "23 × 11 = 253 because 2 + 3 = 5.",
    questions: [
      { question: "34 × 11", answer: 374 },
      { question: "52 × 11", answer: 572 },
      { question: "67 × 11", answer: 737 },
    ],
  },
  {
    name: "Squares Ending in 5",
    lesson: "Multiply the number before the final 5 by the next whole number, then append 25.",
    example: "35² = 1225 because 3 × 4 = 12, then append 25.",
    questions: [
      { question: "25²", answer: 625 },
      { question: "45²", answer: 2025 },
      { question: "75²", answer: 5625 },
    ],
  },
  {
    name: "Percentages",
    lesson: "Find 10% by dividing by 10. Find 5% by halving 10%. Combine easy percentages to find others.",
    example: "15% of 200 = 10% (20) + 5% (10) = 30.",
    questions: [
      { question: "15% of 80", answer: 12 },
      { question: "25% of 240", answer: 60 },
      { question: "5% of 360", answer: 18 },
    ],
  },
];

const testQuestions = [
  { question: "12 × 11", answer: 132 },
  { question: "35²", answer: 1225 },
  { question: "20% of 150", answer: 30 },
  { question: "48 × 11", answer: 528 },
  { question: "65²", answer: 4225 },
];

export default function NumberSensePage() {
  const [mode, setMode] = useState<"home" | "learn" | "test">("home");
  const [topicIndex, setTopicIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);

const [timeLeft, setTimeLeft] = useState(300);

useEffect(() => {
  if (mode !== "test" || submitted) return;

  if (timeLeft <= 0) {
    setSubmitted(true);
    return;
  }

  const timer = setTimeout(() => {
    setTimeLeft((previous) => previous - 1);
  }, 1000);

  return () => clearTimeout(timer);
}, [mode, submitted, timeLeft]);

  const questions =
    mode === "test"
      ? testQuestions
      : topics[topicIndex].questions;

  const score = questions.filter(
    (q, i) =>
      answers[i]?.trim() !== "" &&
      Number(answers[i]) === q.answer
  ).length;

  function start(
    nextMode: "learn" | "test",
    selectedTopic = 0
  ) {
    setMode(nextMode);
    setTopicIndex(selectedTopic);
    setAnswers({});
    setSubmitted(false);
    setTimeLeft(300);
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-4xl">
        <Link href="/" className="text-cyan-400">
          ← Back to Homepage
        </Link>

        <h1 className="mt-8 text-4xl font-bold">
          Number Sense
        </h1>
        <p className="mt-3 text-slate-400">
          Learn mental math strategies and prepare for competition.
        </p>

{mode === "test" && !submitted && (
  <div className="mt-8 rounded-xl bg-cyan-900 p-5 text-center">
    <p className="text-sm text-cyan-200">
      Time Remaining
    </p>
    <p className="text-4xl font-bold">
      {Math.floor(timeLeft / 60)}:
      {String(timeLeft % 60).padStart(2, "0")}
    </p>
  </div>
)}

        {mode === "home" && (
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <button
              onClick={() => start("learn")}
              className="rounded-xl bg-slate-800 p-8 text-left hover:bg-slate-700"
            >
              <h2 className="text-2xl font-bold">Learn & Practice</h2>
              <p className="mt-3 text-slate-300">
                Choose a topic, study a strategy, and answer questions.
              </p>
            </button>

            <button
              onClick={() => start("test")}
              className="rounded-xl bg-cyan-600 p-8 text-left hover:bg-cyan-500"
            >
              <h2 className="text-2xl font-bold">Practice Test</h2>
              <p className="mt-3">
                Try a short five-question competition-style demo.
              </p>
            </button>
          </div>
        )}

        {mode === "learn" && (
          <div className="mt-8">
            <label className="block font-semibold">
              Choose a topic
            </label>
            <select
              className="mt-3 w-full rounded-lg bg-slate-800 p-3"
              value={topicIndex}
              onChange={(e) =>
                start("learn", Number(e.target.value))
              }
            >
              {topics.map((topic, i) => (
                <option key={topic.name} value={i}>
                  {topic.name}
                </option>
              ))}
            </select>

            <div className="mt-6 rounded-xl bg-slate-800 p-6">
              <h2 className="text-2xl font-bold">
                {topics[topicIndex].name}
              </h2>
              <p className="mt-4">
                {topics[topicIndex].lesson}
              </p>
              <p className="mt-4 text-cyan-300">
                Example: {topics[topicIndex].example}
              </p>
            </div>
          </div>
        )}

        {mode !== "home" && (
          <div className="mt-8 space-y-5">
            {questions.map((q, i) => (
              <div
                key={i}
                className="rounded-xl border border-slate-700 p-5"
              >
                <p className="text-lg font-semibold">
                  {i + 1}. {q.question}
                </p>
                <input
                  type="number"
                  placeholder="Your answer"
                  value={answers[i] ?? ""}
                  disabled={submitted}
                  onChange={(e) =>
                    setAnswers({
                      ...answers,
                      [i]: e.target.value,
                    })
                  }
                  className="mt-3 w-full rounded-lg bg-slate-800 p-3 text-white"
                />
                {submitted && (
                  <p className="mt-3 text-sm">
                    {Number(answers[i]) === q.answer &&
                    answers[i]?.trim() !== ""
                      ? "✓ Correct"
                      : `✗ Correct answer: ${q.answer}`}
                  </p>
                )}
              </div>
            ))}

            {!submitted ? (
              <button
                onClick={() => setSubmitted(true)}
                className="rounded-lg bg-cyan-500 px-6 py-3 font-bold text-black"
              >
                Submit Answers
              </button>
            ) : (
              <div className="rounded-xl bg-slate-800 p-6">
                <h2 className="text-2xl font-bold">
                  Your Score: {score} / {questions.length}
                </h2>
                <button
                  onClick={() => start(mode, topicIndex)}
                  className="mt-4 rounded-lg bg-cyan-500 px-5 py-2 font-bold text-black"
                >
                  Try Again
                </button>
              </div>
            )}

            <button
              onClick={() => setMode("home")}
              className="block text-slate-400 underline"
            >
              Back to Number Sense Menu
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
