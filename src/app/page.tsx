"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import UrlInput from "@/components/UrlInput";
import VideoResult from "@/components/VideoResult";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import Footer from "@/components/Footer";

interface VideoInfo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: number;
  view_count: number;
  uploader: string;
  webpage_url: string;
  video_options: {
    quality: string;
    height: number;
    format_id: string;
    ext: string;
    filesize?: number;
    has_audio: boolean;
  }[];
  audio_available: boolean;
}

export default function HomePage() {
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [info, setInfo] = useState<VideoInfo | null>(null);
  const [error, setError] = useState("");
  const [downloadProgress, setDownloadProgress] = useState("");

  const handleFetch = async (url: string) => {
    setLoading(true);
    setError("");
    setInfo(null);

    try {
      const res = await fetch("/api/info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch video info");
      }

      setInfo(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (format: "mp4" | "mp3", quality: string) => {
    if (!info) return;

    setDownloading(true);
    setDownloadProgress("Starting download…");

    try {
      const params = new URLSearchParams({
        url: info.webpage_url,
        format,
        quality,
        title: info.title,
      });

      const downloadUrl = `/api/download?${params.toString()}`;

      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = "";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setDownloadProgress("Download started!");
      setTimeout(() => {
        setDownloading(false);
        setDownloadProgress("");
      }, 2500);
    } catch (err) {
      setError("Download failed. Please try again.");
      setDownloading(false);
      setDownloadProgress("");
    }
  };

  return (
    <div className="min-h-screen bg-hero-gradient">
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-violet-200/40 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-32 w-80 h-80 bg-pink-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-72 h-72 bg-blue-200/25 rounded-full blur-3xl" />
      </div>

      <Header />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-4 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 sm:mb-10"
        >
          <h2 className="text-3xl sm:text-4xl md:text-[2.75rem] font-bold tracking-tight text-slate-800 text-balance leading-tight">
            Download YouTube videos
            <span className="block mt-1 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
              beautifully & fast
            </span>
          </h2>
          <p className="mt-4 text-slate-500 text-base sm:text-lg max-w-lg mx-auto">
            Paste a link, choose MP4 quality or MP3, and download in one click.
          </p>
        </motion.div>

        <UrlInput onSubmit={handleFetch} loading={loading} />

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 p-4 rounded-2xl bg-pink-50 border border-pink-100 text-pink-700 text-sm font-medium text-center"
          >
            {error}
          </motion.div>
        )}

        {info && (
          <div className="mt-8">
            <VideoResult
              info={info}
              onDownload={handleDownload}
              downloading={downloading}
              downloadProgress={downloadProgress}
            />
          </div>
        )}

        {!info && !loading && !error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-10 text-center text-sm text-slate-400"
          >
            Supports public YouTube videos · MP4 up to 1080p · High-quality MP3
          </motion.p>
        )}
      </main>

      <HowItWorks />
      <Features />
      <Footer />
    </div>
  );
}
