function StatusMessage({ type, onRetry }) {
  if (type === 'loading') {
    return (
      <div className="status-message" role="status" aria-live="polite">
        <span className="loading-spinner" aria-hidden="true" />
        <p>กำลังโหลดภาพยนตร์...</p>
      </div>
    )
  }

  if (type === 'empty') {
    return (
      <div className="status-message" role="status">
        <p>ยังไม่มีภาพยนตร์ให้แสดงในตอนนี้</p>
      </div>
    )
  }

  if (type === 'error') {
    return (
      <div className="status-message status-message-error" role="alert">
        <p>โหลดข้อมูลไม่สำเร็จ กรุณาตรวจสอบการเชื่อมต่อแล้วลองอีกครั้ง</p>
        {onRetry && (
          <button className="retry-button" type="button" onClick={onRetry}>
            ลองใหม่
          </button>
        )}
      </div>
    )
  }

  return null
}

export default StatusMessage
