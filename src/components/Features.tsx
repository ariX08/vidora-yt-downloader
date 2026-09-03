"use client";

import { motion } from "framer-motion";
import { Zap, Music2, MonitorPlay, Shield, Sparkles, Headphones } from "lucide-react";

const features = [
  {
    icon: MonitorPlay,
    title: "All resolutions",
    description: "From 144p to full 1080p — pick exactly the quality you need.",
    color: "from-violet-500 to-purple-500",
  },
  {
    icon: Music2,
    title: "Crystal MP3",
    description: "Extract high-quality audio in one click. Perfect for playlists.",
    color: "from-pink-500 to-rose-500",
  },
  {
    icon: Zap,
    title: "Lightning fast",
    description: "Optimized pipeline that gets your file ready in seconds.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Shield,
    title: "Private & secure",
    description: "No account required. We don’t store your videos.",
    color: "from-emerald-500 to-teal-500",
  },
  {
    icon: Sparkles,
    title: "Beautiful experience",
    description: "A clean, modern interface designed for everyday use.",
    color: "from-amber-500 to-orange-500",
  },
  {
    icon: Headphones,
    title: "Works everywhere",
    description: "Desktop, tablet or phone — Vidora adapts to any screen.",
    color: "from-indigo-500 to-violet-500",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-16 sm:py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">
            Everything you need
          </h2>
          <p className="mt-2 text-slate-500 max-w-md mx-auto">
            A polished tool that just works — no clutter, no ads, no nonsense.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="group relative bg-white rounded-2xl p-5 border border-violet-50 shadow-soft hover:shadow-soft-lg transition-shadow duration-300"
            >
              <div
                className={`w-11 h-11 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 shadow-md`}
              >
                <f.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-1.5">{f.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                {f.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
