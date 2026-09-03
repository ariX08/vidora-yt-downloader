# Vidora — Premium YouTube Downloader

A modern, colorful, full-stack YouTube video & audio downloader.

**Features**
- MP4 downloads: 1080p · 720p · 480p · 360p · 240p · 144p
- High-quality audio extraction
- Beautiful light / premium UI (violet · purple · pink · blue)
- Works on **Vercel** (pure JS — no yt-dlp)
- Supabase-ready (auth + download history)
- Next.js 14 · Tailwind · Framer Motion

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. (Optional) Configure Supabase
cp .env.example .env.local
# Fill in your NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY

# 3. Run the SQL schema in your Supabase project
# Open supabase/schema.sql and execute it in the SQL Editor

# 4. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Requirements

- Node.js 18+
- Works on **Vercel** and other serverless hosts (uses pure JS `youtubei.js` — no yt-dlp)

### Deploy on Vercel

1. Push this repo to GitHub
2. Import in [vercel.com](https://vercel.com) → Deploy
3. No extra env vars required for basic download (optional: Supabase keys)

> Note: Downloads redirect to YouTube’s CDN. High-quality progressive MP4 is used when available.
> True MP3 conversion / merged 1080p (video+audio separate streams) needs a self-hosted server with ffmpeg + yt-dlp.

## Project structure

```
vidora/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── info/route.ts      # Extract video metadata
│   │   │   └── download/route.ts  # Redirect to stream URL
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   └── lib/
├── supabase/
│   └── schema.sql
└── ...
```

## Design notes

Vidora uses a bright, airy SaaS aesthetic:
- Soft gradient backgrounds
- White cards with subtle violet borders & shadows
- Purple / violet / pink accent gradients
- Rounded-2xl / rounded-3xl components
- Smooth Framer Motion entrances
- Generous whitespace

## Legal disclaimer

This tool is for personal use only. Always respect copyright and YouTube’s Terms of Service. Only download content you own or have explicit permission to download.

## License

MIT
