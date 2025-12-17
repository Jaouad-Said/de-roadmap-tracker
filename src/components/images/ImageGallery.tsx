'use client';

import { useState } from 'react';
import { X, ZoomIn, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import ImageModal from './ImageModal';

interface ImageGalleryProps {
  images: string[];
  sectionId: string;
  onDelete?: (imageUrl: string) => void;
  editable?: boolean;
}

export default function ImageGallery({
  images,
  sectionId,
  onDelete,
  editable = false,
}: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  if (images.length === 0) return null;
  
  const handleDelete = async (imageUrl: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;
    
    // Extract filename from URL
    const filename = imageUrl.split('/').pop();
    if (!filename) return;
    
    try {
      await fetch(`/api/upload/${filename}?sectionId=${sectionId}`, {
        method: 'DELETE',
      });
      onDelete?.(imageUrl);
    } catch (error) {
      console.error('Failed to delete image:', error);
    }
  };
  
  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {images.map((url, index) => (
          <div
            key={index}
            className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800"
          >
            <img
              src={url}
              alt=""
              className="w-full h-full object-cover"
              loading="lazy"
            />
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                onClick={() => setSelectedImage(url)}
                className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
              >
                <ZoomIn className="w-4 h-4 text-gray-800" />
              </button>
              
              {editable && onDelete && (
                <button
                  onClick={() => handleDelete(url)}
                  className="p-2 bg-red-500/90 rounded-full hover:bg-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-white" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Image Modal */}
      {selectedImage && (
        <ImageModal
          imageUrl={selectedImage}
          onClose={() => setSelectedImage(null)}
          images={images}
          onNavigate={setSelectedImage}
        />
      )}
    </>
  );
}
