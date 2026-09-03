import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";

export const runtime = "nodejs";
export const maxDuration = 60;

function runYtDlp(args: string[]): Promise<{ stdout: string; stderr: string; code: number }> {
  return new Promise((resolve, reject) => {
    // Prefer yt-dlp binary, fall back to python module
    const candidates = ["yt-dlp", "python3 -m yt_dlp", "python -m yt_dlp"];

    const tryNext = (index: number) => {
      if (index >= candidates.length) {
        reject(new Error(
          "yt-dlp is not installed or not in PATH. " +
          "Install it with: pip install -U yt-dlp  (or brew install yt-dlp)"
        ));
        return;
      }

      const cmd = candidates[index];
      const parts = cmd.split(" ");
      const bin = parts[0];
      const binArgs = [...parts.slice(1), ...args];

      const child = spawn(bin, binArgs, {
        stdio: ["ignore", "pipe", "pipe"],
        env: { ...process.env, PYTHONUNBUFFERED: "1" },
      });

      let stdout = "";
      let stderr = "";

      child.stdout.on("data", (chunk) => {
        stdout += chunk.toString();
      });
      child.stderr.on("data", (chunk) => {
        stderr += chunk.toString();
      });

      child.on("error", (err: NodeJS.ErrnoException) => {
        // ENOENT = binary not found → try next candidate
        if (err.code === "ENOENT") {
          tryNext(index + 1);
        } else {
          reject(err);
        }
      });

      child.on("close", (code) => {
        if (code === 0 || stdout.trim()) {
          resolve({ stdout, stderr, code: code ?? 1 });
        } else if (index < candidates.length - 1 && /No such file|not found|ENOENT/i.test(stderr + (code === 127 ? "not found" : ""))) {
          tryNext(index + 1);
        } else {
          resolve({ stdout, stderr, code: code ?? 1 });
        }
      });

      // Timeout after 45s
      setTimeout(() => {
        child.kill("SIGKILL");
        reject(new Error("yt-dlp timed out after 45 seconds"));
      }, 45000);
    };

    tryNext(0);
  });
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

    const args = [
      "--dump-json",
      "--no-playlist",
      "--no-warnings",
      "--no-check-certificates",
      url,
    ];

    const { stdout, stderr, code } = await runYtDlp(args);

    if (code !== 0 || !stdout.trim()) {
      console.error("yt-dlp failed:", { code, stderr: stderr.slice(0, 500) });

      // Surface useful messages
      const errText = (stderr || "").toLowerCase();
      let message = "Could not retrieve video info. Please check the URL and try again.";

      if (/private video|login required|sign in/i.test(errText)) {
        message = "This video is private or requires login.";
      } else if (/unavailable|not available|removed/i.test(errText)) {
        message = "This video is unavailable or has been removed.";
      } else if (/not installed|not in path|no module named|enoent/i.test(errText + message)) {
        message =
          "yt-dlp is not installed. Run: pip install -U yt-dlp  (or brew install yt-dlp) then restart the server.";
      } else if (/http error 429|too many requests|rate.?limit/i.test(errText)) {
        message = "YouTube rate-limited the request. Wait a minute and try again.";
      } else if (/timed out/i.test(errText)) {
        message = "Request timed out. Try again or check your network.";
      } else if (stderr.trim()) {
        // Show a short clean snippet of the real error
        const clean = stderr
          .split("\n")
          .filter((l) => l.trim() && !l.includes("WARNING"))
          .slice(0, 3)
          .join(" ")
          .slice(0, 200);
        if (clean) message = clean;
      }

      return NextResponse.json({ error: message, detail: stderr.slice(0, 300) }, { status: 422 });
    }

    let info: any;
    try {
      info = JSON.parse(stdout);
    } catch {
      return NextResponse.json(
        { error: "Failed to parse video information from yt-dlp." },
        { status: 500 }
      );
    }

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

    const supportedHeights = [1080, 720, 480, 360, 240, 144];

    const videoOptions = supportedHeights
      .map((h) => {
        const candidates = formats.filter(
          (f: any) => f.height === h && f.vcodec !== "none"
        );
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

    const msg = error?.message || "";
    if (/not installed|not in path|no module named/i.test(msg)) {
      return NextResponse.json(
        {
          error:
            "yt-dlp is not installed. Run: pip install -U yt-dlp  (or brew install yt-dlp) then restart the server.",
        },
        { status: 500 }
      );
    }
    if (/timed out/i.test(msg)) {
      return NextResponse.json(
        { error: "Request timed out. Please try again." },
        { status: 504 }
      );
    }
    if (/private|unavailable/i.test(msg)) {
      return NextResponse.json(
        { error: "This video is private or unavailable." },
        { status: 422 }
      );
    }

    return NextResponse.json(
      { error: "Could not retrieve video info. Please check the URL and try again." },
      { status: 500 }
    );
  }
}
