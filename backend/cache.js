const CACHE_TTL_MS = 5 * 60 * 1000;
const cache = new Map();

function get(key) {
  const entry = cache.get(key);

  // เก็บ entry ที่หมดอายุไว้ เพื่อให้เสิร์ฟเป็น stale ได้เมื่อ TMDB ขัดข้อง
  if (!entry || entry.expiresAt <= Date.now()) {
    return null;
  }

  return entry.value;
}

function getStale(key) {
  const entry = cache.get(key);
  return entry ? entry.value : null;
}

function set(key, value) {
  // TTL ใช้กำหนดความสดของข้อมูล ส่วน getStale ยังอ่าน entry เก่าได้
  cache.set(key, {
    value,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

module.exports = { get, getStale, set };
