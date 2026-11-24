
'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import {
  generateTest,
  generateMatching,
  type Question,
  type Match
} from './dictionary-generator';

type Mode = 'full' | 'matching';

type Attempt = {
  mode: Mode;
  score: number;
  correct: number;
  wrong: number;
  blank: number;
  ms: number;
  date: string;
};

type Session = {
  mode: Mode;
  questions: Question[];
  matches: Match[];
  bank: string[];
};

const KEY = 'uil-dictionary-attempts-v1';

function format(ms: number) {
  const t = Math.floor(Math.max(0, ms) / 100);
  return `${String(Math.floor(t / 600)).padStart(2, '0')}:${String(Math.floor(t / 10) % 60).padStart(2, '0')}.${t % 10}`;
}

export default function DictionaryPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [elapsed, setElapsed] = useState(0);
  const [result, setResult] = useState<Attempt | null>(null);
  const [history, setHistory] = useState<Attempt[]>([]);

  const started = useRef(0);
  const finished = useRef(false);
  const answersRef = useRef<Record<number, string>>({});

  useEffect(() => {
    try {
      const a = JSON.parse(localStorage.getItem(KEY) || '[]');
      if (Array.isArray(a)) {
        setHistory(
          a.filter(
            x =>
              x &&
              typeof x.score === 'number' &&
              typeof x.ms === 'number'
          )
        );
      }
    } catch {}
  }, []);

  function start(mode: Mode) {
    const data =
      mode === 'full'
        ? generateTest()
        : { questions: [], ...generateMatching() };

    answersRef.current = {};
    setAnswers({});
    setResult(null);
    setElapsed(0);
    finished.current = false;
    started.current = performance.now();
    setSession({ mode, ...data });
    window.scrollTo(0, 0);
  }

  function choose(i: number, value: string) {
    if (finished.current) return;

    const next = {
      ...answersRef.current,
      [i]: value
    };

    answersRef.current = next;
    setAnswers(next);
  }

  function finish(s: Session, ms: number) {
    if (finished.current) return;
    finished.current = true;

    const keys = [
      ...s.questions.map(q => q.answer),
      ...s.matches.map(m => m.answer)
    ];

    let correct = 0;
    let wrong = 0;
    let blank = 0;

    keys.forEach((key, i) => {
      const a = answersRef.current[i];

      if (!a) blank++;
      else if (a === key) correct++;
      else wrong++;
    });

    const r: Attempt = {
      mode: s.mode,
      score: 3 * correct - 2 * wrong,
      correct,
      wrong,
      blank,
      ms,
      date: new Date().toISOString()
    };

    setElapsed(ms);
    setResult(r);

    setHistory(old => {
      const next = [r, ...old].slice(0, 500);

      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {}

      return next;
    });

    window.scrollTo(0, 0);
  }

  useEffect(() => {
    if (!session || result) return;

    const tick = () => {
      const ms = performance.now() - started.current;

      if (session.mode === 'full' && ms >= 1200000) {
        finish(session, 1200000);
        return;
      }

      setElapsed(ms);
    };

    const timer = window.setInterval(tick, 100);

    return () => window.clearInterval(timer);
  }, [session, result]);

  const full = history.filter(a => a.mode === 'full');

  const perfect = history.filter(
    a => a.mode === 'matching' && a.correct === 8
  );

  const best = full.length
    ? Math.max(...full.map(a => a.score))
    : null;

  const fastest = perfect.length
    ? Math.min(...perfect.map(a => a.ms))
    : null;

  const button =
    'rounded-lg bg-cyan-600 px-5 py-3 font-semibold text-white hover:bg-cyan-500';

  return (
    <main className="min-h-screen bg-slate-950 text-white [color-scheme:dark]">
      <div className="mx-auto max-w-5xl px-4 py-8">

        <Link
          href="/"
          className="text-cyan-400 hover:underline"
        >
          ← Back to Academy
        </Link>

        <h1 className="my-5 text-4xl font-bold">
          Dictionary Skills
        </h1>

        {!session ? (
          <>
            <p>
              Use your physical Merriam-Webster Intermediate
              Dictionary (2024 edition).
            </p>

            <div className="my-6 grid gap-4 sm:grid-cols-2">

              <div className="rounded-xl border border-slate-700 bg-slate-800 p-5">
                Personal best score

                <div className="text-3xl font-bold">
                  {best === null ? '—' : best + ' / 120'}
                </div>
              </div>

              <div className="rounded-xl border border-slate-700 bg-slate-800 p-5">
                Fastest perfect matching

                <div className="text-3xl font-bold">
                  {fastest === null ? '—' : format(fastest)}
                </div>
              </div>

            </div>

            <div className="grid gap-4 sm:grid-cols-2">

              <section className="rounded-xl border border-slate-700 bg-slate-800 p-6">
                <h2 className="text-2xl font-bold">
                  Full Practice Test
                </h2>

                <p className="my-4">
                  40 questions · 20 minutes · 120 possible points
                </p>

                <button
                  className={button}
                  onClick={() => start('full')}
                >
                  Generate New Test
                </button>
              </section>

              <section className="rounded-xl border border-slate-700 bg-slate-800 p-6">
                <h2 className="text-2xl font-bold">
                  Matching Speed Practice
                </h2>

                <p className="my-4">
                  8 words · Stopwatch · No time limit
                </p>

                <button
                  className={button}
                  onClick={() => start('matching')}
                >
                  Start Matching Practice
                </button>
              </section>

            </div>

            <h2 className="mt-8 text-xl font-bold">
              Recent attempts
            </h2>

            {history.length === 0 ? (
              <p>No attempts yet.</p>
            ) : (
              <div className="mt-3 space-y-2">
                {history.slice(0, 10).map((a, i) => (
                  <div
                    key={i}
                    className="rounded border border-slate-700 bg-slate-800 p-3"
                  >
                    {a.mode === 'full' ? 'Full test' : 'Matching'}
                    {' · '}
                    {a.score}/{a.mode === 'full' ? 120 : 24} points
                    {' · '}
                    {a.correct} correct
                    {' · '}
                    {format(a.ms)}
                  </div>
                ))}
              </div>
            )}

            <p className="mt-8 text-sm text-slate-400">
              Original independent practice materials.
              Not affiliated with UIL. Starter questions
              have not been checked against every printed
              dictionary entry.
            </p>
          </>
        ) : (
          <>

            <div className="sticky top-0 z-10 mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-700 bg-slate-800 p-4 shadow">

              <div>
                <p className="text-sm">
                  {result
                    ? 'Time used'
                    : session.mode === 'full'
                      ? 'Time remaining'
                      : 'Elapsed time'}
                </p>

                <p className="text-3xl font-bold tabular-nums">
                  {format(
                    result
                      ? result.ms
                      : session.mode === 'full'
                        ? 1200000 - elapsed
                        : elapsed
                  )}
                </p>
              </div>

              <p>
                {Object.values(answers).filter(Boolean).length}
                /{session.questions.length + 8} answered
              </p>

              <button
                className="rounded border border-slate-700 px-3 py-2"
                onClick={() => {
                  if (
                    result ||
                    window.confirm(
                      'Leave this attempt without saving?'
                    )
                  ) {
                    finished.current = true;
                    setSession(null);
                    setResult(null);
                  }
                }}
              >
                Exit
              </button>

            </div>

            {result && (
              <section className="mb-5 rounded-xl border border-slate-700 bg-slate-800 p-5">

                <h2 className="text-2xl font-bold">
                  Results: {result.score} /{' '}
                  {session.mode === 'full' ? 120 : 24}
                </h2>

                <p className="my-3">
                  Correct: {result.correct}
                  {' · '}
                  Incorrect: {result.wrong}
                  {' · '}
                  Blank: {result.blank}
                </p>

                <button
                  className={button}
                  onClick={() => start(session.mode)}
                >
                  Practice Again
                </button>

                <h3 className="mt-4 font-bold">
                  Answer review
                </h3>

              </section>
            )}

            {session.questions.map((q, i) => (
              <section
                key={i}
                className="mb-4 rounded-xl border border-slate-700 bg-slate-800 p-5"
              >

                <h3 className="font-semibold">
                  {i + 1}. {q.prompt}
                </h3>

                <div className="mt-3 grid gap-2 sm:grid-cols-2">

                  {q.choices.map((c, j) => (
                    <button
                      key={j}
                      disabled={!!result}
                      onClick={() =>
                        choose(i, answers[i] === c ? '' : c)
                      }
                      className={
                        'rounded border p-3 text-left ' +
                        (
                          result && c === q.answer
                            ? 'border-green-600 bg-green-900'
                            : result && answers[i] === c
                              ? 'border-red-600 bg-red-900'
                              : answers[i] === c
                                ? 'border-cyan-400 bg-cyan-900'
                                : 'border-slate-600 bg-slate-800 hover:bg-slate-700'
                        )
                      }
                    >
                      {String.fromCharCode(65 + j)}. {c}
                    </button>
                  ))}

                </div>

                {result && (
                  <p className="mt-3 text-sm">
                    Correct answer: {q.answer}.
                    Look in: {q.source}.
                  </p>
                )}

              </section>
            ))}

            <section className="rounded-xl border border-slate-700 bg-slate-800 p-5">

              <h2 className="text-xl font-bold">
                Matching
              </h2>

              <p className="my-3">
                Match each word to its meaning.
              </p>

              {!result && (
                <p className="mb-3 text-sm text-slate-400">
                  Selected definitions are crossed out to help
                  you keep track of your answers.
                </p>
              )}

              <div className="grid gap-2 rounded border border-slate-700 bg-slate-950 p-4 sm:grid-cols-2">

                {session.bank.map((a, j) => {
                  const used = session.matches.some(
                    (_, k) =>
                      answers[session.questions.length + k] === a
                  );

                  return (
                    <p
                      key={j}
                      className={
                        used && !result
                          ? 'text-red-400 line-through decoration-2'
                          : 'text-white'
                      }
                    >
                      {String.fromCharCode(65 + j)}. {a}
                    </p>
                  );
                })}

              </div>

              {session.matches.map((m, j) => {
                const i = session.questions.length + j;

                return (
                  <div
                    key={j}
                    className="border-b border-slate-700 py-3"
                  >

                    <div className="flex items-center justify-between gap-4">

                      <label htmlFor={'match-' + i}>
                        {i + 1}. {m.word}
                      </label>

                      <select
                        id={'match-' + i}
                        disabled={!!result}
                        className="rounded border border-slate-700 bg-slate-800 p-2"
                        value={answers[i] || ''}
                        onChange={e => choose(i, e.target.value)}
                      >

                        <option value="">—</option>

                        {session.bank.map((a, k) => (
                          <option key={k} value={a}>
                            {String.fromCharCode(65 + k)}
                          </option>
                        ))}

                      </select>

                    </div>

                    {result && (
                      <p
                        className={
                          answers[i] === m.answer
                            ? 'text-green-300'
                            : 'text-red-300'
                        }
                      >
                        {answers[i] === m.answer
                          ? 'Correct'
                          : 'Correct answer'}
                        :{' '}
                        {String.fromCharCode(
                          65 + session.bank.indexOf(m.answer)
                        )}
                        . {m.answer}
                      </p>
                    )}

                  </div>
                );
              })}

            </section>

            {!result && (
              <button
                className={button + ' mt-5 w-full'}
                onClick={() =>
                  finish(
                    session,
                    Math.min(
                      performance.now() - started.current,
                      session.mode === 'full'
                        ? 1200000
                        : Infinity
                    )
                  )
                }
              >
                {session.mode === 'full'
                  ? 'Submit Test'
                  : 'Submit & Stop Stopwatch'}
              </button>
            )}

          </>
        )}

      </div>
    </main>
  );
}
