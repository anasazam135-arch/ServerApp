const movieService = require("../services/movieService");
const favoriteMovieRepo = require("../repositories/favoriteMovieRepository");

class MoviesController {
  async showMovies(req, res) {
    const user = req.session.user;
    const term = (req.query.term || "").trim();
    const sort = (req.query.sort || "createdAt").trim();
    const dir = (req.query.dir || "desc").trim();

    let results = [];
    let error = null;
    console.log("TERM =", term);
    try {
      if (term) {
        results = await movieService.search(term);
      }
    } catch (e) {
      error = "Search failed. Please try again.";
    }

    const favorites = await favoriteMovieRepo.getAllByUserId(user.userId, { sort, dir });

    res.render("movies", {
      user: req.session.user,
      term,
      results,
      favorites,
      sort,
      dir,
      error,
    });
  }

  async addFavorite(req, res) {
    const userId = req.session.user.userId;
    const { movieId, title, year, posterUrl } = req.body;

    if (!movieId || !title) {
      return res.redirect("/movies");
    }

    try {
      await favoriteMovieRepo.add(userId, {
        movieId: String(movieId),
        title: String(title),
        year: year ? Number(year) : null,
        posterUrl: posterUrl ? String(posterUrl) : null,
      });
    } catch (e) {
      // ignore duplicate favorites (unique constraint)
    }

    const back = req.get("referer") || "/movies";
    res.redirect(back);
  }

  async deleteFavorite(req, res) {
    const userId = req.session.user.userId;
    const favoriteId = Number(req.params.id);
    if (!Number.isFinite(favoriteId)) {
      return res.redirect("/movies");
    }

    try {
      await favoriteMovieRepo.deleteById(userId, favoriteId);
    } catch (e) {
      // ignore
    }

    const back = req.get("referer") || "/movies";
    res.redirect(back);
  }
}

module.exports = new MoviesController();
