import { useEffect, useState } from 'react'
import { getMovie } from '../api/movies.js'
import StatusMessage from './StatusMessage.jsx'

function MovieDetail({ movieId, onClose }) {
  const [movie, setMovie] = useState(null)
  const [status, setStatus] = useState('loading')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let active = true

    async function loadMovie() {
      try {
        const result = await getMovie(movieId)
        if (active) {
          setMovie(result)
          setStatus('success')
        }
      } catch (error) {
        console.error('โหลดรายละเอียดภาพยนตร์ไม่สำเร็จ:', error)
        if (active) setStatus('error')
      }
    }

    loadMovie()
    return () => {
      active = false
    }
  }, [movieId, attempt])

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const backdropUrl = movie?.backdropPath
    ? `https://image.tmdb.org/t/p/w780${movie.backdropPath}`
    : null

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        className="movie-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="movie-detail-title"
      >
        <button className="modal-close" type="button" onClick={onClose} aria-label="ปิดรายละเอียด">
          <svg viewBox="0 0 24 24" width="19" height="19" fill="none" aria-hidden="true">
            <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        {status !== 'success' && (
          <div className="detail-status">
            <h2 id="movie-detail-title" className="sr-only">รายละเอียดภาพยนตร์</h2>
            <StatusMessage
              type={status}
              onRetry={() => {
                setStatus('loading')
                setAttempt((current) => current + 1)
              }}
            />
          </div>
        )}

        {status === 'success' && movie && (
          <>
            <div
              className="modal-backdrop-image"
              role="img"
              aria-label={movie.backdropPath ? `ภาพฉากหลัง ${movie.title}` : ''}
              style={backdropUrl ? { backgroundImage: `linear-gradient(180deg, rgb(12 13 17 / 5%), #191a21 96%), url("${backdropUrl}")` } : undefined}
            />
            <div className="modal-content">
              <h2 id="movie-detail-title">{movie.title}</h2>
              {movie.tagline && <p className="modal-tagline">{movie.tagline}</p>}

              <div className="modal-facts">
                {movie.runtime && <span>{movie.runtime} นาที</span>}
                {movie.releaseDate && <span>{new Date(`${movie.releaseDate}T00:00:00`).getFullYear()}</span>}
                {movie.rating !== undefined && (
                  <span className="rating">★ {Number(movie.rating).toFixed(1)}</span>
                )}
                {(movie.genres || []).map((genre) => <span key={genre.id}>{genre.name}</span>)}
              </div>

              <p className="modal-overview">{movie.overview?.trim() || 'ยังไม่มีเรื่องย่อ'}</p>

              {movie.cast?.length > 0 && (
                <>
                  <h3 className="modal-subheading">นักแสดง</h3>
                  <div className="cast-list">
                    {movie.cast.map((person) => (
                      <div className="cast-person" key={person.id}>
                        <strong>{person.name}</strong>
                        {person.character && <span>{person.character}</span>}
                      </div>
                    ))}
                  </div>
                </>
              )}

              {movie.trailerKey && (
                <a
                  className="trailer-button"
                  href={`https://www.youtube.com/watch?v=${encodeURIComponent(movie.trailerKey)}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden="true">
                    <path d="M21.6 7.2a2.8 2.8 0 0 0-2-2C17.9 4.7 12 4.7 12 4.7s-5.9 0-7.6.5a2.8 2.8 0 0 0-2 2A29 29 0 0 0 2 12a29 29 0 0 0 .4 4.8 2.8 2.8 0 0 0 2 2c1.7.5 7.6.5 7.6.5s5.9 0 7.6-.5a2.8 2.8 0 0 0 2-2A29 29 0 0 0 22 12a29 29 0 0 0-.4-4.8ZM10 15.5v-7l6 3.5-6 3.5Z" />
                  </svg>
                  ดูตัวอย่าง
                </a>
              )}
            </div>
          </>
        )}
      </section>
    </div>
  )
}

export default MovieDetail
