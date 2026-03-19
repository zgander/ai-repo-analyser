import TypingText from './TypingText';
import { Menu } from 'lucide-react';

interface ReportProps {
  selectedRepo: string;
  setSidebarOpen: (val: boolean) => void;
}

const PLACEHOLDER_TEXT = `This repository exhibits a strong architectural foundation rooted in modern software engineering principles. The overall structure is highly modular, promoting code reuse and separation of concerns. Core logic is thoughtfully abstracted into manageable services, reducing the cognitive load required to understand individual components.

Upon analyzing the commit history, it's evident that the development team adheres to conventional commits, providing clear and structured historical context. The codebase leverages modern async/await patterns effectively to handle I/O operations, ensuring high throughput and minimal blocking in the main execution thread.

Security analysis reveals solid practices regarding input validation and data sanitization. Secrets and environment variables are properly decoupled from the source code, reducing the footprint of potential attack vectors. However, there are minor opportunities for optimization by implementing rate-limiting on public-facing endpoints.

The implementation of unit and integration tests is extensive, covering approximately 85% of critical path operations. Test fixtures are well-constructed, isolated, and execute swiftly, validating the repository’s robust CI/CD pipeline integration. Moving forward, incorporating more rigorous end-to-end (E2E) testing could further bolster system reliability.`;

const Report = ({ selectedRepo, setSidebarOpen }: ReportProps) => {
  return (
    <div className="flex-1 flex flex-col bg-background text-primary p-6 md:p-12 lg:p-20 relative animate-fade-in-up overflow-y-auto w-full transition-colors duration-300">
      {/* Mobile Sidebar Toggle */}
      <div className="lg:hidden flex items-center justify-between mb-8 pb-4 border-b border-border">
        <h1 className="text-xl font-bold tracking-tight text-primary uppercase flex items-center gap-2">
          Dashboard
        </h1>
        <button 
          onClick={() => setSidebarOpen(true)}
          className="p-2.5 bg-surface border border-border rounded-lg text-muted hover:text-primary hover:bg-elevated transition-all focus:ring-2 focus:ring-accent/50 outline-none"
        >
          <Menu size={22} className="stroke-[2.5px]" />
        </button>
      </div>

      <div className="max-w-5xl w-full mx-auto md:mt-8">
        <div className="mb-10 lg:mb-16">
          <p className="text-accent text-sm lg:text-base font-semibold tracking-[0.15em] uppercase mb-3 animate-fade-in-up opacity-90 drop-shadow-sm">
            {selectedRepo}
          </p>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-light tracking-[0.05em] text-primary drop-shadow-sm animate-fade-in-up animation-delay-200" style={{lineHeight: 1.1}}>
            REPORT
          </h1>
          <div className="w-20 md:w-32 h-1 md:h-1.5 bg-accent mt-6 lg:mt-8 rounded-full opacity-90 shadow-[0_0_20px_rgba(59,130,246,0.6)]"></div>
        </div>

        <div className="bg-surface/80 border border-border rounded-2xl md:rounded-3xl p-6 md:p-10 lg:p-12 shadow-xl backdrop-blur-md animate-fade-in-up transition-colors duration-300" style={{ animationDelay: '400ms' }}>
          <TypingText text={PLACEHOLDER_TEXT} speed={8} />
        </div>
      </div>
    </div>
  );
};

export default Report;
