function WatchlistItem({ movie, onRemove, onSelectMovie }) {
  const posterUrl = movie.posterPath
    ? `https://image.tmdb.org/t/p/w342${movie.posterPath}`
    : null

  return (
    <article className="watchlist-item">
      <button
        type="button"
        className="watchlist-item-open"
        onClick={() => onSelectMovie(movie.id)}
        aria-label={`ดูรายละเอียด ${movie.title}`}
      >
        {posterUrl
          ? <img className="watchlist-poster" src={posterUrl} alt="" loading="lazy" />
          : <span className="poster-placeholder" aria-hidden="true" />}
      </button>
      <div className="watchlist-item-copy">
        <span className="watchlist-item-title" title={movie.title}>{movie.title}</span>
        <span className="watchlist-item-rating">★ {Number(movie.rating || 0).toFixed(1)}</span>
      </div>
      <button
        type="button"
        className="remove-button"
        onClick={() => onRemove(movie)}
        aria-label={`นำ ${movie.title} ออกจากรายการ`}
      >
        <svg viewBox="0 0 24 24" width="17" height="17" fill="none" aria-hidden="true">
          <path d="m7 7 10 10M17 7 7 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>
    </article>
  )
}

export default WatchlistItem
