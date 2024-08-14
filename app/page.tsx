"use client";

const GAME_TIME = 60;

import { ReactNode, useEffect, useState } from "react";

type GameType =
  | "addition-1-5"
  | "addition-6-10"
  | "complement-10"
  | "multiplication-2-5"
  | "multiplication-6-9";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

type ProblemType = "addition" | "complement-10" | "multiplication";

type Problem = {
  gameType: GameType;
  type: ProblemType;
  left: number;
  right: number;
  answer: number;
};

type Choice = {
  value: number;
  correct: boolean;
  state: boolean | null;
};

function makeSimpleAdditionChoices(solution: number) {
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

function makeMultiplicationChoices(problem: Problem) {
  const solution = problem.left * problem.right;
  let choices = [0, 1, 2].map((_) => {
    const left = Math.floor(Math.random() * 9) + 1;
    let right = Math.floor(Math.random() * 4) + 2;
    if (problem.gameType === "multiplication-6-9") {
      right = Math.floor(Math.random() * 4) + 6;
    }
    return right * left;
  });

  return [
    {
      value: solution,
      correct: true,
      state: null,
    },
    {
      value: choices[0],
      correct: choices[0] === solution,
      state: null,
    },
    {
      value: choices[1],
      correct: choices[1] === solution,
      state: null,
    },
    {
      value: choices[2],
      correct: choices[2] === solution,
      state: null,
    },
    // {
    //   value: ((solution + 1) * 7) % (2 * solution),
    //   correct: ((solution + 1) * 7) % (2 * solution) === solution,
    //   state: null,
    // },
    // {
    //   value: ((solution + 1) * 5) % (2 * solution),
    //   correct: ((solution + 1) * 5) % (2 * solution) === solution,
    //   state: null,
    // },
    // {
    //   value: ((solution + 1) * 2) % (3 * solution),
    //   correct: ((solution + 1) * 2) % (3 * solution) === solution,
    //   state: null,
    // },
  ];
}

function Button({
  onClick,
  children,
}: {
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      className="flex text-base bg-indigo-500 hover:bg-indigo-600 text-white p-4 rounded-xl shadow-md font-semibold uppercase tracking-tight justify-center"
      onClick={onClick}
    >
      {children}
    </button>
  );
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
      choices = makeSimpleAdditionChoices(p.right);
    } else if (p.type === "multiplication") {
      choices = makeMultiplicationChoices(p);
    } else {
      choices = makeSimpleAdditionChoices(p.answer);
    }
    choices.sort(() => Math.random() - 0.5);
    setChoicees(choices);
  }, [p]);

  const handleChoice = (choice: Choice) => {
    onChoice && choice.state === null && onChoice(choice);

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
    <div className="flex flex-col gap-y-16 font-semibold select-none text-4xl">
      <div className="flex flex-row justify-center w-full">
        <div className="flex flex-row rounded-xl bg-indigo-500 p-8 gap-x-2 shadow-md text-white">
          <div className="">{p.left}</div>
          {["addition", "complement-10"].includes(p.type) && (
            <div className="font-light">+</div>
          )}
          {p.type === "multiplication" && <div className="font-light">x</div>}
          {p.type === "complement-10" && (
            <div className="text-yellow-500">?</div>
          )}
          {["addition", "multiplication"].includes(p.type) && (
            <div className="">{p.right}</div>
          )}
          <div className="font-light">=</div>
          {p.type === "complement-10" && <div className="">{p.answer}</div>}
          {["addition", "multiplication"].includes(p.type) && (
            <div className="text-yellow-500">?</div>
          )}
        </div>
      </div>

      <div className="flex flex-row gap-x-4 justify-center flex-wrap gap-y-4">
        {choices.map((c, i) => (
          <div
            className={classNames(
              "flex flex-col border-1 w-32 items-center select-none rounded-xl text-indigo-900 p-4 shadow-md bg-gray-100 select-none",
              c.state === null
                ? "cursor-pointer lg:hover:shadow-md lg:hover:-translate-y-1 transition-all"
                : c.state
                ? "bg-green-300 text-green-800"
                : "bg-red-300 text-red-800"
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
  state: "waiting" | "playing" | "finished";
  gameType: GameType;
  timeLeft: number;
  score: number;
  problem: Problem;
};

export default function Home() {
  const newProblem = (gameType: GameType) => {
    let left = Math.floor(Math.random() * 5) + 1;
    let right = 1;
    let type: ProblemType = "addition";
    switch (gameType) {
      case "addition-1-5":
        right = Math.floor(Math.random() * 5) + 1;
        break;
      case "addition-6-10":
        right = Math.floor(Math.random() * 5) + 6;
        left = Math.floor(Math.random() * 9) + 1;
        break;
      case "complement-10":
        right = 10 - left;
        type = "complement-10";
        break;
      case "multiplication-2-5":
        right = Math.floor(Math.random() * 4) + 2;
        left = Math.floor(Math.random() * 9) + 1;
        type = "multiplication";
        break;
      case "multiplication-6-9":
        right = Math.floor(Math.random() * 4) + 6;
        left = Math.floor(Math.random() * 9) + 1;
        type = "multiplication";
        break;
    }
    const swap = Math.random() > 0.5;
    const p: Problem = {
      gameType,
      type,
      left: swap ? right : left,
      right: swap ? left : right,
      answer: type === "multiplication" ? left * right : left + right,
    };
    return p;
  };

  const [gameState, setGameState] = useState<GameState>({
    state: "waiting",
    gameType: "addition-1-5",
    timeLeft: GAME_TIME,
    score: 0,
    problem: newProblem("addition-1-5"),
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
              state: "finished",
            };
          }
          return {
            ...s,
            timeLeft: s.timeLeft - 1,
          };
        });
      }
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [gameState.state]);

  return (
    <main className="font-nunito flex min-h-screen flex-col items-center bg-indigo-100 text-black pt-16">
      {gameState.state === "finished" && (
        <>
          <div className="text-xl max-w-4xl font-bold text-indigo-900">
            Tu as fait {gameState.score} points en 1mn.
          </div>
          <div className="pt-8 text-base">
            <Button
              onClick={() =>
                setGameState({
                  ...gameState,
                  state: "playing",
                  timeLeft: GAME_TIME,
                  gameType: gameState.gameType,
                  score: 0,
                })
              }
            >
              Recommencer
            </Button>
          </div>
        </>
      )}
      {gameState.state === "playing" && (
        <>
          <ProblemView p={gameState.problem} onChoice={handleChoice} />
          <div className="flex flex-col text-center justify-center gap-y-2 mt-16">
            <div className="text-xl font-semibold">
              Score:{" "}
              <span className="text-indigo-600 text-2xl ">
                {gameState.score}
              </span>
            </div>
            <div className="text-xl font-semibold">
              Temps restant:{" "}
              <span className="text-indigo-600 text-2xl">
                {gameState.timeLeft}s
              </span>
            </div>
          </div>
        </>
      )}
      {gameState.state === "waiting" && (
        <>
          <div className="px-4 text-base w-96 text-indigo-900 text-center font-semibold">
            Tu dois faire un maximum de points en 1mn. Tu gagnes 1 point par
            bonne réponse et perds 1 point par mauvaise réponse! Prêt?
          </div>
          <div className="pt-16 text-base flex flex-col gap-y-2">
            <Button
              onClick={() =>
                setGameState({
                  ...gameState,
                  gameType: "addition-1-5",
                  state: "playing",
                  timeLeft: GAME_TIME,
                  score: 0,
                  problem: newProblem("addition-1-5"),
                })
              }
            >
              {"Additions 1-5"}
            </Button>
            <Button
              onClick={() =>
                setGameState({
                  ...gameState,
                  gameType: "addition-6-10",
                  state: "playing",
                  timeLeft: GAME_TIME,
                  score: 0,
                  problem: newProblem("addition-6-10"),
                })
              }
            >
              {"Additions 6-10"}
            </Button>
            <Button
              onClick={() =>
                setGameState({
                  ...gameState,
                  gameType: "complement-10",
                  state: "playing",
                  timeLeft: GAME_TIME,
                  score: 0,
                  problem: newProblem("complement-10"),
                })
              }
            >
              {"Compléments à 10"}
            </Button>
            <Button
              onClick={() =>
                setGameState({
                  ...gameState,
                  gameType: "multiplication-2-5",
                  state: "playing",
                  timeLeft: GAME_TIME,
                  score: 0,
                  problem: newProblem("multiplication-2-5"),
                })
              }
            >
              {"Multiplications 2-5"}
            </Button>
            <Button
              onClick={() =>
                setGameState({
                  ...gameState,
                  gameType: "multiplication-6-9",
                  state: "playing",
                  timeLeft: GAME_TIME,
                  score: 0,
                  problem: newProblem("multiplication-6-9"),
                })
              }
            >
              {"Multiplications 6-9"}
            </Button>
          </div>
        </>
      )}
    </main>
  );
}
