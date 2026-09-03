"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Link2, Loader2, Search } from "lucide-react";
import { cn, isValidYoutubeUrl } from "@/lib/utils";

interface UrlInputProps {
  onSubmit: (url: string) => void;
  loading: boolean;
}

export default function UrlInput({ onSubmit, loading }: UrlInputProps) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const trimmed = url.trim();
    if (!trimmed) {
      setError("Please paste a YouTube link");
      return;
    }
    if (!isValidYoutubeUrl(trimmed)) {
      setError("That doesn’t look like a valid YouTube URL");
      return;
    }
    onSubmit(trimmed);
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.1 }}
      className="w-full"
    >
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 rounded-2xl opacity-20 group-hover:opacity-40 blur transition duration-300" />
        <div className="relative flex items-center bg-white rounded-2xl shadow-soft border border-violet-100/80 overflow-hidden">
          <div className="pl-4 pr-2 text-violet-400">
            <Link2 className="w-5 h-5" />
          </div>
          <input
            type="url"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (error) setError("");
            }}
            placeholder="Paste YouTube link here…"
            className="flex-1 py-4 pr-2 text-[15px] text-slate-800 placeholder:text-slate-400 outline-none bg-transparent"
            disabled={loading}
            autoComplete="off"
            spellCheck={false}
          />
          <button
            type="submit"
            disabled={loading}
            className={cn(
              "m-1.5 px-5 py-2.5 rounded-xl font-semibold text-sm text-white",
              "bg-gradient-to-r from-violet-600 to-purple-600",
              "hover:from-violet-500 hover:to-purple-500",
              "active:scale-[0.98] transition-all duration-200",
              "shadow-md shadow-violet-500/20",
              "disabled:opacity-60 disabled:cursor-not-allowed",
              "flex items-center gap-2"
            )}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Fetching…</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Get Video</span>
              </>
            )}
          </button>
        </div>
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2.5 text-sm text-pink-600 font-medium px-1"
        >
          {error}
        </motion.p>
      )}
    </motion.form>
  );
}
