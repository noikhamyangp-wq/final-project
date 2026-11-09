function StatusMessage({ type, message, onRetry, compact = false }) {
  const className = `status-message${compact ? ' status-message-compact' : ''}`

  if (type === 'loading') {
    return (
      <div className={className} role="status" aria-live="polite">
        <span className="loading-spinner" aria-hidden="true" />
        <p>{message || 'กำลังโหลดภาพยนตร์...'}</p>
      </div>
    )
  }

  if (type === 'empty') {
    return (
      <div className={className} role="status">
        <p>{message || 'ยังไม่มีภาพยนตร์ให้แสดงในตอนนี้'}</p>
      </div>
    )
  }

  if (type === 'error') {
    return (
      <div className={`${className} status-message-error`} role="alert">
        <p>{message || 'โหลดข้อมูลไม่สำเร็จ กรุณาตรวจสอบการเชื่อมต่อแล้วลองอีกครั้ง'}</p>
        {onRetry && (
          <button className="retry-button" type="button" onClick={onRetry}>
            ลองใหม่
          </button>
        )}
      </div>
    )
  }

  if (type === 'success') {
    return (
      <div className={className} role="status">
        <p>{message}</p>
      </div>
    )
  }

  return null
}

export default StatusMessage
