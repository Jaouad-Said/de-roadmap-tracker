'use client';

import { useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageModalProps {
  imageUrl: string;
  onClose: () => void;
  images?: string[];
  onNavigate?: (url: string) => void;
}

export default function ImageModal({
  imageUrl,
  onClose,
  images = [],
  onNavigate,
}: ImageModalProps) {
  const currentIndex = images.indexOf(imageUrl);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < images.length - 1;
  
  const handlePrev = useCallback(() => {
    if (hasPrev && onNavigate) {
      onNavigate(images[currentIndex - 1]);
    }
  }, [hasPrev, currentIndex, images, onNavigate]);
  
  const handleNext = useCallback(() => {
    if (hasNext && onNavigate) {
      onNavigate(images[currentIndex + 1]);
    }
  }, [hasNext, currentIndex, images, onNavigate]);
  
  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          handlePrev();
          break;
        case 'ArrowRight':
          handleNext();
          break;
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose, handlePrev, handleNext]);
  
  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-white/80 hover:text-white bg-white/10 rounded-full hover:bg-white/20 transition-colors"
      >
        <X className="w-6 h-6" />
      </button>
      
      {/* Navigation buttons */}
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            disabled={!hasPrev}
            className="absolute left-4 p-2 text-white/80 hover:text-white bg-white/10 rounded-full hover:bg-white/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            disabled={!hasNext}
            className="absolute right-4 p-2 text-white/80 hover:text-white bg-white/10 rounded-full hover:bg-white/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}
      
      {/* Image */}
      <img
        src={imageUrl}
        alt=""
        className="max-w-[90vw] max-h-[90vh] object-contain"
        onClick={(e) => e.stopPropagation()}
      />
      
      {/* Image counter */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-white/10 rounded-full text-white/80 text-sm">
          {currentIndex + 1} / {images.length}
        </div>
      )}
    </div>
  );
}
