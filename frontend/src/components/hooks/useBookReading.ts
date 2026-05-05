import { useState, useEffect, useRef, useCallback } from 'react';
import type { Session } from '../../types';
import { booksService } from '../../services/books';
import { sessionsService } from '../../services/sessions';

export const useBookReading = (session: Session) => {
  const [sentences, setSentences] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visitedSet, setVisitedSet] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const textContainerRef = useRef<HTMLDivElement>(null);
  const currentSentenceRef = useRef<HTMLDivElement>(null);
  
  const lastSavedIndexRef = useRef<number>(-1);
  const isInitialLoadRef = useRef<boolean>(true);

  // Загрузка текста, позиции и выделений
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const rawText = await booksService.getBookText(session.book_id);
        const sents = rawText.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 3);
        setSentences(sents);
        
        const updatedSession = await sessionsService.getSession(session.id);
        
        let savedPosition = updatedSession.current_position;
        if (savedPosition >= 0 && savedPosition < sents.length) {
          setCurrentIndex(savedPosition);
          lastSavedIndexRef.current = savedPosition;
          console.log(`Loaded position: ${savedPosition}`);
        } else {
          setCurrentIndex(0);
        }

        const highlights = await sessionsService.getHighlights(session.id);
        const visited = new Set(highlights.map(h => h.sentence_index));
        setVisitedSet(visited);
        
        isInitialLoadRef.current = false;
        
      } catch (error) {
        console.error('Error loading book:', error);
      } finally {
        setLoading(false);
      }
    };
    
    load();
  }, [session.id, session.book_id]);

  // Сохраняем позицию при изменении
  useEffect(() => {
    if (!sentences.length || loading || isInitialLoadRef.current) return;
    
    const timer = setTimeout(async () => {
      if (lastSavedIndexRef.current !== currentIndex) {
        try {
          await sessionsService.updatePosition(session.id, currentIndex);
          lastSavedIndexRef.current = currentIndex;
          console.log(`Position saved: ${currentIndex}`);
        } catch (error) {
          console.error('Error saving position:', error);
        }
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [currentIndex, session.id, sentences.length, loading]);

  // Сохраняем выделение
  useEffect(() => {
    if (!sentences.length || loading || isInitialLoadRef.current) return;
    
    const saveHighlight = async () => {
      if (!visitedSet.has(currentIndex) && currentIndex >= 0 && sentences[currentIndex]) {
        try {
          await sessionsService.addHighlight(session.id, { 
            sentence_index: currentIndex, 
            text: sentences[currentIndex] 
          });
          setVisitedSet(prev => new Set(prev).add(currentIndex));
          console.log(`Highlight saved for sentence ${currentIndex}`);
        } catch (error) {
          console.error('Error saving highlight:', error);
        }
      }
    };
    
    saveHighlight();
  }, [currentIndex, sentences, visitedSet, session.id, loading]);

  // Скролл
  useEffect(() => {
    if (!loading && currentSentenceRef.current && textContainerRef.current) {
      currentSentenceRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
    }
  }, [currentIndex, loading]);

  const setCurrentIndexSafe = useCallback((idx: number) => {
    if (idx >= 0 && idx < sentences.length) {
      setCurrentIndex(idx);
    }
  }, [sentences.length]);

  return {
    sentences,
    currentIndex,
    visitedSet,
    loading,
    setCurrentIndex: setCurrentIndexSafe,
    textContainerRef,
    currentSentenceRef
  };
};