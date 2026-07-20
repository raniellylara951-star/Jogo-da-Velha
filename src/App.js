import { useState } from "react";
import Square from "./components/Square";

function calculateWinner(squares) {

  const lines = [

    [0,1,2],
    [3,4,5],
    [6,7,8],

    [0,3,6],
    [1,4,7],
    [2,5,8],

    [0,4,8],
    [2,4,6]

  ];

  for (let i = 0; i < lines.length; i++) {

    const [a,b,c] = lines[i];

    if (
      squares[a] &&
      squares[a] === squares[b] &&
      squares[a] === squares[c]
    ) {
      return squares[a];
    }
  }

  return null;
}


export default function App() {

  const [squares, setSquares] =
    useState(Array(9).fill(null));


  const [xIsNext, setXIsNext] =
  useState(true);

  const winner =
   calculateWinner(squares);


  const [score, setScore] =
  useState({
    x:"O",
    O:"O",
    draws:"O"

  });

    function handleClick(i) {

      if (winner || squares[i]) {
        return;
      }
      if (squares[i]) return;

    
      const nextSquares = [...squares];
    
      nextSquares[i] =
        xIsNext ? "X" : "O";

      setScore(prev =>({
        ...prev,
        [winner]: prev[winner] + 1
      }));  
    
      setSquares(nextSquares);
    
      setXIsNext(!xIsNext);
    }
    function restartGame() {
      setSquares(Array(9).fill(null));
      setXIsNext(true);
    }
      
  return {
    winner: squares[a],
    line: [a,b,c]
  };


  return (
    <>
    <div className="game">
  
    <h2>
      {winner
      ?`Vencedor: ${winner}`
      :`Vez do jogador: ${xIsNext ? "x" : "O" }`}
    </h2>

    <button onClick={() => restartGame()}>
      Reiniciar Jogo
    </button>

    <h3>Placar</h3>
    <p>x: {score.x}</p>
    <p>O: {score.O}</p>
    <p>Empates: {score.draws}</p>
    </div>

  
  
      <div className="board-row">
        <Square value={squares[0]} onClick={() => handleClick(0)} />
        <Square value={squares[1]} onClick={() => handleClick(1)} />
        <Square value={squares[2]} onClick={() => handleClick(2)} />
      </div>
  
      <div className="board-row">
        <Square value={squares[3]} onClick={() => handleClick(3)} />
        <Square value={squares[4]} onClick={() => handleClick(4)} />
        <Square value={squares[5]} onClick={() => handleClick(5)} />
      </div>
  
      <div className="board-row">
        <Square value={squares[6]} onClick={() => handleClick(6)} />
        <Square value={squares[7]} onClick={() => handleClick(7)} />
        <Square value={squares[8]} onClick={() => handleClick(8)} />
      </div>
    </>
  );

}

   