"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Download,
  Music,
  Video,
  Clock,
  Eye,
  User,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import Image from "next/image";
import { cn, formatDuration, formatViews } from "@/lib/utils";

interface VideoOption {
  quality: string;
  height: number;
  format_id: string;
  ext: string;
  filesize?: number;
  has_audio: boolean;
}

interface VideoInfo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: number;
  view_count: number;
  uploader: string;
  webpage_url: string;
  video_options: VideoOption[];
  audio_available: boolean;
}

interface VideoResultProps {
  info: VideoInfo;
  onDownload: (format: "mp4" | "mp3", quality: string) => void;
  downloading: boolean;
  downloadProgress?: string;
}

const QUALITY_ORDER = ["1080p", "720p", "480p", "360p", "240p", "144p"];

export default function VideoResult({
  info,
  onDownload,
  downloading,
  downloadProgress,
}: VideoResultProps) {
  const [mode, setMode] = useState<"video" | "audio">("video");
  const [selectedQuality, setSelectedQuality] = useState<string>(
    info.video_options[0]?.quality || "720p"
  );

  const availableQualities = QUALITY_ORDER.filter((q) =>
    info.video_options.some((o) => o.quality === q)
  );

  const handleDownload = () => {
    if (mode === "audio") {
      onDownload("mp3", "mp3");
    } else {
      onDownload("mp4", selectedQuality);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="w-full"
    >
      <div className="bg-white rounded-3xl shadow-soft-lg border border-violet-50 overflow-hidden">
        {/* Thumbnail + meta */}
        <div className="flex flex-col sm:flex-row gap-5 p-5 sm:p-6">
          <div className="relative w-full sm:w-64 shrink-0 aspect-video rounded-2xl overflow-hidden bg-violet-50 shadow-soft">
            <Image
              src={info.thumbnail}
              alt={info.title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 256px"
              unoptimized
            />
            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs font-medium px-2 py-0.5 rounded-md backdrop-blur-sm">
              {formatDuration(info.duration)}
            </div>
          </div>

          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <h2 className="text-lg sm:text-xl font-semibold text-slate-800 leading-snug line-clamp-2">
              {info.title}
            </h2>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-slate-500">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-violet-400" />
                {info.uploader || "Unknown"}
              </span>
              <span className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-violet-400" />
                {formatViews(info.view_count)} views
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-violet-400" />
                {formatDuration(info.duration)}
              </span>
            </div>
          </div>
        </div>

        {/* Mode toggle */}
        <div className="px-5 sm:px-6 pb-2">
          <div className="inline-flex p-1 bg-violet-50 rounded-xl">
            <button
              onClick={() => setMode("video")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all",
                mode === "video"
                  ? "bg-white text-violet-700 shadow-sm"
                  : "text-slate-500 hover:text-violet-600"
              )}
            >
              <Video className="w-4 h-4" />
              Video (MP4)
            </button>
            <button
              onClick={() => setMode("audio")}
              disabled={!info.audio_available}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all",
                mode === "audio"
                  ? "bg-white text-violet-700 shadow-sm"
                  : "text-slate-500 hover:text-violet-600",
                !info.audio_available && "opacity-40 cursor-not-allowed"
              )}
            >
              <Music className="w-4 h-4" />
              Audio (MP3)
            </button>
          </div>
        </div>

        {/* Quality grid (video only) */}
        {mode === "video" && (
          <div className="px-5 sm:px-6 py-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Select quality
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {QUALITY_ORDER.map((q) => {
                const available = availableQualities.includes(q);
                const selected = selectedQuality === q;
                return (
                  <button
                    key={q}
                    disabled={!available}
                    onClick={() => setSelectedQuality(q)}
                    className={cn(
                      "relative py-3 rounded-xl text-sm font-semibold transition-all duration-200",
                      "border",
                      available
                        ? selected
                          ? "bg-gradient-to-br from-violet-500 to-purple-600 text-white border-transparent shadow-md shadow-violet-500/25 scale-[1.02]"
                          : "bg-white text-slate-700 border-violet-100 hover:border-violet-300 hover:bg-violet-50"
                        : "bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed"
                    )}
                  >
                    {q}
                    {selected && available && (
                      <CheckCircle2 className="absolute -top-1.5 -right-1.5 w-4 h-4 text-white bg-violet-600 rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
            {availableQualities.length === 0 && (
              <p className="mt-3 text-sm text-amber-600">
                No standard resolutions detected. You can still try the best available.
              </p>
            )}
          </div>
        )}

        {mode === "audio" && (
          <div className="px-5 sm:px-6 py-4">
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-pink-50 to-violet-50 border border-pink-100/60">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-violet-500 flex items-center justify-center">
                <Music className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-slate-800">High quality MP3</p>
                <p className="text-sm text-slate-500">
                  Best available audio · Converted to MP3
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Download button */}
        <div className="px-5 sm:px-6 pb-6 pt-2">
          <button
            onClick={handleDownload}
            disabled={downloading || (mode === "video" && availableQualities.length === 0)}
            className={cn(
              "w-full py-3.5 rounded-2xl font-semibold text-white text-[15px]",
              "bg-gradient-to-r from-violet-600 via-purple-600 to-pink-500",
              "hover:from-violet-500 hover:via-purple-500 hover:to-pink-400",
              "active:scale-[0.99] transition-all duration-200",
              "shadow-lg shadow-violet-500/25",
              "disabled:opacity-60 disabled:cursor-not-allowed",
              "flex items-center justify-center gap-2.5"
            )}
          >
            {downloading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{downloadProgress || "Preparing download…"}</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                <span>
                  Download {mode === "audio" ? "MP3" : `MP4 · ${selectedQuality}`}
                </span>
              </>
            )}
          </button>
          <p className="mt-3 text-center text-xs text-slate-400">
            By downloading you confirm you have the right to access this content.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
