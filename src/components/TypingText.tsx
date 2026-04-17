import { useState, useEffect } from 'react';

interface TypingTextProps {
  text: string;
  speed?: number;
  instant?: boolean;
}

const TypingText = ({ text, speed = 10, instant = false }: TypingTextProps) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(!instant);

  useEffect(() => {
    if (instant) {
      setDisplayedText(text);
      setCurrentIndex(text.length);
      setIsTyping(false);
      return;
    }

    if (currentIndex < text.length) {
      const remainingBytes = text.length - currentIndex;
      const chunkSize = remainingBytes > 100 ? 5 : remainingBytes > 20 ? 2 : 1;
      
      const timeoutId = setTimeout(() => {
        setDisplayedText(prev => prev + text.slice(currentIndex, currentIndex + chunkSize));
        setCurrentIndex(prev => prev + chunkSize);
      }, speed);
      
      return () => clearTimeout(timeoutId);
    } else {
      setIsTyping(false);
    }
  }, [currentIndex, text, speed, instant]);

  const lines = displayedText.split('\n');
  const blocks: { type: string, lines: string[], lang?: string }[] = [];
  let inCodeBlock = false;
  let currentCodeBlock: string[] = [];
  let currentLang = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith('```')) {
      if (inCodeBlock) {
        blocks.push({ type: 'code', lines: currentCodeBlock, lang: currentLang });
        currentCodeBlock = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
        currentLang = line.replace(/`/g, '').trim();
      }
    } else {
      if (inCodeBlock) {
        currentCodeBlock.push(line);
      } else {
        blocks.push({ type: 'text', lines: [line] });
      }
    }
  }

  if (inCodeBlock) {
    blocks.push({ type: 'code', lines: currentCodeBlock, lang: currentLang });
  }

  const formattedElements = blocks.map((block, bIdx) => {
    if (block.type === 'code') {
      const isLastBlock = bIdx === blocks.length - 1;
      return (
        <div key={bIdx} className="my-6 relative bg-[#1D1D20]/80 border border-border/80 rounded-xl overflow-hidden font-mono text-sm leading-relaxed shadow-lg backdrop-blur-md">
          {block.lang && (
             <div className="bg-surface/90 border-b border-border/50 px-4 py-2 text-xs text-muted font-bold uppercase tracking-widest">{block.lang}</div>
          )}
          <pre className="p-5 overflow-x-auto text-[#E2E8F0] custom-scrollbar">
            <code>
              {block.lines.join('\n')}
              {isLastBlock && isTyping && (
                <span className="inline-block w-2 sm:w-2.5 h-[1.1em] align-middle ml-1 bg-accent/80 animate-pulse border-none rounded-sm" />
              )}
            </code>
          </pre>
        </div>
      );
    } else {
      const line = block.lines[0];
      const isLastBlock = bIdx === blocks.length - 1;
      let className = "leading-relaxed text-primary text-base md:text-lg min-h-[1.5em]";
      let content = line;

      if (content.startsWith('# ')) {
        className = "text-3xl md:text-4xl font-extrabold mt-10 mb-5 text-primary tracking-tight";
        content = content.replace(/^#\s/, '');
      } else if (content.startsWith('## ')) {
        className = "text-2xl md:text-3xl font-bold mt-8 mb-4 text-primary tracking-tight border-b border-border/40 pb-2";
        content = content.replace(/^##\s/, '');
      } else if (content.startsWith('### ')) {
        className = "text-xl md:text-2xl font-semibold mt-6 mb-3 text-primary";
        content = content.replace(/^###\s/, '');
      } else if (content.startsWith('- ') || content.startsWith('* ')) {
        className += " ml-4 pl-2 relative before:content-['•'] before:absolute before:-left-3 before:text-accent font-medium";
        content = content.replace(/^[-*]\s/, '');
      } else if (/^\d+\.\s/.test(content)) {
        className += " pl-6 -indent-[1.2rem] font-medium";
      } else if (content.trim() === '') {
        className = "h-3"; 
      } else {
        className += " mb-3 opacity-90"; 
      }

      const renderInline = (str: string) => {
         const parts = str.split(/(\*\*.*?\*\*|`.*?`)/g);
         return parts.map((part, idx) => {
           if (part.startsWith('**') && part.endsWith('**')) {
             return <strong key={idx} className="font-bold text-primary">{part.slice(2, -2)}</strong>;
           } else if (part.startsWith('\`') && part.endsWith('\`')) {
             return <code key={idx} className="bg-elevated text-accent/90 border border-border/50 px-1.5 py-0.5 mx-0.5 rounded-md font-mono text-[0.9em]">{part.slice(1, -1)}</code>;
           }
           return part;
         });
      };

      return (
        <div key={bIdx} className={className}>
          {renderInline(content)}
          {isLastBlock && isTyping && (
            <span className="inline-block w-2 sm:w-2.5 h-[1.1em] align-middle ml-1 bg-accent/80 animate-pulse border-none rounded-sm" />
          )}
        </div>
      );
    }
  });

  return (
    <div className="font-sans">
      {formattedElements}
    </div>
  );
};

export default TypingText;
