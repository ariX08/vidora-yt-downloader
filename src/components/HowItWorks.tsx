"use client";

import { motion } from "framer-motion";
import { Link2, ListMusic, Download } from "lucide-react";

const steps = [
  {
    icon: Link2,
    title: "Paste the link",
    description: "Copy any public YouTube video URL and drop it in the box.",
  },
  {
    icon: ListMusic,
    title: "Choose format",
    description: "Select MP4 quality or switch to high-quality MP3 audio.",
  },
  {
    icon: Download,
    title: "Download",
    description: "Hit the button and your file starts downloading instantly.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how" className="py-12 sm:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">
            How it works
          </h2>
          <p className="mt-2 text-slate-500">Three simple steps</p>
        </motion.div>

        <div className="grid sm:grid-cols-3 gap-6 relative">
          {/* connector line on desktop */}
          <div className="hidden sm:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-violet-200 via-purple-200 to-pink-200" />

          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative flex flex-col items-center text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-white border-2 border-violet-100 shadow-soft flex items-center justify-center mb-4 z-10">
                <step.icon className="w-6 h-6 text-violet-600" />
              </div>
              <span className="text-xs font-bold text-violet-400 mb-1">
                STEP {i + 1}
              </span>
              <h3 className="font-semibold text-slate-800 mb-1">{step.title}</h3>
              <p className="text-sm text-slate-500 max-w-[220px]">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
