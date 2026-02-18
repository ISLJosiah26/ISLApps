# Social Post Intelligence (Minimal Gotham UI)

A sleek, minimal web app that lets you upload and compare **multiple social posts** in separate tiles.

## What changed

- Removed the fixed low-vs-high structure and use a **multi-post tile layout**.
- Each post is an independent tile (no left-panel internal scroll container).
- Added a dedicated **Add New Post** button underneath the tiles.
- Updated to a cleaner, more minimal visual system.
- Typography now uses **Gotham Light** (with local fallbacks).

## Per-post inputs

- Post image upload
- Caption
- Platform
- Post type
- Likes
- Comments
- Impressions
- Engagements
- Post date
- Post time

## AI behavior

- Auto-estimates caption-based:
  - Hook quality (1–10)
  - CTA strength (1–10)
- Compares all posts and returns:
  - Top-performer snapshot
  - Conversational summary
  - Ranked comparison
  - Actionable recommendations

## Usage

1. Open `index.html` in your browser.
2. Add post tiles and fill inputs.
3. Click **Analyze All Posts**.
4. Use **Add New Post** to expand your comparison set.
5. Optionally load sample data with **Load Example Set**.
