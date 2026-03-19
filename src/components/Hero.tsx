
import type { MouseEvent } from 'react';
import { motion, useMotionValue, useSpring, useMotionTemplate } from 'framer-motion';
import { Github, ArrowRight, ChevronDown } from 'lucide-react';

export default function Hero() {
  const mouseX = useMotionValue(typeof window !== "undefined" ? window.innerWidth / 2 : 500);
  const mouseY = useMotionValue(typeof window !== "undefined" ? window.innerHeight / 2 : 500);

  const smoothX = useSpring(mouseX, { damping: 30, stiffness: 200, mass: 0.5 });
  const smoothY = useSpring(mouseY, { damping: 30, stiffness: 200, mass: 0.5 });

  const background = useMotionTemplate`radial-gradient(600px circle at ${smoothX}px ${smoothY}px, rgba(59, 130, 246, 0.15), transparent 80%)`;

  const handleMouseMove = (e: MouseEvent<HTMLElement>) => {
    const { currentTarget, clientX, clientY } = e;
    const { left, top } = currentTarget.getBoundingClientRect();

    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  };

  return (
    <section
      onMouseMove={handleMouseMove}
      className="relative w-full mx-auto px-6 pt-32 pb-24 flex flex-col items-center text-center overflow-hidden min-h-screen justify-center"
    >
      {/* Dynamic Background glowing cursor tracking */}
      <motion.div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{ background }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-4xl"
      >
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-clip-text from-primary to-muted leading-tight mb-8">
          AI-Powered GitHub <br className="hidden md:block" />
          Repository Analyzer
        </h1>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
        className="max-w-2xl"
      >
        <p className="text-lg md:text-xl text-muted leading-relaxed mb-10">
          Analyze your projects, and get step-by-step fixes — all in one place. Connect your GitHub, improve your projects, and learn as you build.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
        className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full"
      >
        <button className="group relative flex items-center justify-center gap-2 px-8 py-3.5 bg-primary text-background font-semibold rounded-full hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] sm:w-auto w-full">
          <Github className="w-5 h-5" />
          <span>Connect GitHub</span>
        </button>

        <button
          onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
          className="group flex items-center justify-center gap-2 px-8 py-3.5 bg-transparent text-primary font-medium rounded-full border border-border hover:bg-border/50 hover:border-muted/30 transition-all duration-300 sm:w-auto w-full"
        >
          <span>Learn More</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <ChevronDown className="w-8 h-8 text-muted/70 animate-bounce" />
      </motion.div>
    </section>
  );
}
