import React from 'react';
import { Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AnnouncementBar = () => {
  return (
    <div className="bg-sphere-charcoal text-white text-xs py-2 px-4 border-b border-white/10">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="hidden sm:flex items-center gap-2 text-gray-400">
          <span>Carbon-neutral delivery across India</span>
          <span className="text-gray-600">•</span>
          <span>15-day verified returns</span>
        </div>
        <div className="flex items-center justify-center sm:justify-end gap-2 w-full sm:w-auto font-medium">
          <Sparkles className="w-3.5 h-3.5 text-sphere-amber" />
          <span>Use code <strong className="text-sphere-amber underline decoration-dotted">WELCOME10</strong> for 10% off your first order!</span>
          <Link to="/shop" className="underline hover:text-sphere-violet ml-1">
            Shop Now &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
};
