const db = require("../config/db");

class FavoriteMovieRepository {
  /**
   * @param {number} userId
   * @param {{sort?: string, dir?: 'asc'|'desc'}} opts
   */
  getAllByUserId(userId, opts = {}) {
    const sort = (opts.sort || "createdAt").toLowerCase();
    const dir = (opts.dir || "desc").toLowerCase() === "asc" ? "ASC" : "DESC";

    // Whitelist sortable columns to prevent SQL injection
    const sortColumn = (() => {
      switch (sort) {
        case "title":
          return "title";
        case "year":
          return "year";
        case "createdat":
        case "created":
        default:
          return "createdAt";
      }
    })();

    const sql = `SELECT id, movieId, title, year, posterUrl, createdAt FROM FavoriteMovies WHERE userId = ? ORDER BY ${sortColumn} ${dir}`;

    return new Promise((resolve, reject) => {
      db.all(sql, [userId], (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      });
    });
  }

  /**
   * @param {number} userId
   * @param {{movieId: string, title: string, year?: number|null, posterUrl?: string|null}} movie
   */
  add(userId, movie) {
    const sql = `INSERT INTO FavoriteMovies (userId, movieId, title, year, posterUrl, createdAt) VALUES (?, ?, ?, ?, ?, ?)`;
    const params = [
      userId,
      String(movie.movieId),
      String(movie.title),
      movie.year ?? null,
      movie.posterUrl ?? null,
      new Date().toISOString(),
    ];

    return new Promise((resolve, reject) => {
      db.run(sql, params, function (err) {
        if (err) return reject(err);
        resolve({ id: this.lastID, ...movie });
      });
    });
  }

  /**
   * Delete by internal favorite id (scoped to user)
   * @param {number} userId
   * @param {number} favoriteId
   */
  deleteById(userId, favoriteId) {
    const sql = `DELETE FROM FavoriteMovies WHERE id = ? AND userId = ?`;
    return new Promise((resolve, reject) => {
      db.run(sql, [favoriteId, userId], function (err) {
        if (err) return reject(err);
        resolve(this.changes || 0);
      });
    });
  }
}

module.exports = new FavoriteMovieRepository();
