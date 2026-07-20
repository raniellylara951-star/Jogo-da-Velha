export default function Square({ value, onClick, isWinner }) {
  return (
    <button
      className={`square ${isWinner ? "winner" : ""}`}
      onClick={onClick}
    >
      {/* Renderização condicional: se houver Pokémon na casa, exibe sua imagem (Requisito 2) */}
      {value?.image && (
        <img 
          src={value.image} 
          alt={value.name} 
          className="pokemon-sprite" 
        />
      )}
    </button>
  );
}