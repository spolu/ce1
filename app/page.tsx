"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

type Problem = {
  type: "table-addition" | "complement-10";
  left: number;
  right: number;
  answer: number;
};

type Choice = {
  value: number;
  correct: boolean;
  state: boolean | null;
};

function makeChoices(solution: number) {
  return [
    {
      value: solution,
      correct: true,
      state: null,
    },
    {
      value: (solution + 7) % 16,
      correct: false,
      state: null,
    },
    {
      value: (solution + 5) % 16,
      correct: false,
      state: null,
    },
    {
      value: (solution + 2) % 16,
      correct: false,
      state: null,
    },
  ];
}

function ProblemView({
  p,
  onChoice: onChoice,
}: {
  p: Problem;
  onChoice: (c: Choice) => void;
}) {
  const [choices, setChoicees] = useState<Choice[]>([]);

  useEffect(() => {
    let choices: Choice[] = [];
    if (p.type === "complement-10") {
      choices = makeChoices(p.right);
    } else {
      choices = makeChoices(p.answer);
    }
    choices.sort(() => Math.random() - 0.5);
    setChoicees(choices);
  }, [p]);

  const handleChoice = (choice: Choice) => {
    setTimeout(() => {
      onChoice && choice.state === null && onChoice(choice);
    }, 250);

    const newChoices = choices.map((c) => {
      if (c === choice) {
        if (c.correct) {
          return {
            ...c,
            state: true,
          };
        }
        return {
          ...c,
          state: false,
        };
      }
      return c;
    });
    setChoicees(newChoices);
  };

  return (
    <div className="flex flex-col gap-y-24 text-9xl font-semibold select-none">
      <div className="flex flex-row justify-center w-full">
        <div className="flex flex-row rounded-xl bg-yellow-50 p-8 gap-x-2 shadow-md">
          <div className="">{p.left}</div>
          <div className="">+</div>
          {p.type === "complement-10" && (
            <div className="text-yellow-500">?</div>
          )}
          {p.type === "table-addition" && <div className="">{p.right}</div>}
          <div className="">=</div>
          {p.type === "complement-10" && <div className="">{p.answer}</div>}
          {p.type === "table-addition" && (
            <div className="text-yellow-500">?</div>
          )}
        </div>
      </div>

      <div className="flex flex-row gap-x-16 justify-center">
        {choices.map((c, i) => (
          <div
            className={classNames(
              "flex flex-col border-1 rounded-xl p-4 shadow-md bg-gray-100 select-none",
              c.state === null
                ? "cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all"
                : c.state
                ? "bg-green-300"
                : "bg-red-300"
            )}
            key={i}
            onClick={() => handleChoice(c)}
          >
            <div className="">{c.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

type GameState = {
  state: "waiting" | "playing" | "won" | "lost";
  gameType: "table-addition" | "complement-10";
  timeLeft: number;
  score: number;
  problem: Problem;
};

export default function Home() {
  const newProblem = (gameType: "table-addition" | "complement-10") => {
    const left = Math.floor(Math.random() * 5) + 1;
    const right =
      gameType === "table-addition"
        ? Math.floor(Math.random() * 9) + 1
        : 10 - left;
    const swap = Math.random() > 0.5;
    const p: Problem = {
      type: gameType,
      left: swap ? right : left,
      right: swap ? left : right,
      answer: left + right,
    };
    return p;
  };

  const [gameState, setGameState] = useState<GameState>({
    state: "waiting",
    gameType: "table-addition",
    timeLeft: 120,
    score: 0,
    problem: newProblem("table-addition"),
  });

  const handleChoice = (c: Choice) => {
    if (c.correct) {
      setGameState((s) => {
        return {
          ...s,
          score: s.score + 1,
          problem: newProblem(s.gameType),
        };
      });
    } else {
      setGameState((s) => {
        return {
          ...s,
          score: s.score - 1,
        };
      });
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (gameState.state === "playing") {
        setGameState((s) => {
          if (s.timeLeft === 0) {
            return {
              ...s,
              state: s.score > 10 ? "won" : "lost",
            };
          }
          return {
            ...s,
            timeLeft: s.timeLeft - 1,
          };
        });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [gameState]);

  return (
    <main className="flex min-h-screen flex-col items-center p-24 bg-blue-200 text-black pt-32">
      {gameState.state === "won" && (
        <>
          <div className="pt-16 text-8xl max-w-4xl font-bold text-green-600">
            Gagné!! Tu as fait {gameState.score} points en 2mn.
          </div>
          <div className="pt-16 text-2xl">
            <button
              className="bg-green-100 p-4 rounded-xl shadow-md font-bold"
              onClick={() =>
                setGameState({
                  ...gameState,
                  state: "playing",
                  timeLeft: 120,
                  score: 0,
                })
              }
            >
              Reommencer
            </button>
          </div>
        </>
      )}
      {gameState.state === "lost" && (
        <>
          <div className="pt-16 text-8xl max-w-4xl font-bold text-orange-600">
            Tu as fait {gameState.score} points en 2mn.
          </div>
          <div className="pt-16 text-2xl">
            <button
              className="bg-green-100 p-4 rounded-xl shadow-md font-bold"
              onClick={() =>
                setGameState({
                  ...gameState,
                  state: "playing",
                  timeLeft: 120,
                  score: 0,
                })
              }
            >
              Reommencer
            </button>
          </div>
        </>
      )}
      {gameState.state === "playing" && (
        <>
          <ProblemView p={gameState.problem} onChoice={handleChoice} />
          <div className="flex flex-col justify-center gap-y-4 mt-32 font-mono">
            <div className="text-5xl font-semibold">
              Score:{" "}
              <span className="text-violet-600 text-6xl">
                {gameState.score}
              </span>
            </div>
            <div className="text-5xl font-semibold">
              Temps restant:{" "}
              <span className="text-violet-600 text-6xl">
                {gameState.timeLeft}s
              </span>
            </div>
          </div>
        </>
      )}
      {gameState.state === "waiting" && (
        <>
          <div className="pt-16 text-2xl max-w-xl">
            Tu dois faire 10 points en 2mn.
            <br />
            <br />
            Tu gagnes 1 point par bonne réponse et perds 1 point par mauvaise
            réponse!
            <br />
            <br />
            Tu es prêt?
          </div>
          <div className="pt-16 text-2xl flex flex-col gap-y-2">
            <button
              className="flex bg-green-100 p-4 rounded-xl shadow-md font-bold"
              onClick={() =>
                setGameState({
                  ...gameState,
                  gameType: "table-addition",
                  state: "playing",
                  timeLeft: 120,
                  score: 0,
                  problem: newProblem("table-addition"),
                })
              }
            >
              {"Tables d'additions 1-5"}
            </button>
            <button
              className="flex bg-green-100 p-4 rounded-xl shadow-md font-bold"
              onClick={() =>
                setGameState({
                  ...gameState,
                  gameType: "complement-10",
                  state: "playing",
                  timeLeft: 120,
                  score: 0,
                  problem: newProblem("complement-10"),
                })
              }
            >
              {"Compléments à 10"}
            </button>
          </div>
        </>
      )}
    </main>
  );
}
