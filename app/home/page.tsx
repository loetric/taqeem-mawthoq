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
import { MapPin, Plus, TrendingUp, Navigation, Shield, Sparkles, Clock, Star, CheckCircle, Heart, Zap, Award, ThumbsUp, Flag, Building2, FileText, Flame, Users, Compass, BadgeCheck, Target, Layers, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/components/Toast';
import ReportReviewModal from '@/components/ReportReviewModal';

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState(getCurrentUser());
  const [nearbyPlaces, setNearbyPlaces] = useState<Place[]>([]);
  const [recommendedPlaces, setRecommendedPlaces] = useState<Place[]>([]);
  const [similarPlaces, setSimilarPlaces] = useState<Place[]>([]);
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
    
    return places;
  }, [nearbyPlaces, recommendedPlaces, topRated, newPlaces, similarPlaces]);

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
        {/* Hero Section - Compact */}
        <div className="relative bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 rounded-3xl shadow-2xl p-5 sm:p-6 text-white overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24 blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full -ml-20 -mb-20 blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          
          <div className="relative z-10">
            <div className="flex flex-col items-center text-center">
              {/* Main Heading */}
              <h1 className="text-2xl sm:text-3xl font-bold mb-3 leading-tight text-emerald-50">
                تقييمات موثوقة
                <br />
                <span className="text-white">لأماكن موثوقة</span>
              </h1>
              
              {/* Description */}
              <p className="text-emerald-50 text-sm sm:text-base max-w-2xl mx-auto mb-5 leading-relaxed">
                منصة <span className="font-bold text-white">تقييم موثوق</span> تجمع بين دقة التقييمات وشفافية المعلومات
                <br className="hidden sm:block" />
                لتساعدك في اتخاذ قرارات مدروسة حول الأماكن والخدمات
              </p>

              {/* Key Features */}
              <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
                <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/20">
                  <CheckCircle className="w-4 h-4 text-emerald-50" />
                  <span className="text-xs sm:text-sm font-medium text-emerald-50">تقييمات موثوقة</span>
                </div>
                <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/20">
                  <Shield className="w-4 h-4 text-emerald-50" />
                  <span className="text-xs sm:text-sm font-medium text-emerald-50">معلومات شفافة</span>
                </div>
                <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/20">
                  <Users className="w-4 h-4 text-emerald-50" />
                  <span className="text-xs sm:text-sm font-medium text-emerald-50">مجتمع نشط</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setActiveFilter('all')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm whitespace-nowrap transition-all flex-shrink-0 ${
              activeFilter === 'all'
                ? 'bg-emerald-500 text-white shadow-lg'
                : 'bg-white text-slate-700 hover:bg-emerald-50 hover:text-emerald-600 shadow-md'
            }`}
          >
            <Compass className={`w-4 h-4 flex-shrink-0 ${activeFilter === 'all' ? 'text-white' : 'text-emerald-600'}`} />
            <span>الكل</span>
          </button>
          <button
            onClick={() => setActiveFilter('places')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm whitespace-nowrap transition-all flex-shrink-0 ${
              activeFilter === 'places'
                ? 'bg-emerald-500 text-white shadow-lg'
                : 'bg-white text-slate-700 hover:bg-emerald-50 hover:text-emerald-600 shadow-md'
            }`}
          >
            <MapPin className={`w-4 h-4 flex-shrink-0 ${activeFilter === 'places' ? 'text-white' : 'text-emerald-600'}`} />
            <span>الأماكن</span>
          </button>
          <button
            onClick={() => setActiveFilter('reviews')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm whitespace-nowrap transition-all flex-shrink-0 ${
              activeFilter === 'reviews'
                ? 'bg-emerald-500 text-white shadow-lg'
                : 'bg-white text-slate-700 hover:bg-emerald-50 hover:text-emerald-600 shadow-md'
            }`}
          >
            <FileText className={`w-4 h-4 flex-shrink-0 ${activeFilter === 'reviews' ? 'text-white' : 'text-emerald-600'}`} />
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
                    <div className="flex items-center gap-6">
                      <div className="relative p-4 rounded-3xl backdrop-blur-xl bg-gradient-to-br from-emerald-500/20 via-emerald-400/15 to-emerald-600/20 border border-emerald-300/30 shadow-lg shadow-emerald-500/20 flex-shrink-0 before:absolute before:inset-0 before:rounded-3xl before:bg-gradient-to-br before:from-white/20 before:to-transparent before:opacity-50">
                        <Navigation className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-600 relative z-10" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-1">أماكن قريبة منك</h2>
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
                <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-100 rounded-full -mr-20 -mt-20 blur-2xl"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-6">
                      <div className="relative p-4 rounded-3xl backdrop-blur-xl bg-gradient-to-br from-emerald-500/20 via-emerald-400/15 to-emerald-600/20 border border-emerald-300/30 shadow-lg shadow-emerald-500/20 flex-shrink-0 before:absolute before:inset-0 before:rounded-3xl before:bg-gradient-to-br before:from-white/20 before:to-transparent before:opacity-50">
                        <Target className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-600 relative z-10" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-1">موصى به لك</h2>
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
              <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-6 sm:p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-100 rounded-full -mr-20 -mt-20 blur-2xl"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-6">
                      <div className="relative p-4 rounded-3xl backdrop-blur-xl bg-gradient-to-br from-emerald-500/20 via-emerald-400/15 to-emerald-600/20 border border-emerald-300/30 shadow-lg shadow-emerald-500/20 flex-shrink-0 before:absolute before:inset-0 before:rounded-3xl before:bg-gradient-to-br before:from-white/20 before:to-transparent before:opacity-50">
                        <Flame className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-600 relative z-10" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-1">الأكثر شعبية</h2>
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
              </div>
            )}

            {/* New Places */}
            {newPlaces.length > 0 && (
              <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-6 sm:p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-100 rounded-full -mr-20 -mt-20 blur-2xl"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-6">
                      <div className="relative p-4 rounded-3xl backdrop-blur-xl bg-gradient-to-br from-emerald-500/20 via-emerald-400/15 to-emerald-600/20 border border-emerald-300/30 shadow-lg shadow-emerald-500/20 flex-shrink-0 before:absolute before:inset-0 before:rounded-3xl before:bg-gradient-to-br before:from-white/20 before:to-transparent before:opacity-50">
                        <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-600 relative z-10" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-1">أماكن جديدة</h2>
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
              </div>
            )}

            {/* Similar Places */}
            {similarPlaces.length > 0 && (
              <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-6 sm:p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-100 rounded-full -mr-20 -mt-20 blur-2xl"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-6">
                      <div className="relative p-4 rounded-3xl backdrop-blur-xl bg-gradient-to-br from-emerald-500/20 via-emerald-400/15 to-emerald-600/20 border border-emerald-300/30 shadow-lg shadow-emerald-500/20 flex-shrink-0 before:absolute before:inset-0 before:rounded-3xl before:bg-gradient-to-br before:from-white/20 before:to-transparent before:opacity-50">
                        <Layers className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-600 relative z-10" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-1">أماكن مشابهة</h2>
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
              </div>
            )}

          </div>
        )}

        {/* Reviews Section */}
        {activeFilter !== 'places' && recentReviews.length > 0 && (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-6 sm:p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-100 rounded-full -mr-20 -mt-20 blur-2xl"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-6">
                  <div className="relative p-4 rounded-3xl backdrop-blur-xl bg-gradient-to-br from-emerald-500/20 via-emerald-400/15 to-emerald-600/20 border border-emerald-300/30 shadow-lg shadow-emerald-500/20 flex-shrink-0 before:absolute before:inset-0 before:rounded-3xl before:bg-gradient-to-br before:from-white/20 before:to-transparent before:opacity-50">
                    <BookOpen className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-600 relative z-10" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-1">آخر التقييمات</h2>
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
              className="inline-flex items-center gap-2 bg-emerald-500 text-white px-5 py-3 rounded-xl font-semibold hover:bg-emerald-600 transition-all shadow-lg hover:shadow-xl"
            >
              <Compass className="w-5 h-5 flex-shrink-0" />
              <span>استكشف الأماكن</span>
            </Link>
          </div>
        )}
      </main>

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
