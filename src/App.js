import { useState } from "react";
import Square from "./components/Square";

export default function App() {

  const [squares, setSquares] =
    useState(Array(9).fill(null));

    const [xIsNext, setXIsNext] =
  useState(true);

    function handleClick(i) {

      if (squares[i]) return;
    
      const nextSquares = [...squares];
    
      nextSquares[i] =
        xIsNext ? "X" : "O";
    
      setSquares(nextSquares);
    
      setXIsNext(!xIsNext);
    }

  return (
    <>
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