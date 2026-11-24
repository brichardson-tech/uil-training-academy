
'use client';

import { Chess, type Square } from 'chess.js';

type Props = {
  fen: string;
  selected?: Square | null;
  legalMoves?: Square[];
  onSquareClick?: (square: Square) => void;
  flipped?: boolean;
};

const pieces: Record<string, string> = {
  wp: '♙',
  wn: '♘',
  wb: '♗',
  wr: '♖',
  wq: '♕',
  wk: '♔',
  bp: '♟︎',
  bn: '♞',
  bb: '♝',
  br: '♜',
  bq: '♛',
  bk: '♚',
};

export default function ChessBoard({
  fen,
  selected = null,
  legalMoves = [],
  onSquareClick,
  flipped = false,
}: Props) {
  const game = new Chess(fen);
  const board = game.board();

  const ranks = flipped
    ? [1, 2, 3, 4, 5, 6, 7, 8]
    : [8, 7, 6, 5, 4, 3, 2, 1];

  const files = flipped
    ? 'hgfedcba'
    : 'abcdefgh';

  return (
    <div className="mx-auto w-full max-w-[520px] select-none">

      <div className="grid grid-cols-8 overflow-hidden rounded-lg border-2 border-slate-600">

        {ranks.map((rank, row) =>
          Array.from(files).map((file, col) => {
            const square = `${file}${rank}` as Square;

            const piece =
              board[8 - rank]['abcdefgh'.indexOf(file)];

            const light = (row + col) % 2 === 0;
            const isSelected = selected === square;
            const isLegal = legalMoves.includes(square);

            const isCheckedKing =
              piece?.type === 'k' &&
              piece.color === game.turn() &&
              game.isCheck();

            const background = isCheckedKing
              ? '#dc6464'
              : isSelected
                ? '#e6cf55'
                : light
                  ? '#f0d9b5'
                  : '#b58863';

            return (
              <button
                key={square}
                type="button"
                aria-label={
                  piece
                    ? `${square} ${piece.color === 'w' ? 'White' : 'Black'} ${piece.type}`
                    : square
                }
                onClick={() => onSquareClick?.(square)}
                className={
                  'relative flex aspect-square items-center justify-center ' +
                  (onSquareClick
                    ? 'cursor-pointer'
                    : 'cursor-default')
                }
                style={{ backgroundColor: background }}
              >

                {col === 0 && (
                  <span className="absolute left-1 top-0.5 text-[10px] font-bold text-slate-700 sm:text-xs">
                    {rank}
                  </span>
                )}

                {row === 7 && (
                  <span className="absolute bottom-0.5 right-1 text-[10px] font-bold text-slate-700 sm:text-xs">
                    {file}
                  </span>
                )}

                {piece && (
                  <span
                    className="relative z-10 leading-none"
                    style={{
                      fontSize: 'clamp(22px, 7vw, 52px)',
                      fontFamily:
                        '"DejaVu Sans", "Segoe UI Symbol", serif',
                      color:
                        piece.color === 'w'
                          ? '#ffffff'
                          : '#111827',
                      WebkitTextStroke:
                        piece.color === 'w'
                          ? '1px #111827'
                          : '0.5px #111827',
                    }}
                  >
                    {pieces[piece.color + piece.type]}
                  </span>
                )}

                {isLegal && (
                  <span
                    className={
                      piece
                        ? 'absolute inset-1 rounded-full border-4 border-green-700/60'
                        : 'absolute h-1/4 w-1/4 rounded-full bg-green-800/50'
                    }
                  />
                )}

              </button>
            );
          })
        )}

      </div>

    </div>
  );
}
