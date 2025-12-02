'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TabNavigation from '@/components/TabNavigation';
import Navbar from '@/components/Navbar';
import PlaceCard from '@/components/PlaceCard';
import { getCurrentUser } from '@/lib/auth';
import { dataStore } from '@/lib/data';
import { formatRelativeTime } from '@/lib/dateUtils';
import { Place, Review } from '@/types';
import { Search, Star, Filter, TrendingUp, MessageSquare, ThumbsUp, Flame, Sparkles, Clock, Award, Heart, Eye, ArrowRight, Flag } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 pb-24">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-[#0369a1] text-white py-6 sm:py-8 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 flex items-center justify-center space-x-2 sm:space-x-3 space-x-reverse">
              <Sparkles className="icon-lg sm:icon-xl" />
              <span>استكشف الأماكن</span>
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-white/90">اكتشف أفضل الأماكن والتقييمات الأكثر تفاعلاً</p>
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
        <div className="mb-4 sm:mb-6 bg-white rounded-2xl shadow-lg border border-gray-100 p-2">
          <div className="flex items-center space-x-2 space-x-reverse overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setActiveTab('places')}
              className={`flex items-center justify-center space-x-1.5 sm:space-x-2 space-x-reverse px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl whitespace-nowrap transition-all font-semibold text-sm sm:text-base flex-shrink-0 min-h-[44px] ${
                activeTab === 'places'
                  ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Search className="icon-sm sm:icon-md" />
              <span>الأماكن</span>
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`flex items-center justify-center space-x-1.5 sm:space-x-2 space-x-reverse px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl whitespace-nowrap transition-all font-semibold text-sm sm:text-base flex-shrink-0 min-h-[44px] ${
                activeTab === 'reviews'
                  ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <MessageSquare className="icon-sm sm:icon-md" />
              <span>أحدث التقييمات</span>
            </button>
            <button
              onClick={() => setActiveTab('trending')}
              className={`flex items-center justify-center space-x-1.5 sm:space-x-2 space-x-reverse px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl whitespace-nowrap transition-all font-semibold text-sm sm:text-base flex-shrink-0 min-h-[44px] ${
                activeTab === 'trending'
                  ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
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
              <span className="font-semibold text-gray-700 text-sm sm:text-base">الفئات:</span>
            </div>
            
            <div className="flex space-x-2 space-x-reverse overflow-x-auto pb-2 scrollbar-hide -mx-3 sm:-mx-4 px-3 sm:px-4">
              <button
                onClick={() => {
                  setSelectedCategory('');
                  setShowTopRated(false);
                }}
                className={`flex items-center justify-center space-x-1.5 space-x-reverse px-4 py-2.5 rounded-full whitespace-nowrap transition-all flex-shrink-0 text-sm font-semibold min-h-[44px] ${
                  !selectedCategory && !showTopRated
                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <span>الكل</span>
              </button>
              <button
                onClick={() => {
                  setShowTopRated(true);
                  setSelectedCategory('');
                }}
                className={`flex items-center justify-center space-x-1.5 space-x-reverse px-4 py-2.5 rounded-full whitespace-nowrap transition-all flex-shrink-0 text-sm font-semibold min-h-[44px] ${
                  showTopRated
                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <Star className="icon-sm" />
                <span>الأعلى تقييماً</span>
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => {
                    setSelectedCategory(category.nameAr);
                    setShowTopRated(false);
                  }}
                  className={`flex items-center justify-center space-x-1.5 space-x-reverse px-4 py-2.5 rounded-full whitespace-nowrap transition-all flex-shrink-0 text-sm font-semibold min-h-[44px] ${
                    selectedCategory === category.nameAr
                      ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  <span className="text-base sm:text-lg leading-none" style={{ fontFamily: 'Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif' }}>{category.icon}</span>
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
              <div className="place-card-grid">
                {filteredPlaces.map((place) => (
                  <PlaceCard key={place.id} place={place} userLocation={userLocation} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
                <Search className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-2xl text-gray-500 mb-2">لا توجد نتائج</p>
                <p className="text-gray-400">جرب البحث بكلمات مختلفة</p>
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
                              <Award className="user-badge-icon-sm text-white fill-current" />
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
                            className={`w-3.5 h-3.5 ${
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
                                const reviewIndex = recentReviews.findIndex(r => r.id === review.id) !== -1 
                                  ? recentReviews.findIndex(r => r.id === review.id)
                                  : mostInteractiveReviews.findIndex(r => r.id === review.id);
                                if (reviewIndex !== -1) {
                                  const reviewsList = recentReviews.findIndex(r => r.id === review.id) !== -1 ? recentReviews : mostInteractiveReviews;
                                  const updatedReview = { ...reviewsList[reviewIndex] };
                                  if (!updatedReview.likes) updatedReview.likes = [];
                                  const likeIndex = updatedReview.likes.indexOf(user.id);
                                  if (likeIndex > -1) {
                                    updatedReview.likes.splice(likeIndex, 1);
                                  } else {
                                    updatedReview.likes.push(user.id);
                                  }
                                  if (recentReviews.findIndex(r => r.id === review.id) !== -1) {
                                    const updatedReviews = [...recentReviews];
                                    updatedReviews[reviewIndex] = updatedReview;
                                    setRecentReviews(updatedReviews);
                                  } else {
                                    const updatedReviews = [...mostInteractiveReviews];
                                    updatedReviews[reviewIndex] = updatedReview;
                                    setMostInteractiveReviews(updatedReviews);
                                  }
                                }
                              }}
                              className={`flex items-center space-x-1 space-x-reverse text-xs px-2 py-1 rounded-lg transition-all ${
                                review.likes?.includes(user?.id || '') 
                                  ? 'bg-emerald-600/10 text-emerald-600 hover:bg-emerald-600/20' 
                                  : 'text-gray-500 hover:bg-gray-100 hover:text-emerald-600'
                              }`}
                            >
                              <ThumbsUp className={`w-3.5 h-3.5 ${review.likes?.includes(user?.id || '') ? 'fill-current' : ''}`} />
                              <span className="font-semibold text-xs">{review.likes?.length || 0}</span>
                            </button>
                          )}
                          {(!user || user.id === review.userId) && review.likes && review.likes.length > 0 && (
                            <div className="flex items-center space-x-1 space-x-reverse text-xs text-gray-500">
                              <ThumbsUp className="w-3.5 h-3.5 text-gray-400" />
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
                              <Flag className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-2xl text-gray-500 mb-2">لا توجد تقييمات</p>
                <p className="text-gray-400">جرب البحث بكلمات مختلفة</p>
              </div>
            )}
          </div>
        )}

        {/* Trending/Most Interactive Tab */}
        {activeTab === 'trending' && (
          <div>
            <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl p-4 mb-6">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Flame className="w-6 h-6 text-orange-500" />
                <h3 className="font-bold text-gray-800">التقييمات الأكثر تفاعلاً</h3>
              </div>
              <p className="text-sm text-gray-600 mt-1">التقييمات التي حصلت على أكبر عدد من الإعجابات</p>
            </div>

            {filteredReviews.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {filteredReviews.map((review, index) => {
                  const place = dataStore.getPlace(review.placeId);
                  if (!place) return null;
                  return (
                    <Link
                      key={review.id}
                      href={`/places/${review.placeId}`}
                      className="bg-white rounded-xl shadow-sm p-4 border-2 border-orange-200 hover:shadow-md transition-all relative"
                    >
                      {index < 3 && (
                        <div className="absolute top-2 left-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold shadow-lg z-10">
                          #{index + 1}
                        </div>
                      )}
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
                              <Award className="user-badge-icon-sm text-white fill-current" />
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
                            className={`w-3.5 h-3.5 ${
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
                            <>
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  // Handle like
                                  const reviewIndex = mostInteractiveReviews.findIndex(r => r.id === review.id);
                                  if (reviewIndex !== -1) {
                                    const updatedReview = { ...mostInteractiveReviews[reviewIndex] };
                                    if (!updatedReview.likes) updatedReview.likes = [];
                                    const likeIndex = updatedReview.likes.indexOf(user.id);
                                    if (likeIndex > -1) {
                                      updatedReview.likes.splice(likeIndex, 1);
                                    } else {
                                      updatedReview.likes.push(user.id);
                                    }
                                    const updatedReviews = [...mostInteractiveReviews];
                                    updatedReviews[reviewIndex] = updatedReview;
                                    setMostInteractiveReviews(updatedReviews);
                                  }
                                }}
                                className={`flex items-center space-x-1 space-x-reverse text-xs px-2 py-1 rounded-lg transition-all ${
                                  review.likes?.includes(user?.id || '') 
                                    ? 'bg-orange-100 text-orange-600 hover:bg-orange-200' 
                                    : 'text-gray-500 hover:bg-gray-100 hover:text-orange-600'
                                }`}
                              >
                                <ThumbsUp className={`w-3.5 h-3.5 ${review.likes?.includes(user?.id || '') ? 'fill-current' : ''}`} />
                                <span className="font-semibold text-xs">{review.likes?.length || 0}</span>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setReportReviewModal({
                                    isOpen: true,
                                    reviewId: review.id,
                                    reviewUserName: review.userName,
                                  });
                                }}
                                className="flex items-center space-x-1 space-x-reverse text-xs text-gray-500 hover:text-red-500 hover:bg-red-50 px-2 py-1 rounded-lg transition-all"
                                title="الإبلاغ عن التقييم"
                              >
                                <Flag className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                          {(!user || user.id === review.userId) && review.likes && review.likes.length > 0 && (
                            <div className="flex items-center space-x-1 space-x-reverse text-xs text-orange-600">
                              <ThumbsUp className="w-3.5 h-3.5 text-orange-500" />
                              <span className="font-semibold">{review.likes.length}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
                <Flame className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-2xl text-gray-500 mb-2">لا توجد تقييمات تفاعلية</p>
                <p className="text-gray-400">ابدأ بإعجاب التقييمات لتراها هنا</p>
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
