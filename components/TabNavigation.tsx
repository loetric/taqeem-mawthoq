'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, MessageSquare, User, Settings } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getCurrentUser } from '@/lib/auth';
import { dataStore } from '@/lib/data';

export default function TabNavigation() {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);
  const [user, setUser] = useState(getCurrentUser());

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    if (currentUser) {
      const count = dataStore.getUnreadNotificationCount(currentUser.id);
      setUnreadCount(count);
      
      // Refresh notification count every 5 seconds
      const interval = setInterval(() => {
        const updatedCount = dataStore.getUnreadNotificationCount(currentUser.id);
        setUnreadCount(updatedCount);
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, []);

  // For owners, show only dashboard tab
  if (user?.role === 'owner') {
    const ownerTabs = [
      { href: '/dashboard', icon: Settings, label: 'لوحة التحكم' },
    ];
    
    return (
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t-2 border-gray-200 z-50 shadow-2xl">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-around items-center h-14 sm:h-16 px-1 sm:px-2">
            {ownerTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = pathname === tab.href || pathname.startsWith('/places/');
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 relative group ${
                    isActive 
                      ? 'text-[#0ea5e9]' 
                      : 'text-gray-400 hover:text-[#0ea5e9]'
                  }`}
                >
                  {isActive && (
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-[#0ea5e9] to-[#0284c7] rounded-b-full" />
                  )}
                  <div className={`p-2 rounded-xl transition-all relative ${isActive ? 'bg-[#0ea5e9]/10' : 'group-hover:bg-gray-100'}`}>
                    <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${isActive ? 'scale-110' : ''} transition-transform`} />
                  </div>
                  <span className={`text-[10px] sm:text-xs font-semibold mt-0.5 sm:mt-1 ${isActive ? 'font-bold text-[#0ea5e9]' : ''}`}>{tab.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    );
  }

  // For regular users, show normal tabs
  const tabs = [
    { href: '/home', icon: Home, label: 'الرئيسية' },
    { href: '/explore', icon: Search, label: 'استكشف' },
    { href: '/liked', icon: MessageSquare, label: 'التفاعلات' },
    { href: '/account', icon: User, label: 'الحساب' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t-2 border-gray-200 z-50 shadow-2xl">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-around items-center h-16 px-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = pathname === tab.href || (tab.href === '/home' && pathname === '/');
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 relative group ${
                  isActive 
                    ? 'text-[#0ea5e9]' 
                    : 'text-gray-400 hover:text-[#0ea5e9]'
                }`}
              >
                {isActive && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-[#0ea5e9] to-[#0284c7] rounded-b-full" />
                )}
                <div className={`p-2 rounded-xl transition-all relative ${isActive ? 'bg-[#0ea5e9]/10' : 'group-hover:bg-gray-100'}`}>
                  <Icon className={`w-6 h-6 ${isActive ? 'scale-110' : ''} transition-transform`} />
                  {/* Notification badge on Interactions tab */}
                  {tab.href === '/liked' && unreadCount > 0 && (
                    <span className="absolute top-0 left-0 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold shadow-lg border-2 border-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </div>
                <span className={`text-xs font-semibold mt-1 ${isActive ? 'font-bold text-[#0ea5e9]' : ''}`}>{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

