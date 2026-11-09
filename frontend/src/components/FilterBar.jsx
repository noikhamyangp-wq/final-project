import { useEffect, useState } from 'react'
import { getGenres } from '../api/movies.js'
import StatusMessage from './StatusMessage.jsx'

function FilterBar({ sort, genre, loading, onSortChange, onGenreChange }) {
  const [genres, setGenres] = useState([])
  const [genresStatus, setGenresStatus] = useState('loading')
  const [genreAttempt, setGenreAttempt] = useState(0)

  useEffect(() => {
    let active = true

    getGenres()
      .then((result) => {
        if (!active) return
        setGenres(result.genres)
        setGenresStatus(result.genres.length === 0 ? 'empty' : 'success')
      })
      .catch((error) => {
        console.error('โหลดประเภทภาพยนตร์ไม่สำเร็จ:', error)
        if (active) setGenresStatus('error')
      })

    return () => {
      active = false
    }
  }, [genreAttempt])

  return (
    <section className="filter-bar" aria-label="ตัวกรองภาพยนตร์">
      <div className="filter-controls">
        <label>
          <span>แนวหนัง</span>
          <select
            value={genre}
            onChange={(event) => onGenreChange(event.target.value)}
            disabled={genresStatus !== 'success'}
          >
            <option value="">ทุกแนว</option>
            {genres.map((item) => (
              <option value={item.id} key={item.id}>{item.name}</option>
            ))}
          </select>
        </label>
        <label>
          <span>เรียงตาม</span>
          <select value={sort} onChange={(event) => onSortChange(event.target.value)}>
            <option value="popularity">ความนิยม</option>
            <option value="rating">คะแนน</option>
            <option value="year">ปี</option>
            <option value="title">ชื่อ</option>
          </select>
        </label>
      </div>

      {genresStatus === 'loading' && (
        <StatusMessage type="loading" message="กำลังโหลดแนวหนัง..." compact />
      )}
      {genresStatus === 'empty' && (
        <StatusMessage type="empty" message="ไม่มีข้อมูลแนวหนัง" compact />
      )}
      {genresStatus === 'error' && (
        <StatusMessage
          type="error"
          message="โหลดแนวหนังไม่สำเร็จ"
          onRetry={() => setGenreAttempt((current) => current + 1)}
          compact
        />
      )}
      {genresStatus === 'success' && loading && (
        <StatusMessage
          type="loading"
          message="กำลังอัปเดตแคตตาล็อก..."
          compact
        />
      )}
    </section>
  )
}

export default FilterBar
