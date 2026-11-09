function MovieCard({ movie, isSaved, onToggleWatchlist, onSelectMovie }) {
  const posterUrl = movie.posterPath
    ? `https://image.tmdb.org/t/p/w342${movie.posterPath}`
    : null
  const releaseYear = movie.releaseDate
    ? new Date(`${movie.releaseDate}T00:00:00`).getFullYear()
    : 'ไม่ระบุปี'

  return (
    <article className="movie-card">
      <button
        className="poster-button"
        type="button"
        onClick={() => onSelectMovie(movie.id)}
        aria-label={`ดูรายละเอียด ${movie.title}`}
      >
        {posterUrl
          ? <img className="poster-image" src={posterUrl} alt={`โปสเตอร์ ${movie.title}`} loading="lazy" />
          : (
            <span className="poster-placeholder" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M6 4.5h12A1.5 1.5 0 0 1 19.5 6v12a1.5 1.5 0 0 1-1.5 1.5H6A1.5 1.5 0 0 1 4.5 18V6A1.5 1.5 0 0 1 6 4.5Z" stroke="currentColor" strokeWidth="1.5" />
                <path d="m8 15 2.5-2.5 2 2 1.5-1.5 2 2M9 9h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          )}
        <span className="poster-overlay">ดูรายละเอียด</span>
      </button>

      <div className="movie-card-meta">
        <span className="movie-card-title" title={movie.title}>{movie.title}</span>
        <div className="movie-card-subtitle">
          <span>{releaseYear}</span>
          <span className="rating">★ {Number(movie.rating || 0).toFixed(1)}</span>
        </div>
        <div className="card-actions">
          <button
            type="button"
            className={`watchlist-button${isSaved ? ' is-saved' : ''}`}
            onClick={() => onToggleWatchlist(movie)}
            aria-pressed={isSaved}
          >
            <span aria-hidden="true">{isSaved ? '✓' : '+'}</span>
            {isSaved ? 'บันทึกแล้ว' : 'อยากดู'}
          </button>
        </div>
      </div>
    </article>
  )
}

export default MovieCard
