'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import TabNavigation from '@/components/TabNavigation';
import Navbar from '@/components/Navbar';
import NotificationBell from '@/components/NotificationBell';
import PlaceCard from '@/components/PlaceCard';
import { useToast } from '@/components/Toast';
import { getCurrentUser, logout } from '@/lib/auth';
import { dataStore } from '@/lib/data';
import { User, LoyaltyTransaction, Announcement, LoyaltyBadge, Place } from '@/types';
import { Star, Gift, TrendingUp, Settings, LogOut, Edit, MapPin, Bell, Plus, X, Award, Crown, Gem, Zap, Shield, CheckCircle, Heart, Target, Trophy, Calendar, Phone, Mail, User as UserIcon, Calendar as CalendarIcon, Eye, EyeOff, Building2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function AccountPage() {
  const router = useRouter();
  const { showToast, ToastContainer } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [likedPlaces, setLikedPlaces] = useState<Place[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [weeklyReviewsCount, setWeeklyReviewsCount] = useState(0);
  const [totalReviewsCount, setTotalReviewsCount] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    bio: '',
    city: '',
    avatar: '',
    email: '',
    phone: '',
    gender: '' as 'male' | 'female' | '',
    dateOfBirth: '',
  });
  const [privacySettings, setPrivacySettings] = useState({
    showEmail: true,
    showPhone: true,
    showDateOfBirth: true,
    showGender: true,
    showLocation: true,
  });
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    content: '',
    type: 'announcement' as 'announcement' | 'offer' | 'event',
  });

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setUser(currentUser);
    setEditForm({
      name: currentUser.name,
      bio: currentUser.bio || '',
      city: currentUser.location?.city || '',
      avatar: currentUser.avatar || '',
      email: currentUser.email || '',
      phone: currentUser.phone || '',
      gender: currentUser.gender || '',
      dateOfBirth: currentUser.dateOfBirth ? new Date(currentUser.dateOfBirth).toISOString().split('T')[0] : '',
    });
    setPrivacySettings({
      showEmail: currentUser.privacySettings?.showEmail ?? true,
      showPhone: currentUser.privacySettings?.showPhone ?? true,
      showDateOfBirth: currentUser.privacySettings?.showDateOfBirth ?? true,
      showGender: currentUser.privacySettings?.showGender ?? true,
      showLocation: currentUser.privacySettings?.showLocation ?? true,
    });
    // Get loyalty transactions for all users
    setTransactions(dataStore.getUserLoyaltyTransactions(currentUser.id));
    
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

    // Get user location
    if (navigator.geolocation) {
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
    } else {
      setUserLocation({ lat: 24.7136, lng: 46.6753 });
    }
  }, [router]);

  const handleSave = () => {
    if (!user) return;
    
    dataStore.updateUser(user.id, {
      name: editForm.name,
      bio: editForm.bio,
      avatar: editForm.avatar || undefined,
      email: editForm.email,
      phone: editForm.phone || undefined,
      gender: editForm.gender || undefined,
      dateOfBirth: editForm.dateOfBirth ? new Date(editForm.dateOfBirth) : undefined,
      location: user.location ? {
        ...user.location,
        city: editForm.city,
      } : {
        lat: 24.7136,
        lng: 46.6753,
        city: editForm.city,
      },
      privacySettings: privacySettings,
    });
    
    setUser(getCurrentUser());
    setIsEditing(false);
    // Toast will be handled by parent component if needed
  };

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

  const getBadgeInfo = (badge?: LoyaltyBadge) => {
    switch (badge) {
      case 'bronze':
        return { name: 'برونزي', icon: Award, color: 'bg-amber-500', bgColor: 'bg-amber-50', textColor: 'text-amber-700', borderColor: 'border-amber-200' };
      case 'silver':
        return { name: 'فضي', icon: Shield, color: 'bg-gray-500', bgColor: 'bg-gray-50', textColor: 'text-slate-700', borderColor: 'border-gray-200' };
      case 'gold':
        return { name: 'ذهبي', icon: Crown, color: 'bg-yellow-500', bgColor: 'bg-yellow-50', textColor: 'text-yellow-700', borderColor: 'border-yellow-200' };
      case 'platinum':
        return { name: 'بلاتيني', icon: Zap, color: 'bg-cyan-500', bgColor: 'bg-cyan-50', textColor: 'text-cyan-700', borderColor: 'border-cyan-200' };
      case 'diamond':
        return { name: 'ماسي', icon: Gem, color: 'bg-slate-500', bgColor: 'bg-slate-50', textColor: 'text-slate-700', borderColor: 'border-slate-200' };
      case 'expert':
        return { name: 'خبير', icon: Award, color: 'bg-emerald-500', bgColor: 'bg-emerald-50', textColor: 'text-emerald-700', borderColor: 'border-emerald-200' };
      default:
        return { name: 'مبتدئ', icon: Star, color: 'bg-gray-400', bgColor: 'bg-gray-50', textColor: 'text-slate-600', borderColor: 'border-gray-200' };
    }
  };

  if (!user) return null;

  const level = Math.floor(user.loyaltyPoints / 100) + 1;
  const nextLevelPoints = level * 100;
  const progress = (user.loyaltyPoints % 100) / 100;
  const badgeInfo = getBadgeInfo(user.loyaltyBadge);
  const BadgeIcon = badgeInfo.icon;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Navbar />

      <main className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Profile Header */}
        <div className="bg-emerald-600 rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12 blur-2xl"></div>
          <div className="relative z-10">
            <div className="flex items-center space-x-4 space-x-reverse mb-6">
              {isEditing ? (
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30">
                  {editForm.avatar ? (
                    <img
                      src={editForm.avatar}
                      alt={user.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl font-bold">{editForm.name.charAt(0)}</span>
                  )}
                </div>
              ) : (
                user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-20 h-20 rounded-full border-4 border-white/30 object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-3xl font-bold border-2 border-white/30">
                    {user.name.charAt(0)}
                  </div>
                )
              )}
              <div className="flex-1">
                <div className="flex items-center space-x-3 space-x-reverse mb-2 flex-wrap">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 text-white placeholder-white/70 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
                      placeholder="الاسم"
                    />
                  ) : (
                    <>
                      <h2 className="text-2xl font-bold">{user.name}</h2>
                      {/* Expert Badge - بجانب الاسم مع مسافة كافية */}
                      {user.verifiedBadge && !isEditing && (
                        <div className="flex items-center space-x-1.5 space-x-reverse bg-emerald-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-md">
                          <Award className="w-4 h-4" />
                          <span>خبير</span>
                        </div>
                      )}
                      {/* Badge Display - Only for users */}
                      {user.role === 'user' && user.loyaltyBadge && !isEditing && (
                        <div className={`flex items-center space-x-1 space-x-reverse bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full border border-white/30`}>
                          <BadgeIcon className={`w-4 h-4 text-white`} />
                          <span className="text-sm font-semibold text-white">{badgeInfo.name}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.city}
                    onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                    className="w-full bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 text-white placeholder-white/70 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 mt-2"
                    placeholder="المدينة"
                  />
                ) : (
                  user.location?.city && (
                    <div className="flex items-center space-x-1 space-x-reverse mt-1 text-white/90">
                      <MapPin className="w-4 h-4" />
                      <span>{user.location.city}</span>
                    </div>
                  )
                )}
              </div>
              <button
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                className="bg-white/20 backdrop-blur-sm p-2 rounded-lg hover:bg-white/30 transition-all"
              >
                {isEditing ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <Edit className="w-5 h-5" />
                )}
              </button>
            </div>

            {isEditing ? (
              <div className="space-y-4">
                {/* Basic Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-white/90 mb-1">الاسم الكامل</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      placeholder="الاسم الكامل"
                      className="w-full bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 text-white placeholder-white/70 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-white/90 mb-1">المدينة</label>
                    <input
                      type="text"
                      value={editForm.city}
                      onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                      placeholder="المدينة"
                      className="w-full bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 text-white placeholder-white/70 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
                    />
                  </div>
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-white/90 mb-1 flex items-center space-x-2 space-x-reverse">
                      <Mail className="w-4 h-4" />
                      <span>البريد الإلكتروني</span>
                    </label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      placeholder="example@email.com"
                      className="w-full bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 text-white placeholder-white/70 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
                    />
                    <div className="mt-2 flex items-center space-x-2 space-x-reverse">
                      <button
                        type="button"
                        onClick={() => setPrivacySettings({ ...privacySettings, showEmail: !privacySettings.showEmail })}
                        className="flex items-center space-x-1 space-x-reverse text-xs text-white/80 hover:text-white transition"
                      >
                        {privacySettings.showEmail ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        <span>{privacySettings.showEmail ? 'مرئي' : 'مخفي'}</span>
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-white/90 mb-1 flex items-center space-x-2 space-x-reverse">
                      <Phone className="w-4 h-4" />
                      <span>رقم الهاتف</span>
                    </label>
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      placeholder="05xxxxxxxx"
                      className="w-full bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 text-white placeholder-white/70 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
                    />
                    <div className="mt-2 flex items-center space-x-2 space-x-reverse">
                      <button
                        type="button"
                        onClick={() => setPrivacySettings({ ...privacySettings, showPhone: !privacySettings.showPhone })}
                        className="flex items-center space-x-1 space-x-reverse text-xs text-white/80 hover:text-white transition"
                      >
                        {privacySettings.showPhone ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        <span>{privacySettings.showPhone ? 'مرئي' : 'مخفي'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Personal Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-white/90 mb-1 flex items-center space-x-2 space-x-reverse">
                      <UserIcon className="w-4 h-4" />
                      <span>الجنس</span>
                    </label>
                    <select
                      value={editForm.gender}
                      onChange={(e) => setEditForm({ ...editForm, gender: e.target.value as 'male' | 'female' | '' })}
                      className="w-full bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
                    >
                      <option value="" className="bg-slate-700">اختر الجنس</option>
                      <option value="male" className="bg-slate-700">ذكر</option>
                      <option value="female" className="bg-slate-700">أنثى</option>
                    </select>
                    <div className="mt-2 flex items-center space-x-2 space-x-reverse">
                      <button
                        type="button"
                        onClick={() => setPrivacySettings({ ...privacySettings, showGender: !privacySettings.showGender })}
                        className="flex items-center space-x-1 space-x-reverse text-xs text-white/80 hover:text-white transition"
                      >
                        {privacySettings.showGender ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        <span>{privacySettings.showGender ? 'مرئي' : 'مخفي'}</span>
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-white/90 mb-1 flex items-center space-x-2 space-x-reverse">
                      <CalendarIcon className="w-4 h-4" />
                      <span>تاريخ الميلاد</span>
                    </label>
                    <input
                      type="date"
                      value={editForm.dateOfBirth}
                      onChange={(e) => setEditForm({ ...editForm, dateOfBirth: e.target.value })}
                      className="w-full bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
                    />
                    <div className="mt-2 flex items-center space-x-2 space-x-reverse">
                      <button
                        type="button"
                        onClick={() => setPrivacySettings({ ...privacySettings, showDateOfBirth: !privacySettings.showDateOfBirth })}
                        className="flex items-center space-x-1 space-x-reverse text-xs text-white/80 hover:text-white transition"
                      >
                        {privacySettings.showDateOfBirth ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        <span>{privacySettings.showDateOfBirth ? 'مرئي' : 'مخفي'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Avatar and Bio */}
                <div>
                  <label className="block text-sm font-semibold text-white/90 mb-1">رابط الصورة الشخصية</label>
                  <input
                    type="url"
                    value={editForm.avatar || ''}
                    onChange={(e) => setEditForm({ ...editForm, avatar: e.target.value })}
                    placeholder="https://example.com/avatar.jpg"
                    className="w-full bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 text-white placeholder-white/70 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white/90 mb-1">نبذة عنك</label>
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    placeholder="اكتب نبذة عنك..."
                    rows={3}
                    className="w-full bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 text-white placeholder-white/70 resize-none border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                </div>

                {/* Location Privacy */}
                <div className="pt-2 border-t border-white/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <MapPin className="w-4 h-4 text-white/90" />
                      <span className="text-sm font-semibold text-white/90">إظهار الموقع</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPrivacySettings({ ...privacySettings, showLocation: !privacySettings.showLocation })}
                      className="flex items-center space-x-1 space-x-reverse text-xs text-white/80 hover:text-white transition"
                    >
                      {privacySettings.showLocation ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      <span>{privacySettings.showLocation ? 'مرئي' : 'مخفي'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              user.bio && <p className="text-white/90 leading-relaxed">{user.bio}</p>
            )}
          </div>
        </div>

        {/* Loyalty Program - Only for regular users */}
        {user.role === 'user' && (
          <>
            {/* Badge Card */}
            <div className={`${badgeInfo.color} rounded-2xl shadow-xl p-6 relative overflow-hidden`}>
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 blur-2xl"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                      <BadgeIcon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">شارة الولاء</h3>
                      <p className="text-white/90 text-sm">مستواك الحالي</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold text-white">{user.loyaltyPoints}</div>
                    <div className="text-white/80 text-sm">نقطة</div>
                  </div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-white">المستوى {level}</span>
                    <span className="text-sm text-white/90">{user.loyaltyPoints} / {nextLevelPoints}</span>
                  </div>
                  <div className="w-full bg-white/30 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-white h-full transition-all duration-300 rounded-full"
                      style={{ width: `${progress * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Badge Tiers */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center space-x-2 space-x-reverse">
                <Crown className="w-6 h-6 text-emerald-600" />
                <span>مستويات الشارات</span>
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {(['bronze', 'silver', 'gold', 'platinum', 'diamond', 'expert'] as LoyaltyBadge[]).map((badge) => {
                  const tierInfo = getBadgeInfo(badge);
                  const TierIcon = tierInfo.icon;
                  const isCurrent = user.loyaltyBadge === badge;
                  const pointsNeeded = badge === 'bronze' ? 0 : badge === 'silver' ? 100 : badge === 'gold' ? 300 : badge === 'platinum' ? 600 : badge === 'diamond' ? 1000 : 0;
                  const hasBadge = user.loyaltyPoints >= pointsNeeded || (badge === 'expert' && user.verifiedBadge);
                  
                  return (
                    <div
                      key={badge}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        isCurrent
                          ? `${tierInfo.bgColor} ${tierInfo.borderColor} border-4 shadow-lg scale-105`
                          : hasBadge
                          ? `${tierInfo.bgColor} ${tierInfo.borderColor} opacity-60`
                          : 'bg-gray-50 border-gray-200 opacity-40'
                      }`}
                    >
                      <div className="flex flex-col items-center text-center">
                        <div className={`p-3 rounded-full mb-2 ${
                          isCurrent ? tierInfo.color : hasBadge ? tierInfo.bgColor : 'bg-gray-200'
                        }`}>
                          <TierIcon className={`icon-lg ${
                            isCurrent ? 'text-white' : hasBadge ? tierInfo.textColor : 'text-slate-600'
                          }`} />
                        </div>
                        <div className={`font-bold text-sm mb-1 ${
                          isCurrent ? tierInfo.textColor : hasBadge ? tierInfo.textColor : 'text-slate-700'
                        }`}>
                          {tierInfo.name}
                        </div>
                        {badge !== 'expert' && (
                          <div className={`text-xs ${
                            isCurrent ? 'text-slate-600' : hasBadge ? 'text-slate-600' : 'text-slate-500'
                          }`}>
                            {pointsNeeded}+ نقطة
                          </div>
                        )}
                        {isCurrent && (
                          <div className="mt-2 text-xs font-semibold text-emerald-600">الحالي</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Expert Program Section */}
            {!user.verifiedBadge && (
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200 mb-6">
                <div className="flex items-center space-x-3 space-x-reverse mb-4">
                  <div className="p-3 bg-emerald-100 rounded-xl">
                    <Award className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">برنامج الخبراء</h3>
                    <p className="text-sm text-slate-600">كن خبيراً في التقييمات</p>
                  </div>
                </div>

                <div className="bg-emerald-50 rounded-xl p-4 mb-4 border border-emerald-200">
                  <h4 className="text-base font-bold text-slate-800 mb-3">المتطلبات:</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                        totalReviewsCount >= 10 ? 'bg-emerald-500' : 'bg-gray-300'
                      }`}>
                        {totalReviewsCount >= 10 && (
                          <CheckCircle className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <span className={`text-sm flex-1 ${totalReviewsCount >= 10 ? 'text-emerald-700 font-bold' : 'text-slate-700'}`}>
                        كتابة 10 تقييمات على الأقل
                        {totalReviewsCount >= 10 && <span className="mr-2 text-emerald-600">✓</span>}
                      </span>
                      <span className="text-xs text-slate-500">
                        ({totalReviewsCount}/10)
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                        user.loyaltyPoints >= 200 ? 'bg-emerald-500' : 'bg-gray-300'
                      }`}>
                        {user.loyaltyPoints >= 200 && (
                          <CheckCircle className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <span className={`text-sm flex-1 ${user.loyaltyPoints >= 200 ? 'text-emerald-700 font-bold' : 'text-slate-700'}`}>
                        الحصول على 200 نقطة ولاء على الأقل
                        {user.loyaltyPoints >= 200 && <span className="mr-2 text-emerald-600">✓</span>}
                      </span>
                      <span className="text-xs text-slate-500">
                        ({user.loyaltyPoints}/200)
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 bg-gray-300">
                      </div>
                      <span className="text-sm text-slate-700 flex-1">
                        جودة التقييمات (يتم التحقق تلقائياً)
                      </span>
                    </div>
                  </div>
                </div>

                {totalReviewsCount >= 10 && user.loyaltyPoints >= 200 ? (
                  <div className="bg-emerald-100 rounded-xl p-4 border-2 border-emerald-500">
                    <div className="flex items-center space-x-2 space-x-reverse mb-2">
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                      <p className="font-bold text-emerald-800">تهانينا! أنت مؤهل لتصبح خبيراً</p>
                    </div>
                    <p className="text-sm text-emerald-700 mb-3">
                      سيتم مراجعة تقييماتك والتحقق من جودتها. عند الموافقة، ستحصل على شارة "خبير" وستظهر تقييماتك كتقييمات خبراء.
                    </p>
                    <button
                      onClick={() => {
                        // في التطبيق الحقيقي، سيتم إرسال طلب للتحقق
                        dataStore.updateUser(user.id, { verifiedBadge: true });
                        setUser(getCurrentUser());
                        showToast('تم التقديم بنجاح! سيتم مراجعة طلبك.', 'success');
                      }}
                      className="w-full bg-emerald-600 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-emerald-700 transition-all shadow-md"
                    >
                      التقديم لبرنامج الخبراء
                    </button>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <p className="text-sm text-slate-600 mb-2">
                      <span className="font-semibold text-slate-800">المزايا:</span>
                    </p>
                    <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside mr-2">
                      <li>ظهور تقييماتك كتقييمات خبراء في أعلى القائمة</li>
                      <li>شارة "خبير" بجانب اسمك في جميع التقييمات</li>
                      <li>نقاط ولاء إضافية لكل تقييم</li>
                      <li>مصداقية أكبر في المنصة</li>
                    </ul>
                  </div>
                )}
              </div>
            )}

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
                      <p className="text-white/90 text-xs">ستحصل على 50 نقطة إضافية</p>
                    </div>
                    <div className="bg-white/30 px-3 py-1.5 rounded-lg">
                      <span className="font-bold text-lg">+50</span>
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
                        {5 - weeklyReviewsCount} تقييم{5 - weeklyReviewsCount > 1 ? 'ات' : ''} متبقي{5 - weeklyReviewsCount > 1 ? 'ة' : ''} للحصول على 50 نقطة
                      </p>
                    </div>
                    <div className="bg-white/30 px-3 py-1.5 rounded-lg">
                      <span className="font-bold text-lg">+50</span>
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

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-amber-50 rounded-xl border-2 border-amber-200">
                <Star className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-slate-800">{level}</div>
                <div className="text-xs text-slate-600">المستوى</div>
              </div>
              <div className="text-center p-4 bg-emerald-600/10 rounded-xl border-2 border-emerald-600">
                <TrendingUp className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-slate-800">{transactions.length}</div>
                <div className="text-xs text-slate-600">المعاملات</div>
              </div>
              <div className="text-center p-4 bg-emerald-50 rounded-xl border-2 border-emerald-200">
                <Gift className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-slate-800">{user.loyaltyPoints}</div>
                <div className="text-xs text-slate-600">النقاط</div>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-slate-800 mb-4">آخر المعاملات</h3>
              {transactions.slice(0, 5).length > 0 ? (
                <div className="space-y-3">
                  {transactions.slice(0, 5).map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                    >
                      <div>
                        <p className="font-semibold text-slate-800">{transaction.description}</p>
                        <p className="text-xs text-slate-500">
                          {formatDate(transaction.createdAt)}
                        </p>
                      </div>
                      <div className={`text-lg font-bold ${
                        transaction.type === 'earned' ? 'text-emerald-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'earned' ? '+' : '-'}
                        {transaction.points}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-slate-500 py-4">لا توجد معاملات بعد</p>
              )}
            </div>
          </>
        )}

        {/* Saved Places - Only for regular users */}
        {user.role === 'user' && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
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
              <div className="place-card-grid">
                {likedPlaces.map((place) => (
                  <PlaceCard key={place.id} place={place} userLocation={userLocation} />
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

        {/* Menu Items */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {dataStore.getPlacesByOwner(user.id).length > 0 && (
            <Link
              href="/my-place"
              className="flex items-center justify-between p-4 border-b border-gray-200 hover:bg-gray-50 transition"
            >
              <div className="flex items-center space-x-3 space-x-reverse">
                <Settings className="w-5 h-5 text-slate-600" />
                <span className="font-semibold text-slate-800">مكاني</span>
              </div>
              <span className="text-slate-400">›</span>
            </Link>
          )}
          <Link
            href="/profile"
            className="flex items-center justify-between p-4 border-b border-gray-200 hover:bg-gray-50 transition"
          >
            <div className="flex items-center space-x-3 space-x-reverse">
              <Edit className="w-5 h-5 text-slate-600" />
              <span className="font-semibold text-slate-800">الملف الشخصي</span>
            </div>
            <span className="text-slate-400">›</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition text-red-600"
          >
            <div className="flex items-center space-x-3 space-x-reverse">
              <LogOut className="w-5 h-5" />
              <span className="font-semibold">تسجيل الخروج</span>
            </div>
            <span>›</span>
          </button>
        </div>

        {/* Add Place Link */}
        <Link
          href="/places/add"
          className="bg-white rounded-2xl shadow-xl border border-gray-200 mt-6 p-6 hover:shadow-2xl transition-all block"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <Building2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="text-right">
                <h3 className="text-lg font-bold text-slate-800">إضافة مكان جديد</h3>
                <p className="text-sm text-slate-600">أضف مكانك التجاري إلى المنصة</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400" />
          </div>
        </Link>
      </main>

      <TabNavigation />
    </div>
  );
}
