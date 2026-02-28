import React from 'react';
import { motion } from 'framer-motion';
import { Code2, Zap, Rocket, ChevronDown, Sparkles } from 'lucide-react';

export default function HeroSection() {
  const scrollToAbout = () => {
    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToServices = () => {
    document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
      {/* Animated grid background */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(rgba(0,255,255,.03) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(0,255,255,.03) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
            animation: 'gridMove 20s linear infinite',
          }}
        />
      </div>

      {/* Glowing accents */}
      <div className="absolute top-20 left-20 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
      <div
        className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: '1s' }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center pt-12 md:pt-0">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full mb-8 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-cyan-400 text-sm font-medium">Beacon Projects</span>
          </div>

          {/* Main heading */}
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Strategy + Build<br />
            <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              for Small Business Growth
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-xl text-gray-400 mb-8 max-w-3xl mx-auto leading-relaxed">
            Beacon Projects helps small businesses get clarity, streamline operations,
            and ship what matters—through strategic consulting, custom software, and rapid prototyping.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
            <a
              href="#contact"
              className="inline-flex items-center justify-center px-6 py-3 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-200 hover:bg-cyan-500/25 transition-colors backdrop-blur-sm"
            >
              Book a Discovery Call
            </a>

            <button
              onClick={scrollToServices}
              className="inline-flex items-center justify-center px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-gray-200 hover:bg-white/10 transition-colors"
            >
              Explore Services
            </button>
          </div>

          {/* Service pillars */}
          <div className="flex flex-wrap gap-6 justify-center mt-12">
            <div className="flex items-center gap-2 text-gray-300">
              <Rocket className="w-5 h-5 text-cyan-400" />
              <span>Small Business Strategic Consulting</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <Code2 className="w-5 h-5 text-purple-400" />
              <span>Custom Software Development</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <Zap className="w-5 h-5 text-pink-400" />
              <span>Rapid Prototyping</span>
            </div>
          </div>

          <p className="text-sm text-gray-500 mt-6">
            Practical plans • Fast execution • Built for real-world operations
          </p>
        </motion.div>

        {/* Scroll indicator */}
        <motion.button
          onClick={scrollToAbout}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-gray-600 hover:text-cyan-400 transition-colors"
          aria-label="Scroll to about section"
        >
          <ChevronDown className="w-8 h-8 animate-bounce" />
        </motion.button>
      </div>

      <style>{`
        @keyframes gridMove {
          0% { transform: translateY(0); }
          100% { transform: translateY(50px); }
        }
      `}</style>
    </section>
  );
}