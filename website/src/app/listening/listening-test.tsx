
"use client";

import { useState, useEffect, useRef } from "react";

import {
  LISTENING_RULES,
  type ListeningStory,
  type ListeningPhase,
  type ListeningResult,
  type ListeningProgress,
} from "./listening-types";

type Props = {
  story: ListeningStory;
  onExit: () => void;
};

export default function ListeningTest({
  story,
  onExit,
}: Props) {
  const [phase, setPhase] =
    useState<ListeningPhase>("instructions");

  const [notes, setNotes] = useState("");
  const [answers, setAnswers] =
    useState<Record<number, string>>({});

  const [timeLeft, setTimeLeft] = useState<number>(
    LISTENING_RULES.testingTime
  );

  const [result, setResult] =
    useState<ListeningResult | null>(null);

  const [selectedQuestion, setSelectedQuestion] =
    useState(1);

  const [narrationProgress, setNarrationProgress] =
    useState(0);

  const [error, setError] = useState("");
  const [isPaused, setIsPaused] = useState(false);

  const pauseRequested = useRef(false);
  const continueNarration = useRef<(() => void) | null>(null);
  const narrationId = useRef(0);
  const deadline = useRef(0);
  const submitted = useRef(false);
  const utteranceRef =
    useRef<SpeechSynthesisUtterance | null>(null);

  const answeredCount = story.questions.filter(
    (question) => answers[question.id] !== undefined
  ).length;

  useEffect(() => {
    return () => {
      narrationId.current += 1;

      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        window.speechSynthesis.resume();
      }
    };
  }, []);

  function togglePause() {
    if (phase !== "listening") return;

    if (pauseRequested.current) {
      pauseRequested.current = false;
      setIsPaused(false);
      continueNarration.current?.();
    } else {
      pauseRequested.current = true;
      setIsPaused(true);
    }
  }

  function beginTesting() {
    pauseRequested.current = false;
    continueNarration.current = null;
    setIsPaused(false);
    deadline.current =
      Date.now() + LISTENING_RULES.testingTime * 1000;

    setTimeLeft(LISTENING_RULES.testingTime);
    setPhase("testing");
  }

  function startNarration() {
    setError("");

    if (
      !("speechSynthesis" in window) ||
      !("SpeechSynthesisUtterance" in window)
    ) {
      setError(
        "Narration is not supported in this browser. Please use Google Chrome."
      );
      return;
    }

    if (
      !story.transcript.trim() ||
      story.questions.length !==
        LISTENING_RULES.questionCount
    ) {
      setError("This test is not ready yet.");
      return;
    }

    const runId = ++narrationId.current;

    window.speechSynthesis.cancel();

    window.speechSynthesis.resume();
    pauseRequested.current = false;
    continueNarration.current = null;
    setIsPaused(false);
    setPhase("listening");
    setNarrationProgress(0);

    const words = story.transcript.trim().split(/\s+/);
    const chunks: string[] = [];

    let chunk = "";

    for (const word of words) {
      if (
        chunk.length + word.length > 180 &&
        chunk.length > 0
      ) {
        chunks.push(chunk.trim());
        chunk = "";
      }

      chunk += word + " ";

      if (
        chunk.length > 90 &&
        /[.!?]["']?$/.test(word)
      ) {
        chunks.push(chunk.trim());
        chunk = "";
      }
    }

    if (chunk.trim()) {
      chunks.push(chunk.trim());
    }

    let currentChunk = 0;

    function speakNextChunk() {
      if (runId !== narrationId.current) return;

      if (currentChunk >= chunks.length) {
        setNarrationProgress(100);
        utteranceRef.current = null;
        beginTesting();
        return;
      }

      if (pauseRequested.current) {
        continueNarration.current = speakNextChunk;
        return;
      }
      continueNarration.current = null;

      const utterance =
        new SpeechSynthesisUtterance(
          chunks[currentChunk]
        );

      utterance.lang = "en-US";
      utterance.rate = story.narrationRate ?? 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;

      const voices =
        window.speechSynthesis.getVoices();

      const englishVoice =
        voices.find(
          (voice) =>
            voice.lang === "en-US" &&
            voice.localService
        ) ??
        voices.find(
          (voice) => voice.lang === "en-US"
        );

      if (englishVoice) {
        utterance.voice = englishVoice;
      }

      utterance.onend = () => {
        if (runId !== narrationId.current) return;

        currentChunk += 1;

        setNarrationProgress(
          Math.round(
            (currentChunk / chunks.length) * 100
          )
        );

        speakNextChunk();
      };

      utterance.onerror = () => {
        if (runId !== narrationId.current) return;

        narrationId.current += 1;
        window.speechSynthesis.cancel();

        window.speechSynthesis.resume();
        pauseRequested.current = false;
        continueNarration.current = null;
        setIsPaused(false);
        setNotes("");
        setPhase("instructions");

        setError(
          "Narration was interrupted. Please restart the test."
        );
      };

      utteranceRef.current = utterance;

      window.speechSynthesis.speak(utterance);
    }

    speakNextChunk();
  }

  function chooseAnswer(
    questionId: number,
    answer: string
  ) {
    if (
      phase !== "testing" ||
      submitted.current ||
      Date.now() >= deadline.current
    ) {
      return;
    }

    setAnswers((previous) => ({
      ...previous,
      [questionId]: answer,
    }));
  }

  function clearAnswer(questionId: number) {
    if (
      submitted.current ||
      Date.now() >= deadline.current
    ) {
      return;
    }

    setAnswers((previous) => {
      const updated = { ...previous };
      delete updated[questionId];
      return updated;
    });
  }

  function submitTest() {
    if (submitted.current) return;

    submitted.current = true;

    let correct = 0;
    let incorrect = 0;
    let unanswered = 0;

    for (const question of story.questions) {
      const studentAnswer = answers[question.id];

      if (studentAnswer === undefined) {
        unanswered += 1;
      } else if (
        studentAnswer === question.correctAnswer
      ) {
        correct += 1;
      } else {
        incorrect += 1;
      }
    }

    const score =
      correct * LISTENING_RULES.correctPoints +
      incorrect * LISTENING_RULES.incorrectPoints;

    const remaining = Math.max(
      0,
      Math.ceil(
        (deadline.current - Date.now()) / 1000
      )
    );

    const newResult: ListeningResult = {
      storyId: story.id,
      correct,
      incorrect,
      unanswered,
      score,
      completedAt: new Date().toISOString(),
      answers: { ...answers },
      timeUsed:
        LISTENING_RULES.testingTime - remaining,
    };

    setResult(newResult);

    try {
      const storageKey =
        `uil-listening-${story.id}`;

      const saved =
        localStorage.getItem(storageKey);

      const previous: ListeningProgress | null =
        saved ? JSON.parse(saved) : null;

      const progress: ListeningProgress = {
        storyId: story.id,
        attempts: [
          ...(previous?.attempts ?? []),
          newResult,
        ],
        bestScore: previous
          ? Math.max(previous.bestScore, score)
          : score,
        lastScore: score,
        completed: true,
      };

      localStorage.setItem(
        storageKey,
        JSON.stringify(progress)
      );
    } catch {
      setError(
        "Your score could not be saved on this device."
      );
    }

    setPhase("results");
  }

  useEffect(() => {
    if (phase !== "testing") return;

    function updateTimer() {
      const remaining = Math.max(
        0,
        Math.ceil(
          (deadline.current - Date.now()) / 1000
        )
      );

      setTimeLeft(remaining);

      if (remaining === 0) {
        submitTest();
      }
    }

    updateTimer();

    const timer = window.setInterval(
      updateTimer,
      250
    );

    return () => window.clearInterval(timer);
  }, [phase, answers]);

  function resetTest() {
    narrationId.current += 1;

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      window.speechSynthesis.resume();
    }

    setIsPaused(false);
    pauseRequested.current = false;
    continueNarration.current = null;
    submitted.current = false;

    setNotes("");
    setAnswers({});
    setResult(null);
    setError("");
    setSelectedQuestion(1);
    setNarrationProgress(0);
    setTimeLeft(LISTENING_RULES.testingTime);
    setPhase("instructions");
  }

  function exitTest() {
    if (
      phase === "listening" ||
      phase === "testing"
    ) {
      const confirmed = window.confirm(
        "Leave this test? Your current attempt will not be saved."
      );

      if (!confirmed) return;
    }

    narrationId.current += 1;

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      window.speechSynthesis.resume();
    }

    pauseRequested.current = false;
    continueNarration.current = null;
    onExit();
  }

  function formatTime(seconds: number) {
    const minutes = Math.floor(seconds / 60);
    const remaining = seconds % 60;

    return `${minutes}:${remaining
      .toString()
      .padStart(2, "0")}`;
  }

  function renderHighlightedTranscript() {
    const question = story.questions.find(
      (item) => item.id === selectedQuestion
    );

    const transcript = story.transcript;

    const evidence = question?.evidence.filter(
      (item) => item.trim().length > 0
    ) ?? [];

    const ranges: {
      start: number;
      end: number;
    }[] = [];

    for (const passage of evidence) {
      const lowerTranscript =
        transcript.toLowerCase();

      const lowerPassage =
        passage.toLowerCase();

      let position = lowerTranscript.indexOf(
        lowerPassage
      );

      while (position !== -1) {
        ranges.push({
          start: position,
          end: position + passage.length,
        });

        position = lowerTranscript.indexOf(
          lowerPassage,
          position + passage.length
        );
      }
    }

    ranges.sort((a, b) => a.start - b.start);

    const merged: typeof ranges = [];

    for (const range of ranges) {
      const last = merged[merged.length - 1];

      if (last && range.start <= last.end) {
        last.end = Math.max(last.end, range.end);
      } else {
        merged.push({ ...range });
      }
    }

    const parts = [];
    let cursor = 0;

    for (const range of merged) {
      parts.push(
        <span key={`text-${cursor}`}>
          {transcript.slice(cursor, range.start)}
        </span>
      );

      parts.push(
        <mark
          key={`highlight-${range.start}`}
          className="rounded bg-yellow-300 px-1 text-black"
        >
          {transcript.slice(range.start, range.end)}
        </mark>
      );

      cursor = range.end;
    }

    parts.push(
      <span key="remaining">
        {transcript.slice(cursor)}
      </span>
    );

    return (
      <>
        {merged.length === 0 && (
          <p className="mb-4 text-sm text-amber-400">
            No exact supporting passage is available
            for this question.
          </p>
        )}

        <div className="whitespace-pre-wrap leading-8 text-slate-200">
          {parts}
        </div>
      </>
    );
  }

  function renderNotepad() {
    return (
      <section className="rounded-xl border border-slate-700 bg-slate-900 p-5">
        <h2 className="mb-2 text-xl font-bold">
          Your Notes
        </h2>

        <p className="mb-4 text-sm text-slate-400">
          Record important names, dates, numbers,
          places, and details.
        </p>

        <textarea
          value={notes}
          onChange={(event) =>
            setNotes(event.target.value)
          }
          placeholder="Type your notes here..."
          className="min-h-80 w-full resize-y rounded-lg border border-slate-600 bg-slate-950 p-4 text-white outline-none focus:border-blue-500"
        />

        <p className="mt-2 text-xs text-slate-400">
          Your notes remain available during the test.
        </p>
      </section>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-8">

        <button
          onClick={exitTest}
          className="mb-6 text-blue-400 hover:text-blue-300"
        >
          &larr; Back to Story Library
        </button>

        <p className="mb-2 font-semibold text-blue-400">
          UIL LISTENING SKILLS
        </p>

        <h1 className="text-3xl font-bold">
          {story.title}
        </h1>

        <p className="mb-8 mt-2 text-slate-400">
          {story.year}
        </p>

        {error && (
          <div className="mb-6 rounded-lg border border-red-700 bg-red-950 p-4 text-red-300">
            {error}
          </div>
        )}

        {/* INSTRUCTIONS */}

        {phase === "instructions" && (
          <section className="mx-auto max-w-3xl rounded-xl border border-slate-700 bg-slate-900 p-8">

            <h2 className="mb-5 text-2xl font-bold">
              Before You Begin
            </h2>

            <ol className="list-decimal space-y-4 pl-6 text-slate-300">
              <li>
                Make sure your headphones or speakers
                are working.
              </li>
              <li>
                Listen carefully to the entire story.
              </li>
              <li>
                You may take notes while listening.
              </li>
              <li>
                You may pause and resume the narration,
                but you cannot skip, rewind, or replay it.
              </li>
              <li>
                The 25 questions will appear after
                the narration ends.
              </li>
              <li>
                You will have 10 minutes to answer
                the questions.
              </li>
              <li>
                Your test will automatically submit
                when time expires.
              </li>
            </ol>

            <div className="my-6 rounded-lg bg-slate-800 p-4">
              <p className="font-bold text-green-400">
                Correct: +3 points
              </p>
              <p className="font-bold text-red-400">
                Incorrect: -2 points
              </p>
              <p className="text-slate-300">
                Unanswered: 0 points
              </p>
            </div>

            <button
              onClick={startNarration}
              className="w-full rounded-lg bg-blue-600 py-4 text-lg font-bold hover:bg-blue-500"
            >
              Begin Listening
            </button>

          </section>
        )}

        {/* LISTENING */}

        {phase === "listening" && (
          <div className="grid gap-6 lg:grid-cols-2">

            <section className="rounded-xl border border-slate-700 bg-slate-900 p-8">

              <div className="mb-6 text-center">

                <div className={`mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-blue-600 text-4xl ${isPaused ? "" : "animate-pulse"}`}>
                  ♪
                </div>

                <h2 className="text-2xl font-bold">
                  {isPaused ? "Narration Paused" : "Story in Progress"}
                </h2>

                <p className="mt-3 text-slate-400">
                  {isPaused ? "Pausing at the next short passage break. Resume when ready." : "Listen carefully and take notes."}
                </p>

              </div>

              <div className="mb-3 flex justify-between text-sm">
                <span>Narration Progress</span>
                <span>{narrationProgress}%</span>
              </div>

              <div className="h-4 overflow-hidden rounded-full bg-slate-700">

                <div
                  className="h-full rounded-full bg-blue-500 transition-all"
                  style={{
                    width: `${narrationProgress}%`,
                  }}
                />

              </div>

              <button
                type="button"
                onClick={togglePause}
                className="mt-5 w-full rounded-lg bg-blue-600 px-6 py-3 font-bold text-white hover:bg-blue-500"
              >
                {isPaused ? "▶ Resume Listening" : "⏸ Pause Listening"}
              </button>

              <div className="mt-8 rounded-lg bg-slate-800 p-5 text-center">

                <p className="font-semibold">
                  Questions are locked
                </p>

                <p className="mt-2 text-sm text-slate-400">
                  Your questions and 10-minute timer
                  will begin automatically when the
                  story finishes.
                </p>

              </div>

            </section>

            {renderNotepad()}

          </div>
        )}

        {/* TESTING */}

        {phase === "testing" && (
          <>

            <div className="sticky top-0 z-20 mb-6 rounded-xl border border-slate-700 bg-slate-900 p-4">

              <div className="flex flex-wrap items-center justify-between gap-4">

                <div>
                  <p className="text-sm text-slate-400">
                    Time Remaining
                  </p>

                  <p
                    className={`text-3xl font-bold tabular-nums ${
                      timeLeft <= 60
                        ? "text-red-400"
                        : "text-white"
                    }`}
                  >
                    {formatTime(timeLeft)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-400">
                    Questions Answered
                  </p>

                  <p className="text-2xl font-bold text-blue-400">
                    {answeredCount} / 25
                  </p>
                </div>

                <button
                  onClick={() => {
                    if (
                      window.confirm(
                        "Are you sure you want to submit your test?"
                      )
                    ) {
                      submitTest();
                    }
                  }}
                  className="rounded-lg bg-green-600 px-6 py-3 font-bold hover:bg-green-500"
                >
                  Submit Test
                </button>

              </div>

            </div>

            <div className="grid items-start gap-6 lg:grid-cols-3">

              <div className="space-y-5 lg:col-span-2">

                {story.questions.map((question) => (

                  <section
                    key={question.id}
                    className="rounded-xl border border-slate-700 bg-slate-900 p-5"
                  >

                    <h3 className="mb-4 text-lg font-semibold">
                      {question.id}. {question.question}
                    </h3>

                    <div className="space-y-3">

                      {question.choices.map(
                        (choice, index) => (

                          <button
                            key={choice}
                            onClick={() =>
                              chooseAnswer(
                                question.id,
                                choice
                              )
                            }
                            className={`w-full rounded-lg border p-4 text-left transition-colors ${
                              answers[question.id] === choice
                                ? "border-blue-400 bg-blue-900"
                                : "border-slate-600 bg-slate-800 hover:bg-slate-700"
                            }`}
                          >
                            {question.type ===
                              "multiple-choice" && (
                              <span className="mr-3 font-bold">
                                {String.fromCharCode(
                                  65 + index
                                )}.
                              </span>
                            )}

                            {choice}

                          </button>

                        )
                      )}

                    </div>

                    {answers[question.id] !==
                      undefined && (

                      <button
                        onClick={() =>
                          clearAnswer(question.id)
                        }
                        className="mt-4 text-sm text-slate-400 hover:text-white"
                      >
                        Clear Answer
                      </button>

                    )}

                  </section>

                ))}

                <button
                  onClick={() => {
                    if (
                      window.confirm(
                        "Are you sure you want to submit your test?"
                      )
                    ) {
                      submitTest();
                    }
                  }}
                  className="w-full rounded-lg bg-green-600 py-4 font-bold hover:bg-green-500"
                >
                  Submit Test
                </button>

              </div>

              <aside className="lg:sticky lg:top-32">
                {renderNotepad()}
              </aside>

            </div>

          </>
        )}

        {/* RESULTS */}

        {phase === "results" && result && (
          <section className="mx-auto max-w-4xl rounded-xl border border-slate-700 bg-slate-900 p-8">

            <h2 className="text-center text-3xl font-bold">
              Test Complete!
            </h2>

            <div className="my-8 text-center">

              <p className="text-sm text-slate-400">
                Your Score
              </p>

              <p className="text-6xl font-bold text-blue-400">
                {result.score}
                <span className="text-3xl text-slate-500">
                  {" "}/ 75
                </span>
              </p>

            </div>

            <div className="grid grid-cols-3 gap-4">

              <div className="rounded-xl bg-green-950 p-5 text-center">
                <p className="text-3xl font-bold text-green-400">
                  {result.correct}
                </p>
                <p className="mt-2 text-green-300">
                  Correct
                </p>
                <p className="mt-1 text-sm">
                  +{result.correct * 3} pts
                </p>
              </div>

              <div className="rounded-xl bg-red-950 p-5 text-center">
                <p className="text-3xl font-bold text-red-400">
                  {result.incorrect}
                </p>
                <p className="mt-2 text-red-300">
                  Incorrect
                </p>
                <p className="mt-1 text-sm">
                  {result.incorrect * -2} pts
                </p>
              </div>

              <div className="rounded-xl bg-slate-800 p-5 text-center">
                <p className="text-3xl font-bold">
                  {result.unanswered}
                </p>
                <p className="mt-2 text-slate-300">
                  Blank
                </p>
                <p className="mt-1 text-sm">
                  0 pts
                </p>
              </div>

            </div>

            <p className="my-6 text-center text-slate-400">
              Time Used: {formatTime(result.timeUsed)}
            </p>

            <div className="grid gap-3 md:grid-cols-3">

              <button
                onClick={() => setPhase("review")}
                className="rounded-lg bg-blue-600 p-4 font-bold hover:bg-blue-500"
              >
                Review Answers
              </button>

              <button
                onClick={resetTest}
                className="rounded-lg bg-slate-700 p-4 font-bold hover:bg-slate-600"
              >
                Retake Test
              </button>

              <button
                onClick={exitTest}
                className="rounded-lg bg-slate-700 p-4 font-bold hover:bg-slate-600"
              >
                Story Library
              </button>

            </div>

          </section>
        )}

        {/* ANSWER REVIEW */}

        {phase === "review" && result && (
          <>

            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">

              <h2 className="text-2xl font-bold">
                Answer Review
              </h2>

              <button
                onClick={() => setPhase("results")}
                className="rounded-lg bg-slate-700 px-5 py-3"
              >
                Back to Results
              </button>

            </div>

            <p className="mb-6 text-slate-400">
              Select any question to highlight the
              supporting evidence in the story.
            </p>

            <div className="grid items-start gap-6 lg:grid-cols-2">

              <section className="space-y-4">

                {story.questions.map((question) => {

                  const studentAnswer =
                    result.answers[question.id];

                  const isCorrect =
                    studentAnswer ===
                    question.correctAnswer;

                  const isBlank =
                    studentAnswer === undefined;

                  return (

                    <button
                      key={question.id}
                      onClick={() =>
                        setSelectedQuestion(question.id)
                      }
                      className={`w-full rounded-xl border p-5 text-left ${
                        selectedQuestion === question.id
                          ? "border-blue-400 bg-slate-800"
                          : "border-slate-700 bg-slate-900"
                      }`}
                    >

                      <p
                        className={`mb-2 text-sm font-bold ${
                          isBlank
                            ? "text-slate-400"
                            : isCorrect
                              ? "text-green-400"
                              : "text-red-400"
                        }`}
                      >
                        {isBlank
                          ? "Unanswered"
                          : isCorrect
                            ? "Correct (+3)"
                            : "Incorrect (-2)"}
                      </p>

                      <h3 className="mb-3 font-bold">
                        {question.id}. {question.question}
                      </h3>

                      <p className="text-sm text-slate-300">
                        Your answer:{" "}
                        {studentAnswer ?? "Blank"}
                      </p>

                      <p className="mt-2 text-sm font-semibold text-green-400">
                        Correct answer:{" "}
                        {question.correctAnswer}
                      </p>

                      {question.explanation && (
                        <p className="mt-3 text-sm text-slate-400">
                          {question.explanation}
                        </p>
                      )}

                    </button>

                  );

                })}

              </section>

              <section className="rounded-xl border border-slate-700 bg-slate-900 p-6 lg:sticky lg:top-6">

                <h3 className="mb-2 text-xl font-bold">
                  Story Transcript
                </h3>

                <p className="mb-5 text-sm text-yellow-300">
                  Highlighted evidence for Question{" "}
                  {selectedQuestion}
                </p>

                <div
                  key={selectedQuestion}
                  ref={(element) => {
                    if (!element) return;

                    const highlight =
                      element.querySelector("mark");

                    if (highlight) {
                      element.scrollTop =
                        highlight.getBoundingClientRect().top -
                        element.getBoundingClientRect().top +
                        element.scrollTop -
                        40;
                    }
                  }}
                  className="max-h-[70vh] overflow-y-auto pr-3"
                >
                  {renderHighlightedTranscript()}
                </div>

              </section>

            </div>

          </>
        )}

      </div>
    </main>
  );
}
