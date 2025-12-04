'use client';

import Link from 'next/link';
import { Star } from 'lucide-react';

export default function Navbar() {

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex justify-center items-center h-14 sm:h-16">
          <Link 
            href="/" 
            className="inline-block"
          >
            {/* Arabic Text Logo with Star */}
            <span 
              className="text-lg sm:text-xl lg:text-2xl font-bold text-emerald-600 leading-tight logo-extended relative inline-block" 
              style={{ 
                letterSpacing: '0.3em',
                wordSpacing: 'normal'
              }}
            >
              تقييم موثوق
              <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-500 absolute -top-1 -left-0.5 fill-amber-400" />
            </span>
          </Link>
        </div>
      </div>
    </nav>
  );
}

