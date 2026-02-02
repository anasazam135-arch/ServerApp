const db = require("../config/db");

class FavoriteVideoRepository {
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
        case "channel":
        case "channeltitle":
          return "channelTitle";
        case "published":
        case "publishedat":
          return "publishedAt";
        case "createdat":
        case "created":
        default:
          return "createdAt";
      }
    })();

    const sql = `SELECT id, videoId, title, channelTitle, thumbnailUrl, publishedAt, createdAt FROM FavoriteVideos WHERE userId = ? ORDER BY ${sortColumn} ${dir}`;

    return new Promise((resolve, reject) => {
      db.all(sql, [userId], (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      });
    });
  }

  /**
   * @param {number} userId
   * @param {{videoId: string, title: string, channelTitle?: string|null, thumbnailUrl?: string|null, publishedAt?: string|null}} video
   */
  add(userId, video) {
    const sql = `INSERT INTO FavoriteVideos (userId, videoId, title, channelTitle, thumbnailUrl, publishedAt, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const params = [
      userId,
      String(video.videoId),
      String(video.title),
      video.channelTitle ?? null,
      video.thumbnailUrl ?? null,
      video.publishedAt ?? null,
      new Date().toISOString(),
    ];

    return new Promise((resolve, reject) => {
      db.run(sql, params, function (err) {
        if (err) return reject(err);
        resolve({ id: this.lastID, ...video });
      });
    });
  }

  /**
   * Delete by internal favorite id (scoped to user)
   * @param {number} userId
   * @param {number} favoriteId
   */
  deleteById(userId, favoriteId) {
    const sql = `DELETE FROM FavoriteVideos WHERE id = ? AND userId = ?`;
    return new Promise((resolve, reject) => {
      db.run(sql, [favoriteId, userId], function (err) {
        if (err) return reject(err);
        resolve(this.changes || 0);
      });
    });
  }
}

module.exports = new FavoriteVideoRepository();
