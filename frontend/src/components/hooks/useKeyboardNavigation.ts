import { useEffect } from 'react';

export const useKeyboardNavigation = ({ 
  active, 
  sentencesLength, 
  currentIndex, 
  setCurrentIndex 
}: {
  active: boolean;
  sentencesLength: number;
  currentIndex: number;
  setCurrentIndex: (idx: number) => void;
}) => {
  useEffect(() => {
    if (!active) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // Игнорируем, если фокус на инпуте или текстареа
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }
      
      switch(e.key) {
        case 'ArrowRight':
        case ' ':
        case 'd':
        case 'D':
          e.preventDefault();
          if (currentIndex < sentencesLength - 1) {
            setCurrentIndex(currentIndex + 1);
          }
          break;
          
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
          }
          break;
          
        default:
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [active, sentencesLength, currentIndex, setCurrentIndex]);
};