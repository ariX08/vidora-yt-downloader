"use client";

import { motion } from "framer-motion";
import { Play } from "lucide-react";

export default function Header() {
  return (
    <header className="w-full py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-3"
        >
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-soft">
              <Play className="w-5 h-5 text-white fill-white ml-0.5" />
            </div>
            <div className="absolute -inset-1 bg-gradient-to-br from-violet-400 to-pink-400 rounded-xl blur opacity-30 -z-10" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-violet-700 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Vidora
            </h1>
            <p className="text-[11px] text-violet-400/80 font-medium tracking-wide">
              Premium Downloader
            </p>
          </div>
        </motion.div>

        <motion.nav
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="hidden sm:flex items-center gap-6 text-sm font-medium text-slate-500"
        >
          <a
            href="#features"
            className="hover:text-violet-600 transition-colors"
          >
            Features
          </a>
          <a
            href="#how"
            className="hover:text-violet-600 transition-colors"
          >
            How it works
          </a>
        </motion.nav>
      </div>
    </header>
  );
}
