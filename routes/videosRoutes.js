const express = require("express");
const requireAuth = require("../middleware/requireAuth");
const videosController = require("../controllers/videosController");

const router = express.Router();

router.get(["/videos", "/movies"], requireAuth, (req, res) => videosController.showVideos(req, res));
router.post(["/videos/favorites", "/movies/favorites"], requireAuth, (req, res) =>
  videosController.addFavorite(req, res)
);
router.post(["/videos/favorites/:id/delete", "/movies/favorites/:id/delete"], requireAuth, (req, res) =>
  videosController.deleteFavorite(req, res)
);

module.exports = router;
