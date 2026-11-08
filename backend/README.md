# Movie Night Picker backend

Express proxy สำหรับ TMDB API v3 ใช้ CommonJS และ Node.js 18 ขึ้นไป

## ตั้งค่าและเริ่มต้น

1. ติดตั้ง Node.js 18 หรือใหม่กว่า
2. กรอก API key ของ TMDB ใน `backend/.env` ที่ `TMDB_API_KEY`
3. กำหนด `PORT` ในไฟล์เดียวกัน (ค่าเริ่มต้นคือ `3000`)
4. จากโฟลเดอร์ `backend` รัน `npm install` แล้ว `npm start`

ไฟล์ `.env` ถูกละเว้นโดย Git; ใช้ `.env.example` เป็นตัวอย่างชื่อตัวแปร

## API

- `GET /api/movies/popular?page=1` (`page` ต้องอยู่ระหว่าง 1 ถึง 20)
- `GET /api/search?q=คำค้น&page=1` (`q` ยาว 1 ถึง 100 ตัวอักษร และ `page` อยู่ระหว่าง 1 ถึง 20)
- `GET /api/movies/:id` (รวม `credits` และ `videos` จาก TMDB)
- `GET /api/genres`

ผลลัพธ์หนังใช้ชื่อฟิลด์ `id`, `title`, `posterPath`, `rating`, `voteCount`,
`releaseDate`, `genreIds` และ `overview` เท่านั้น ยกเว้น `credits` และ `videos`
ที่ส่งมาพร้อมข้อมูลหน้าแสดงรายละเอียดหนัง

ข้อมูลถูกเก็บในหน่วยความจำเป็นเวลา 5 นาที หาก TMDB ใช้งานไม่ได้ ระบบจะส่งข้อมูล
ที่หมดอายุแล้วกลับมาพร้อม `stale: true` เมื่อมีข้อมูลเดิมอยู่
