'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import TabNavigation from '@/components/TabNavigation';
import Navbar from '@/components/Navbar';
import CreatePlaceModal from '@/components/CreatePlaceModal';
import PlaceCard from '@/components/PlaceCard';
import ReviewCard from '@/components/ReviewCard';
import { getCurrentUser } from '@/lib/auth';
import { dataStore } from '@/lib/data';
import { formatRelativeTime } from '@/lib/dateUtils';
import { Place, Review } from '@/types';
import { MapPin, Plus, TrendingUp, Navigation, Shield, Sparkles, Clock, Star, CheckCircle, Heart, Zap, Award, ThumbsUp, Flag, Building2, MessageSquare, Flame, Users, Compass } from 'lucide-react';
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
  const [activeFilter, setActiveFilter] = useState<'all' | 'places' | 'reviews'>('all');
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
    // Nearby places (within 10km) - sorted by distance
    const nearby = dataStore.getNearbyPlaces(location.lat, location.lng, 10);
    // Sort by distance (closest first)
    const nearbyWithDistance = nearby.map(place => {
      if (!place.location) return { place, distance: Infinity };
      const R = 6371; // Earth's radius in km
      const dLat = (place.location.lat - location.lat) * Math.PI / 180;
      const dLng = (place.location.lng - location.lng) * Math.PI / 180;
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(location.lat * Math.PI / 180) * Math.cos(place.location.lat * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;
      return { place, distance };
    });
    nearbyWithDistance.sort((a, b) => a.distance - b.distance);
    setNearbyPlaces(nearbyWithDistance.map(item => item.place).slice(0, 12));

    // Top rated places
    const topRatedData = dataStore.getTopRatedPlaces(12);
    setTopRated(topRatedData);

    // Recent reviews
    const allReviews = dataStore.getAllReviews();
    const recent = allReviews
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 12);
    setRecentReviews(recent);

    // Get user's review history to recommend similar places
    const userReviews = allReviews.filter(r => r.userId === userId);
    const reviewedPlaceIds = userReviews.map(r => r.placeId);
    const reviewedPlaces = reviewedPlaceIds
      .map(id => dataStore.getPlace(id))
      .filter((p): p is Place => p !== undefined);

    // Recommended places based on user's review history
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
        .slice(0, 12);
      
      if (recommended.length >= 5) {
        setRecommendedPlaces(recommended);
      } else {
        setRecommendedPlaces([]);
      }
    } else {
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
        .slice(0, 12);
      setSimilarPlaces(similar);
    }

    // Liked places
    const liked = dataStore.getLikedPlacesList(userId);
    setLikedPlaces(liked.slice(0, 12));

    // New places (created in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newPlacesData = dataStore.getAllPlaces()
      .filter(p => new Date(p.createdAt) > thirtyDaysAgo)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 12);
    setNewPlaces(newPlacesData);
  };

  const refreshData = () => {
    if (user && userLocation) {
      loadAllData(user.id, userLocation);
    }
  };

  // Combine all places and sort by priority: nearby first, then by rating
  const allPlaces = useMemo(() => {
    const places: Place[] = [];
    
    // Add nearby places first (highest priority)
    nearbyPlaces.forEach(place => {
      if (!places.find(p => p.id === place.id)) {
        places.push(place);
      }
    });
    
    // Add recommended places
    recommendedPlaces.forEach(place => {
      if (!places.find(p => p.id === place.id)) {
        places.push(place);
      }
    });
    
    // Add top rated places
    topRated.forEach(place => {
      if (!places.find(p => p.id === place.id)) {
        places.push(place);
      }
    });
    
    // Add new places
    newPlaces.forEach(place => {
      if (!places.find(p => p.id === place.id)) {
        places.push(place);
      }
    });
    
    // Add similar places
    similarPlaces.forEach(place => {
      if (!places.find(p => p.id === place.id)) {
        places.push(place);
      }
    });
    
    // Add liked places
    likedPlaces.forEach(place => {
      if (!places.find(p => p.id === place.id)) {
        places.push(place);
      }
    });
    
    return places;
  }, [nearbyPlaces, recommendedPlaces, topRated, newPlaces, similarPlaces, likedPlaces]);

  const stats = useMemo(() => ({
    totalPlaces: dataStore.getAllPlaces().length,
    totalReviews: dataStore.getAllReviews().length,
    avgRating: dataStore.getAllPlaces().reduce((sum, p) => sum + dataStore.getAverageRating(p.id), 0) / Math.max(dataStore.getAllPlaces().length, 1),
  }), []);

  if (!user || loading) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/30 to-gray-50 pb-24">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Hero Section - Enhanced */}
        <div className="relative bg-gradient-to-br from-emerald-500 via-emerald-600 to-slate-700 rounded-3xl shadow-2xl p-6 sm:p-8 text-white overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-56 h-56 bg-white/10 rounded-full -ml-28 -mb-28 blur-3xl animate-pulse delay-1000"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col items-center text-center">
              <div className="mb-6">
                <div className="inline-flex p-4 bg-white/20 backdrop-blur-sm rounded-2xl mb-4">
                  <Shield className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3">اكتشف أفضل الأماكن</h1>
                <p className="text-white/90 text-base sm:text-lg max-w-2xl mx-auto">
                  منصة موثوقة لتقييم الأماكن والخدمات في المملكة العربية السعودية
                </p>
              </div>
              
              {/* Stats Cards - Compact */}
              <div className="grid grid-cols-3 gap-3 sm:gap-4 w-full max-w-md">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/30">
                  <div className="text-xl sm:text-2xl font-bold">{stats.totalPlaces}</div>
                  <div className="text-xs text-white/80 mt-1">مكان</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/30">
                  <div className="text-xl sm:text-2xl font-bold">{stats.totalReviews}</div>
                  <div className="text-xs text-white/80 mt-1">تقييم</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/30">
                  <div className="text-xl sm:text-2xl font-bold">{stats.avgRating.toFixed(1)}</div>
                  <div className="text-xs text-white/80 mt-1">متوسط</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Filters */}
        <div className="flex items-center space-x-3 space-x-reverse overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setActiveFilter('all')}
            className={`flex items-center space-x-2 space-x-reverse px-4 py-2.5 rounded-xl font-semibold text-sm whitespace-nowrap transition-all flex-shrink-0 ${
              activeFilter === 'all'
                ? 'bg-emerald-500 text-white shadow-lg scale-105'
                : 'bg-white text-slate-700 hover:bg-gray-50 shadow-md'
            }`}
          >
            <Compass className="w-4 h-4 text-emerald-600" />
            <span>الكل</span>
          </button>
          <button
            onClick={() => setActiveFilter('places')}
            className={`flex items-center space-x-2 space-x-reverse px-4 py-2.5 rounded-xl font-semibold text-sm whitespace-nowrap transition-all flex-shrink-0 ${
              activeFilter === 'places'
                ? 'bg-emerald-500 text-white shadow-lg scale-105'
                : 'bg-white text-slate-700 hover:bg-gray-50 shadow-md'
            }`}
          >
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span>الأماكن</span>
          </button>
          <button
            onClick={() => setActiveFilter('reviews')}
            className={`flex items-center space-x-2 space-x-reverse px-4 py-2.5 rounded-xl font-semibold text-sm whitespace-nowrap transition-all flex-shrink-0 ${
              activeFilter === 'reviews'
                ? 'bg-emerald-500 text-white shadow-lg scale-105'
                : 'bg-white text-slate-700 hover:bg-gray-50 shadow-md'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            <span>التقييمات</span>
          </button>
        </div>

        {/* Places Section - Priority: Nearby First */}
        {activeFilter !== 'reviews' && allPlaces.length > 0 && (
          <div className="space-y-8">
            {/* Nearby Places - Highest Priority */}
            {nearbyPlaces.length > 0 && (
              <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-6 sm:p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-100 rounded-full -mr-20 -mt-20 blur-2xl"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <div className="p-3 bg-emerald-500 rounded-2xl shadow-lg">
                        <Navigation className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-800">أماكن قريبة منك</h2>
                        <p className="text-sm text-slate-600">الأقرب إليك أولاً</p>
                      </div>
                    </div>
                  </div>
                  <div className="place-card-grid gap-5 sm:gap-6">
                    {nearbyPlaces.map((place) => (
                      <PlaceCard key={place.id} place={place} userLocation={userLocation} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Recommended Places */}
            {recommendedPlaces.length >= 5 && (
              <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-6 sm:p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-amber-100 rounded-full -mr-20 -mt-20 blur-2xl"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <div className="p-3 bg-amber-500 rounded-2xl shadow-lg">
                        <Zap className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-800">موصى به لك</h2>
                        <p className="text-sm text-slate-600">بناءً على تقييماتك السابقة</p>
                      </div>
                    </div>
                  </div>
                  <div className="place-card-grid gap-5 sm:gap-6">
                    {recommendedPlaces.slice(0, 8).map((place) => (
                      <PlaceCard key={place.id} place={place} userLocation={userLocation} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Top Rated */}
            {topRated.length > 0 && (
              <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <div className="p-3 bg-emerald-500 rounded-2xl shadow-lg">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-slate-800">الأكثر شعبية</h2>
                      <p className="text-sm text-slate-600">الأماكن الأعلى تقييماً</p>
                    </div>
                  </div>
                </div>
                <div className="place-card-grid gap-5 sm:gap-6">
                  {topRated.slice(0, 8).map((place) => (
                    <PlaceCard key={place.id} place={place} userLocation={userLocation} />
                  ))}
                </div>
              </div>
            )}

            {/* New Places */}
            {newPlaces.length > 0 && (
              <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <div className="p-3 bg-cyan-500 rounded-2xl shadow-lg">
                      <Award className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-slate-800">أماكن جديدة</h2>
                      <p className="text-sm text-slate-600">أضيفت مؤخراً إلى المنصة</p>
                    </div>
                  </div>
                </div>
                <div className="place-card-grid gap-5 sm:gap-6">
                  {newPlaces.slice(0, 8).map((place) => (
                    <PlaceCard key={place.id} place={place} userLocation={userLocation} />
                  ))}
                </div>
              </div>
            )}

            {/* Similar Places */}
            {similarPlaces.length > 0 && (
              <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <div className="p-3 bg-purple-500 rounded-2xl shadow-lg">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-slate-800">أماكن مشابهة</h2>
                      <p className="text-sm text-slate-600">أماكن من نفس الفئات التي زرت سابقاً</p>
                    </div>
                  </div>
                </div>
                <div className="place-card-grid gap-5 sm:gap-6">
                  {similarPlaces.slice(0, 8).map((place) => (
                    <PlaceCard key={place.id} place={place} userLocation={userLocation} />
                  ))}
                </div>
              </div>
            )}

            {/* Liked Places */}
            {likedPlaces.length > 0 && (
              <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <div className="p-3 bg-red-500 rounded-2xl shadow-lg">
                      <Heart className="w-6 h-6 text-white fill-current" />
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-slate-800">مفضلاتك</h2>
                      <p className="text-sm text-slate-600">الأماكن التي أضفتها إلى قائمة المفضلة</p>
                    </div>
                  </div>
                </div>
                <div className="place-card-grid gap-5 sm:gap-6">
                  {likedPlaces.slice(0, 8).map((place) => (
                    <PlaceCard key={place.id} place={place} userLocation={userLocation} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Reviews Section */}
        {activeFilter !== 'places' && recentReviews.length > 0 && (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="p-3 bg-emerald-500 rounded-2xl shadow-lg">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-800">آخر التقييمات</h2>
                  <p className="text-sm text-slate-600">آخر التقييمات المضافة من المستخدمين</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {recentReviews.map((review) => (
                <div key={review.id} className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-5 sm:p-6 border border-gray-200 hover:shadow-lg transition-all">
                  <ReviewCard review={review} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {allPlaces.length === 0 && recentReviews.length === 0 && (
          <div className="text-center py-16 bg-white rounded-3xl shadow-xl border border-gray-200">
            <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <MapPin className="w-12 h-12 text-emerald-500" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">لا توجد محتويات بعد</h3>
            <p className="text-slate-500 mb-6">ابدأ باكتشاف الأماكن والتقييمات</p>
            <Link
              href="/explore"
              className="inline-flex items-center space-x-2 space-x-reverse bg-emerald-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-600 transition-all shadow-lg hover:shadow-xl"
            >
              <Compass className="w-5 h-5" />
              <span>استكشف الأماكن</span>
            </Link>
          </div>
        )}
      </main>

      {/* Floating Create Button */}
      {dataStore.getPlacesByOwner(user.id).length > 0 && (
        <button
          onClick={() => setShowCreateModal(true)}
          className="fixed bottom-28 left-4 sm:left-8 bg-emerald-500 text-white p-4 rounded-full shadow-2xl hover:bg-emerald-600 hover:shadow-emerald-500/50 hover:scale-110 transition-all duration-300 z-40"
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
