class YouTubeService {
  /**
   * Search YouTube videos using Data API v3
   * @param {string} term
   * @param {{pageToken?: string, maxResults?: number}} opts
   */
  async search(term, opts = {}) {
    const q = (term || "").trim();
    if (!q) {
      return { items: [], nextPageToken: null, prevPageToken: null, totalResults: 0 };
    }

    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      return {
        items: [],
        nextPageToken: null,
        prevPageToken: null,
        totalResults: 0,
        error: "YOUTUBE_API_KEY is missing in .env",
      };
    }

    const maxResults = Math.min(Math.max(Number(opts.maxResults) || 10, 1), 25);
    const params = new URLSearchParams({
      part: "snippet",
      type: "video",
      maxResults: String(maxResults),
      q,
      key: apiKey,
    });

    const pageToken = (opts.pageToken || "").trim();
    if (pageToken) {
      params.set("pageToken", pageToken);
    }

    const url = `https://www.googleapis.com/youtube/v3/search?${params.toString()}`;

    const res = await fetch(url, {
      headers: { Accept: "application/json", "User-Agent": "Mozilla/5.0" },
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.log("YouTube API error:", res.status, body);
      return {
        items: [],
        nextPageToken: null,
        prevPageToken: null,
        totalResults: 0,
        error: "YouTube request failed. Please try again.",
      };
    }

    const data = await res.json();
    if (!data || !Array.isArray(data.items)) {
      return { items: [], nextPageToken: null, prevPageToken: null, totalResults: 0 };
    }

    const items = data.items
      .map((item) => {
        const videoId = item?.id?.videoId;
        if (!videoId) return null;
        const snippet = item?.snippet || {};
        const thumbnails = snippet.thumbnails || {};
        const thumbnailUrl =
          (thumbnails.medium && thumbnails.medium.url) ||
          (thumbnails.high && thumbnails.high.url) ||
          (thumbnails.default && thumbnails.default.url) ||
          null;

        return {
          videoId: String(videoId),
          title: String(snippet.title || ""),
          channelTitle: snippet.channelTitle ? String(snippet.channelTitle) : "",
          publishedAt: snippet.publishedAt ? String(snippet.publishedAt) : null,
          thumbnailUrl,
        };
      })
      .filter(Boolean);

    return {
      items,
      nextPageToken: data.nextPageToken || null,
      prevPageToken: data.prevPageToken || null,
      totalResults: Number(data.pageInfo?.totalResults) || items.length,
    };
  }
}

module.exports = new YouTubeService();
