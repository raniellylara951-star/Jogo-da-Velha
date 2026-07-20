export default function Square({
  value,
  onClick,
  isWinner
}) {
    return (
      <button
  className={`square ${isWinner ? "winner" : ""}`}
  onClick={onClick}
>
        {value}
      </button>
    );
  }

 

  