"use client";



import { useEffect, useState } from "react";

import Link from "next/link";

import { competitionLevels } from "@/lib/competition-levels";

import { numberSenseQuestions } from "@/lib/number-sense-questions";

import { generateNumberSenseTest } from "@/lib/number-sense-generator";
import NumberSensePractice from "./number-sense-practice";



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



function parseMathAnswer(value: string): number | null {

  const text = value.trim();

  if (!text) return null;



  const mixed = text.match(/^(-?\d+)\s+(\d+)\/(\d+)$/);

  if (mixed) {

    const whole = Number(mixed[1]);

    const numerator = Number(mixed[2]);

    const denominator = Number(mixed[3]);

    if (denominator === 0) return null;

    const fraction = numerator / denominator;

    return whole < 0 ? whole - fraction : whole + fraction;

  }

  const fraction = text.match(/^(-?\d+)\/(-?\d+)$/);

  if (fraction) {

    const numerator = Number(fraction[1]);

    const denominator = Number(fraction[2]);

    if (denominator === 0) return null;

    return numerator / denominator;

  }



  if (!/^-?(?:\d+(?:\.\d*)?|\.\d+)$/.test(text)) return null;

  return Number(text);

}



function isCorrectAnswer(

  studentAnswer: string | undefined,

  correctAnswer: number | string,

  questionIndex?: number,

  isTest = false

): boolean {

  if (!studentAnswer?.trim()) return false;

  const studentValue = parseMathAnswer(studentAnswer);

  const correctValue = parseMathAnswer(String(correctAnswer));



  if (isTest && questionIndex !== undefined && (questionIndex + 1) % 10 === 0) {

    if (studentValue === null || correctValue === null) return false;

    if (!/^-?\d+$/.test(studentAnswer.trim())) return false;

    const tolerance = Math.abs(correctValue) * 0.05;

    return Math.abs(studentValue - correctValue) <= tolerance + 1e-9;

  }



  if (studentValue === null || correctValue === null) {

    return studentAnswer.trim() === String(correctAnswer).trim();

  }

  return Math.abs(studentValue - correctValue) < 1e-9;

}



export default function NumberSensePage() {

  const [mode, setMode] = useState<"home" | "learn" | "test">("home");

  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);

  const [topicIndex, setTopicIndex] = useState(0);

  const [answers, setAnswers] = useState<Record<number, string>>({});

  const [testQuestions, setTestQuestions] = useState<(typeof numberSenseQuestions)[string]>([]);

  const [submitted, setSubmitted] = useState(false);

  const [timeLeft, setTimeLeft] = useState(600);



    useEffect(() => {

    if (mode !== "test" || submitted) return;

    if (timeLeft <= 0) {

      setSubmitted(true);

      return;

    }

    const timer = setTimeout(() => setTimeLeft((previous) => previous - 1), 1000);

    return () => clearTimeout(timer);

  }, [mode, submitted, timeLeft]);



  const questions = mode === "test" ? testQuestions : topics[topicIndex].questions;

  const lastAttemptedIndex = questions.reduce(

    (last, _question, index) => (answers[index]?.trim() ? index : last),

    -1

  );

  const correctCount = questions.filter((question, index) =>

    isCorrectAnswer(answers[index], question.answer, index, mode === "test")

  ).length;

  const incorrectOrSkippedCount = lastAttemptedIndex + 1 - correctCount;

  const skippedCount = questions.filter(

    (_question, index) => index <= lastAttemptedIndex && !answers[index]?.trim()

  ).length;

  const incorrectCount = incorrectOrSkippedCount - skippedCount;

  const unattemptedCount = questions.length - (lastAttemptedIndex + 1);

  const uilScore = correctCount * 5 - incorrectOrSkippedCount * 4;

  const answeredCount = questions.filter((_question, index) => answers[index]?.trim()).length;



  function start(nextMode: "learn" | "test", selectedTopic = 0) {

    if (nextMode === "test") {

      if (selectedLevel === "high-school") {

        setTestQuestions(numberSenseQuestions["high-school"].slice(0, 80));

      } else {

        const level = selectedLevel === "junior-high" ? "junior-high" : "elementary";

        setTestQuestions(generateNumberSenseTest(level));

      }

    }

    setMode(nextMode);

    setTopicIndex(selectedTopic);

    setAnswers({});

    setSubmitted(false);

    setTimeLeft(600);

  }



  return (

    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">

      <div className="mx-auto max-w-4xl">

        <Link href="/" className="text-cyan-400">← Back to Homepage</Link>

        <h1 className="mt-8 text-4xl font-bold">Number Sense</h1>

        <p className="mt-3 text-slate-400">Learn mental math strategies and prepare for competition.</p>



        {mode === "test" && !submitted && (

          <div className="mt-8 rounded-xl bg-cyan-900 p-5 text-center">

            <p className="text-sm text-cyan-200">Time Remaining</p>

            <p className="text-4xl font-bold">

              {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}

            </p>

          </div>

        )}

         {mode === "home" && !selectedLevel && (

          <div className="mt-10">

            <h2 className="mb-6 text-2xl font-bold">Choose Your Competition Level</h2>

            <div className="grid gap-5 md:grid-cols-3">

              {competitionLevels.map((level) => (

                <button

                  key={level.id}

                  onClick={() => setSelectedLevel(level.id)}

                  className="rounded-xl border border-slate-700 bg-slate-800 p-6 text-left hover:border-cyan-400"

                >

                  <h3 className="text-xl font-bold">{level.name}</h3>

                  <p className="mt-2 text-cyan-400">{level.grades}</p>

                  <p className="mt-3 text-sm text-slate-300">{level.description}</p>

                </button>

              ))}

            </div>

          </div>

        )}



        {mode === "home" && selectedLevel && (

          <>

            <div className="mt-10 grid gap-6 md:grid-cols-2">

              <button

                onClick={() => start("learn")}

                className="rounded-xl bg-slate-800 p-8 text-left hover:bg-slate-700"

              >

                <h2 className="text-2xl font-bold">Learn & Practice</h2>

                <p className="mt-3 text-slate-300">Choose a topic, study a strategy, and answer questions.</p>

              </button>

              <button

                onClick={() => start("test")}

                className="rounded-xl bg-cyan-600 p-8 text-left hover:bg-cyan-500"

              >

                <h2 className="text-2xl font-bold">Practice Test</h2>

                <p className="mt-3">Take an 80-question mental math practice test with a 10-minute timer.</p>

              </button>

            </div>

            <button onClick={() => setSelectedLevel(null)} className="mt-8 text-cyan-400 underline">

              ← Change Competition Level

            </button>

          </>

        )}



        {mode === "learn" && (
         <NumberSensePractice level={selectedLevel ?? "elementary"} onBack={() => setMode("home")} />
       )}

       {mode === "test" && (

          <div className="mt-8 space-y-5">

            {mode === "test" && (

              <div className="rounded-xl bg-slate-800 p-5">

                <p className="mb-3 text-sm text-slate-300">Answered: {answeredCount} / {questions.length}</p>

                <div className="mb-5 h-3 overflow-hidden rounded-full bg-slate-700">

                  <div

                    className="h-full bg-green-500 transition-all"

                    style={{ width: `${questions.length ? (answeredCount / questions.length) * 100 : 0}%` }}

                  />

                </div>

                <h2 className="mb-4 text-xl font-bold">Jump to Question</h2>

                <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">

                  {questions.map((question, index) => (

                    <a

                      key={index}

                      href={`#question-${index + 1}`}

                      className={`rounded-lg p-2 text-center text-sm text-white ${

                        submitted

                          ? index > lastAttemptedIndex

                            ? "bg-slate-700"

                            : !answers[index]?.trim()

                              ? "bg-yellow-600"

                              : isCorrectAnswer(answers[index], question.answer, index, true)

                                ? "bg-green-600"

                                : "bg-red-600"

                          : answers[index]?.trim()

                            ? "bg-green-600"

                            : "bg-slate-700 hover:bg-cyan-600"

                      }`}

                    >

                      {index + 1}

                    </a>

                  ))}

                </div>

              </div>

            )}





            {questions.map((question, index) => {

              const correct = isCorrectAnswer(answers[index], question.answer, index, mode === "test");

              const unattempted = mode === "test" && index > lastAttemptedIndex;

              const skipped = !answers[index]?.trim();

              return (

                <div

                  key={index}

                  id={`question-${index + 1}`}

                  className="rounded-xl border border-slate-700 p-5"

                >

                  <p className="text-lg font-semibold">

                    {index + 1}{mode === "test" && (index + 1) % 10 === 0 ? "★" : "."} {question.question}

                  </p>

                  <input

                    type="text"

                    placeholder="Your answer"

                    value={answers[index] ?? ""}

                    disabled={submitted}

                    onChange={(event) => setAnswers((previous) => ({ ...previous, [index]: event.target.value }))}

                    className="mt-3 w-full rounded-lg bg-slate-800 p-3 text-white"

                  />

                  {submitted && (

                    <div

                      className={`mt-3 rounded-lg p-3 text-sm ${

                        unattempted

                          ? "bg-slate-700 text-slate-200"

                          : skipped

                            ? "bg-yellow-900 text-yellow-200"

                            : correct

                              ? "bg-green-900 text-green-200"

                              : "bg-red-900 text-red-200"

                      }`}

                    >

                      {unattempted ? (

                        <p>Unattempted — No penalty</p>

                      ) : skipped ? (

                        <p>Skipped — Correct answer: {question.answer}</p>

                      ) : correct ? (

                        <p>✓ Correct — +5 points</p>

                      ) : (

                        <p>✗ Incorrect — Correct answer: {question.answer} (−4 points)</p>

                      )}

                    </div>

                  )}

                </div>

              );

            })}



            {!submitted ? (

              <button

                onClick={() => {

                  const message = lastAttemptedIndex === -1

                    ? "You haven't answered any questions yet. Are you sure you want to submit?"

                    : `You have answered ${answeredCount} out of ${questions.length} questions. Are you sure you want to submit?`;

                  if (window.confirm(message)) setSubmitted(true);

                }}

                className="rounded-lg bg-cyan-500 px-6 py-3 font-bold text-black"

              >

                Submit Answers

              </button>

            ) : (

              <div className="rounded-xl bg-slate-800 p-6">

                {mode === "test" && timeLeft === 0 && (

                  <div className="mb-5 rounded-lg bg-amber-900 p-4 text-amber-100">

                    <p className="font-bold">Time's Up!</p>

                    <p className="mt-1 text-sm">Your 10-minute practice test has ended. Your answers were submitted automatically.</p>

                  </div>

                )}

                <h2 className="text-2xl font-bold">UIL Score: {uilScore}</h2>

                <div className="mt-5 grid grid-cols-2 gap-3">

                  <div className="rounded-lg bg-green-900 p-4">

                    <p className="text-sm text-green-200">Correct</p>

                    <p className="text-2xl font-bold">{correctCount}</p>

                  </div>

                  <div className="rounded-lg bg-red-900 p-4">

                    <p className="text-sm text-red-200">Incorrect</p>

                    <p className="text-2xl font-bold">{incorrectCount}</p>

                  </div>

                  <div className="rounded-lg bg-slate-700 p-4">

                    <p className="text-sm text-slate-300">Skipped</p>

                    <p className="text-2xl font-bold">{skippedCount}</p>

                  </div>

                  <div className="rounded-lg bg-slate-700 p-4">

                    <p className="text-sm text-slate-300">Unattempted</p>

                    <p className="text-2xl font-bold">{unattemptedCount}</p>

                  </div>

                </div>

                <p className="mt-4 text-sm text-slate-300">Correct Answers: {correctCount} / {questions.length}</p>

                <button

                  onClick={() => start(mode === "test" ? "test" : "learn", topicIndex)}

                  className="mt-4 rounded-lg bg-cyan-500 px-5 py-2 font-bold text-black"

                >

                  Try Again

                </button>

              </div>

            )}

            <button onClick={() => setMode("home")} className="block text-slate-400 underline">

              Back to Number Sense Menu

            </button>

          </div>

        )}

      </div>

    </main>

  );

}