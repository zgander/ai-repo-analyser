import { useState, useEffect } from 'react';

interface TypingTextProps {
  text: string;
  speed?: number;
}

const TypingText = ({ text, speed = 10 }: TypingTextProps) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    if (currentIndex < text.length) {
      // Chunking text prevents re-render lag for long strings
      const remainingBytes = text.length - currentIndex;
      // Faster for huge blocks, moderate for ends
      const chunkSize = remainingBytes > 100 ? 4 : remainingBytes > 20 ? 2 : 1;
      
      const timeoutId = setTimeout(() => {
        setDisplayedText(prev => prev + text.slice(currentIndex, currentIndex + chunkSize));
        setCurrentIndex(prev => prev + chunkSize);
      }, speed);
      
      return () => clearTimeout(timeoutId);
    } else {
      setIsTyping(false);
    }
  }, [currentIndex, text, speed]);

  const paragraphs = displayedText.split('\n\n').map((para, i, arr) => {
    const showCursor = isTyping && i === arr.length - 1;
    return (
      <p key={i} className="mb-6 leading-relaxed text-primary text-base md:text-lg">
        {para}
        {showCursor && (
          <span className="inline-block w-2 sm:w-2.5 h-[1.1em] align-middle ml-1 bg-accent/80 animate-pulse border-none rounded-sm" />
        )}
      </p>
    );
  });

  return (
    <div className="font-sans">
      {paragraphs}
    </div>
  );
};

export default TypingText;
