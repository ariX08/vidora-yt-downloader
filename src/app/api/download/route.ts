import { NextRequest, NextResponse } from "next/server";
import { Innertube } from "youtubei.js";

export const runtime = "nodejs";
export const maxDuration = 30;

function extractVideoId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) {
      return u.pathname.slice(1).split("/")[0] || null;
    }
    if (u.hostname.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v) return v;
      const parts = u.pathname.split("/");
      const shortsIdx = parts.indexOf("shorts");
      if (shortsIdx >= 0 && parts[shortsIdx + 1]) return parts[shortsIdx + 1];
      const embedIdx = parts.indexOf("embed");
      if (embedIdx >= 0 && parts[embedIdx + 1]) return parts[embedIdx + 1];
    }
  } catch {
    // ignore
  }
  const match = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})(?:[&?]|$)/);
  return match ? match[1] : null;
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const url = searchParams.get("url");
  const format = searchParams.get("format"); // mp4 | mp3
  const quality = searchParams.get("quality"); // 1080p, 720p, ..., mp3

  if (!url || !format) {
    return NextResponse.json(
      { error: "Missing url or format" },
      { status: 400 }
    );
  }

  if (!/(youtube\.com|youtu\.be)/i.test(url)) {
    return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 });
  }

  try {
    const videoId = extractVideoId(url);
    if (!videoId) {
      return NextResponse.json(
        { error: "Could not extract video ID" },
        { status: 400 }
      );
    }

    const yt = await Innertube.create();
    const info = await yt.getInfo(videoId);

    let streamUrl: string | undefined;

    if (format === "mp3") {
      const audioFormat = info.chooseFormat({
        type: "audio",
        quality: "best",
      });
      streamUrl = audioFormat?.deciphered_url || audioFormat?.url;
    } else {
      const height = parseInt(quality?.replace("p", "") || "720", 10);

      try {
        const progressive = info.chooseFormat({
          type: "video+audio",
          quality: quality || "720p",
        });
        if (progressive && (progressive.height || 0) >= Math.min(height, 360)) {
          streamUrl = progressive.deciphered_url || progressive.url;
        }
      } catch {
        // fall through
      }

      if (!streamUrl) {
        try {
          const fmt = info.chooseFormat({
            type: "video+audio",
            quality: "best",
          });
          streamUrl = fmt?.deciphered_url || fmt?.url;
        } catch {
          const fmt = info.chooseFormat({
            type: "video",
            quality: quality || "best",
          });
          streamUrl = fmt?.deciphered_url || fmt?.url;
        }
      }
    }

    if (!streamUrl) {
      return NextResponse.json(
        {
          error:
            "No suitable stream found for this quality. Try a lower resolution.",
        },
        { status: 422 }
      );
    }

    // Redirect browser directly to YouTube CDN — works on Vercel
    return NextResponse.redirect(streamUrl, 302);
  } catch (error: any) {
    console.error("Download error:", error?.message || error);
    return NextResponse.json(
      {
        error:
          "Download failed. The video may be restricted or the stream is unavailable.",
      },
      { status: 500 }
    );
  }
}
