import { useEffect, useState } from 'react'
import { getPopular } from './api/movies.js'
import Footer from './components/Footer.jsx'
import Header from './components/Header.jsx'
import MovieDetail from './components/MovieDetail.jsx'
import MovieGrid from './components/MovieGrid.jsx'
import StatusMessage from './components/StatusMessage.jsx'
import WatchlistPanel from './components/WatchlistPanel.jsx'
import './App.css'

const WATCHLIST_STORAGE_KEY = 'movie-night-watchlist'

function readWatchlist() {
  try {
    const saved = window.localStorage.getItem(WATCHLIST_STORAGE_KEY)
    if (!saved) return []

    const parsed = JSON.parse(saved)
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.error('อ่าน watchlist จาก localStorage ไม่สำเร็จ:', error)
    return []
  }
}

function App() {
  // ให้ watchlist อยู่ที่ App เพราะทั้ง MovieGrid และ WatchlistPanel ต้องอ่านและแก้ข้อมูลชุดเดียวกัน
  const [watchlist, setWatchlist] = useState(readWatchlist)
  const [movies, setMovies] = useState([])
  const [status, setStatus] = useState('loading')
  const [selectedMovieId, setSelectedMovieId] = useState(null)

  async function loadMovies() {
    try {
      const result = await getPopular()
      setMovies(result.results)
      setStatus(result.results.length === 0 ? 'empty' : 'success')
    } catch (error) {
      console.error('โหลดภาพยนตร์ยอดนิยมไม่สำเร็จ:', error)
      setStatus('error')
    }
  }

  function retryMovies() {
    setStatus('loading')
    loadMovies()
  }

  useEffect(() => {
    let active = true
    getPopular()
      .then((result) => {
        if (!active) return
        setMovies(result.results)
        setStatus(result.results.length === 0 ? 'empty' : 'success')
      })
      .catch((error) => {
        console.error('โหลดภาพยนตร์ยอดนิยมไม่สำเร็จ:', error)
        if (active) setStatus('error')
      })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    try {
      window.localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(watchlist))
    } catch (error) {
      console.error('บันทึก watchlist ลง localStorage ไม่สำเร็จ:', error)
    }
  }, [watchlist])

  function toggleWatchlist(movie) {
    setWatchlist((current) => (
      current.some((item) => item.id === movie.id)
        ? current.filter((item) => item.id !== movie.id)
        : [...current, movie]
    ))
  }

  return (
    <div className="app-shell">
      <Header watchlistCount={watchlist.length} />

      <main className="page-content">
        <section className="catalog-section" aria-labelledby="popular-heading">
          <div className="section-heading">
            <div>
              <p className="eyebrow">คืนนี้ดูอะไรดี</p>
              <h1 id="popular-heading">หนังยอดนิยม</h1>
              <p className="section-description">เลือกเรื่องที่ใช่ แล้วเตรียมป๊อปคอร์นให้พร้อม</p>
            </div>
            {status === 'success' && (
              <span className="movie-count">{movies.length} เรื่อง</span>
            )}
          </div>

          {status === 'loading' && <StatusMessage type="loading" />}
          {status === 'empty' && <StatusMessage type="empty" />}
          {status === 'error' && (
            <StatusMessage type="error" onRetry={retryMovies} />
          )}
          {status === 'success' && (
            <MovieGrid
              movies={movies}
              watchlist={watchlist}
              onToggleWatchlist={toggleWatchlist}
              onSelectMovie={setSelectedMovieId}
            />
          )}
        </section>

        <WatchlistPanel
          movies={watchlist}
          onRemove={toggleWatchlist}
          onSelectMovie={setSelectedMovieId}
        />
      </main>

      <Footer />

      {selectedMovieId !== null && (
        <MovieDetail
          movieId={selectedMovieId}
          onClose={() => setSelectedMovieId(null)}
        />
      )}
    </div>
  )
}

export default App
