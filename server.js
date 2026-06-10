const fs = require("fs");
const http = require("http");
const path = require("path");

const root = __dirname;
const port = Number(process.env.PORT || 4173);
const cacheTtl = 1000 * 60 * 60 * 6;

const publicFiles = new Set([
  "/index.html",
  "/gallery.html",
  "/album.html",
  "/styles.css",
  "/script.js",
  "/gallery-data.js",
  "/album.js",
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml"
]);

const mimeTypes = {
  ".css": "text/css",
  ".html": "text/html",
  ".ico": "image/x-icon",
  ".js": "text/javascript",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".txt": "text/plain",
  ".xml": "application/xml",
};

let reviewCache = null;

const loadEnv = () => {
  const envPath = path.join(root, ".env");
  if (!fs.existsSync(envPath)) return {};

  return Object.fromEntries(
    fs
      .readFileSync(envPath, "utf8")
      .split(/\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"))
      .map((line) => {
        const separator = line.indexOf("=");
        return [line.slice(0, separator), line.slice(separator + 1)];
      })
  );
};

const env = { ...loadEnv(), ...process.env };

const sendJson = (response, status, data) => {
  response.writeHead(status, {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  });
  response.end(JSON.stringify(data));
};

const getReviewYear = (review) => {
  if (!review.publishTime) return "";

  const year = new Date(review.publishTime).getFullYear();
  return Number.isNaN(year) ? "" : String(year);
};

const normalizeReview = (review) => ({
  author: review.authorAttribution?.displayName || "Google reviewer",
  rating: review.rating,
  text: review.text?.text || review.originalText?.text || "",
  time: getReviewYear(review) || review.relativePublishTimeDescription || "",
  url: review.googleMapsUri || "",
});

const fetchReviews = async () => {
  if (reviewCache && Date.now() - reviewCache.fetchedAt < cacheTtl) {
    return reviewCache.data;
  }

  if (!env.GOOGLE_MAPS_API_KEY || !env.GOOGLE_PLACE_ID) {
    throw new Error("Google reviews are not configured yet.");
  }

  const response = await fetch(`https://places.googleapis.com/v1/places/${env.GOOGLE_PLACE_ID}`, {
    headers: {
      "X-Goog-Api-Key": env.GOOGLE_MAPS_API_KEY,
      "X-Goog-FieldMask":
        "id,displayName,formattedAddress,rating,userRatingCount,googleMapsUri,reviews",
    },
  });

  const place = await response.json();

  if (!response.ok) {
    throw new Error(place.error?.message || "Google Places request failed.");
  }

  const data = {
    source: "Google",
    name: place.displayName?.text || "Munchkins Daycare",
    address: place.formattedAddress || "",
    rating: place.rating || null,
    reviewCount: place.userRatingCount || 0,
    url: place.googleMapsUri || "https://share.google/vHhCoQUPc4rWcp6dv",
    reviews: (place.reviews || []).map(normalizeReview).filter((review) => review.text),
    fetchedAt: new Date().toISOString(),
  };

  reviewCache = { fetchedAt: Date.now(), data };
  return data;
};

const isAllowedAsset = (pathname) =>
  pathname.startsWith("/assets/") && !pathname.split("/").some((part) => part.startsWith("."));

const serveStatic = (request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
  const publicPath = pathname === "/" ? "/index.html" : pathname;

  if (!publicFiles.has(publicPath) && !isAllowedAsset(publicPath)) {
    response.writeHead(404);
    response.end("Not found");
    return;
  }

  const resolvedPath = path.resolve(path.join(root, publicPath.slice(1)));

  if (!resolvedPath.startsWith(root)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  fs.readFile(resolvedPath, (error, content) => {
    if (error) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }

    response.writeHead(200, {
      "Content-Type": mimeTypes[path.extname(resolvedPath)] || "application/octet-stream",
    });

    response.end(content);
  });
};

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url, "http://localhost");

  if (url.pathname === "/api/reviews") {
    try {
      sendJson(response, 200, await fetchReviews());
    } catch (error) {
      sendJson(response, 500, { error: error.message });
    }
    return;
  }

  serveStatic(request, response);
});

server.listen(port, () => {
  console.log(`Munchkins Daycare website running at http://localhost:${port}`);
});
