import { useState, useEffect, useContext } from "react";
import gameStyles from "../styles/Game.module.css";
import Link from "next/link";
import Head from "next/head";
import {
  SquaresContext,
  RawResultContext,
  HandleTileClickContext,
} from "./TicTacToeContext";

export default function App() {
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState("X");
  const [theme, setTheme] = useState(null);

  //get system theme and dynamically update theme of application based on theme
  useEffect((theme) => {
    setTheme(
      window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
    );
    document.body.className = `${gameStyles[theme]}`;
  }, []);

  //check the result of the game on component re-render
  let rawResult = getResult(squares);
  let result = null;
  if (rawResult === "draw") {
    result = "draw";
  } else if (rawResult) {
    result = squares[rawResult[0]];
  }

  const handleChangeTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleTileClick = (index) => {
    if (result || squares[index]) return;
    const newState = [...squares];
    newState[index] = currentPlayer;
    setSquares(newState);
    setCurrentPlayer(currentPlayer === "X" ? "O" : "X");
  };

  const handleReset = () => {
    result = null;
    rawResult = null;
    setSquares(Array(9).fill(null));
    setCurrentPlayer("X");
  };

  return (
    <>
      <Head>
        <title>Tic-Tac-Toe</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={`${gameStyles.main} ${gameStyles[theme]}`}>
        <MenuBar theme={theme} setTheme={handleChangeTheme} />
        <GameContextWrapper
          handleTileClick={handleTileClick}
          squares={squares}
          rawResult={rawResult}
        >
          <GameContainer
            currentPlayer={currentPlayer}
            handleReset={handleReset}
            result={result}
          />
        </GameContextWrapper>
      </main>
    </>
  );
}

function MenuBar({ setTheme }) {
  return (
    <>
      <Link href="/" className={`${gameStyles.homeLink}`}>
        <u>Home</u>
      </Link>
      <button
        className={`${gameStyles.themeSelector}`}
        onClick={() => setTheme()}
      ></button>
    </>
  );
}

function GameContextWrapper({ children, handleTileClick, squares, rawResult }) {
  return (
    <HandleTileClickContext.Provider value={handleTileClick}>
      <SquaresContext.Provider value={squares}>
        <RawResultContext.Provider value={rawResult}>
          {children}
        </RawResultContext.Provider>
      </SquaresContext.Provider>
    </HandleTileClickContext.Provider>
  );
}

function GameContainer({ handleReset, result, currentPlayer }) {
  return (
    <div className={gameStyles.gameContainer}>
      <Grid />
      <div className={`${gameStyles.infoContainer}`}>
        <button className={`${gameStyles.resetButton}`} onClick={handleReset}>
          Reset
        </button>
        <button
          className={`${gameStyles.resetButton} ${
            result && gameStyles.celebrate
          }`}
        >
          {resultButtonText(result, currentPlayer)}
        </button>
      </div>
    </div>
  );
}

function Grid({}) {
  return (
    <div className={gameStyles.board}>
      <Square index={0} />
      <Square index={1} />
      <Square index={2} />
      <Square index={3} />
      <Square index={4} />
      <Square index={5} />
      <Square index={6} />
      <Square index={7} />
      <Square index={8} />
    </div>
  );
}

function Square({ index }) {
  const rawResult = useContext(RawResultContext);
  const squares = useContext(SquaresContext);
  const onClick = useContext(HandleTileClickContext);

  const winningCombination = Array.isArray(rawResult) ? [...rawResult] : [];
  const isIconDisabled = rawResult ? "icon-disabled" : "";
  const appearClass = squares[index] ? "appear" : "";

  return (
    <div
      className={`${gameStyles.square} ${
        gameStyles[indexToPositionList[index]]
      }`}
      onClick={() => onClick(index)}
    >
      <div
        className={`${gameStyles[appearClass]} ${gameStyles[isIconDisabled]} ${
          winningCombination.includes(index) && gameStyles.winTile
        }`}
      >
        {squares[index]}
      </div>
    </div>
  );
}

const winningCombinations = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const indexToPositionList = [
  "topLeft",
  "top",
  "topRight",
  "middleLeft",
  "middle",
  "middleRight",
  "bottomLeft",
  "bottom",
  "bottomRight",
];

//decides what text to put on gameState info button
const resultButtonText = (result, currentPlayer) => {
  switch (result) {
    case "draw":
      return "It's a draw!";
    case "X":
      return "X wins!";
    case "O":
      return "O wins!";
    default:
      return `${currentPlayer}, your turn now!`;
  }
};

//calculates result of game; winning combination indexes or draw or null if no result
function getResult(squares) {
  for (let i = 0; i < winningCombinations.length; i++) {
    const [a, b, c] = winningCombinations[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return [a, b, c];
    }
  }
  if (squares.every((square) => square !== null)) {
    return "draw";
  }
  return null;
}
