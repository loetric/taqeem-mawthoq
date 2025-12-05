'use client';

import Link from 'next/link';
import { Star } from 'lucide-react';

export default function Navbar() {

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex justify-center items-center h-14 sm:h-16 pb-4 sm:pb-0">
          <Link 
            href="/" 
            className="inline-block"
          >
            {/* Arabic Text Logo with Star */}
            <span 
              className="text-2xl sm:text-2xl lg:text-3xl font-bold text-emerald-600 leading-tight logo-extended relative inline-block" 
            >
              تقييم موثوق
              <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-500 absolute -top-1.5 -left-1 fill-amber-400 animate-spin" style={{ animationDuration: '3s' }} />
            </span>
          </Link>
        </div>
      </div>
    </nav>
  );
}

