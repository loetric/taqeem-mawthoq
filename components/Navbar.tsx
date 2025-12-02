'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MapPin, Star, User, LogOut, Home, PlusCircle } from 'lucide-react';
import { getCurrentUser, logout } from '@/lib/auth';
import { useEffect, useState } from 'react';
import { User as UserType } from '@/types';

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<UserType | null>(null);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  const handleLogout = () => {
    logout();
    setUser(null);
    router.push('/');
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <div className="flex items-center space-x-2 sm:space-x-4 space-x-reverse">
            <Link href="/" className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent whitespace-nowrap">
              تقييم موثوق
            </Link>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4 space-x-reverse">
            {user ? (
              <>
                <Link href="/profile" className="flex items-center space-x-1 sm:space-x-2 space-x-reverse text-slate-700 hover:text-emerald-600 transition p-1.5 sm:p-2 rounded-lg hover:bg-emerald-50">
                  <Star className="icon-md icon-secondary hover:icon-primary transition-colors" />
                  <span className="hidden sm:inline text-xs sm:text-sm font-medium">نقاط الولاء: {user.loyaltyPoints}</span>
                </Link>
                <Link href="/account" className="flex items-center space-x-1 sm:space-x-2 space-x-reverse text-slate-700 hover:text-emerald-600 transition p-1.5 sm:p-2 rounded-lg hover:bg-emerald-50">
                  <User className="icon-md icon-secondary hover:icon-primary transition-colors" />
                  <span className="hidden sm:inline text-sm max-w-[80px] truncate font-medium">{user.name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 sm:space-x-2 space-x-reverse text-red-600 hover:text-red-700 transition p-1.5 sm:p-2 rounded-lg hover:bg-red-50"
                  title="تسجيل الخروج"
                >
                  <LogOut className="icon-md" />
                  <span className="hidden md:inline text-sm font-medium">تسجيل الخروج</span>
                </button>
              </>
            ) : (
              <Link href="/login" className="button-primary-unified text-sm sm:text-base px-2 sm:px-4 py-1.5 sm:py-2">
                <User className="icon-md" />
                <span className="hidden sm:inline">تسجيل الدخول</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

