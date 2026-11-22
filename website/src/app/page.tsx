
const events = [
  "Number Sense",
  "Calculator Applications",
  "Mathematics",
  "Science",
  "Social Studies",
  "Spelling",
  "Dictionary Skills",
  "Listening Skills",
  "Maps, Graphs & Charts",
];

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 p-6">
        <h1 className="text-2xl font-bold text-cyan-400">
          UIL Training Academy
        </h1>
      </header>

      <section className="px-6 py-20 text-center">
        <h2 className="text-5xl font-bold">
          Learn. Practice. Compete.
        </h2>
        <p className="mt-6 text-lg text-slate-300">
          Your home for UIL academic competition preparation.
        </p>
        <a
          href="#events"
          className="mt-8 inline-block rounded-lg bg-cyan-500 px-6 py-3 font-bold text-black"
        >
          Explore Events
        </a>
      </section>

      <section id="events" className="mx-auto max-w-6xl px-6 pb-20">
        <h3 className="mb-8 text-3xl font-bold">
          Academic Events
        </h3>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <div
              key={event}
              className="rounded-xl border border-slate-700 bg-slate-900 p-6"
            >
              <h4 className="text-xl font-bold">{event}</h4>
              <p className="mt-3 text-slate-400">
                Lessons, practice questions, and competitions.
              </p>
              <p className="mt-5 font-semibold text-cyan-400">
                Coming Soon
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
