import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import { Readable } from "stream";

export const runtime = "nodejs";
export const maxDuration = 300; // 5 minutes for large videos

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const url = searchParams.get("url");
  const format = searchParams.get("format"); // mp4 | mp3
  const quality = searchParams.get("quality"); // 1080p, 720p, ..., mp3
  const title = searchParams.get("title") || "vidora-download";

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
    // Build yt-dlp arguments
    const args: string[] = [
      "--no-playlist",
      "--no-warnings",
      "--newline",
      "-o",
      "-", // output to stdout
    ];

    if (format === "mp3") {
      args.push("-x", "--audio-format", "mp3", "--audio-quality", "0");
    } else {
      // Video: select by height preference + best audio
      const height = quality?.replace("p", "") || "720";
      // Prefer mp4 with both video+audio, otherwise merge
      args.push(
        "-f",
        `bestvideo[height<=${height}][ext=mp4]+bestaudio[ext=m4a]/bestvideo[height<=${height}]+bestaudio/best[height<=${height}]/best`,
        "--merge-output-format",
        "mp4"
      );
    }

    args.push(url);

    const safeTitle = title
      .replace(/[^\w\s\-_.]/g, "")
      .replace(/\s+/g, "_")
      .slice(0, 80);

    const filename =
      format === "mp3"
        ? `${safeTitle}.mp3`
        : `${safeTitle}_${quality || "video"}.mp4`;

    const ytDlp = spawn("yt-dlp", args, {
      stdio: ["ignore", "pipe", "pipe"],
    });

    // Collect stderr for errors
    let stderrData = "";
    ytDlp.stderr.on("data", (chunk) => {
      stderrData += chunk.toString();
    });

    // Create a Readable stream from stdout
    const stream = Readable.from(ytDlp.stdout);

    // Handle process errors
    ytDlp.on("error", (err) => {
      console.error("yt-dlp spawn error:", err);
    });

    ytDlp.on("close", (code) => {
      if (code !== 0) {
        console.error("yt-dlp exited with code", code, stderrData);
      }
    });

    // Return streaming response
    const headers = new Headers();
    headers.set(
      "Content-Disposition",
      `attachment; filename="${filename}"`
    );
    headers.set(
      "Content-Type",
      format === "mp3" ? "audio/mpeg" : "video/mp4"
    );
    headers.set("Cache-Control", "no-cache");

    // @ts-ignore - NextResponse accepts Node streams in Node runtime
    return new NextResponse(stream as any, {
      status: 200,
      headers,
    });
  } catch (error: any) {
    console.error("Download error:", error);
    return NextResponse.json(
      { error: "Download failed. Please try again." },
      { status: 500 }
    );
  }
}
