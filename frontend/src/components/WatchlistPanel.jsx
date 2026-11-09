import WatchlistItem from './WatchlistItem.jsx'

function WatchlistPanel({ movies, onRemove, onSelectMovie }) {
  return (
    <aside className="watchlist-panel" aria-labelledby="watchlist-heading">
      <div className="watchlist-heading">
        <h2 id="watchlist-heading">รายการที่อยากดู</h2>
        <span>{movies.length} เรื่อง</span>
      </div>

      {movies.length === 0
        ? <p className="watchlist-empty">เพิ่มหนังที่สนใจไว้ แล้วค่อยเลือกดูคืนนี้</p>
        : (
          <div className="watchlist-list">
            {movies.map((movie) => (
              <WatchlistItem
                key={movie.id}
                movie={movie}
                onRemove={onRemove}
                onSelectMovie={onSelectMovie}
              />
            ))}
          </div>
        )}
    </aside>
  )
}

export default WatchlistPanel
