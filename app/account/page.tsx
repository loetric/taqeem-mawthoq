'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import TabNavigation from '@/components/TabNavigation';
import Navbar from '@/components/Navbar';
import NotificationBell from '@/components/NotificationBell';
import { useToast } from '@/components/Toast';
import { getCurrentUser, logout } from '@/lib/auth';
import { dataStore } from '@/lib/data';
import { User, Announcement, Place } from '@/types';
import { Settings, LogOut, MapPin, Award, CheckCircle, Heart, Target, Trophy, Calendar, Building2, ArrowRight, Gift, Mail, Phone, User as UserIcon, Calendar as CalendarIcon } from 'lucide-react';
import Link from 'next/link';

export default function AccountPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { showToast, ToastContainer } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [likedPlaces, setLikedPlaces] = useState<Place[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [weeklyReviewsCount, setWeeklyReviewsCount] = useState(0);
  const [totalReviewsCount, setTotalReviewsCount] = useState(0);
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    content: '',
    type: 'announcement' as 'announcement' | 'offer' | 'event',
  });

  useEffect(() => {
    const loadUserData = () => {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        router.push('/login');
        return;
      }
      setUser(currentUser);
      
      // Get announcements for user's places (if they own any)
      const userPlaces = dataStore.getPlacesByOwner(currentUser.id);
      const allAnnouncements: Announcement[] = [];
      userPlaces.forEach(place => {
        const placeAnnouncements = dataStore.getAnnouncementsByPlace(place.id);
        allAnnouncements.push(...placeAnnouncements);
      });
      setAnnouncements(allAnnouncements);

      // Load liked places
      const liked = dataStore.getLikedPlacesList(currentUser.id);
      setLikedPlaces(liked);

      // Get weekly reviews count
      const weeklyCount = dataStore.getWeeklyReviewsCount(currentUser.id);
      setWeeklyReviewsCount(weeklyCount);

      // Get total reviews count
      const totalReviews = dataStore.getReviewsByUser(currentUser.id);
      setTotalReviewsCount(totalReviews.length);
    };

    loadUserData();

    // Get user location (only once, using a ref-like check)
    if (navigator.geolocation && userLocation === null) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          setUserLocation({ lat: 24.7136, lng: 46.6753 });
        }
      );
    } else if (userLocation === null) {
      setUserLocation({ lat: 24.7136, lng: 46.6753 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, pathname]); // Reload when pathname changes (e.g., returning from settings)

  // Also reload data when window gains focus (user returns to tab)
  useEffect(() => {
    const handleFocus = () => {
      const currentUser = getCurrentUser();
      if (!currentUser) return;
      
      setUser(currentUser);
      
      // Get announcements for user's places (if they own any)
      const userPlaces = dataStore.getPlacesByOwner(currentUser.id);
      const allAnnouncements: Announcement[] = [];
      userPlaces.forEach(place => {
        const placeAnnouncements = dataStore.getAnnouncementsByPlace(place.id);
        allAnnouncements.push(...placeAnnouncements);
      });
      setAnnouncements(allAnnouncements);

      // Load liked places
      const liked = dataStore.getLikedPlacesList(currentUser.id);
      setLikedPlaces(liked);

      // Get weekly reviews count
      const weeklyCount = dataStore.getWeeklyReviewsCount(currentUser.id);
      setWeeklyReviewsCount(weeklyCount);

      // Get total reviews count
      const totalReviews = dataStore.getReviewsByUser(currentUser.id);
      setTotalReviewsCount(totalReviews.length);
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);


  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const ownerPlaces = dataStore.getPlacesByOwner(user.id);
    if (ownerPlaces.length === 0) {
      // Toast will be handled by parent component if needed
      return;
    }

    // Create announcement for first place (in real app, let user select)
    dataStore.createAnnouncement({
      placeId: ownerPlaces[0].id,
      title: announcementForm.title,
      content: announcementForm.content,
      type: announcementForm.type,
      isActive: true,
    });

    setAnnouncementForm({ title: '', content: '', type: 'announcement' });
    setShowAnnouncementForm(false);
    
    // Refresh announcements
    const allAnnouncements: Announcement[] = [];
    ownerPlaces.forEach(place => {
      const placeAnnouncements = dataStore.getAnnouncementsByPlace(place.id);
      allAnnouncements.push(...placeAnnouncements);
    });
    setAnnouncements(allAnnouncements);
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/30 to-gray-50 pb-24">
      <Navbar />

      <main className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Profile Header with Integrated Details */}
        <div className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 rounded-3xl shadow-2xl p-6 sm:p-8 relative overflow-hidden" style={{ color: 'white' }}>
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16 blur-3xl"></div>
          <div className="relative z-10" style={{ color: 'white' }}>
            {/* Avatar and Name Section */}
            <div className="flex items-start gap-6 mb-6">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-24 h-24 rounded-full border-4 border-white/30 object-cover shadow-xl flex-shrink-0"
                />
              ) : (
                <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-4xl font-bold border-4 border-white/30 shadow-xl flex-shrink-0" style={{ color: 'white' }}>
                  {user.name.charAt(0)}
                </div>
              )}
              <div className="flex-1 min-w-0" style={{ color: 'white' }}>
                <h2 className="text-3xl font-bold mb-3" style={{ color: 'white' }}>{user.name}</h2>
                {user.location?.city && user.privacySettings?.showLocation !== false && (
                  <div className="flex items-center gap-2 mb-3" style={{ color: 'white' }}>
                    <MapPin className="w-4 h-4 flex-shrink-0" style={{ color: 'white' }} />
                    <span className="text-lg font-semibold" style={{ color: 'white' }}>{user.location.city}</span>
                  </div>
                )}
                {user.bio && (
                  <p className="leading-relaxed text-sm line-clamp-2" style={{ color: 'white' }}>{user.bio}</p>
                )}
              </div>
            </div>

            {/* User Details Grid - Integrated */}
            {(user.privacySettings?.showEmail !== false && user.email) ||
             (user.privacySettings?.showPhone !== false && user.phone) ||
             (user.privacySettings?.showGender !== false && user.gender) ||
             (user.privacySettings?.showDateOfBirth !== false && user.dateOfBirth) ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/20">
                {user.privacySettings?.showEmail !== false && user.email && (
                  <div className="flex flex-col items-center gap-2 p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/15 transition-all group">
                    <div className="p-2 bg-white/20 rounded-lg group-hover:bg-white/30 transition-all">
                      <Mail className="w-4 h-4" style={{ color: 'white' }} />
                    </div>
                    <p className="text-xs font-semibold text-center truncate w-full px-1" style={{ color: 'white' }}>{user.email}</p>
                  </div>
                )}
                {user.privacySettings?.showPhone !== false && user.phone && (
                  <div className="flex flex-col items-center gap-2 p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/15 transition-all group">
                    <div className="p-2 bg-white/20 rounded-lg group-hover:bg-white/30 transition-all">
                      <Phone className="w-4 h-4" style={{ color: 'white' }} />
                    </div>
                    <p className="text-xs font-semibold text-center" style={{ color: 'white' }}>{user.phone}</p>
                  </div>
                )}
                {user.privacySettings?.showGender !== false && user.gender && (
                  <div className="flex flex-col items-center gap-2 p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/15 transition-all group">
                    <div className="p-2 bg-white/20 rounded-lg group-hover:bg-white/30 transition-all">
                      <UserIcon className="w-4 h-4" style={{ color: 'white' }} />
                    </div>
                    <p className="text-xs font-semibold text-center" style={{ color: 'white' }}>{user.gender === 'male' ? 'ذكر' : 'أنثى'}</p>
                  </div>
                )}
                {user.privacySettings?.showDateOfBirth !== false && user.dateOfBirth && (
                  <div className="flex flex-col items-center gap-2 p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/15 transition-all group">
                    <div className="p-2 bg-white/20 rounded-lg group-hover:bg-white/30 transition-all">
                      <CalendarIcon className="w-4 h-4" style={{ color: 'white' }} />
                    </div>
                    <p className="text-xs font-semibold text-center leading-tight" style={{ color: 'white' }}>
                      {new Date(user.dateOfBirth).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>


            {/* Weekly Challenge */}
            <div className="bg-emerald-500 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12 blur-2xl"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                      <Target className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">تحدي الأسبوع</h3>
                      <p className="text-white/90 text-sm">اكتب 5 تقييمات هذا الأسبوع</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold">{weeklyReviewsCount}/5</div>
                    <div className="text-white/80 text-sm">تقييم</div>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold">التقدم</span>
                    <span className="text-sm font-bold">{Math.min(weeklyReviewsCount, 5)}/5</span>
                  </div>
                  <div className="w-full bg-white/30 rounded-full h-4 overflow-hidden">
                    <div
                      className="bg-white h-full transition-all duration-500 rounded-full flex items-center justify-end pr-1"
                      style={{ width: `${Math.min((weeklyReviewsCount / 5) * 100, 100)}%` }}
                    >
                      {weeklyReviewsCount >= 5 && (
                        <Trophy className="w-3 h-3 text-emerald-600" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Reward Info */}
                {weeklyReviewsCount >= 5 ? (
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 flex items-center space-x-3 space-x-reverse">
                    <div className="bg-white/30 p-2 rounded-lg">
                      <Trophy className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-sm">تهانينا! أكملت التحدي</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 flex items-center space-x-3 space-x-reverse">
                    <div className="bg-white/30 p-2 rounded-lg">
                      <Gift className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-sm">المكافأة</p>
                      <p className="text-white/90 text-xs">
                        {5 - weeklyReviewsCount} تقييم{5 - weeklyReviewsCount > 1 ? 'ات' : ''} متبقي{5 - weeklyReviewsCount > 1 ? 'ة' : ''} لإكمال التحدي
                      </p>
                    </div>
                  </div>
                )}

                {/* Time Remaining */}
                <div className="mt-4 flex items-center justify-center space-x-2 space-x-reverse text-white/80 text-xs">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {(() => {
                      const now = new Date();
                      const daysUntilSunday = (7 - now.getDay()) % 7 || 7;
                      if (daysUntilSunday === 7) return 'ينتهي اليوم';
                      if (daysUntilSunday === 1) return 'ينتهي غداً';
                      return `متبقي ${daysUntilSunday} أيام`;
                    })()}
                  </span>
                </div>
              </div>
            </div>

        {/* Saved Places - Only for regular users */}
        {user.role === 'user' && (
          <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-200">
            <div className="flex items-center space-x-3 space-x-reverse mb-4">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <Heart className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">الأماكن المحفوظة</h3>
                <p className="text-sm text-slate-600">الأماكن التي أضفتها إلى قائمة المفضلة</p>
              </div>
            </div>
            {likedPlaces.length > 0 ? (
              <div className="space-y-2">
                {likedPlaces.map((place) => (
                  <Link
                    key={place.id}
                    href={`/places/${place.id}`}
                    className="block p-4 bg-gray-50 rounded-xl border border-gray-200 hover:bg-emerald-50 hover:border-emerald-300 transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800 group-hover:text-emerald-600 transition-colors">
                        {place.name}
                      </span>
                      <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-[-4px] transition-all" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-12 text-center">
                <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-bold text-slate-800 mb-2">لا توجد أماكن محفوظة</h3>
                <p className="text-slate-600 text-sm">ابدأ بإضافة أماكن إلى قائمة المحفوظات</p>
              </div>
            )}
          </div>
        )}

        {/* Add Place Link */}
        <Link
          href="/places/add"
          className="w-full bg-white rounded-3xl shadow-xl border border-gray-200 mt-6 p-4 hover:shadow-2xl hover:scale-[1.01] transition-all block group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="p-2 bg-emerald-100 rounded-xl group-hover:bg-emerald-200 transition-all">
                <Building2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="text-right">
                <h3 className="text-base font-bold text-slate-800 mb-0.5">إضافة مكان جديد</h3>
                <p className="text-xs text-slate-600">أضف مكانك التجاري إلى المنصة</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-[-4px] transition-all" />
          </div>
        </Link>

        {/* Account Settings Button */}
        <Link
          href="/account/settings"
          className="w-full bg-white rounded-3xl shadow-xl border border-gray-200 p-4 hover:shadow-2xl hover:scale-[1.01] transition-all block group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="p-2 bg-emerald-100 rounded-xl group-hover:bg-emerald-200 transition-all">
                <Settings className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="text-right">
                <h3 className="text-base font-bold text-slate-800 mb-0.5">إعدادات الحساب</h3>
                <p className="text-xs text-slate-600">تحرير بياناتك وصورتك الشخصية</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-[-4px] transition-all" />
          </div>
        </Link>

        {/* Logout Button - Last Option */}
        <button
          onClick={handleLogout}
          className="w-full bg-white rounded-3xl shadow-xl border border-gray-200 p-4 hover:shadow-2xl hover:scale-[1.01] transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="p-2 bg-red-100 rounded-xl group-hover:bg-red-200 transition-all">
                <LogOut className="w-5 h-5 text-red-600" />
              </div>
              <div className="text-right">
                <h3 className="text-base font-bold text-red-600 mb-0.5">تسجيل الخروج</h3>
                <p className="text-xs text-slate-600">تسجيل الخروج من حسابك</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-red-600 group-hover:translate-x-[-4px] transition-all" />
          </div>
        </button>

        {/* Edit Form Section - Removed, now in /account/settings */}
      </main>

      <TabNavigation />
      
      {/* Toast Container */}
      <ToastContainer />
    </div>
  );
}
