import { useState, useEffect, useContext, useRef } from "react";
import style from "../styles/Game.module.css";
import Link from "next/link";
import Head from "next/head";
import axios from "axios";
import { bestBotMove, getResult } from "../functions/tictactoeBot";
import {
  SquaresContext,
  ResultContext,
  HandleTileClickContext,
  IsSinglePlayerContext,
} from "../contexts/TicTacToeContext";

export default function App() {
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [theme, setTheme] = useState(null);
  const [isSinglePlayer, setIsSinglePlayer] = useState(true);
  const [isBoardEnabled, setIsBoardEnabled] = useState(true);
  const resultRef = useRef(null);
  const playerRef = useRef("X");
  const squaresRef = useRef(squares);

  function delay(ms) {
    return new Promise((res) => setTimeout(res, ms));
  }

  function handleChangeTheme() {
    setTheme(theme === "dark" ? "light" : "dark");
  }

  function swapPlayers() {
    playerRef.current = playerRef.current === "X" ? "O" : "X";
  }

  function updateSquares(newSquares) {
    setSquares(newSquares);
    squaresRef.current = newSquares;
  }

  function isPlayerXTurn() {
    return playerRef.current === "X" ? true : false;
  }

  function onIndexUpdate(index) {
    //generate new squares
    const newSquares = [...squaresRef.current];
    newSquares[index] = playerRef.current;
    //update squares, results, and swap players
    updateSquares(newSquares);
    swapPlayers();
    resultRef.current = getResult(newSquares);
  }

  useEffect((theme) => {
    setTheme(
      window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
    );
    document.body.className = `${style[theme]}`;
  }, []);

  /*
  const handleOtherPlayerMove = async (newSquares) => {
    setIsBoardEnabled(false);
    await delay(300)
      .then(() => {
        const startTime = performance.now();
        //return callAPI(newSquares);
        const botMove = bestBotMove(newSquares); //anyhowBotMove for easy mode
        const endTime = performance.now();
        console.log(`Call to botMove took ${endTime - startTime}ms`);
        return botMove;
      })
      .then((botMove) => {
        newSquares[botMove] = playerRef.current === "X" ? "O" : "X";
        resultRef.current = getResult(newSquares);
        setSquares(newSquares);
        setIsBoardEnabled(true);
      })
      .catch((err) => console.log(err));
  };
  */

  function getOpponentMove(squares, isMaximizer) {
    const url = "/api/tic-tac-toe";
    const data = { first: squares, second: isMaximizer };
    return axios.post(url, data);
  }

  async function handleBotMove() {
    setIsBoardEnabled(false);
    await delay(300);
    const botMove = bestBotMove(squaresRef.current, isPlayerXTurn());
    onIndexUpdate(botMove);
    setIsBoardEnabled(true);
    //test data fetching
    const res = await getOpponentMove(squaresRef.current, isPlayerXTurn());
    if (res) console.log(`\nPlayer X\nBest Move: ${res.data}\n\n`);
  }

  function handleTileClick(index) {
    if (resultRef.current || squares[index]) return; //return if gameOver or tile is clicked already
    onIndexUpdate(index); //handle everything and swap players
    if (resultRef.current || !isSinglePlayer) return; //if gameOver or is double player
    handleBotMove(); //game not ended and is single player
  }

  function handleReset() {
    squaresRef.current = Array(9).fill(null);
    setSquares(squaresRef.current);
    resultRef.current = null;
    playerRef.current = "X";
  }

  function handlePlayerModeToggle() {
    setIsSinglePlayer(isSinglePlayer === true ? false : true);
    handleReset();
  }

  return (
    <>
      <Head>
        <title>Tic-Tac-Toe</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={`${style.main} ${style[theme]}`}>
        <MenuBar theme={theme} setTheme={handleChangeTheme} />
        <GameContextWrapper
          handleTileClick={handleTileClick}
          squares={squares}
          result={resultRef.current}
          isSinglePlayer={isSinglePlayer}
        >
          <GameContainer
            currentPlayer={playerRef.current}
            handleReset={handleReset}
            handlePlayerModeToggle={handlePlayerModeToggle}
            isBoardEnabled={isBoardEnabled}
          />
        </GameContextWrapper>
      </main>
    </>
  );
}

function MenuBar({ setTheme }) {
  return (
    <>
      <Link href="/" className={`${style.homeLink}`}>
        <u>Home</u>
      </Link>
      <button
        className={`${style.themeSelector}`}
        onClick={() => setTheme()}
      ></button>
    </>
  );
}

function GameContextWrapper(props) {
  return (
    <HandleTileClickContext.Provider value={props.handleTileClick}>
      <SquaresContext.Provider value={props.squares}>
        <ResultContext.Provider value={props.result}>
          <IsSinglePlayerContext.Provider value={props.isSinglePlayer}>
            {props.children}
          </IsSinglePlayerContext.Provider>
        </ResultContext.Provider>
      </SquaresContext.Provider>
    </HandleTileClickContext.Provider>
  );
}

function GameContainer(props) {
  return (
    <div className={style.gameContainer}>
      <Grid isBoardEnabled={props.isBoardEnabled} />
      <GameMenuBar {...props} />
    </div>
  );
}

function GameMenuBar({ handleReset, currentPlayer, handlePlayerModeToggle }) {
  const isSinglePlayer = useContext(IsSinglePlayerContext);
  const result = useContext(ResultContext);
  return (
    <div className={`${style.infoContainer}`}>
      <button className={`${style.resetButton}`} onClick={handleReset}>
        Reset
      </button>
      <button className={`${style.resetButton} ${result && style.celebrate}`}>
        {resultButtonText(result, currentPlayer)}
      </button>
      <button
        className={`${style.resetButton}`}
        onClick={handlePlayerModeToggle}
      >
        {isSinglePlayer ? "2P" : "1P"}
      </button>
    </div>
  );
}

function Grid({ isBoardEnabled }) {
  return (
    <div className={`${style.board} ${!isBoardEnabled && style.disableClick}`}>
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
  const result = useContext(ResultContext);
  const squares = useContext(SquaresContext);
  const onClick = useContext(HandleTileClickContext);

  const winningCombination = result ? result.winningCombination : [];
  const isIconDisabled = result ? "icon-disabled" : "";
  const appearClass = squares[index] ? "appear" : "";

  return (
    <div
      className={`${style.square} ${style[indexToPositionList[index]]}`}
      onClick={() => onClick(index)}
    >
      <div
        className={`${style[appearClass]} ${style[isIconDisabled]} ${
          winningCombination.includes(index) && style.winTile
        }`}
      >
        {squares[index]}
      </div>
    </div>
  );
}

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
  if (!result) return `${currentPlayer}, your turn now!`;
  if (result.winner === "null") return "It's a draw!";
  return `${result.winner} wins!`;
};
