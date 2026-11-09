import { useState } from 'react'
import StatusMessage from './StatusMessage.jsx'

function SearchBox({ trie, catalogStatus, onSelectMovie, onRetry }) {
  const [query, setQuery] = useState('')
  const normalizedQuery = query.trim()
  const suggestions = trie && normalizedQuery
    ? trie.searchPrefix(normalizedQuery, 6)
    : []

  return (
    <section className="search-box" aria-label="ค้นหาภาพยนตร์">
      <label className="search-label" htmlFor="movie-search">ค้นหาชื่อหนัง</label>
      <input
        id="movie-search"
        className="search-input"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="พิมพ์ชื่อเรื่องหรือชื่อดั้งเดิม"
        autoComplete="off"
      />

      {catalogStatus === 'loading' && (
        <StatusMessage type="loading" message="กำลังเตรียมคำแนะนำ..." compact />
      )}
      {catalogStatus === 'error' && (
        <StatusMessage type="error" onRetry={onRetry} compact />
      )}
      {catalogStatus === 'empty' && (
        <StatusMessage type="empty" message="ไม่มีหนังในแคตตาล็อกให้ค้นหา" compact />
      )}
      {catalogStatus === 'success' && normalizedQuery && suggestions.length === 0 && (
        <StatusMessage type="empty" message="ไม่พบภาพยนตร์ที่ตรงกับคำค้น" compact />
      )}
      {catalogStatus === 'success' && normalizedQuery && suggestions.length > 0 && (
        <ul className="search-suggestions" aria-label="คำแนะนำภาพยนตร์">
          {suggestions.map((movie) => (
            <li key={movie.id}>
              <button
                type="button"
                className="search-suggestion"
                onClick={() => onSelectMovie(movie.id)}
              >
                <span>{movie.title}</span>
                {movie.originalTitle && movie.originalTitle !== movie.title && (
                  <span className="search-original-title">{movie.originalTitle}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default SearchBox
