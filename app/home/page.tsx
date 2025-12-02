'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import TabNavigation from '@/components/TabNavigation';
import Navbar from '@/components/Navbar';
import NotificationBell from '@/components/NotificationBell';
import CreatePlaceModal from '@/components/CreatePlaceModal';
import PlaceCard from '@/components/PlaceCard';
import { getCurrentUser } from '@/lib/auth';
import { dataStore } from '@/lib/data';
import { formatRelativeTime } from '@/lib/dateUtils';
import { Place, Review } from '@/types';
import { MapPin, Plus, TrendingUp, Navigation, Shield, Sparkles, Clock, Star, CheckCircle, Heart, Zap, Award, ThumbsUp, Flag } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/components/Toast';
import ReportReviewModal from '@/components/ReportReviewModal';

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState(getCurrentUser());
  const [nearbyPlaces, setNearbyPlaces] = useState<Place[]>([]);
  const [recommendedPlaces, setRecommendedPlaces] = useState<Place[]>([]);
  const [similarPlaces, setSimilarPlaces] = useState<Place[]>([]);
  const [likedPlaces, setLikedPlaces] = useState<Place[]>([]);
  const [newPlaces, setNewPlaces] = useState<Place[]>([]);
  const [topRated, setTopRated] = useState<Place[]>([]);
  const [recentReviews, setRecentReviews] = useState<Review[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const { showToast, ToastContainer } = useToast();
  const [reportReviewModal, setReportReviewModal] = useState<{
    isOpen: boolean;
    reviewId: string;
    reviewUserName: string;
  }>({
    isOpen: false,
    reviewId: '',
    reviewUserName: '',
  });

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    
    // Redirect owners to dashboard
    
    setUser(currentUser);
    setLoading(false);

    // Get user location for nearby places
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(loc);
          loadAllData(currentUser.id, loc);
        },
        () => {
          const defaultLoc = { lat: 24.7136, lng: 46.6753 };
          setUserLocation(defaultLoc);
          loadAllData(currentUser.id, defaultLoc);
        }
      );
    } else {
      const defaultLoc = { lat: 24.7136, lng: 46.6753 };
      setUserLocation(defaultLoc);
      loadAllData(currentUser.id, defaultLoc);
    }
  }, [router]);

  const loadAllData = (userId: string, location: { lat: number; lng: number }) => {
    // Nearby places (within 10km)
    const nearby = dataStore.getNearbyPlaces(location.lat, location.lng, 10);
    setNearbyPlaces(nearby.slice(0, 8));

    // Top rated places
    const topRatedData = dataStore.getTopRatedPlaces(8);
    setTopRated(topRatedData);

    // Recent reviews
    const allReviews = dataStore.getAllReviews();
    const recent = allReviews
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 6);
    setRecentReviews(recent);

    // Get user's review history to recommend similar places
    const userReviews = allReviews.filter(r => r.userId === userId);
    const reviewedPlaceIds = userReviews.map(r => r.placeId);
    const reviewedPlaces = reviewedPlaceIds
      .map(id => dataStore.getPlace(id))
      .filter((p): p is Place => p !== undefined);

    // Recommended places based on user's review history
    // Only show recommendations if user has at least 3 reviews (enough data)
    if (userReviews.length >= 3 && reviewedPlaces.length > 0) {
      const categories = reviewedPlaces.map(p => p.category);
      const avgRating = userReviews.reduce((sum, r) => sum + r.rating, 0) / userReviews.length;
      
      const recommended = dataStore.getAllPlaces()
        .filter(p => 
          !reviewedPlaceIds.includes(p.id) &&
          categories.includes(p.category) &&
          dataStore.getAverageRating(p.id) >= avgRating - 0.5
        )
        .sort((a, b) => dataStore.getAverageRating(b.id) - dataStore.getAverageRating(a.id))
        .slice(0, 8);
      
      // Only set if we have at least 5 recommendations
      if (recommended.length >= 5) {
        setRecommendedPlaces(recommended);
      } else {
        setRecommendedPlaces([]);
      }
    } else {
      // Not enough data - don't show recommendations
      setRecommendedPlaces([]);
    }

    // Similar places (same category as reviewed places)
    if (reviewedPlaces.length > 0) {
      const categories = [...new Set(reviewedPlaces.map(p => p.category))];
      const similar = dataStore.getAllPlaces()
        .filter(p => 
          !reviewedPlaceIds.includes(p.id) &&
          categories.some(cat => p.category === cat)
        )
        .sort((a, b) => dataStore.getAverageRating(b.id) - dataStore.getAverageRating(a.id))
        .slice(0, 8);
      setSimilarPlaces(similar);
    }

    // Liked places
    const liked = dataStore.getLikedPlacesList(userId);
    setLikedPlaces(liked.slice(0, 8));

    // New places (created in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newPlacesData = dataStore.getAllPlaces()
      .filter(p => new Date(p.createdAt) > thirtyDaysAgo)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 8);
    setNewPlaces(newPlacesData);
  };

  const refreshData = () => {
    if (user && userLocation) {
      loadAllData(user.id, userLocation);
    }
  };

  if (!user || loading) return null;

  const SectionHeader = ({ icon: Icon, title, subtitle, color = 'from-emerald-600 to-emerald-700' }: { 
    icon: any; 
    title: string; 
    subtitle?: string;
    color?: string;
  }) => (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-4 space-x-reverse">
        <div className={`bg-gradient-to-br ${color} p-2.5 rounded-xl shadow-md flex-shrink-0`}>
          <Icon className="icon-md text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 pb-24">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 space-y-6 sm:space-y-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-2xl shadow-xl p-6 sm:p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24 blur-3xl"></div>
          <div className="relative z-10">
            <div className="flex items-center space-x-4 space-x-reverse mb-3">
              <Shield className="icon-lg sm:icon-xl" />
              <h1 className="text-2xl sm:text-3xl font-bold">مرحباً بك في تقييم موثوق</h1>
            </div>
            <p className="text-white/90 text-base sm:text-lg mb-4">
              اكتشف أفضل الأماكن في المملكة العربية السعودية مع تقييمات موثوقة
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center space-x-2 space-x-reverse bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <Sparkles className="icon-sm" />
                <span className="text-sm font-semibold">تقييمات موثوقة</span>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <MapPin className="icon-sm" />
                <span className="text-sm font-semibold">أماكن حقيقية</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recommended for You - Smart Algorithm */}
        {recommendedPlaces.length >= 5 && (
          <section className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-4 sm:p-6">
            <SectionHeader 
              icon={Zap} 
              title="موصى به لك" 
              subtitle="بناءً على تقييماتك السابقة"
              color="from-[#f59e0b] to-[#d97706]"
            />
            <div className="place-card-grid">
              {recommendedPlaces.map((place) => (
                <PlaceCard key={place.id} place={place} userLocation={userLocation} />
              ))}
            </div>
          </section>
        )}

        {/* Nearby Places */}
        {nearbyPlaces.length > 0 && (
          <section className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-4 sm:p-6">
            <SectionHeader 
              icon={Navigation} 
              title="أماكن قريبة منك" 
              subtitle="اكتشف الأماكن القريبة من موقعك"
              color="from-emerald-600 to-emerald-700"
            />
            <div className="place-card-grid">
              {nearbyPlaces.map((place) => (
                <PlaceCard key={place.id} place={place} userLocation={userLocation} />
              ))}
            </div>
          </section>
        )}

        {/* Top Rated */}
        {topRated.length > 0 && (
          <section className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-4 sm:p-6">
            <SectionHeader 
              icon={TrendingUp} 
              title="الأكثر شعبية" 
              subtitle="الأماكن الأعلى تقييماً"
              color="from-[#10b981] to-[#059669]"
            />
            <div className="place-card-grid">
              {topRated.map((place) => (
                <PlaceCard key={place.id} place={place} userLocation={userLocation} />
              ))}
            </div>
          </section>
        )}

        {/* Similar Places */}
        {similarPlaces.length > 0 && (
          <section className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-4 sm:p-6">
            <SectionHeader 
              icon={Sparkles} 
              title="أماكن مشابهة" 
              subtitle="أماكن من نفس الفئات التي زرت سابقاً"
              color="from-[#8b5cf6] to-[#7c3aed]"
            />
            <div className="place-card-grid">
              {similarPlaces.map((place) => (
                <PlaceCard key={place.id} place={place} userLocation={userLocation} />
              ))}
            </div>
          </section>
        )}

        {/* Liked Places */}
        {likedPlaces.length > 0 && (
          <section className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-4 sm:p-6">
            <SectionHeader 
              icon={Heart} 
              title="أماكنك المفضلة" 
              subtitle="الأماكن التي أضفتها إلى قائمة المفضلة"
              color="from-[#ef4444] to-[#dc2626]"
            />
            <div className="place-card-grid">
              {likedPlaces.map((place) => (
                <PlaceCard key={place.id} place={place} userLocation={userLocation} />
              ))}
            </div>
          </section>
        )}

        {/* New Places */}
        {newPlaces.length > 0 && (
          <section className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-4 sm:p-6">
            <SectionHeader 
              icon={Award} 
              title="أماكن جديدة" 
              subtitle="أضيفت مؤخراً إلى المنصة"
              color="from-[#06b6d4] to-[#0891b2]"
            />
            <div className="place-card-grid">
              {newPlaces.map((place) => (
                <PlaceCard key={place.id} place={place} userLocation={userLocation} />
              ))}
            </div>
          </section>
        )}

        {/* Recent Reviews */}
        {recentReviews.length > 0 && (
          <section className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-4 sm:p-6">
            <SectionHeader 
              icon={Clock} 
              title="آخر التقييمات" 
              subtitle="آخر التقييمات المضافة من المستخدمين"
              color="from-[#8b5cf6] to-[#7c3aed]"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {recentReviews.map((review) => {
                const place = dataStore.getPlace(review.placeId);
                if (!place) return null;
                return (
                  <Link 
                    key={review.id} 
                    href={`/places/${review.placeId}`}
                    className="bg-white rounded-xl shadow-sm p-4 border border-gray-200 hover:shadow-md transition-all"
                  >
                    <div className="user-profile-container-sm mb-3">
                      <Link
                        href={`/profile/${review.userId}`}
                        onClick={(e) => e.stopPropagation()}
                        className="relative hover:opacity-80 transition cursor-pointer flex-shrink-0"
                      >
                        {review.userAvatar ? (
                          <img
                            src={review.userAvatar}
                            alt={review.userName}
                            className="user-avatar-sm"
                          />
                        ) : (
                          <div className="user-avatar-placeholder-sm">
                            {review.userName.charAt(0)}
                          </div>
                        )}
                        {review.isExpert && (
                          <div className="user-badge-sm bg-green-500">
                            <CheckCircle className="user-badge-icon-sm text-white fill-current" />
                          </div>
                        )}
                      </Link>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1.5">
                          <div className="flex items-center space-x-1.5 space-x-reverse min-w-0">
                            <Link
                              href={`/profile/${review.userId}`}
                              onClick={(e) => e.stopPropagation()}
                              className="user-name-sm hover:text-emerald-600 transition"
                            >
                              {review.userName}
                            </Link>
                          </div>
                          <div className="flex items-center space-x-1.5 space-x-reverse flex-shrink-0 mr-1.5">
                            {review.isExpert && (
                              <span className="bg-green-500 text-white px-1.5 py-0.5 rounded-full text-[10px] font-bold">
                                خبير
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mb-1 truncate">
                          راجع <span className="text-emerald-600 font-semibold">{place.name}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 space-x-reverse mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`icon-xs ${
                            i < review.rating 
                              ? 'text-yellow-400 fill-current' 
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="mr-1.5 text-xs font-semibold text-gray-600">{review.rating}.0</span>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed line-clamp-2 mb-2">{review.comment}</p>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                      <span className="text-[9px] text-gray-400">{formatRelativeTime(review.createdAt)}</span>
                      <div className="flex items-center space-x-2 space-x-reverse">
                        {user && user.id !== review.userId && (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              // Handle like
                              const reviewIndex = recentReviews.findIndex(r => r.id === review.id);
                              if (reviewIndex !== -1) {
                                const updatedReview = { ...recentReviews[reviewIndex] };
                                if (!updatedReview.likes) updatedReview.likes = [];
                                const likeIndex = updatedReview.likes.indexOf(user.id);
                                if (likeIndex > -1) {
                                  updatedReview.likes.splice(likeIndex, 1);
                                } else {
                                  updatedReview.likes.push(user.id);
                                }
                                const updatedReviews = [...recentReviews];
                                updatedReviews[reviewIndex] = updatedReview;
                                setRecentReviews(updatedReviews);
                              }
                            }}
                            className={`flex items-center space-x-1 space-x-reverse text-xs px-2 py-1 rounded-lg transition-all ${
                              review.likes?.includes(user?.id || '') 
                                ? 'bg-emerald-600/10 text-emerald-600 hover:bg-emerald-600/20' 
                                : 'text-gray-500 hover:bg-gray-100 hover:text-emerald-600'
                            }`}
                          >
                            <ThumbsUp className={`icon-xs ${review.likes?.includes(user?.id || '') ? 'fill-current' : ''}`} />
                            <span className="font-semibold text-xs">{review.likes?.length || 0}</span>
                          </button>
                        )}
                        {(!user || user.id === review.userId) && review.likes && review.likes.length > 0 && (
                          <div className="flex items-center space-x-1 space-x-reverse text-xs text-gray-500">
                            <ThumbsUp className="icon-xs text-gray-400" />
                            <span>{review.likes.length}</span>
                          </div>
                        )}
                        {(!user || user.id !== review.userId) && (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (!user) {
                                router.push('/login');
                                return;
                              }
                              setReportReviewModal({
                                isOpen: true,
                                reviewId: review.id,
                                reviewUserName: review.userName,
                              });
                            }}
                            className="flex items-center space-x-1 space-x-reverse text-xs text-gray-500 hover:text-red-500 hover:bg-red-50 px-2 py-1 rounded-lg transition-all"
                            title="الإبلاغ عن التقييم"
                          >
                            <Flag className="icon-xs" />
                          </button>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Empty State */}
        {nearbyPlaces.length === 0 && topRated.length === 0 && recommendedPlaces.length === 0 && (
          <div className="text-center py-16">
            <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">لا توجد أماكن بعد</h3>
            <p className="text-gray-500">ابدأ باكتشاف الأماكن القريبة منك</p>
          </div>
        )}
      </main>

      {/* Floating Create Button */}
      {dataStore.getPlacesByOwner(user.id).length > 0 && (
        <button
          onClick={() => setShowCreateModal(true)}
          className="fixed bottom-28 left-4 sm:left-8 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-4 rounded-full shadow-2xl hover:shadow-emerald-600/50 hover:scale-110 transition-all duration-300 z-40"
          aria-label="إنشاء مكان جديد"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}

      <CreatePlaceModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={refreshData}
      />

      <TabNavigation />

      {/* Toast Container */}
      <ToastContainer />

      {/* Report Review Modal */}
      <ReportReviewModal
        isOpen={reportReviewModal.isOpen}
        reviewUserName={reportReviewModal.reviewUserName}
        onConfirm={(reason) => {
          const review = recentReviews.find(r => r.id === reportReviewModal.reviewId);
          if (review) {
            review.reports = (review.reports || 0) + 1;
            setRecentReviews([...recentReviews]);
            showToast('تم الإبلاغ عن التقييم. شكراً لملاحظاتك.', 'success');
          }
          setReportReviewModal({ ...reportReviewModal, isOpen: false });
        }}
        onCancel={() => setReportReviewModal({ ...reportReviewModal, isOpen: false })}
      />
    </div>
  );
}
