import WatchlistItem from './WatchlistItem.jsx'
import StatusMessage from './StatusMessage.jsx'

function WatchlistPanel({ movies, onRemove, onSelectMovie, canUndo, onUndo }) {
  return (
    <aside className="watchlist-panel" aria-labelledby="watchlist-heading">
      <div className="watchlist-heading">
        <h2 id="watchlist-heading">รายการที่อยากดู</h2>
        <span>{movies.length} เรื่อง</span>
      </div>
      <button
        className="undo-button"
        type="button"
        onClick={onUndo}
        disabled={!canUndo}
      >
        ย้อนกลับ
      </button>

      {movies.length === 0
        ? <StatusMessage
          type="empty"
          message="เพิ่มหนังที่สนใจไว้ แล้วค่อยเลือกดูคืนนี้"
          compact
        />
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
