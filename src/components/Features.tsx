import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Github, BarChart3, Bot, Settings, Smile } from 'lucide-react';

const features = [
  {
    title: "Seamless GitHub Integration",
    description: "One-click repository analysis using GitHub OAuth, eliminating manual uploads and enabling instant project evaluation.",
    icon: <Github className="w-10 h-10 text-accent" />,
    color: "from-gray-800 to-gray-900",
  },
  {
    title: "Comprehensive Repository Scoring",
    description: "Generates an overall score along with granular file-level ratings to clearly highlight strengths and weaknesses.",
    icon: <BarChart3 className="w-10 h-10 text-emerald-400" />,
    color: "from-emerald-950 to-gray-900",
  },
  {
    title: "AI-Powered Code Insights",
    description: "Detects issues in code quality, structure, documentation, and dependencies, providing precise and actionable feedback.",
    icon: <Bot className="w-10 h-10 text-purple-400" />,
    color: "from-purple-950 to-gray-900",
  },
  {
    title: "Personalized Improvement Suggestions",
    description: "Recommends targeted fixes and best practices tailored to the specific repository and developer skill level.",
    icon: <Settings className="w-10 h-10 text-amber-400" />,
    color: "from-amber-950 to-gray-900",
  },
  {
    title: "Beginner-Friendly Feedback",
    description: "Presents insights in a simplified and structured format, making it accessible for early-stage developers.",
    icon: <Smile className="w-10 h-10 text-sky-400" />,
    color: "from-sky-950 to-gray-900",
  }
];

const FeatureItem = ({ feature, index }: { feature: { title: string; description: string; icon: ReactNode; color: string }, index: number }) => {
  const isEven = index % 2 === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={`flex flex-col md:flex-row items-center justify-between w-full max-w-5xl mx-auto gap-8 py-10 ${
        isEven ? 'md:flex-row' : 'md:flex-row-reverse'
      }`}
    >
      <div className="w-full md:w-1/2 flex flex-col items-start px-6 space-y-4">
        <div className="p-4 rounded-full bg-border/50 backdrop-blur-sm border border-border/80 shadow-md">
          {feature.icon}
        </div>
        <h3 className="text-3xl font-bold tracking-tight mt-4 text-primary">
          {feature.title}
        </h3>
        <p className="text-lg text-muted leading-relaxed">
          {feature.description}
        </p>
      </div>

      <div className="w-full md:w-1/2 flex items-center justify-center px-6">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className={`w-full max-w-sm aspect-video rounded-2xl bg-gradient-to-br ${feature.color} border border-border/50 shadow-xl overflow-hidden relative flex items-center justify-center`}
        >
          {/* A faux UI card representing the feature */}
          <div className="absolute inset-0 bg-black/40 mix-blend-overlay"></div>
          <div className="z-10 animate-pulse bg-white/5 w-3/4 h-2/3 rounded border border-white/10 shadow-inner flex flex-col p-4 space-y-3">
             <div className="w-1/3 h-4 bg-white/20 rounded"></div>
             <div className="w-full h-8 bg-white/10 rounded"></div>
             <div className="w-2/3 h-4 bg-white/10 rounded"></div>
             <div className="w-full h-4 bg-white/10 rounded"></div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default function Features() {
  return (
    <section className="w-full pt-16 pb-12">
      <div className="text-center mb-12 px-6">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-primary to-muted">
          Features
        </h2>
        <p className="text-muted mt-4 max-w-2xl mx-auto text-lg hover:text-primary transition-colors cursor-default">
          Everything you need to level up your code and understand your repositories better.
        </p>
      </div>

      <div className="flex flex-col space-y-4 md:space-y-8 mt-8 w-full">
        {features.map((feat, idx) => (
          <FeatureItem key={idx} feature={feat} index={idx} />
        ))}
      </div>
    </section>
  );
}
