import MovieCard from './MovieCard.jsx'

function MovieGrid({ movies, watchlist, onToggleWatchlist, onSelectMovie }) {
  return (
    <div className="movie-grid">
      {movies.map((movie) => (
        <MovieCard
          key={movie.id}
          movie={movie}
          isSaved={watchlist.some((item) => item.id === movie.id)}
          onToggleWatchlist={onToggleWatchlist}
          onSelectMovie={onSelectMovie}
        />
      ))}
    </div>
  )
}

export default MovieGrid
