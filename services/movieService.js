class MovieService {
  /**
   * Search movies using OMDb API (API key required)
   * @param {string} term
   */
  async search(term) {
    const q = (term || "").trim();
    if (!q) return [];

    const apiKey = process.env.OMDB_API_KEY;
    if (!apiKey) {
      console.log("OMDB_API_KEY is missing in .env");
      return [];
    }

    const url = `https://www.omdbapi.com/?apikey=${apiKey}&s=${encodeURIComponent(q)}&type=movie&page=1`;

    // Debug (optional)
    console.log("URL =", url);

    const res = await fetch(url, {
      headers: { "Accept": "application/json", "User-Agent": "Mozilla/5.0" },
    });

    const data = await res.json();

    // OMDb returns { Response:"False", Error:"Movie not found!" } when no results
    if (!data || data.Response === "False" || !Array.isArray(data.Search)) {
      console.log("OMDb says:", data?.Error || "No results");
      return [];
    }

    // Normalize results to your app format
    return data.Search.map((m) => ({
      movieId: String(m.imdbID),
      title: String(m.Title),
      year: Number(m.Year) || null,
      posterUrl: m.Poster && m.Poster !== "N/A" ? m.Poster : null,
      genre: "",
    }));
  }
}

module.exports = new MovieService();
