const youtubeService = require("../services/youtubeService");
const favoriteVideoRepo = require("../repositories/favoriteVideoRepository");

class VideosController {
  async showVideos(req, res) {
    const user = req.session.user;
    const term = (req.query.term || "").trim();
    const pageToken = (req.query.pageToken || "").trim();
    const sort = (req.query.sort || "createdAt").trim();
    const dir = (req.query.dir || "desc").trim();

    let results = [];
    let nextPageToken = null;
    let prevPageToken = null;
    let error = null;

    if (term) {
      try {
        const data = await youtubeService.search(term, { pageToken });
        results = data.items || [];
        nextPageToken = data.nextPageToken || null;
        prevPageToken = data.prevPageToken || null;
        if (data.error) {
          error = data.error;
        }
      } catch (e) {
        console.log("YouTube search failed:", e);
        error = "Search failed. Please try again.";
      }
    }

    let favorites = [];
    try {
      favorites = await favoriteVideoRepo.getAllByUserId(user.id, { sort, dir });
    } catch (e) {
      favorites = [];
    }

    res.render("videos", {
      user: req.session.user,
      term,
      results,
      favorites,
      sort,
      dir,
      error,
      nextPageToken,
      prevPageToken,
    });
  }

  async addFavorite(req, res) {
    const userId = req.session.user.id;
    const { videoId, title, channelTitle, publishedAt, thumbnailUrl } = req.body;

    if (!videoId || !title) {
      return res.redirect("/videos");
    }

    try {
      await favoriteVideoRepo.add(userId, {
        videoId: String(videoId),
        title: String(title),
        channelTitle: channelTitle ? String(channelTitle) : null,
        publishedAt: publishedAt ? String(publishedAt) : null,
        thumbnailUrl: thumbnailUrl ? String(thumbnailUrl) : null,
      });
    } catch (e) {
      // ignore duplicate favorites (unique constraint)
    }

    const back = req.get("referer") || "/videos";
    res.redirect(back);
  }

  async deleteFavorite(req, res) {
    const userId = req.session.user.id;
    const favoriteId = Number(req.params.id);
    if (!Number.isFinite(favoriteId)) {
      return res.redirect("/videos");
    }

    try {
      await favoriteVideoRepo.deleteById(userId, favoriteId);
    } catch (e) {
      // ignore
    }

    const back = req.get("referer") || "/videos";
    res.redirect(back);
  }
}

module.exports = new VideosController();
