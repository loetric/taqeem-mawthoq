'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Activity, User, Building2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getCurrentUser } from '@/lib/auth';
import { dataStore } from '@/lib/data';

export default function TabNavigation() {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);
  const [user, setUser] = useState(getCurrentUser());
  const [hasPlaces, setHasPlaces] = useState(false);

  // Function to check if user has places - always check directly from dataStore
  // Only return true if user has at least one claimed place
  const checkUserHasPlaces = (userId: string | null): boolean => {
    if (!userId) return false;
    try {
      const userPlaces = dataStore.getPlacesByOwner(userId);
      // Check if user has at least one claimed place
      return userPlaces.some(place => place.isClaimed) && userPlaces.length > 0;
    } catch (error) {
      console.error('Error checking user places:', error);
      return false;
    }
  };

  // Initialize immediately on mount and when user changes
  useEffect(() => {
    const initializeData = () => {
      const currentUser = getCurrentUser();
      setUser(currentUser);
      if (currentUser) {
        // Check immediately
        const count = dataStore.getUnreadNotificationCount(currentUser.id);
        setUnreadCount(count);
        
        // Check if user has places immediately - verify places are claimed
        const userPlaces = dataStore.getPlacesByOwner(currentUser.id);
        const hasClaimedPlaces = userPlaces.some(place => place.isClaimed);
        setHasPlaces(hasClaimedPlaces && userPlaces.length > 0);
      } else {
        setHasPlaces(false);
        setUnreadCount(0);
      }
    };

    // Initialize immediately
    initializeData();
    
    // Also initialize after a short delay to ensure dataStore is ready
    const timeout = setTimeout(initializeData, 100);
    
    // Refresh notification count and places check every 2 seconds
    const interval = setInterval(() => {
      const updatedUser = getCurrentUser();
      if (updatedUser) {
        const updatedCount = dataStore.getUnreadNotificationCount(updatedUser.id);
        setUnreadCount(updatedCount);
        
        // Check if user has places - verify places are claimed
        const userPlaces = dataStore.getPlacesByOwner(updatedUser.id);
        const hasClaimedPlaces = userPlaces.some(place => place.isClaimed);
        setHasPlaces(hasClaimedPlaces && userPlaces.length > 0);
        setUser(updatedUser);
      } else {
        setHasPlaces(false);
        setUnreadCount(0);
      }
    }, 2000);
    
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [pathname]);

  // Always check current user and their places for tabs - use state value for consistency
  const currentUserForTabs = getCurrentUser();
  // Use state value which is updated every 2 seconds
  const userHasPlaces = currentUserForTabs ? hasPlaces : false;

  const tabs = [
    { href: '/home', icon: Home, label: 'الرئيسية' },
    { href: '/explore', icon: Search, label: 'استكشف' },
    { href: '/interactions', icon: Activity, label: 'التفاعلات' },
    ...(userHasPlaces ? [{ href: '/my-place', icon: Building2, label: 'مكاني' }] : []),
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
                    ? 'text-emerald-600' 
                      : 'text-slate-400 hover:text-emerald-600'
                  }`}
                >
                  {isActive && (
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-emerald-600 rounded-b-full" />
                  )}
                  <div className={`p-2 rounded-xl transition-all relative ${isActive ? 'bg-emerald-50' : 'group-hover:bg-gray-100'}`}>
                    <Icon className={`icon-lg ${isActive ? 'icon-primary scale-110' : 'icon-muted group-hover:icon-primary'} transition-all`} />
                    {/* Notification badge on Interactions tab */}
                    {tab.href === '/interactions' && unreadCount > 0 && (
                      <span className="absolute top-0 left-0 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold shadow-lg border-2 border-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </div>
                  <span className={`text-xs font-semibold mt-1 ${isActive ? 'font-bold text-emerald-600' : 'text-slate-500'}`}>{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

