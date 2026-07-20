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
    // Agora comparamos os nomes dos Pokémon armazenados nas casas
    if (squares[a] && squares[a].name === squares[b]?.name && squares[a].name === squares[c]?.name) {
      return { winner: squares[a], line: [a, b, c] };
    }
  }
  return null;
}

export default function App() {
  // Estados para os Pokémon dos Jogadores
  const [p1Data, setP1Data] = useState(null);
  const [p2Data, setP2Data] = useState(null);
  const [p1Input, setP1Input] = useState("pikachu");
  const [p2Input, setP2Input] = useState("bulbasaur");
  
  // Estados de controle da API
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  // Estados do Jogo (O histórico agora guarda objetos de Pokémon ou null)
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [stepNumber, setStepNumber] = useState(0);
  const [p1IsNext, setP1IsNext] = useState(true);
  const [isVsComputer, setIsVsComputer] = useState(false);
  const [score, setScore] = useState({ p1: 0, p2: 0, draws: 0 });

  const currentSquares = history[stepNumber];
  const result = calculateWinner(currentSquares);

  // Função assíncrona para buscar Pokémon na PokéAPI
  const fetchPokemon = async (name) => {
    try {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase().trim()}`);
      if (!response.ok) {
        throw new Error("Pokémon não encontrado.");
      }
      const data = await response.ok ? await response.json() : null;
      return {
        name: data.name.toUpperCase(),
        image: data.sprites.front_default || data.sprites.other["official-artwork"].front_default
      };
    } catch (error) {
      throw error;
    }
  };

  // Carrega os Pokémon iniciais (Requisito 1)
  useEffect(() => {
    async function loadInitialPokemon() {
      try {
        setLoading(true);
        setApiError("");
        const p1 = await fetchPokemon("pikachu");
        const p2 = await fetchPokemon("bulbasaur");
        setP1Data(p1);
        setP2Data(p2);
      } catch (err) {
        setApiError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadInitialPokemon();
  }, []);

  // Alterar Pokémon customizados (Requisito 3 e 4)
  const handleUpdatePokemon = async (e) => {
    e.preventDefault();
    try {
      setApiError("");
      const p1 = await fetchPokemon(p1Input);
      const p2 = await fetchPokemon(p2Input);
      setP1Data(p1);
      setP2Data(p2);
      restartGame(); // Reinicia para aplicar os novos personagens sem quebrar a partida
    } catch (err) {
      setApiError(err.message); // Tratamento de erro (Requisito 5)
    }
  };

  // Jogada da Máquina
  useEffect(() => {
    if (isVsComputer && !p1IsNext && !result && p2Data) {
      if (currentSquares.every((square) => square !== null)) return;

      const timer = setTimeout(() => {
        const emptySquares = currentSquares
          .map((val, idx) => (val === null ? idx : null))
          .filter((val) => val !== null);

        if (emptySquares.length > 0) {
          const randomMove = emptySquares[Math.floor(Math.random() * emptySquares.length)];
          executeMove(randomMove);
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [p1IsNext, isVsComputer, currentSquares, result, p2Data]);

  function executeMove(i) {
    if (result || currentSquares[i] || !p1Data || !p2Data) return;

    const newHistory = history.slice(0, stepNumber + 1);
    const nextSquares = [...currentSquares];
    
    // Define qual objeto de Pokémon vai para a casa clicada
    nextSquares[i] = p1IsNext ? p1Data : p2Data;

    const nextResult = calculateWinner(nextSquares);

    if (nextResult) {
      const isP1Winner = nextResult.winner.name === p1Data.name;
      setScore((prev) => ({
        ...prev,
        p1: isP1Winner ? prev.p1 + 1 : prev.p1,
        p2: !isP1Winner ? prev.p2 + 1 : prev.p2,
      }));
    } else if (nextSquares.every((square) => square !== null)) {
      setScore((prev) => ({ ...prev, draws: prev.draws + 1 }));
    }

    setHistory([...newHistory, nextSquares]);
    setStepNumber(newHistory.length);
    setP1IsNext(!p1IsNext);
  }

  function handleClick(i) {
    if (isVsComputer && !p1IsNext) return;
    executeMove(i);
  }

  function jumpTo(step) {
    setStepNumber(step);
    setP1IsNext(step % 2 === 0);
  }

  function undoLastMove() {
    const stepsToUndo = isVsComputer ? 2 : 1;
    if (stepNumber >= stepsToUndo) {
      jumpTo(stepNumber - stepsToUndo);
    }
  }

  function restartGame() {
    setHistory([Array(9).fill(null)]);
    setStepNumber(0);
    setP1IsNext(true);
  }

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

  if (loading) {
    return <div className="loading-screen">Carregando dados dos Pokémon...</div>;
  }

  // Define o nome de quem está jogando no momento
  const currentPlayerName = p1IsNext ? p1Data?.name : p2Data?.name;

  return (
    <div className="game-wrapper">
      {/* Lado Esquerdo: Formulário de Seleção e Placar */}
      <div className="left-panel">
        <h2>
          {result
            ? `Vencedor: ${result.winner.name}`
            : `Vez de: ${currentPlayerName}`}
        </h2>

        {/* Formulário de Escolha dos Pokémon */}
        <form onSubmit={handleUpdatePokemon} className="pokemon-form">
          <div className="form-group">
            <label>Jogador 1:</label>
            <input
              type="text"
              value={p1Input}
              onChange={(e) => setP1Input(e.target.value)}
              placeholder="Ex: pikachu"
              required
            />
          </div>
          <div className="form-group">
            <label>Jogador 2:</label>
            <input
              type="text"
              value={p2Input}
              onChange={(e) => setP2Input(e.target.value)}
              placeholder="Ex: bulbasaur"
              required
            />
          </div>
          <button type="submit" className="action-btn change-btn">Alterar Pokémon</button>
        </form>

        {/* Notificação de Erros da API */}
        {apiError && <p className="error-message">{apiError}</p>}

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
          <button type="button" className="action-btn restart" onClick={restartGame}>
            Reiniciar Jogo
          </button>
          <button
            type="button"
            className="action-btn undo"
            onClick={undoLastMove}
            disabled={stepNumber === 0 || (isVsComputer && stepNumber < 2)}
          >
            Desfazer Jogada
          </button>
        </div>

        <div className="score-board">
          <h3>Placar</h3>
          <p><strong>{p1Data?.name}:</strong> {score.p1}</p>
          <p><strong>{p2Data?.name}:</strong> {score.p2}</p>
          <p><strong>Empates:</strong> {score.draws}</p>
        </div>
      </div>

      {/* Centro: Tabuleiro com imagens */}
      <div className="center-panel">
        <div className="board">
          {[0, 1, 2].map((row) => (
            <div className="board-row" key={row}>
              {[0, 1, 2].map((col) => {
                const index = row * 3 + col;
                return (
                  <Square
                    key={index}
                    value={currentSquares[index]} // Passa o objeto do Pokémon selecionado na casa
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