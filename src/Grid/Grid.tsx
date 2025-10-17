import { useCallback, useEffect, useState } from "react";
import { getTileStyle } from "../helper";

const DEFAULT_SIZE = 4;
const START_TILES = 2;
const SPAWN_PROBABILITY_4 = 0.1;

const range = (n: number) => Array.from({ length: n }, (_, i) => i);
const randomInt = (max: number) => Math.floor(Math.random() * max);

function emptyBoard(size: number) {
  return range(size).map(() => range(size).map(() => 0));
}

function hasWon(board: number[][]) {
  return board.some((row) => row.includes(2048));
}

function hasMoves(board: number[][]) {
  if (positionsOf(board, (v) => v === 0).length > 0) return true;

  const size = board.length;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const val = board[r][c];
      if (
        (r < size - 1 && board[r + 1][c] === val) ||
        (c < size - 1 && board[r][c + 1] === val)
      ) {
        return true;
      }
    }
  }
  return false;
}

function rotateBoardCW(board: number[][]) {
  const n = board.length;
  const out = emptyBoard(n);
  for (let r = 0; r < n; r++)
    for (let c = 0; c < n; c++) out[c][n - 1 - r] = board[r][c];
  return out;
}

function rotateBoardCCW(board: number[][]) {
  const n = board.length;
  const out = emptyBoard(n);
  for (let r = 0; r < n; r++)
    for (let c = 0; c < n; c++) out[n - 1 - c][r] = board[r][c];
  return out;
}

function positionsOf(board: number[][], predicate: (n: number) => boolean) {
  const pos: number[][] = [];
  board.forEach((row, r) =>
    row.forEach((val, c) => {
      if (predicate(val)) pos.push([r, c]);
    })
  );
  return pos;
}

function addRandomTile(board: number[][]) {
  const empty = positionsOf(board, (v) => v === 0);
  if (!empty.length) return board;
  const [r, c] = empty[randomInt(empty.length)];
  const newBoard = board.map((row) => [...row]);
  newBoard[r][c] = Math.random() < SPAWN_PROBABILITY_4 ? 4 : 2;
  return newBoard;
}

function initBoard(size = DEFAULT_SIZE) {
  let board = emptyBoard(size);
  for (let i = 0; i < START_TILES; i++) {
    board = addRandomTile(board);
  }
  return board;
}

function compressRow(row: number[]) {
  let scoreToAdd = 0;
  const filtered = row.filter((n) => n !== 0);
  const merged: number[] = [];

  for (let i = 0; i < filtered.length; i++) {
    if (filtered[i] === filtered[i + 1]) {
      const val = filtered[i] * 2;
      scoreToAdd += val;
      merged.push(val);
      i++;
    } else {
      merged.push(filtered[i]);
    }
  }

  while (merged.length < row.length) merged.push(0);
  return { newRow: merged, scoreToAdd };
}

function move(
  board: number[][],
  direction: "left" | "right" | "up" | "down"
): { newBoard: number[][]; scoreToAdd: number } {
  let rotated = board;
  if (direction === "up") rotated = rotateBoardCCW(board);
  else if (direction === "down") rotated = rotateBoardCW(board);

  let totalScore = 0;

  const newBoard = rotated.map((row) => {
    const workingRow = direction === "right" ? [...row].reverse() : [...row];
    const { newRow, scoreToAdd } = compressRow(workingRow);
    totalScore += scoreToAdd;
    return direction === "right" ? newRow.reverse() : newRow;
  });

  let result = newBoard;
  if (direction === "up") result = rotateBoardCW(newBoard);
  else if (direction === "down") result = rotateBoardCCW(newBoard);

  const changed = JSON.stringify(board) !== JSON.stringify(result);
  return {
    newBoard: changed ? addRandomTile(result) : board,
    scoreToAdd: totalScore,
  };
}

export default function Grid() {
  const [size] = useState(DEFAULT_SIZE);
  const [board, setBoard] = useState(initBoard());
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);

  const handleMove = useCallback(
    (dir: "left" | "right" | "up" | "down") => {
      if (gameOver || won) return;

      const { newBoard, scoreToAdd } = move(board, dir);
      if (newBoard !== board) {
        setScore((prev) => prev + scoreToAdd);
        setBoard(newBoard);
        setBestScore((prev) => Math.max(prev, score + scoreToAdd));

        if (hasWon(newBoard)) setWon(true);
        else if (!hasMoves(newBoard)) setGameOver(true);
      }
    },
    [board, score, gameOver, won]
  );

  const handleReset = () => {
    setBoard(initBoard());
    setScore(0);
    setGameOver(false);
    setWon(false);
  };

  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") handleMove("up");
      else if (e.key === "ArrowDown") handleMove("down");
      else if (e.key === "ArrowLeft") handleMove("left");
      else if (e.key === "ArrowRight") handleMove("right");
    };
    window.addEventListener("keydown", handleKeyboard);
    return () => window.removeEventListener("keydown", handleKeyboard);
  }, [handleMove]);

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex gap-4 flex-wrap justify-center items-center">
        <div className="bg-amber-500/30 py-2 px-4 rounded-md flex flex-col items-center min-w-[90px]">
          <span className="text-amber-700 font-semibold text-xs">SCORE</span>
          <b className="text-amber-700 font-bold text-2xl">{score}</b>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/40 py-2 px-4 rounded-md flex flex-col items-center min-w-[90px]">
          <span className="text-amber-700 font-semibold text-xs">BEST</span>
          <b className="text-amber-700 font-bold text-2xl">{bestScore}</b>
        </div>
        <div
          onClick={handleReset}
          className="bg-amber-500/10 border border-amber-500/40 py-2 px-4 rounded-md flex flex-col items-center min-w-[90px] cursor-pointer"
        >
          <span className="text-amber-700 font-semibold text-xs">RESET</span>
          <b className="text-amber-700 font-bold text-2xl">⟳</b>
        </div>
      </div>

      <div
        className="grid gap-2 p-2 rounded-lg bg-amber-700/10"
        style={{
          gridTemplateColumns: `repeat(${size}, minmax(60px, 1fr))`,
          width: "100%",
          maxWidth: "400px",
        }}
      >
        {gameOver && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
            <div className="bg-white p-6 rounded-lg text-center shadow-lg">
              <h2 className="text-2xl font-bold text-red-600 mb-4">
                Game Over!
              </h2>
              <button
                onClick={handleReset}
                className="bg-amber-500 text-white px-4 py-2 rounded font-semibold cursor-pointer"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {won && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
            <div className="bg-white p-6 rounded-lg text-center shadow-lg">
              <h2 className="text-2xl font-bold text-green-600 mb-4">
                🎉 You Win!
              </h2>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={handleReset}
                  className="bg-amber-500 text-white px-4 py-2 rounded font-semibold cursor-pointer"
                >
                  Restart
                </button>
                <button
                  onClick={() => setWon(false)}
                  className="bg-gray-400 text-white px-4 py-2 rounded font-semibold cursor-pointer"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}

        {board.map((row, rIdx) =>
          row.map((val, cIdx) => (
            <div
              key={`${rIdx}-${cIdx}`}
              style={{ ...getTileStyle(val) }}
              className="h-16 flex items-center justify-center rounded-lg font-bold text-xl"
            >
              {val > 0 ? val : ""}
            </div>
          ))
        )}
      </div>

      <div className="flex flex-col items-center gap-2 mt-4">
        <button
          onClick={() => handleMove("up")}
          className="bg-amber-400 text-white font-extrabold p-2 rounded shadow w-16 text-xl cursor-pointer"
        >
          ↑
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => handleMove("left")}
            className="bg-amber-400 text-white font-extrabold p-2 rounded shadow w-16 text-xl cursor-pointer"
          >
            ←
          </button>
          <button
            onClick={() => handleMove("down")}
            className="bg-amber-400 text-white font-extrabold p-2 rounded shadow w-16 text-xl cursor-pointer"
          >
            ↓
          </button>
          <button
            onClick={() => handleMove("right")}
            className="bg-amber-400 text-white font-extrabold p-2 rounded shadow w-16 text-xl cursor-pointer"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}
