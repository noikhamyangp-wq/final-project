require('dotenv').config();

const cors = require('cors');
const express = require('express');
const cache = require('./cache');

const app = express();
const PORT = Number.parseInt(process.env.PORT, 10) || 3000;
const TMDB_API_URL = 'https://api.themoviedb.org/3';
const ALLOWED_ORIGIN = 'http://localhost:5173';

// จำกัด origin ให้ตรงกับ dev server ของ frontend เพื่อไม่เปิด proxy ให้เว็บอื่น
app.use(cors({ origin: ALLOWED_ORIGIN }));

class TmdbError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = 'TmdbError';
    this.statusCode = statusCode;
  }
}

function parsePage(value) {
  if (value === undefined) {
    return 1;
  }

  if (!/^\d+$/.test(value)) {
    return null;
  }

  const page = Number(value);
  return Number.isInteger(page) && page >= 1 && page <= 20 ? page : null;
}

function mapMovie(movie) {
  // แปลงชื่อและเลือกเฉพาะฟิลด์ที่ frontend ใช้ ไม่ส่งข้อมูล TMDB ส่วนเกิน
  return {
    id: movie.id,
    title: movie.title,
    posterPath: movie.poster_path,
    rating: movie.vote_average,
    voteCount: movie.vote_count,
    releaseDate: movie.release_date,
    genreIds: movie.genre_ids || (movie.genres || []).map((genre) => genre.id),
    overview: movie.overview,
  };
}

function mapMoviePage(payload) {
  return {
    page: payload.page,
    totalPages: payload.total_pages,
    totalResults: payload.total_results,
    results: (payload.results || []).map(mapMovie),
  };
}

function sendError(res, status, message) {
  return res.status(status).json({ error: message });
}

async function fetchTmdb(path, params = {}) {
  if (!process.env.TMDB_API_KEY || process.env.TMDB_API_KEY === 'ใส่_TMDB_API_KEY_ที่นี่') {
    throw new TmdbError('ยังไม่ได้ตั้งค่า TMDB_API_KEY ในไฟล์ .env', 500);
  }

  const url = new URL(`${TMDB_API_URL}${path}`);
  url.searchParams.set('api_key', process.env.TMDB_API_KEY);
  url.searchParams.set('language', 'th-TH');

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, String(value));
  }

  let response;
  try {
    response = await fetch(url, { signal: AbortSignal.timeout(10000) });
  } catch (error) {
    console.error('เชื่อมต่อ TMDB ไม่สำเร็จ:', error.message);
    throw new TmdbError('ไม่สามารถเชื่อมต่อบริการ TMDB ได้', 503);
  }

  if (!response.ok) {
    console.error(`TMDB ตอบกลับสถานะ HTTP ${response.status}`);
    const statusCode = response.status === 429
      ? 429
      : response.status === 404
        ? 404
        : response.status >= 500
          ? 503
          : 502;
    throw new TmdbError(
      response.status === 429
        ? 'บริการ TMDB มีคำขอมากเกินไป กรุณาลองใหม่ภายหลัง'
        : response.status === 404
          ? 'ไม่พบข้อมูลที่ต้องการ'
          : 'บริการ TMDB ตอบกลับข้อผิดพลาด',
      statusCode,
    );
  }

  try {
    return await response.json();
  } catch (error) {
    console.error('อ่านข้อมูลจาก TMDB ไม่สำเร็จ:', error.message);
    throw new TmdbError('ได้รับข้อมูลที่ไม่ถูกต้องจากบริการ TMDB', 502);
  }
}

async function respondWithCache(res, key, fetchData, mapData = (value) => value) {
  const cached = cache.get(key);
  if (cached !== null) {
    return res.json(cached);
  }

  try {
    const data = mapData(await fetchData());
    cache.set(key, data);
    return res.json(data);
  } catch (error) {
    if (!(error instanceof TmdbError)) {
      console.error('เกิดข้อผิดพลาดระหว่างประมวลผลคำขอ:', error);
      return sendError(res, 500, 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์');
    }

    // ใช้ข้อมูลเดิมเมื่อ TMDB ขัดข้อง เพื่อให้ผู้ใช้ยังเห็นผลลัพธ์ได้ชั่วคราว
    const stale = cache.getStale(key);
    if (stale !== null) {
      return res.json({ ...stale, stale: true });
    }

    return sendError(res, error.statusCode, error.message);
  }
}

app.get('/api/movies/popular', (req, res) => {
  const page = parsePage(req.query.page);
  if (page === null) {
    return sendError(res, 400, 'page ต้องเป็นจำนวนเต็มตั้งแต่ 1 ถึง 20');
  }

  const key = `popular:${page}`;
  return respondWithCache(
    res,
    key,
    () => fetchTmdb('/movie/popular', { page }),
    mapMoviePage,
  );
});

app.get('/api/search', (req, res) => {
  const rawQuery = typeof req.query.q === 'string' ? req.query.q : '';
  const query = rawQuery.trim();
  if (rawQuery.length < 1 || rawQuery.length > 100 || query.length === 0) {
    return sendError(res, 400, 'q ต้องมีความยาวตั้งแต่ 1 ถึง 100 ตัวอักษร');
  }

  const page = parsePage(req.query.page);
  if (page === null) {
    return sendError(res, 400, 'page ต้องเป็นจำนวนเต็มตั้งแต่ 1 ถึง 20');
  }

  const key = `search:${query}:${page}`;
  return respondWithCache(
    res,
    key,
    () => fetchTmdb('/search/movie', { query, page }),
    mapMoviePage,
  );
});

app.get('/api/movies/:id', (req, res) => {
  const movieId = Number(req.params.id);
  if (!/^\d+$/.test(req.params.id) || !Number.isSafeInteger(movieId) || movieId < 1) {
    return sendError(res, 400, 'id หนังต้องเป็นจำนวนเต็มบวก');
  }

  const key = `movie:${req.params.id}`;
  return respondWithCache(
    res,
    key,
    () => fetchTmdb(`/movie/${req.params.id}`, {
      append_to_response: 'credits,videos',
      include_video_language: 'th,en,null',
    }),
    (movie) => {
      // ตัดข้อมูล TMDB ที่ frontend ไม่ใช้ เพื่อลด payload และไม่เปิดเผยข้อมูลดิบเกินจำเป็น
      const trailers = (movie.videos?.results || []).filter(
        (video) => video.site === 'YouTube' && video.type === 'Trailer',
      );
      const trailer = trailers.find((video) => video.iso_639_1 === 'th')
        || trailers.find((video) => video.iso_639_1 === 'en')
        || trailers[0];

      return {
        id: movie.id,
        title: movie.title,
        posterPath: movie.poster_path,
        backdropPath: movie.backdrop_path,
        rating: movie.vote_average,
        voteCount: movie.vote_count,
        releaseDate: movie.release_date,
        overview: movie.overview,
        tagline: movie.tagline,
        runtime: movie.runtime,
        genres: (movie.genres || []).map(({ id, name }) => ({ id, name })),
        cast: (movie.credits?.cast || []).slice(0, 10).map((person) => ({
          id: person.id,
          name: person.name,
          character: person.character,
          profilePath: person.profile_path,
        })),
        trailerKey: trailer ? trailer.key : null,
      };
    },
  );
});

app.get('/api/genres', (req, res) => {
  return respondWithCache(
    res,
    'genres',
    () => fetchTmdb('/genre/movie/list'),
    (payload) => ({
      genres: (payload.genres || []).map(({ id, name }) => ({ id, name })),
    }),
  );
});

app.listen(PORT, () => {
  console.log(`Movie Night Picker backend ทำงานที่ http://localhost:${PORT}`);
});
