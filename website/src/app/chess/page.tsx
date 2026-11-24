
'use client';

import Link from 'next/link';

const modes = [
  {
    title: 'Learn & Practice',
    icon: '📚',
    description:
      'Learn chess from the beginning, including piece movement, rules, notation, strategies, and tactics.',
    button: 'Start Learning',
    href: '/chess/learn',
  },
  {
    title: 'Full Practice Test',
    icon: '📝',
    description:
      'Take randomized UIL-style chess puzzle tests for grades 2–3, 4–5, and 6–8.',
    button: 'Select Grade Level',
    href: '/chess/test',
  },
  {
    title: 'Puzzle Training',
    icon: '🧩',
    description:
      'Improve your chess skills with tactical puzzles, checkmates, forks, pins, and more.',
    button: 'Choose a Topic',
    href: '/chess/training',
  },
  {
    title: 'Play Chess',
    icon: '♟️',
    description:
      'Play against a computer opponent and improve your skills at different difficulty levels.',
    button: 'Play Chess',
    href: '/chess/play',
  },
  {
    title: 'Tiebreaker Practice',
    icon: '⏱️',
    description:
      'Challenge yourself with eight difficult chess puzzles in five minutes.',
    button: 'Start Tiebreaker',
    href: '/chess/tiebreaker',
  },
];

export default function ChessPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">

        <Link
          href="/"
          className="text-cyan-400 hover:underline"
        >
          ← Back to Academy
        </Link>

        <h1 className="mt-6 text-4xl font-bold">
          Chess Puzzle Solving
        </h1>

        <p className="mt-3 text-lg text-slate-300">
          Learn chess, develop tactical skills, and prepare
          for UIL competition.
        </p>

        <div className="mt-8 grid gap-5 sm:grid-cols-2">

          {modes.map((mode) => (
            <section
              key={mode.title}
              className="flex flex-col rounded-xl border border-slate-700 bg-slate-800 p-6"
            >
              <div className="mb-3 text-4xl">
                {mode.icon}
              </div>

              <h2 className="text-2xl font-bold">
                {mode.title}
              </h2>

              <p className="mb-6 mt-3 flex-1 text-slate-300">
                {mode.description}
              </p>

              <Link
                href={mode.href}
                className="rounded-lg bg-cyan-500 px-5 py-3 text-center font-semibold text-black hover:bg-cyan-400"
              >
                {mode.button}
              </Link>
            </section>
          ))}

        </div>

        <section className="mt-8 rounded-xl border border-slate-700 bg-slate-800 p-6">

          <h2 className="text-2xl font-bold text-cyan-400">
            UIL Contest Format
          </h2>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-600">
                  <th className="p-3">Division</th>
                  <th className="p-3">Questions</th>
                  <th className="p-3">Time</th>
                  <th className="p-3">Max Score</th>
                </tr>
              </thead>

              <tbody>
                <tr className="border-b border-slate-700">
                  <td className="p-3">Grades 2–3</td>
                  <td className="p-3">16</td>
                  <td className="p-3">30 minutes</td>
                  <td className="p-3">16</td>
                </tr>

                <tr className="border-b border-slate-700">
                  <td className="p-3">Grades 4–5</td>
                  <td className="p-3">20</td>
                  <td className="p-3">30 minutes</td>
                  <td className="p-3">20</td>
                </tr>

                <tr className="border-b border-slate-700">
                  <td className="p-3">Grades 6–8</td>
                  <td className="p-3">20</td>
                  <td className="p-3">30 minutes</td>
                  <td className="p-3">20</td>
                </tr>

                <tr>
                  <td className="p-3">Tiebreaker</td>
                  <td className="p-3">8</td>
                  <td className="p-3">5 minutes</td>
                  <td className="p-3">8</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-slate-300">
            Correct answers earn one point. There is no
            penalty for incorrect or unanswered questions.
          </p>

        </section>

        <p className="mt-8 text-sm text-slate-400">
          Original independent practice materials.
          Not affiliated with UIL.
        </p>

      </div>
    </main>
  );
}
