'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TabNavigation from '@/components/TabNavigation';
import Navbar from '@/components/Navbar';
import PlaceCard from '@/components/PlaceCard';
import ReviewCard from '@/components/ReviewCard';
import { getCurrentUser } from '@/lib/auth';
import { dataStore } from '@/lib/data';
import { formatRelativeTime } from '@/lib/dateUtils';
import { Place, Review } from '@/types';
import { Search, Star, Filter, TrendingUp, FileText, ThumbsUp, Flame, Sparkles, Clock, Award, Heart, Eye, ArrowRight, Flag, Compass, Mail, Phone, User as UserIcon, Calendar as CalendarIcon, MapPin } from 'lucide-react';
import { categories } from '@/lib/mockData';
import Link from 'next/link';
import { useToast } from '@/components/Toast';
import ReportReviewModal from '@/components/ReportReviewModal';

export default function ExplorePage() {
  const router = useRouter();
  const [user, setUser] = useState(getCurrentUser());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [places, setPlaces] = useState<Place[]>([]);
  const [recentReviews, setRecentReviews] = useState<Review[]>([]);
  const [mostInteractiveReviews, setMostInteractiveReviews] = useState<Review[]>([]);
  const [activeTab, setActiveTab] = useState<'places' | 'reviews' | 'trending'>('places');
  const [showTopRated, setShowTopRated] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
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
    loadData();
  }, [router, selectedCategory, showTopRated]);

  useEffect(() => {
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
  }, []);

  const loadData = () => {
    // Load places
    let allPlaces = showTopRated 
      ? dataStore.getTopRatedPlaces(50)
      : dataStore.getAllPlaces();
    
    if (selectedCategory) {
      allPlaces = allPlaces.filter(p => p.category === selectedCategory);
    }
    
    setPlaces(allPlaces);

    // Load recent reviews
    const allReviews = dataStore.getAllReviews();
    const recent = allReviews
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);
    setRecentReviews(recent);

    // Load most interactive reviews (by likes count)
    const mostInteractive = allReviews
      .filter(r => r.likes && r.likes.length > 0)
      .sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0))
      .slice(0, 10);
    setMostInteractiveReviews(mostInteractive);
  };

  const filteredPlaces = places.filter(place =>
    place.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    place.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    place.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredReviews = activeTab === 'reviews' 
    ? recentReviews.filter(review => {
        const place = dataStore.getPlace(review.placeId);
        return place && (
          place.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          review.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
          review.userName.toLowerCase().includes(searchTerm.toLowerCase())
        );
      })
    : mostInteractiveReviews.filter(review => {
        const place = dataStore.getPlace(review.placeId);
        return place && (
          place.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          review.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
          review.userName.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });


  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/30 to-gray-50 pb-24">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 text-white py-6 sm:py-8 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 flex items-center justify-center space-x-2 sm:space-x-3 space-x-reverse text-white">
              <Compass className="icon-lg sm:icon-xl text-white" />
              <span className="text-white">استكشف الأماكن</span>
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-white">اكتشف أفضل الأماكن والتقييمات الأكثر تفاعلاً</p>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-white/70 icon-sm sm:icon-md" />
            <input
              type="text"
              placeholder="ابحث عن مكان أو تقييم..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 sm:pr-12 pl-4 py-3 sm:py-4 rounded-full border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/30 transition-all text-base sm:text-lg"
            />
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6">
        {/* Main Tabs */}
        <div className="mb-4 sm:mb-6 bg-white rounded-3xl shadow-xl border border-gray-200 p-2">
          <div className="flex items-center space-x-2 space-x-reverse overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setActiveTab('places')}
              className={`flex items-center justify-center space-x-1.5 sm:space-x-2 space-x-reverse px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl whitespace-nowrap transition-all font-semibold text-sm sm:text-base flex-shrink-0 min-h-[44px] ${
                activeTab === 'places'
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'text-slate-600 hover:bg-gray-100'
              }`}
            >
              <Search className="icon-sm sm:icon-md" />
              <span>الأماكن</span>
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`flex items-center justify-center space-x-1.5 sm:space-x-2 space-x-reverse px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl whitespace-nowrap transition-all font-semibold text-sm sm:text-base flex-shrink-0 min-h-[44px] ${
                activeTab === 'reviews'
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'text-slate-600 hover:bg-gray-100'
              }`}
            >
              <FileText className="icon-sm sm:icon-md" />
              <span>أحدث التقييمات</span>
            </button>
            <button
              onClick={() => setActiveTab('trending')}
              className={`flex items-center justify-center space-x-1.5 sm:space-x-2 space-x-reverse px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl whitespace-nowrap transition-all font-semibold text-sm sm:text-base flex-shrink-0 min-h-[44px] ${
                activeTab === 'trending'
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'text-slate-600 hover:bg-gray-100'
              }`}
            >
              <Flame className="icon-sm sm:icon-md" />
              <span>الأكثر تفاعلاً</span>
            </button>
          </div>
        </div>

        {/* Filters - Only show for places */}
        {activeTab === 'places' && (
          <div className="mb-6 space-y-4">
            <div className="flex items-center space-x-2 space-x-reverse">
              <Filter className="icon-sm icon-primary" />
              <span className="font-semibold text-slate-700 text-sm sm:text-base">الفئات:</span>
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-3 sm:-mx-4 px-3 sm:px-4">
              <button
                onClick={() => {
                  setSelectedCategory('');
                  setShowTopRated(false);
                }}
                className={`flex items-center justify-center px-3 py-2 rounded-full whitespace-nowrap transition-all flex-shrink-0 text-xs font-semibold ${
                  !selectedCategory && !showTopRated
                    ? 'bg-emerald-500 text-white shadow-md'
                    : 'bg-white text-slate-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <span>الكل</span>
              </button>
              <button
                onClick={() => {
                  setShowTopRated(true);
                  setSelectedCategory('');
                }}
                className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-full whitespace-nowrap transition-all flex-shrink-0 text-xs font-semibold ${
                  showTopRated
                    ? 'bg-emerald-500 text-white shadow-md'
                    : 'bg-white text-slate-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <Star className="w-3.5 h-3.5" />
                <span>الأعلى تقييماً</span>
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => {
                    setSelectedCategory(category.nameAr);
                    setShowTopRated(false);
                  }}
                  className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-full whitespace-nowrap transition-all flex-shrink-0 text-xs font-semibold ${
                    selectedCategory === category.nameAr
                      ? 'bg-emerald-500 text-white shadow-md'
                      : 'bg-white text-slate-700 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  <span className="text-sm leading-none" style={{ fontFamily: 'Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif' }}>{category.icon}</span>
                  <span>{category.nameAr}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Places Tab */}
        {activeTab === 'places' && (
          <>
            {filteredPlaces.length > 0 ? (
              <div className="explore-card-grid">
                {filteredPlaces.map((place) => (
                  <PlaceCard key={place.id} place={place} userLocation={userLocation} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-3xl shadow-xl border border-gray-200">
                <Search className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-2xl text-slate-500 mb-2">لا توجد نتائج</p>
                <p className="text-slate-400">جرب البحث بكلمات مختلفة</p>
              </div>
            )}
          </>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div>
            {filteredReviews.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {filteredReviews.map((review) => {
                  const place = dataStore.getPlace(review.placeId);
                  if (!place) return null;
                  return (
                    <div key={review.id}>
                      <ReviewCard review={review} />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-3xl shadow-xl border border-gray-200">
                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-2xl text-slate-500 mb-2">لا توجد تقييمات</p>
                <p className="text-slate-400">جرب البحث بكلمات مختلفة</p>
              </div>
            )}
          </div>
        )}

        {/* Trending/Most Interactive Tab */}
        {activeTab === 'trending' && (
          <div>
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Flame className="w-6 h-6 text-emerald-500" />
                <h3 className="font-bold text-slate-800">التقييمات الأكثر تفاعلاً</h3>
              </div>
              <p className="text-sm text-slate-600 mt-1">التقييمات التي حصلت على أكبر عدد من الإعجابات</p>
            </div>

            {filteredReviews.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {filteredReviews.map((review) => {
                  const place = dataStore.getPlace(review.placeId);
                  if (!place) return null;
                  return (
                    <div key={review.id}>
                      <ReviewCard review={review} />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-3xl shadow-xl border border-gray-200">
                <Flame className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-2xl text-slate-500 mb-2">لا توجد تقييمات تفاعلية</p>
                <p className="text-slate-400">ابدأ بإعجاب التقييمات لتراها هنا</p>
              </div>
            )}
          </div>
        )}
      </main>

      <TabNavigation />

      {/* Toast Container */}
      <ToastContainer />

      {/* Report Review Modal */}
      <ReportReviewModal
        isOpen={reportReviewModal.isOpen}
        reviewUserName={reportReviewModal.reviewUserName}
        onConfirm={(reason) => {
          const review = recentReviews.find(r => r.id === reportReviewModal.reviewId) || 
                        mostInteractiveReviews.find(r => r.id === reportReviewModal.reviewId);
          if (review) {
            review.reports = (review.reports || 0) + 1;
            setRecentReviews([...recentReviews]);
            setMostInteractiveReviews([...mostInteractiveReviews]);
            showToast('تم الإبلاغ عن التقييم. شكراً لملاحظاتك.', 'success');
          }
          setReportReviewModal({ ...reportReviewModal, isOpen: false });
        }}
        onCancel={() => setReportReviewModal({ ...reportReviewModal, isOpen: false })}
      />
    </div>
  );
}
