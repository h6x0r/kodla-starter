
import React, { useState } from 'react';
import { IconChevronDown, IconPlay } from '../../../../components/Icons';

interface VideoSolutionPanelProps {
  videoUrl?: string;
}

export const VideoSolutionPanel = ({ videoUrl }: VideoSolutionPanelProps) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!videoUrl) return null;

  // Robust Video ID extraction using URL API
  const getVideoId = (url: string) => {
    try {
      const urlObj = new URL(url);
      
      // Handle youtube.com/watch?v=ID
      if (urlObj.hostname.includes('youtube.com')) {
         return urlObj.searchParams.get('v');
      }
      
      // Handle youtu.be/ID
      if (urlObj.hostname.includes('youtu.be')) {
         return urlObj.pathname.slice(1);
      }
      
      // Handle youtube.com/embed/ID
      if (urlObj.pathname.includes('/embed/')) {
         return urlObj.pathname.split('/embed/')[1];
      }

      return null;
    } catch (e) {
      // Fallback for partial URLs or regex if URL fails
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      return (match && match[2].length === 11) ? match[2] : null;
    }
  };

  const videoId = getVideoId(videoUrl);

  if (!videoId) return null;

  // Simplified embed URL to maximize compatibility and avoid Error 153
  const embedUrl = `https://www.youtube.com/embed/${videoId}`;

  return (
    <div className="border-t border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-black/20">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 text-xs font-bold text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
      >
        <span className="flex items-center gap-2">
           <div className="w-5 h-5 bg-red-600 rounded flex items-center justify-center shadow-sm">
             <IconPlay className="w-3 h-3 text-white fill-current" />
           </div>
           <span className="text-gray-700 dark:text-gray-300">VIDEO EXPLANATION</span>
        </span>
        <IconChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="p-4 bg-white dark:bg-dark-surface border-t border-gray-200 dark:border-dark-border">
          <div className="relative w-full pt-[56.25%] rounded-xl overflow-hidden bg-black shadow-lg">
             <iframe
               className="absolute top-0 left-0 w-full h-full"
               src={embedUrl}
               title="YouTube video player"
               frameBorder="0"
               allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
               allowFullScreen
             ></iframe>
          </div>
          <div className="mt-3 flex justify-between items-center">
             <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Powered by YouTube</span>
             <a 
               href={videoUrl} 
               target="_blank" 
               rel="noreferrer"
               className="text-[10px] font-bold text-brand-600 hover:underline"
             >
               Open in new tab ↗
             </a>
          </div>
        </div>
      )}
    </div>
  );
};
