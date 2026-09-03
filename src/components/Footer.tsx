export default function Footer() {
  return (
    <footer className="border-t border-violet-100/80 bg-white/60 backdrop-blur-sm mt-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
              <span className="text-white text-xs font-bold">V</span>
            </div>
            <span className="font-semibold text-slate-700">Vidora</span>
          </div>
          <p className="text-xs text-slate-400 text-center max-w-md">
            Vidora is provided for personal use only. Please respect copyright
            laws and YouTube’s Terms of Service. Only download content you own
            or have permission to download.
          </p>
        </div>
        <p className="mt-6 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} Vidora. Built with care.
        </p>
      </div>
    </footer>
  );
}
