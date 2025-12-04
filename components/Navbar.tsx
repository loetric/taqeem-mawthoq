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
              className="text-xl sm:text-2xl lg:text-3xl font-bold text-emerald-600 leading-tight logo-extended relative inline-block" 
              style={{ 
                letterSpacing: '0.5em',
                wordSpacing: 'normal'
              }}
            >
              تقييم مُوثَّـق
              <Star className="w-3 h-3 sm:w-4 sm:h-4 text-amber-600 absolute -top-1.5 -left-1 animate-spin-slow fill-amber-500" style={{ animationDuration: '3s', filter: 'none' }} />
            </span>
          </Link>
        </div>
      </div>
    </nav>
  );
}

