'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import TabNavigation from '@/components/TabNavigation';
import { getCurrentUser } from '@/lib/auth';
import { dataStore } from '@/lib/data';
import { User, Review, LoyaltyTransaction, LoyaltyBadge } from '@/types';
import { formatRelativeTime } from '@/lib/dateUtils';
import { Star, Gift, TrendingUp, Edit, MapPin, Award, Crown, Gem, Zap, Shield, MessageSquare, Clock, CheckCircle, ThumbsUp, User as UserIcon, Settings } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    bio: '',
    city: '',
    avatar: '',
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
    });
    
    if (currentUser.role === 'user') {
      setTransactions(dataStore.getUserLoyaltyTransactions(currentUser.id));
      const allReviews = dataStore.getAllReviews();
      const userReviews = allReviews.filter(r => r.userId === currentUser.id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10);
      setReviews(userReviews);
    }
  }, [router]);

  const handleSave = () => {
    if (!user) return;
    
    dataStore.updateUser(user.id, {
      name: editForm.name,
      bio: editForm.bio,
      avatar: editForm.avatar || undefined,
      location: user.location ? {
        ...user.location,
        city: editForm.city,
      } : {
        lat: 24.7136,
        lng: 46.6753,
        city: editForm.city,
      },
    });
    
    setUser(getCurrentUser());
    setIsEditing(false);
    // Toast will be handled by parent component if needed
  };

  const getBadgeInfo = (badge?: LoyaltyBadge) => {
    switch (badge) {
      case 'bronze':
        return { name: 'برونزي', icon: Award, color: 'from-amber-600 to-orange-600', bgColor: 'bg-amber-50', textColor: 'text-amber-700', borderColor: 'border-amber-200' };
      case 'silver':
        return { name: 'فضي', icon: Shield, color: 'from-gray-400 to-gray-600', bgColor: 'bg-gray-50', textColor: 'text-gray-700', borderColor: 'border-gray-200' };
      case 'gold':
        return { name: 'ذهبي', icon: Crown, color: 'from-yellow-400 to-yellow-600', bgColor: 'bg-yellow-50', textColor: 'text-yellow-700', borderColor: 'border-yellow-200' };
      case 'platinum':
        return { name: 'بلاتيني', icon: Zap, color: 'from-cyan-400 to-blue-500', bgColor: 'bg-cyan-50', textColor: 'text-cyan-700', borderColor: 'border-cyan-200' };
      case 'diamond':
        return { name: 'ماسي', icon: Gem, color: 'from-purple-400 to-pink-500', bgColor: 'bg-purple-50', textColor: 'text-purple-700', borderColor: 'border-purple-200' };
      case 'expert':
        return { name: 'خبير', icon: Award, color: 'from-green-500 to-emerald-600', bgColor: 'bg-green-50', textColor: 'text-green-700', borderColor: 'border-green-200' };
      default:
        return { name: 'مبتدئ', icon: Star, color: 'from-gray-300 to-gray-400', bgColor: 'bg-gray-50', textColor: 'text-gray-600', borderColor: 'border-gray-200' };
    }
  };

  if (!user) return null;

  const level = Math.floor(user.loyaltyPoints / 100) + 1;
  const nextLevelPoints = level * 100;
  const progress = (user.loyaltyPoints % 100) / 100;
  const badgeInfo = getBadgeInfo(user.loyaltyBadge);
  const BadgeIcon = badgeInfo.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 pb-24">
      <Navbar />

      <main className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-[#0ea5e9] to-[#0284c7] rounded-2xl shadow-xl p-8 text-white relative overflow-hidden">
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
                <div className="flex items-center space-x-3 space-x-reverse mb-2">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 text-white placeholder-white/70 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
                      placeholder="الاسم"
                    />
                  ) : (
                    <h2 className="text-2xl font-bold">{user.name}</h2>
                  )}
                  {/* Badge Display - Only for users */}
                  {user.role === 'user' && user.loyaltyBadge && !isEditing && (
                    <div className={`flex items-center space-x-1 space-x-reverse bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full border border-white/30`}>
                      <BadgeIcon className={`w-4 h-4 text-white`} />
                      <span className="text-sm font-semibold text-white">{badgeInfo.name}</span>
                    </div>
                  )}
                  {user.verifiedBadge && !isEditing && (
                    <div className="flex items-center space-x-1 space-x-reverse bg-green-500/80 backdrop-blur-sm px-3 py-1 rounded-full border border-white/30">
                      <Award className="w-4 h-4 text-white" />
                      <span className="text-sm font-semibold text-white">خبير</span>
                    </div>
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
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-semibold text-white/90 mb-1">رابط الصورة الشخصية</label>
                  <input
                    type="url"
                    value={editForm.avatar}
                    onChange={(e) => setEditForm({ ...editForm, avatar: e.target.value })}
                    placeholder="https://example.com/avatar.jpg"
                    className="w-full bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 text-white placeholder-white/70 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                </div>
                <textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  placeholder="اكتب نبذة عنك..."
                  rows={3}
                  className="w-full bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 text-white placeholder-white/70 resize-none border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
                />
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
            <div className={`bg-gradient-to-br ${badgeInfo.color} rounded-2xl shadow-xl p-6 relative overflow-hidden`}>
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

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border-2 border-amber-200">
                <Star className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-800">{level}</div>
                <div className="text-xs text-gray-600">المستوى</div>
              </div>
              <div className="text-center p-4 bg-[#0ea5e9]/10 rounded-xl border-2 border-[#0ea5e9]">
                <TrendingUp className="w-6 h-6 text-[#0ea5e9] mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-800">{transactions.length}</div>
                <div className="text-xs text-gray-600">المعاملات</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border-2 border-emerald-200">
                <Gift className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-800">{user.loyaltyPoints}</div>
                <div className="text-xs text-gray-600">النقاط</div>
              </div>
            </div>

            {/* Recent Reviews */}
            {reviews.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center space-x-2 space-x-reverse">
                  <MessageSquare className="w-6 h-6 text-[#0ea5e9]" />
                  <span>آخر التقييمات</span>
                </h3>
                <div className="space-y-3">
                  {reviews.slice(0, 5).map((review) => {
                    const place = dataStore.getPlace(review.placeId);
                    if (!place) return null;
                    return (
                      <Link
                        key={review.id}
                        href={`/places/${review.placeId}`}
                        className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition border-r-4 border-[#0ea5e9]"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <p className="font-semibold text-gray-800 text-sm">{place.name}</p>
                            <p className="text-xs text-gray-500 mt-1">{formatRelativeTime(review.createdAt)}</p>
                          </div>
                          <div className="flex items-center space-x-1 space-x-reverse">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${
                                  i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 line-clamp-2">{review.comment}</p>
                        {review.likes && review.likes.length > 0 && (
                          <div className="flex items-center space-x-1 space-x-reverse mt-2 text-xs text-gray-500">
                            <ThumbsUp className="w-3 h-3" />
                            <span>{review.likes.length} إعجاب</span>
                          </div>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Recent Transactions */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">آخر المعاملات</h3>
              {transactions.slice(0, 5).length > 0 ? (
                <div className="space-y-3">
                  {transactions.slice(0, 5).map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                    >
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">{transaction.description}</p>
                        <p className="text-xs text-gray-500">
                          {formatRelativeTime(transaction.createdAt)}
                        </p>
                      </div>
                      <div className={`text-lg font-bold ${
                        transaction.type === 'earned' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'earned' ? '+' : '-'}
                        {transaction.points}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-4">لا توجد معاملات بعد</p>
              )}
            </div>
          </>
        )}

        {/* Owner Info */}
        {user.role === 'owner' && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center space-x-2 space-x-reverse">
              <Settings className="w-6 h-6 text-[#0ea5e9]" />
              <span>حساب صاحب منشأة</span>
            </h3>
            <p className="text-gray-600 mb-4">
              أنت مسجل كصاحب منشأة. يمكنك إدارة أماكنك من لوحة التحكم.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center space-x-2 space-x-reverse bg-gradient-to-r from-[#0ea5e9] to-[#0284c7] text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all font-semibold"
            >
              <Settings className="w-5 h-5" />
              <span>الذهاب إلى لوحة التحكم</span>
            </Link>
          </div>
        )}

        {/* Account Settings Link */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <Link
            href="/account"
            className="flex items-center justify-between p-4 hover:bg-gray-50 transition"
          >
            <div className="flex items-center space-x-3 space-x-reverse">
              <Settings className="w-5 h-5 text-gray-600" />
              <span className="font-semibold text-gray-800">إعدادات الحساب</span>
            </div>
            <span className="text-gray-400">›</span>
          </Link>
        </div>
      </main>

      <TabNavigation />
    </div>
  );
}
