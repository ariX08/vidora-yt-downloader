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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const url = body?.url;

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    if (!/(youtube\.com|youtu\.be)/i.test(url)) {
      return NextResponse.json(
        { error: "Please provide a valid YouTube URL" },
        { status: 400 }
      );
    }

    const videoId = extractVideoId(url);
    if (!videoId) {
      return NextResponse.json(
        { error: "Could not extract video ID from URL" },
        { status: 400 }
      );
    }

    const yt = await Innertube.create();
    const info = await yt.getInfo(videoId);

    const basic = info.basic_info;
    if (!basic) {
      return NextResponse.json(
        { error: "Could not load video information" },
        { status: 422 }
      );
    }

    const streamingData = info.streaming_data;
    const formats = [
      ...(streamingData?.formats || []),
      ...(streamingData?.adaptive_formats || []),
    ];

    const supportedHeights = [1080, 720, 480, 360, 240, 144];

    const videoOptions = supportedHeights
      .map((h) => {
        const progressive = formats.find(
          (f: any) =>
            f.quality_label === `${h}p` &&
            f.has_video &&
            f.has_audio &&
            (f.mime_type?.includes("mp4") || f.mime_type?.includes("video"))
        );
        const videoOnly = formats.find(
          (f: any) =>
            (f.height === h || f.quality_label === `${h}p`) &&
            f.has_video &&
            !f.has_audio
        );
        const chosen = progressive || videoOnly;
        if (!chosen) return null;
        return {
          quality: `${h}p`,
          height: h,
          itag: chosen.itag,
          mime_type: chosen.mime_type,
          has_audio: !!chosen.has_audio,
          content_length: chosen.content_length,
        };
      })
      .filter(Boolean);

    const audioFormats = formats
      .filter((f: any) => f.has_audio && !f.has_video)
      .sort(
        (a: any, b: any) =>
          (b.bitrate || b.average_bitrate || 0) -
          (a.bitrate || a.average_bitrate || 0)
      );

    const bestAudio = audioFormats[0];

    const thumbnails = basic.thumbnail || [];
    const bestThumb =
      thumbnails[thumbnails.length - 1]?.url ||
      `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

    const response = {
      id: videoId,
      title: basic.title || "Untitled",
      description: (basic.short_description || "").slice(0, 300),
      thumbnail: bestThumb,
      duration: basic.duration || 0,
      view_count: basic.view_count || 0,
      uploader: basic.author || "Unknown",
      webpage_url: `https://www.youtube.com/watch?v=${videoId}`,
      video_options: videoOptions,
      audio_available: !!bestAudio,
      best_audio_itag: bestAudio?.itag || null,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Info API error:", error?.message || error);

    const msg = String(error?.message || "");
    if (/private|login|members only|unavailable|not available/i.test(msg)) {
      return NextResponse.json(
        { error: "This video is private, restricted, or unavailable." },
        { status: 422 }
      );
    }

    return NextResponse.json(
      {
        error:
          "Could not retrieve video info. The video may be restricted or YouTube temporarily blocked the request.",
      },
      { status: 500 }
    );
  }
}
