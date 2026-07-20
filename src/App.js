import { useState, useEffect } from "react";
import Square from "./components/Square";

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Horizontais
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Verticais
    [0, 4, 8], [2, 4, 6],             // Diagonais
  ];

  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line: [a, b, c] };
    }
  }
  return null;
}

export default function App() {
  // O histórico armazena arrays com o estado das 9 posições
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [stepNumber, setStepNumber] = useState(0);
  const [xIsNext, setXIsNext] = useState(true);
  const [isVsComputer, setIsVsComputer] = useState(false);

  const [score, setScore] = useState({ X: 0, O: 0, draws: 0 });

  // O tabuleiro atual é baseado no passo selecionado no histórico
  const currentSquares = history[stepNumber];
  const result = calculateWinner(currentSquares);

  // Jogada do Computador (IA simples)
  useEffect(() => {
    if (isVsComputer && !xIsNext && !result) {
      // Verifica se o jogo já empatou
      if (currentSquares.every((square) => square !== null)) return;

      // Pequeno delay para parecer que a máquina está "pensando"
      const timer = setTimeout(() => {
        const emptySquares = currentSquares
          .map((val, idx) => (val === null ? idx : null))
          .filter((val) => val !== null);

        if (emptySquares.length > 0) {
          // Escolhe uma posição aleatória dentre as disponíveis
          const randomMove = emptySquares[Math.floor(Math.random() * emptySquares.length)];
          executeMove(randomMove);
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [xIsNext, isVsComputer, currentSquares, result]);

  function executeMove(i) {
    if (result || currentSquares[i]) return;

    // Remove históricos futuros caso o jogador tenha desfeito jogadas e feito uma nova
    const newHistory = history.slice(0, stepNumber + 1);
    const nextSquares = [...currentSquares];
    nextSquares[i] = xIsNext ? "X" : "O";

    const nextResult = calculateWinner(nextSquares);

    // Atualiza placar se o jogo terminar neste movimento
    if (nextResult) {
      setScore((prev) => ({ ...prev, [nextResult.winner]: prev[nextResult.winner] + 1 }));
    } else if (nextSquares.every((square) => square !== null)) {
      setScore((prev) => ({ ...prev, draws: prev.draws + 1 }));
    }

    setHistory([...newHistory, nextSquares]);
    setStepNumber(newHistory.length);
    setXIsNext(!xIsNext);
  }

  function handleClick(i) {
    // Se for a vez do computador, bloqueia cliques do jogador humano
    if (isVsComputer && !xIsNext) return;
    executeMove(i);
  }

  function jumpTo(step) {
    setStepNumber(step);
    setXIsNext(step % 2 === 0);
  }

  function undoLastMove() {
    // Se estiver jogando contra a máquina, desfaz 2 passos (o seu e o dela)
    const stepsToUndo = isVsComputer ? 2 : 1;
    if (stepNumber >= stepsToUndo) {
      jumpTo(stepNumber - stepsToUndo);
    }
  }

  function restartGame() {
    setHistory([Array(9).fill(null)]);
    setStepNumber(0);
    setXIsNext(true);
  }

  // Gera a lista visual do histórico de jogadas
  const moves = history.map((squares, move) => {
    const desc = move ? `Ir para a jogada #${move}` : "Ir para o início do jogo";
    return (
      <li key={move}>
        <button className="history-btn" onClick={() => jumpTo(move)}>
          {desc}
        </button>
      </li>
    );
  });

  return (
    <div className="game-wrapper">
      {/* Lado Esquerdo: Status e Placar */}
      <div className="left-panel">
        <h2>
          {result
            ? `Vencedor: ${result.winner}`
            : `Vez do jogador: ${xIsNext ? "X" : "O"}`}
        </h2>

        <div className="mode-selection">
          <label>
            <input
              type="checkbox"
              checked={isVsComputer}
              onChange={(e) => {
                setIsVsComputer(e.target.checked);
                restartGame();
              }}
            />
            Jogar contra a Máquina
          </label>
        </div>

        <div className="actions">
          <button className="action-btn restart" onClick={restartGame}>
            Reiniciar Jogo
          </button>
          <button
            className="action-btn undo"
            onClick={undoLastMove}
            disabled={stepNumber === 0 || (isVsComputer && stepNumber < 2)}
          >
            Desfazer Jogada
          </button>
        </div>

        <div className="score-board">
          <h3>Placar</h3>
          <p><strong>X:</strong> {score.X}</p>
          <p><strong>O:</strong> {score.O}</p>
          <p><strong>Empates:</strong> {score.draws}</p>
        </div>
      </div>

      {/* Centro: O Tabuleiro Principal e Grande */}
      <div className="center-panel">
        <div className="board">
          {[0, 1, 2].map((row) => (
            <div className="board-row" key={row}>
              {[0, 1, 2].map((col) => {
                const index = row * 3 + col;
                return (
                  <Square
                    key={index}
                    value={currentSquares[index]}
                    onClick={() => handleClick(index)}
                    isWinner={result?.line.includes(index)}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Lado Direito: Histórico */}
      <div className="right-panel">
        <div className="game-history">
          <h3>Histórico da Partida</h3>
          <ol>{moves}</ol>
        </div>
      </div>
    </div>
  );
}