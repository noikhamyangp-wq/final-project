import { useEffect, useMemo, useRef, useState } from 'react'
import { getCatalog } from './api/movies.js'
import Footer from './components/Footer.jsx'
import FilterBar from './components/FilterBar.jsx'
import Header from './components/Header.jsx'
import MovieDetail from './components/MovieDetail.jsx'
import MovieGrid from './components/MovieGrid.jsx'
import SearchBox from './components/SearchBox.jsx'
import StatusMessage from './components/StatusMessage.jsx'
import WatchlistPanel from './components/WatchlistPanel.jsx'
import Trie from './utils/trie.js'
import Stack from './utils/stack.js'
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
  const [sort, setSort] = useState('popularity')
  const [genre, setGenre] = useState('')
  const [loadAttempt, setLoadAttempt] = useState(0)
  const [canUndoRemoval, setCanUndoRemoval] = useState(false)
  const removedMovies = useRef(new Stack())
  const movieTrie = useMemo(
    () => (status === 'success' ? new Trie(movies) : null),
    [movies, status],
  )

  useEffect(() => {
    let active = true

    getCatalog({ sort, genre })
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
  }, [sort, genre, loadAttempt])

  useEffect(() => {
    try {
      window.localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(watchlist))
    } catch (error) {
      console.error('บันทึก watchlist ลง localStorage ไม่สำเร็จ:', error)
    }
  }, [watchlist])

  function removeFromWatchlist(movie) {
    if (!watchlist.some((item) => item.id === movie.id)) return

    removedMovies.current.push(movie)
    setCanUndoRemoval(true)
    setWatchlist((current) => current.filter((item) => item.id !== movie.id))
  }

  function toggleWatchlist(movie) {
    if (watchlist.some((item) => item.id === movie.id)) {
      removeFromWatchlist(movie)
      return
    }

    setWatchlist((current) => (
      current.some((item) => item.id === movie.id) ? current : [...current, movie]
    ))
  }

  function undoWatchlistRemoval() {
    const movie = removedMovies.current.pop()
    if (!movie) return

    setWatchlist((current) => (
      current.some((item) => item.id === movie.id) ? current : [...current, movie]
    ))
    setCanUndoRemoval(!removedMovies.current.isEmpty())
  }

  function retryMovies() {
    setStatus('loading')
    setLoadAttempt((current) => current + 1)
  }

  function changeSort(nextSort) {
    setStatus('loading')
    setSort(nextSort)
  }

  function changeGenre(nextGenre) {
    setStatus('loading')
    setGenre(nextGenre)
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

          <SearchBox
            trie={movieTrie}
            catalogStatus={status}
            onSelectMovie={setSelectedMovieId}
            onRetry={retryMovies}
          />

          <FilterBar
            sort={sort}
            genre={genre}
            loading={status === 'loading'}
            onSortChange={changeSort}
            onGenreChange={changeGenre}
          />

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
          onRemove={removeFromWatchlist}
          onSelectMovie={setSelectedMovieId}
          canUndo={canUndoRemoval}
          onUndo={undoWatchlistRemoval}
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
