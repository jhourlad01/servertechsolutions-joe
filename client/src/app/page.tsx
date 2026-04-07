import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 px-4">
      <div className="text-center animate-fade-in-up">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-neon-purple shadow-[0_0_30px_-5px_#a855f7] mb-8 text-white text-4xl font-black">
          S
        </div>
        <h1 className="text-6xl font-black tracking-tighter text-white mb-4">ServerTech</h1>
        <p className="text-xl text-slate-400 mb-12 max-w-md mx-auto font-medium">
          Simple and intelligent issue tracking for your operational stack.
        </p>

        <Link 
          href="/login" 
          className="btn-primary inline-block px-12 py-5 text-2xl neon-glow no-underline"
        >
          Go to Issues
        </Link>
      </div>
    </div>
  );
}
