
import Hero from './components/Hero';
import Features from './components/Features';

function App() {
  return (
    <div className="min-h-screen relative bg-background text-primary selection:bg-accent selection:text-white font-sans flex flex-col items-center w-full">

      {/* Navigation */}
      <nav className="fixed top-0 inset-x-0 w-full z-50 animate-fade-in-up bg-background/40 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center w-full">
          <div className="text-2xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-accent drop-shadow-sm">
            RepoAnalyzer
          </div>
          <button className="text-base font-bold tracking-wide text-gray-300 hover:text-white transition-colors duration-200">
            Dashboard
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="w-full relative">
        <div className="sticky top-0 h-screen w-full flex flex-col justify-center items-center z-0 overflow-hidden">
          <Hero />
        </div>

        <div id="features" className="relative z-10 w-full bg-[#080809] rounded-t-[3rem] border-t border-border/40 shadow-[0_-20px_50px_rgba(0,0,0,0.8)] pb-12 mt-[-5vh]">
          <Features />
          
          {/* Footer */}
          <footer className="w-full py-8 text-center text-muted text-sm border-t border-border mt-12">
            <p>&copy; {new Date().getFullYear()} AI-Powered GitHub Repo Analyzer. All rights reserved.</p>
          </footer>
        </div>
      </main>
    </div>
  );
}

export default App;
