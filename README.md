# Movie Night Picker

ใบงานต่อยอด API ด้วย React-Vite + Express · รายวิชา 801201 การออกแบบอัลกอริทึมและการพัฒนาเว็บ (กลุ่มเรียน (1302))

เว็บช่วยเลือกหนังสำหรับ "คืนนี้ดูอะไรดี" ค้นหาด้วยคำแนะนำทันที กรองตามแนว เรียงตามคะแนนที่น่าเชื่อถือ และบันทึกรายการที่อยากดูพร้อมปุ่มย้อนกลับ

- **Frontend:** React + Vite (`frontend/`)
- **Backend:** Express (`backend/`) ทำหน้าที่เป็น proxy ไปยัง TMDB API
- **API:** [TMDB (The Movie Database) API v3](https://developer.themoviedb.org/)

> This product uses the TMDB API but is not endorsed or certified by TMDB.

## ลิงก์ส่งงาน

- คลิปนำเสนอ: [ใส่ลิงก์ YouTube (unlisted)]
- GitHub: https://github.com/noikhamyangp-wq/final-project

---

## 1. ตารางส่วนร่วม

งานเดี่ยว: ผู้จัดทำรับผิดชอบทุกส่วนและนำเสนอทุกช่วงในคลิป

| ชื่อ-สกุล | รหัสนักศึกษา | ชิ้นงานที่รับผิดชอบ (ไฟล์ / component / route / DSA) | ช่วงที่นำเสนอในคลิป |
|---|---|---|---|
| พชร น้อยคำยาง (GitHub: `noikhamyangp-wq`) | 681310786 | **Express:** `backend/server.js` (route `/api/movies/popular`, `/api/search`, `/api/movies/:id`, `/api/genres`, `/api/catalog`), `backend/cache.js` · **DSA ฝั่ง Express:** `backend/mergeSort.js`, `backend/benchmark.js` · **React:** `frontend/src/App.jsx`, `frontend/src/components/*`, `frontend/src/api/movies.js` · **DSA ฝั่ง React:** `frontend/src/utils/trie.js`, `frontend/src/utils/stack.js` | ทุกช่วง (1–6) |

---

## 2. ตารางข้อแนะนำจากงานแรก → สิ่งที่แก้

**หมายเหตุ:** งานแรกคือ LaLiga Table Tracker (OpenLigaDB API) ตอนนี้ยังไม่มีคอมเมนต์จากผู้สอนในงานแรก ข้อต่อไปนี้จึงเป็น **ข้อสังเกตที่ผู้จัดทำวิเคราะห์จากโค้ดงานแรกเอง** ไม่ใช่ข้อแนะนำของผู้สอน และเนื่องจากงานนี้เปลี่ยนไปใช้ TMDB API (ขออนุมัติผู้สอนแล้ว) จึงเทียบ Before → After ในเชิงวิศวกรรมที่ไม่ขึ้นกับ API

| ข้อแนะนำจากงานแรก (ข้อสังเกตที่วิเคราะห์เอง) | สิ่งที่แก้ในงานนี้ | หลักฐาน Before / After |
|---|---|---|
| Queue และ History เป็นตัวแปรส่วนกลางบน server ทุกคนใช้ร่วมกัน และข้อมูลหายเมื่อ server รีสตาร์ต | Watchlist และ Undo อยู่ฝั่ง React (state + `localStorage`) แยกกันตามผู้ใช้ ใช้ Stack (`frontend/src/utils/stack.js`) | Before: `server.js` (งานแรก) ตัวแปร `queue`/`history` · After: `frontend/src/App.jsx`, `WatchlistPanel.jsx` · ภาพ: ภาพโค้ด queue/history ใน server.js งานแรก เทียบกับแผง "รายการที่อยากดู" พร้อมปุ่มย้อนกลับและรายการที่ยังอยู่หลังรีเฟรช (แสดงในคลิปช่วงที่ 2) |
| เรียงตารางด้วย Bubble/Selection/Insertion Sort ฝั่ง server กับข้อมูล 20 ทีมที่ API เรียงมาแล้ว ผลเหมือนกัน ผู้ใช้ไม่เห็นความต่าง DSA ไม่ส่งผลต่อ UX | ใช้ Merge Sort (stable) เรียงแคตตาล็อก 100 เรื่องหลายเกณฑ์ ใช้คะแนนถ่วงน้ำหนักเพื่อไม่ให้หนังที่โหวตเดียวคะแนน 10 ขึ้นอันดับ 1 พร้อม benchmark เทียบ Bubble Sort | After: `backend/mergeSort.js`, `backend/benchmark.js`, route `/api/catalog` · ภาพ: คะแนนดิบ (Savage Prey อันดับ 1) เทียบคะแนนถ่วงน้ำหนัก (Shawshank อันดับ 1) · ผล benchmark ในหัวข้อ 4 |
| Cache ไม่มีอายุ โหลดครั้งเดียวแล้วค้างจนรีสตาร์ต ข้อมูลเก่า | `backend/cache.js` ตั้ง TTL 5 นาที และส่งข้อมูลเก่า (`stale: true`) เมื่อ TMDB ล่ม | Before: `ensureTeamsLoaded` (งานแรก) · After: `backend/cache.js`, `fetchTmdb` ใน `server.js` · ภาพ: ภาพโค้ด ensureTeamsLoaded งานแรก เทียบกับ cache.js ที่มี CACHE_TTL_MS และ getStale (แสดงในคลิปช่วงที่ 2) |
| ข้อมูลดาวซัลโวเขียนตายตัวในโค้ด ไม่ใช่ข้อมูลจริง | ข้อมูลทั้งหมดมาจาก TMDB ผ่าน Express ไม่มีข้อมูลฝังในโค้ด | Before: ตัวแปร `topScorers` (งานแรก) · After: ทุก route ใน `backend/server.js` |
| Express เป็นแค่ทางผ่าน ไม่ validate พารามิเตอร์ และฝังค่าคงที่ (พอร์ต ปี) ในโค้ด | ซ่อน API key ใน `.env`, validate `page` (1–20), `q` (1–100 ตัวอักษร), `genre` (จำนวนเต็มบวก), ตอบ error ภาษาไทยพร้อม status code, ตัดฟิลด์ที่ไม่ใช้ก่อนส่งให้ frontend | After: `backend/server.js`, `backend/.env.example` · ภาพ: error ของ `page=999` |
| Frontend เป็นไฟล์ JS ไฟล์เดียวใช้ `onclick` และ `innerHTML` ไม่แยก component | แยกเป็น React component ตาม Component Tree ในหัวข้อ 3 | Before: `public/dashboard.js` (งานแรก) · After: `frontend/src/components/*` |
| README งานแรกเขียนวิธีรันไม่จบ | README นี้มีวิธีรัน โครงสร้าง และตารางครบ | ไฟล์นี้ |

---

## 3. สถาปัตยกรรมและ Component Tree

```
เบราว์เซอร์ (React-Vite :5173)
        │  /api/*  (Vite dev proxy)
        ▼
Express (:3000)  ──►  cache (TTL 5 นาที)  ──►  TMDB API v3
        │                                       (ซ่อน API key ไว้ที่นี่)
        └── ถ้า TMDB ล่ม → ส่ง cache เก่า { stale: true } หรือ error ภาษาไทย
```

```
App                      (state: watchlist, undo stack, catalog, sort, genre)
├── Header
├── SearchBox            (ใช้ Trie)
├── FilterBar            (แนวหนัง / เรียงตาม)
├── MovieGrid
│   └── MovieCard
├── MovieDetail          (modal: backdrop, tagline, runtime, genres, cast, ปุ่มตัวอย่าง)
├── WatchlistPanel
│   └── WatchlistItem    (ปุ่มลบ + ปุ่มย้อนกลับ ใช้ Stack)
├── StatusMessage        (loading / empty / error)
└── Footer               (เครดิต TMDB)
```

หมายเหตุ: state ของ watchlist อยู่ที่ `App` เพราะทั้ง `MovieCard` (ปุ่ม "อยากดู") และ `WatchlistPanel` ต้องใช้ข้อมูลชุดเดียวกัน

### หน้าที่ของ Express (backend)

| Route | หน้าที่ |
|---|---|
| `GET /api/movies/popular?page=` | หนังยอดนิยม (page 1–20) |
| `GET /api/search?q=&page=` | ค้นหาหนัง (q ยาว 1–100 ตัวอักษร) |
| `GET /api/movies/:id` | รายละเอียดหนัง รวม credits และ videos เป็น response เดียว ตัดเหลือ cast 10 คนและ `trailerKey` |
| `GET /api/genres` | รายชื่อแนวหนัง |
| `GET /api/catalog?sort=&genre=` | ดึง popular 5 หน้าพร้อมกัน รวมเป็นแคตตาล็อก กรองแนว และเรียงด้วย Merge Sort |

---

## 4. DSA เชิงลึก

| โครงสร้างข้อมูล / อัลกอริทึม | อยู่ฝั่ง | ไฟล์ | ผลต่อผู้ใช้ | ความซับซ้อน |
|---|---|---|---|---|
| **Trie** | React | `frontend/src/utils/trie.js` | คำแนะนำขณะพิมพ์ทันที ไม่ยิง API ทุกตัวอักษร | insert / ค้น prefix O(L) เมื่อ L คือความยาวคำค้น (เทียบการวนทุกเรื่อง O(N·L)) |
| **Merge Sort** (stable หลายเกณฑ์) | Express | `backend/mergeSort.js` | เรียงหนังตามคะแนนถ่วงน้ำหนัก → จำนวนโหวต → ชื่อ โดยลำดับของเกณฑ์รองไม่สลับ | เวลา O(n log n) พื้นที่ O(n) |
| **Stack** | React | `frontend/src/utils/stack.js` | ปุ่มย้อนกลับเมื่อลบหนังออกจากรายการโดยไม่ตั้งใจ | push / pop O(1) (LIFO) |

### คะแนนถ่วงน้ำหนัก

เรียงตามคะแนนดิบแล้วหนังที่มีโหวตเดียวคะแนน 10 จะขึ้นอันดับ 1 จึงใช้สูตร

`WR = (v / (v + m)) × R + (m / (v + m)) × C`

เมื่อ R คือคะแนนของหนัง, v คือจำนวนโหวต, m คือเกณฑ์โหวตขั้นต่ำ (500), C คือคะแนนเฉลี่ยของทั้งแคตตาล็อก หนังที่โหวตน้อยจะถูกดึงเข้าหาค่าเฉลี่ย

### ผล benchmark (Bubble Sort เทียบ Merge Sort)

รันด้วย `node backend/benchmark.js` บนเครื่องของผู้จัดทำ (Node.js v26.13.0) ตัวเลขเปลี่ยนไปในแต่ละรอบและเครื่อง ใช้ดูแนวโน้มเท่านั้น

| จำนวนรายการ | Bubble Sort (ms) | Merge Sort (ms) |
|---|---|---|
| 100 | 0.69 | 0.13 |
| 1,000 | 5.63 | 0.68 |
| 5,000 | 23.18 | 1.55 |

ที่ขนาดแคตตาล็อกจริง (100 เรื่อง) ทั้งสองวิธีเร็วจนผู้ใช้ไม่รู้สึกต่าง เหตุผลที่เลือก Merge Sort จึงมาจากความ stable ในการเรียงหลายเกณฑ์ และรองรับข้อมูลที่ใหญ่ขึ้นได้

---

## 5. วิธีรันโปรเจกต์

ต้องมี Node.js 18 ขึ้นไป และ TMDB API Key (ขอฟรีที่ themoviedb.org → Settings → API ใช้ค่า **API Key** แบบสั้น ไม่ใช่ Read Access Token)

**Backend**

```bash
cd backend
npm install
```

สร้างไฟล์ `backend/.env` (ดูตัวอย่างที่ `backend/.env.example`):

```
TMDB_API_KEY=ใส่_key_ของคุณ
PORT=3000
```

```bash
npm start
```

**Frontend** (เปิดอีกหน้าต่าง Terminal)

```bash
cd frontend
npm install
npm run dev
```

เปิด http://localhost:5173

> บน Windows PowerShell ถ้า `npm` ถูกบล็อก ให้ใช้ `npm.cmd` แทน

**ทดสอบ Merge Sort เทียบ Bubble Sort**

```bash
cd backend
node benchmark.js
```

---

## 6. สถานะที่ผู้ใช้เห็น

| สถานะ | ตัวอย่าง |
|---|---|
| loading | เปลี่ยนแนวหนัง/การเรียงแล้วรอข้อมูล |
| empty | ค้นหาชื่อที่ไม่มีในแคตตาล็อก / ยังไม่มีหนังใน watchlist |
| error | backend หรือ TMDB ใช้ไม่ได้ → ข้อความภาษาไทยพร้อมปุ่ม "ลองใหม่" ระบบไม่ล่ม |
| success | แสดงการ์ดหนัง รายละเอียด และ watchlist |

## 7. ข้อจำกัดและสิ่งที่จะทำต่อ

- Cache อยู่ในหน่วยความจำ หายเมื่อรีสตาร์ต และยังไม่ล้าง entry ที่หมดอายุออกเป็นระยะ
- ชื่อหนังและเรื่องย่อภาษาไทยบางเรื่องว่าง เพราะ TMDB ไม่มีคำแปล (ระบบแสดง "ยังไม่มีเรื่องย่อ")
- แคตตาล็อกใช้เฉพาะหนังยอดนิยม 5 หน้า (ราว 100 เรื่อง) ยังไม่ครอบคลุมทุกเรื่องใน TMDB
- สิ่งที่จะทำต่อ: ล้าง cache ที่หมดอายุ, แยกข้อความ error ระหว่าง backend ล่มกับ TMDB ล่ม, deploy
