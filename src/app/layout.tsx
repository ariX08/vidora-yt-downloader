import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Vidora — Premium YouTube Downloader",
  description:
    "Download YouTube videos in MP4 (up to 1080p) or MP3 with a beautiful, modern experience. Fast, free, and elegant.",
  keywords: ["youtube downloader", "mp4", "mp3", "video download", "vidora"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
