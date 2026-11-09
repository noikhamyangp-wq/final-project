require('dotenv').config();

const cors = require('cors');
const express = require('express');
const cache = require('./cache');
const mergeSort = require('./mergeSort');
const { performance } = require('node:perf_hooks');

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
    popularity: movie.popularity,
    releaseDate: movie.release_date,
    originalTitle: movie.original_title,
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

function handleRequestError(res, error) {
  if (!(error instanceof TmdbError)) {
    console.error('เกิดข้อผิดพลาดระหว่างประมวลผลคำขอ:', error);
    return sendError(res, 500, 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์');
  }

  return sendError(res, error.statusCode, error.message);
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

async function getCachedData(key, fetchData, mapData = (value) => value) {
  const cached = cache.get(key);
  if (cached !== null) {
    return { data: cached, stale: false };
  }

  try {
    const data = mapData(await fetchData());
    cache.set(key, data);
    return { data, stale: false };
  } catch (error) {
    if (error instanceof TmdbError) {
      const stale = cache.getStale(key);
      if (stale !== null) {
        return { data: stale, stale: true };
      }
    }

    throw error;
  }
}

async function respondWithCache(res, key, fetchData, mapData = (value) => value) {
  try {
    const result = await getCachedData(key, fetchData, mapData);
    return res.json(result.stale ? { ...result.data, stale: true } : result.data);
  } catch (error) {
    return handleRequestError(res, error);
  }
}

function compareDescending(left, right) {
  const leftValue = Number.isFinite(left) ? left : 0;
  const rightValue = Number.isFinite(right) ? right : 0;
  return rightValue - leftValue;
}

function compareTitles(left, right) {
  const leftTitle = left.title || left.originalTitle || '';
  const rightTitle = right.title || right.originalTitle || '';
  return leftTitle.localeCompare(rightTitle);
}

function compareRating(left, right) {
  return compareDescending(left.rating, right.rating)
    || compareDescending(left.voteCount, right.voteCount)
    || compareTitles(left, right);
}

function compareWeightedRating(left, right) {
  return compareDescending(left.weightedRating, right.weightedRating)
    || compareDescending(left.voteCount, right.voteCount)
    || compareTitles(left, right);
}

function getMovieYear(movie) {
  const year = Number.parseInt(movie.releaseDate?.slice(0, 4), 10);
  return Number.isFinite(year) ? year : 0;
}

function getCatalogComparator(sort) {
  if (sort === 'rating') {
    return compareWeightedRating;
  }
  if (sort === 'year') {
    return (left, right) => compareDescending(getMovieYear(left), getMovieYear(right))
      || compareRating(left, right);
  }
  if (sort === 'title') {
    return (left, right) => compareTitles(left, right) || compareRating(left, right);
  }
  return (left, right) => compareDescending(left.popularity, right.popularity)
    || compareRating(left, right);
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

app.get('/api/catalog', async (req, res) => {
  const sort = req.query.sort === undefined || req.query.sort === ''
    ? 'popularity'
    : req.query.sort;
  const supportedSorts = new Set(['rating', 'year', 'popularity', 'title']);
  if (typeof sort !== 'string' || !supportedSorts.has(sort)) {
    return sendError(res, 400, 'sort ต้องเป็น rating, year, popularity หรือ title');
  }

  let genreId = null;
  if (req.query.genre !== undefined) {
    if (typeof req.query.genre !== 'string' || !/^\d+$/.test(req.query.genre)) {
      return sendError(res, 400, 'genre ต้องเป็นจำนวนเต็มบวก');
    }
    genreId = Number(req.query.genre);
    if (!Number.isSafeInteger(genreId) || genreId < 1) {
      return sendError(res, 400, 'genre ต้องเป็นจำนวนเต็มบวก');
    }
  }

  try {
    const pages = await Promise.all(
      [1, 2, 3, 4, 5].map((page) => getCachedData(
        `popular:${page}`,
        () => fetchTmdb('/movie/popular', { page }),
        mapMoviePage,
      )),
    );
    const uniqueMovies = new Map();
    for (const { data } of pages) {
      for (const movie of data.results) {
        if (!uniqueMovies.has(movie.id)) {
          uniqueMovies.set(movie.id, movie);
        }
      }
    }

    const catalogMovies = Array.from(uniqueMovies.values());
    const averageRating = catalogMovies.length === 0
      ? 0
      : catalogMovies.reduce(
        (sum, movie) => sum + (Number.isFinite(movie.rating) ? movie.rating : 0),
        0,
      ) / catalogMovies.length;
    const moviesWithWeightedRating = catalogMovies.map((movie) => {
      const rating = Number.isFinite(movie.rating) ? movie.rating : 0;
      const voteCount = Number.isFinite(movie.voteCount) ? Math.max(0, movie.voteCount) : 0;
      const priorWeight = 500;
      // คะแนนดิบไม่สะท้อนความน่าเชื่อถือของจำนวนโหวต จึงถ่วงคะแนนเข้าหาค่าเฉลี่ยของแคตตาล็อก
      const weightedRating = (
        (voteCount / (voteCount + priorWeight)) * rating
        + (priorWeight / (voteCount + priorWeight)) * averageRating
      );
      return { ...movie, weightedRating: Number(weightedRating.toFixed(3)) };
    });
    const filteredMovies = moviesWithWeightedRating.filter(
      (movie) => genreId === null || movie.genreIds.includes(genreId),
    );
    const start = performance.now();
    const results = mergeSort(filteredMovies, getCatalogComparator(sort));
    const ms = Number((performance.now() - start).toFixed(2));

    const response = {
      total: results.length,
      ms,
      algorithm: 'Merge Sort',
      results,
    };
    if (pages.some((page) => page.stale)) {
      response.stale = true;
    }
    return res.json(response);
  } catch (error) {
    return handleRequestError(res, error);
  }
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
