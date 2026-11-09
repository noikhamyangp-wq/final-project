function Header({ watchlistCount }) {
  return (
    <header className="site-header">
      <a className="brand" href="#" aria-label="Movie Night Picker หน้าแรก">
        <span className="brand-mark" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
            <path d="M5 4.5h14A1.5 1.5 0 0 1 20.5 6v12a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 18V6A1.5 1.5 0 0 1 5 4.5Z" stroke="currentColor" strokeWidth="1.7" />
            <path d="M3.8 8h16.4M8 4.8v3M16 4.8v3M9 12l6 3.5L9 19v-7Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          </svg>
        </span>
        <span className="brand-copy">
          <span className="brand-title">MOVIE NIGHT</span>
          <span className="brand-subtitle">คืนดูหนังของคุณ</span>
        </span>
      </a>

      <div className="header-watchlist" aria-label={`รายการที่อยากดู ${watchlistCount} เรื่อง`}>
        <svg viewBox="0 0 24 24" width="17" height="17" fill="none" aria-hidden="true">
          <path d="M6 4.75h12a1 1 0 0 1 1 1v14l-7-4-7 4v-14a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        </svg>
        <span>รายการของฉัน</span>
        <span className="watchlist-count">{watchlistCount}</span>
      </div>
    </header>
  )
}

export default Header
