# Vidora — Premium YouTube Downloader

A modern, colorful, full-stack YouTube video & audio downloader.

**Features**
- MP4 downloads: 1080p · 720p · 480p · 360p · 240p · 144p
- High-quality MP3 audio extraction
- Beautiful light / premium UI (violet · purple · pink · blue)
- yt-dlp powered backend
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
- `yt-dlp` available in PATH (the server uses it for metadata + downloading)

Install yt-dlp:
```bash
# macOS
brew install yt-dlp

# Linux / pip
pip install -U yt-dlp

# or follow https://github.com/yt-dlp/yt-dlp#installation
```

## Project structure

```
vidora/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── info/route.ts      # Extract video metadata
│   │   │   └── download/route.ts  # Stream download
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/                # UI components
│   └── lib/
│       ├── supabase.ts
│       └── utils.ts
├── supabase/
│   └── schema.sql                 # Database schema + RLS
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
