import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Basic validation
    if (!/(youtube\.com|youtu\.be)/i.test(url)) {
      return NextResponse.json(
        { error: "Please provide a valid YouTube URL" },
        { status: 400 }
      );
    }

    // Use yt-dlp to get JSON info (no download)
    const command = `yt-dlp --dump-json --no-playlist --no-warnings "${url.replace(/"/g, '\\"')}"`;

    const { stdout, stderr } = await execAsync(command, {
      timeout: 45000,
      maxBuffer: 10 * 1024 * 1024,
    });

    if (stderr && !stdout) {
      console.error("yt-dlp stderr:", stderr);
      return NextResponse.json(
        { error: "Failed to fetch video information. The video may be private or unavailable." },
        { status: 422 }
      );
    }

    const info = JSON.parse(stdout);

    // Extract useful formats
    const formats = (info.formats || [])
      .filter((f: any) => f.vcodec !== "none" || f.acodec !== "none")
      .map((f: any) => ({
        format_id: f.format_id,
        ext: f.ext,
        resolution: f.resolution || (f.height ? `${f.height}p` : null),
        height: f.height,
        width: f.width,
        fps: f.fps,
        vcodec: f.vcodec,
        acodec: f.acodec,
        filesize: f.filesize || f.filesize_approx,
        tbr: f.tbr,
        format_note: f.format_note,
      }));

    // Preferred video qualities we support
    const supportedHeights = [1080, 720, 480, 360, 240, 144];

    // Find best format for each height (prefer mp4)
    const videoOptions = supportedHeights
      .map((h) => {
        const candidates = formats.filter(
          (f: any) => f.height === h && f.vcodec !== "none"
        );
        // Prefer progressive mp4, then others
        const best =
          candidates.find((f: any) => f.ext === "mp4" && f.acodec !== "none") ||
          candidates.find((f: any) => f.ext === "mp4") ||
          candidates[0];
        return best
          ? {
              quality: `${h}p`,
              height: h,
              format_id: best.format_id,
              ext: best.ext,
              filesize: best.filesize,
              has_audio: best.acodec !== "none",
            }
          : null;
      })
      .filter(Boolean);

    // Audio options (best m4a / mp3)
    const audioFormats = formats
      .filter((f: any) => f.vcodec === "none" && f.acodec !== "none")
      .sort((a: any, b: any) => (b.tbr || 0) - (a.tbr || 0));

    const bestAudio = audioFormats[0];

    const response = {
      id: info.id,
      title: info.title,
      description: info.description?.slice(0, 300) || "",
      thumbnail:
        info.thumbnail ||
        `https://i.ytimg.com/vi/${info.id}/maxresdefault.jpg`,
      duration: info.duration,
      view_count: info.view_count,
      uploader: info.uploader,
      upload_date: info.upload_date,
      webpage_url: info.webpage_url || url,
      video_options: videoOptions,
      audio_available: !!bestAudio,
      best_audio_format_id: bestAudio?.format_id || null,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Info API error:", error?.message || error);
    const msg =
      error?.message?.includes("Private video") ||
      error?.message?.includes("unavailable")
        ? "This video is private or unavailable."
        : "Could not retrieve video info. Please check the URL and try again.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
