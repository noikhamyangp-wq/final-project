async function request(path) {
  const response = await fetch(`/api${path}`)
  let payload

  try {
    payload = await response.json()
  } catch {
    throw new Error('ได้รับข้อมูลที่ไม่ถูกต้องจากเซิร์ฟเวอร์')
  }

  if (!response.ok) {
    throw new Error(payload.error || 'ไม่สามารถโหลดข้อมูลภาพยนตร์ได้')
  }

  return payload
}

export function getPopular() {
  return request('/movies/popular')
}

export function getMovie(id) {
  return request(`/movies/${encodeURIComponent(id)}`)
}
