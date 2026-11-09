class TrieNode {
  constructor() {
    this.children = new Map()
    this.movies = []
    this.movieIds = new Set()
  }
}

class Trie {
  constructor(movies = []) {
    this.root = new TrieNode()
    movies.forEach((movie) => {
      this.insert(movie.title, movie)
      if (movie.originalTitle && movie.originalTitle !== movie.title) {
        this.insert(movie.originalTitle, movie)
      }
    })
  }

  insert(text, movie) {
    const key = String(text || '').toLowerCase()
    let node = this.root
    this.addMovie(node, movie)

    for (const character of key) {
      if (!node.children.has(character)) {
        node.children.set(character, new TrieNode())
      }
      node = node.children.get(character)
      this.addMovie(node, movie)
    }
  }

  addMovie(node, movie) {
    if (node.movieIds.has(movie.id)) return
    node.movieIds.add(movie.id)
    node.movies.push(movie)
  }

  searchPrefix(prefix, limit = 5) {
    const key = String(prefix || '').toLowerCase()
    let node = this.root

    for (const character of key) {
      node = node.children.get(character)
      if (!node) return []
    }

    return node.movies.slice(0, Math.max(0, limit))
  }
}

// Trie ช่วยแนะนำหนังตาม prefix ได้ทันทีโดยไม่เรียก API ทุกครั้งที่พิมพ์
// insert และการค้นหา prefix ใช้เวลา O(L) เมื่อ L คือความยาวคำค้น; คืนผลลัพธ์เพิ่ม O(limit)
export default Trie
