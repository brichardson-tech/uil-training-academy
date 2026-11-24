
'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { Chess, type Square } from 'chess.js';
import ChessBoard from '../chess-board';

export default function ChessPlayPage() {
  const game = useRef(new Chess());

  const [fen, setFen] = useState(game.current.fen());
  const [selected, setSelected] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<Square[]>([]);
  const [flipped, setFlipped] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [promotion, setPromotion] = useState<{
    from: Square;
    to: Square;
  } | null>(null);

  function update() {
    setFen(game.current.fen());
    setHistory(game.current.history());
    setSelected(null);
    setLegalMoves([]);
    setPromotion(null);
  }

  function move(
    from: Square,
    to: Square,
    promote?: 'q' | 'r' | 'b' | 'n'
  ) {
    try {
      game.current.move({
        from,
        to,
        promotion: promote,
      });

      update();
    } catch {
      setSelected(null);
      setLegalMoves([]);
    }
  }

  function handleSquare(square: Square) {
    const g = game.current;

    if (g.isGameOver() || promotion) return;

    if (selected && legalMoves.includes(square)) {
      const possible = g.moves({
        square: selected,
        verbose: true,
      });

      const needsPromotion = possible.some(
        m => m.to === square && m.promotion
      );

      if (needsPromotion) {
        setPromotion({
          from: selected,
          to: square,
        });
        return;
      }

      move(selected, square);
      return;
    }

    if (selected === square) {
      setSelected(null);
      setLegalMoves([]);
      return;
    }

    const piece = g.get(square);

    if (piece && piece.color === g.turn()) {
      setSelected(square);

      setLegalMoves(
        g.moves({
          square,
          verbose: true,
        }).map(m => m.to)
      );
    } else {
      setSelected(null);
      setLegalMoves([]);
    }
  }

  function reset() {
    game.current.reset();
    update();
  }

  function undo() {
    game.current.undo();
    update();
  }

  const g = game.current;

  let status =
    g.turn() === 'w'
      ? 'White to move'
      : 'Black to move';

  if (g.isCheckmate()) {
    status =
      g.turn() === 'w'
        ? 'Checkmate! Black wins.'
        : 'Checkmate! White wins.';
  } else if (g.isStalemate()) {
    status = 'Draw by stalemate.';
  } else if (g.isInsufficientMaterial()) {
    status = 'Draw by insufficient material.';
  } else if (g.isThreefoldRepetition()) {
    status = 'Draw by repetition.';
  } else if (g.isDraw()) {
    status = 'Draw.';
  } else if (g.isCheck()) {
    status += ' — Check!';
  }

  const button =
    'rounded-lg bg-slate-700 px-4 py-3 font-semibold hover:bg-slate-600';

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white">

      <div className="mx-auto max-w-5xl">

        <Link
          href="/chess"
          className="text-cyan-400 hover:underline"
        >
          ← Back to Chess
        </Link>

        <h1 className="mt-5 text-4xl font-bold">
          Play Chess
        </h1>

        <p className="mt-2 text-slate-300">
          Local two-player practice.
          Computer opponent coming soon.
        </p>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_280px]">

          <section className="rounded-xl border border-slate-700 bg-slate-800 p-4">

            <h2 className="mb-4 text-center text-xl font-bold text-cyan-400">
              {status}
            </h2>

            <ChessBoard
              fen={fen}
              selected={selected}
              legalMoves={legalMoves}
              onSquareClick={handleSquare}
              flipped={flipped}
            />

            {promotion && (
              <div className="mt-4 rounded-lg bg-slate-900 p-4">

                <p className="mb-3 font-bold">
                  Choose your promotion piece:
                </p>

                <div className="flex flex-wrap gap-2">

                  {(
                    [
                      ['q', 'Queen'],
                      ['r', 'Rook'],
                      ['b', 'Bishop'],
                      ['n', 'Knight'],
                    ] as const
                  ).map(([value, name]) => (
                    <button
                      key={value}
                      className={button}
                      onClick={() =>
                        move(
                          promotion.from,
                          promotion.to,
                          value
                        )
                      }
                    >
                      {name}
                    </button>
                  ))}

                  <button
                    className={button}
                    onClick={() => setPromotion(null)}
                  >
                    Cancel
                  </button>

                </div>

              </div>
            )}

            <div className="mt-5 flex flex-wrap justify-center gap-3">

              <button
                className={button}
                onClick={undo}
                disabled={history.length === 0}
              >
                Undo Move
              </button>

              <button
                className={button}
                onClick={() => setFlipped(!flipped)}
              >
                Flip Board
              </button>

              <button
                className="rounded-lg bg-cyan-500 px-4 py-3 font-bold text-black hover:bg-cyan-400"
                onClick={reset}
              >
                New Game
              </button>

            </div>

          </section>

          <section className="rounded-xl border border-slate-700 bg-slate-800 p-5">

            <h2 className="mb-4 text-xl font-bold">
              Move History
            </h2>

            {history.length === 0 ? (
              <p className="text-slate-400">
                No moves yet.
              </p>
            ) : (
              <div className="max-h-[500px] overflow-y-auto">

                {Array.from({
                  length: Math.ceil(history.length / 2),
                }).map((_, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-3 border-b border-slate-700 py-2"
                  >
                    <span className="text-slate-400">
                      {i + 1}.
                    </span>

                    <span>{history[i * 2]}</span>

                    <span>{history[i * 2 + 1] || ''}</span>
                  </div>
                ))}

              </div>
            )}

          </section>

        </div>

      </div>

    </main>
  );
}
