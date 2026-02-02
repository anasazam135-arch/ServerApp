const express = require("express");
const requireAuth = require("../middleware/requireAuth");
const moviesController = require("../controllers/moviesController");

const router = express.Router();

router.get("/movies", requireAuth, (req, res) => moviesController.showMovies(req, res));
router.post("/movies/favorites", requireAuth, (req, res) => moviesController.addFavorite(req, res));
router.post("/movies/favorites/:id/delete", requireAuth, (req, res) => moviesController.deleteFavorite(req, res));

module.exports = router;
