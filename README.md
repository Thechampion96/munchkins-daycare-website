# Munchkins Daycare Website

Open `index.html` directly for a static preview.

For real-time Google reviews, run the website through the local server so the Google API key stays private:

```bash
node server.js
```

Then open:

```text
http://localhost:4173
```

Create a `.env` file with:

```text
GOOGLE_MAPS_API_KEY=...
GOOGLE_PLACE_ID=...
```

The reviews are fetched from Google Places through `/api/reviews` and cached for a few hours.

## Deploying

Use a Node-capable host such as Render.

Start command:

```bash
npm start
```

Environment variables:

```text
GOOGLE_MAPS_API_KEY=...
GOOGLE_PLACE_ID=...
```

Do not upload or commit `.env`. Add those values in the hosting provider's environment variable settings.
