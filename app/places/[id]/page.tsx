'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ReviewCard from '@/components/ReviewCard';
import PlaceCard from '@/components/PlaceCard';
import { Place, Review, Question, Answer, Announcement } from '@/types';
import { dataStore } from '@/lib/data';
import { getCurrentUser } from '@/lib/auth';
import { getPlaceStatus } from '@/lib/placeUtils';
import { formatRelativeTime } from '@/lib/dateUtils';
import { MapPin, Star, Phone, Navigation, MessageSquare, Heart, HelpCircle, CheckCircle, MessageCircle, Flag, ThumbsUp, User, Clock, Circle, Bell, Calendar, Edit, Plus, X, ChevronDown, ChevronUp, Trash2, Share2 } from 'lucide-react';
import ReviewerProfileModal from '@/components/ReviewerProfileModal';
import ClaimBusinessModal from '@/components/ClaimBusinessModal';
import SmartReviewForm from '@/components/SmartReviewForm';
import ReviewDetailsDisplay from '@/components/ReviewDetailsDisplay';
import Navbar from '@/components/Navbar';
import TabNavigation from '@/components/TabNavigation';
import { useToast } from '@/components/Toast';
import ConfirmModal from '@/components/ConfirmModal';
import EditModal from '@/components/EditModal';

export default function PlaceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const placeId = params.id as string;
  
  const [place, setPlace] = useState<Place | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [user, setUser] = useState(getCurrentUser());
  const [isLiked, setIsLiked] = useState(false);
  const [activeTab, setActiveTab] = useState<'reviews' | 'questions'>('reviews');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [showResponseForm, setShowResponseForm] = useState<string | null>(null);
  const [showAnswerForm, setShowAnswerForm] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [responseText, setResponseText] = useState('');
  const [answerText, setAnswerText] = useState('');
  const [distance, setDistance] = useState<number | null>(null);
  const [suggestedPlaces, setSuggestedPlaces] = useState<Place[]>([]);
  const [selectedReviewer, setSelectedReviewer] = useState<{ userId: string; userName: string } | null>(null);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [showHoursExpanded, setShowHoursExpanded] = useState(false);
  const [showRatingStatsExpanded, setShowRatingStatsExpanded] = useState(false);
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    content: '',
    type: 'announcement' as 'announcement' | 'offer' | 'event',
  });
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editReviewData, setEditReviewData] = useState({
    rating: 5,
    comment: '',
    reviewDetails: {} as any,
  });
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editQuestionText, setEditQuestionText] = useState('');
  const [editAnswerModal, setEditAnswerModal] = useState<{
    isOpen: boolean;
    questionId: string;
    answerId: string;
    answer: string;
  }>({
    isOpen: false,
    questionId: '',
    answerId: '',
    answer: '',
  });
  const [reportModal, setReportModal] = useState<{
    isOpen: boolean;
    reviewId: string | null;
    reason: string;
    details: string;
  }>({
    isOpen: false,
    reviewId: null,
    reason: '',
    details: '',
  });
  const { showToast, ToastContainer } = useToast();
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type?: 'danger' | 'warning' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'warning',
  });

  useEffect(() => {
    const placeData = dataStore.getPlace(placeId);
    if (!placeData) {
      router.push('/');
      return;
    }
    
    setPlace(placeData);
    const placeReviews = dataStore.getReviewsByPlace(placeId);
    // Sort reviews by date (newest first)
    const sortedReviews = placeReviews.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    setReviews(sortedReviews);
    setAvgRating(dataStore.getAverageRating(placeId));
    setQuestions(dataStore.getQuestionsByPlace(placeId));
    
    // Load announcements
    const placeAnnouncements = dataStore.getAnnouncementsByPlace(placeId);
    setAnnouncements(placeAnnouncements);
    
    const currentUser = getCurrentUser();
    if (currentUser) {
      setIsLiked(dataStore.isPlaceLiked(currentUser.id, placeId));
    }

    // Calculate distance
    if (navigator.geolocation && placeData.location) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;
          const dist = calculateDistance(
            userLat,
            userLng,
            placeData.location!.lat,
            placeData.location!.lng
          );
          setDistance(dist);
        },
        () => {
          // Default to Riyadh if location denied
          const defaultLat = 24.7136;
          const defaultLng = 46.6753;
          if (placeData.location) {
            const dist = calculateDistance(
              defaultLat,
              defaultLng,
              placeData.location.lat,
              placeData.location.lng
            );
            setDistance(dist);
          }
        }
      );
    }

    // Get suggested places
    if (placeData.location) {
      const nearby = dataStore.getNearbyPlaces(placeData.location.lat, placeData.location.lng, 5);
      const sameCategory = dataStore.getAllPlaces()
        .filter(p => p.id !== placeId && p.category === placeData.category)
        .slice(0, 3);
      const suggested = [...nearby.filter(p => p.id !== placeId), ...sameCategory]
        .filter((p, i, arr) => arr.findIndex(pl => pl.id === p.id) === i)
        .slice(0, 5);
      setSuggestedPlaces(suggested);
    }
  }, [placeId, router]);

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleToggleLike = () => {
    if (!user) {
      router.push('/login');
      return;
    }
    const liked = dataStore.toggleLikePlace(user.id, placeId);
    setIsLiked(liked);
  };

  const handleShare = async () => {
    if (!place) return;
    
    const placeUrl = `${window.location.origin}/places/${place.id}`;
    const shareData = {
      title: `${place.name} - تقييم موثوق`,
      text: `تحقق من ${place.name} على منصة تقييم موثوق`,
      url: placeUrl,
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        showToast('تم مشاركة المكان بنجاح', 'success');
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(placeUrl);
        showToast('تم نسخ رابط المكان', 'success');
      }
    } catch (error: any) {
      // User cancelled or error occurred
      if (error.name !== 'AbortError') {
        // Fallback: Copy to clipboard
        try {
          await navigator.clipboard.writeText(placeUrl);
          showToast('تم نسخ رابط المكان', 'success');
        } catch (clipboardError) {
          showToast('حدث خطأ أثناء المشاركة', 'error');
        }
      }
    }
  };

  const handleSubmitReview = (data: {
    rating: number;
    comment: string;
    reviewDetails?: any;
  }) => {
    if (!user) {
      router.push('/login');
      return;
    }

    dataStore.createReview({
      placeId,
      userId: user.id,
      userName: user.name,
      rating: data.rating,
      comment: data.comment,
      reviewDetails: data.reviewDetails,
    });

    const placeReviews = dataStore.getReviewsByPlace(placeId);
    const sortedReviews = placeReviews.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    setReviews(sortedReviews);
    setAvgRating(dataStore.getAverageRating(placeId));
    
    setComment('');
    setRating(5);
    setShowReviewForm(false);
    setUser(getCurrentUser());
  };

  const handleSubmitQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      router.push('/login');
      return;
    }

    if (!questionText.trim()) {
      showToast('الرجاء إدخال سؤال', 'warning');
      return;
    }

    dataStore.createQuestion({
      placeId,
      userId: user.id,
      userName: user.name,
      question: questionText,
    });

    setQuestions(dataStore.getQuestionsByPlace(placeId));
    setQuestionText('');
    setShowQuestionForm(false);
  };

  const handleSubmitResponse = (reviewId: string) => {
    if (!user || !place || user.id !== place.ownerId) return;
    
    if (!responseText.trim()) {
      showToast('الرجاء إدخال رد', 'warning');
      return;
    }

    dataStore.addReviewResponse(reviewId, user.id, responseText);
    
    const placeReviews = dataStore.getReviewsByPlace(placeId);
    const sortedReviews = placeReviews.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    setReviews(sortedReviews);
    setResponseText('');
    setShowResponseForm(null);
  };

  const handleSubmitAnswer = (questionId: string) => {
    if (!user || !place || user.id !== place.ownerId) {
      showToast('فقط صاحب المكان يمكنه الإجابة على الأسئلة', 'error');
      return;
    }
    
    if (!answerText.trim()) {
      showToast('الرجاء إدخال إجابة', 'warning');
      return;
    }

    dataStore.addAnswer(questionId, {
      questionId,
      userId: user.id,
      userName: user.name,
      answer: answerText,
      isOwner: true,
    });

    setQuestions(dataStore.getQuestionsByPlace(placeId));
    setAnswerText('');
    setShowAnswerForm(null);
  };

  const handleLikeReview = (reviewId: string) => {
    if (!user) {
      router.push('/login');
      return;
    }
    // Toggle like on review
    const review = reviews.find(r => r.id === reviewId);
    if (review) {
      if (!review.likes) review.likes = [];
      const index = review.likes.indexOf(user.id);
      if (index > -1) {
        review.likes.splice(index, 1);
      } else {
        review.likes.push(user.id);
        // Notify review author about like (only if not the same user)
        if (review.userId !== user.id) {
          dataStore.createNotification({
            userId: review.userId,
            type: 'like',
            title: 'إعجاب بتقييمك',
            message: `${user.name} أعجب بتقييمك على ${place?.name || 'مكان'}`,
            placeId: review.placeId,
            reviewId: review.id,
            actionUrl: `/places/${review.placeId}`,
          });
        }
      }
      setReviews([...reviews]);
    }
  };

  const handleReportReview = (reviewId: string) => {
    if (!user) {
      router.push('/login');
      return;
    }
    setReportModal({
      isOpen: true,
      reviewId,
      reason: '',
      details: '',
    });
  };

  const handleSubmitReport = () => {
    if (!reportModal.reason) {
      showToast('يرجى اختيار سبب البلاغ', 'error');
      return;
    }
    const review = reviews.find(r => r.id === reportModal.reviewId);
    if (review) {
      review.reports = (review.reports || 0) + 1;
      setReviews([...reviews]);
      showToast('تم إرسال البلاغ بنجاح. شكراً لملاحظاتك.', 'success');
    }
    setReportModal({ isOpen: false, reviewId: null, reason: '', details: '' });
  };


  const handleClaimBusiness = () => {
    if (!user) {
      router.push('/login');
      return;
    }

    // Allow any logged-in user to claim (they can switch to owner role if needed)
    setShowClaimModal(true);
  };

  const handleClaimSuccess = () => {
    const updatedPlace = dataStore.getPlace(placeId);
    if (updatedPlace) {
      setPlace(updatedPlace);
    }
  };

  const handleEditReview = (review: Review) => {
    setEditingReviewId(review.id);
    setEditReviewData({
      rating: review.rating,
      comment: review.comment,
      reviewDetails: review.reviewDetails || {},
    });
  };

  const handleUpdateReview = () => {
    if (!user || !editingReviewId) return;
    
    if (!editReviewData.comment.trim()) {
      showToast('الرجاء إدخال تعليق', 'warning');
      return;
    }

    const success = dataStore.updateReview(editingReviewId, user.id, {
      rating: editReviewData.rating,
      comment: editReviewData.comment,
      reviewDetails: editReviewData.reviewDetails,
    });

    if (success) {
      const placeReviews = dataStore.getReviewsByPlace(placeId);
      const sortedReviews = placeReviews.sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      setReviews(sortedReviews);
      setAvgRating(dataStore.getAverageRating(placeId));
      setEditingReviewId(null);
      setEditReviewData({ rating: 5, comment: '', reviewDetails: {} });
      showToast('تم تحديث التقييم بنجاح', 'success');
    } else {
      showToast('فشل تحديث التقييم', 'error');
    }
  };

  const handleDeleteReview = (reviewId: string) => {
    if (!user) return;
    
    setConfirmModal({
      isOpen: true,
      title: 'حذف التقييم',
      message: 'هل أنت متأكد من حذف هذا التقييم؟',
      type: 'danger',
      onConfirm: () => {
        const success = dataStore.deleteReview(reviewId, user.id);
        if (success) {
          const placeReviews = dataStore.getReviewsByPlace(placeId);
          const sortedReviews = placeReviews.sort((a, b) => {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          });
          setReviews(sortedReviews);
          setAvgRating(dataStore.getAverageRating(placeId));
          showToast('تم حذف التقييم بنجاح', 'success');
        } else {
          showToast('فشل حذف التقييم', 'error');
        }
        setConfirmModal({ ...confirmModal, isOpen: false });
      },
    });
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestionId(question.id);
    setEditQuestionText(question.question);
  };

  const handleUpdateQuestion = () => {
    if (!user || !editingQuestionId) return;
    
    if (!editQuestionText.trim()) {
      showToast('الرجاء إدخال سؤال', 'warning');
      return;
    }

    const success = dataStore.updateQuestion(editingQuestionId, user.id, editQuestionText);
    if (success) {
      setQuestions(dataStore.getQuestionsByPlace(placeId));
      setEditingQuestionId(null);
      setEditQuestionText('');
      showToast('تم تحديث السؤال بنجاح', 'success');
    } else {
      showToast('فشل تحديث السؤال', 'error');
    }
  };

  const handleDeleteQuestion = (questionId: string) => {
    if (!user) return;
    
    setConfirmModal({
      isOpen: true,
      title: 'حذف السؤال',
      message: 'هل أنت متأكد من حذف هذا السؤال؟',
      type: 'danger',
      onConfirm: () => {
        const success = dataStore.deleteQuestion(questionId, user.id);
        if (success) {
          setQuestions(dataStore.getQuestionsByPlace(placeId));
          showToast('تم حذف السؤال بنجاح', 'success');
        } else {
          showToast('فشل حذف السؤال', 'error');
        }
        setConfirmModal({ ...confirmModal, isOpen: false });
      },
    });
  };

  const handleEditAnswer = (questionId: string, answer: Answer) => {
    setEditAnswerModal({
      isOpen: true,
      questionId,
      answerId: answer.id,
      answer: answer.answer,
    });
  };

  const handleUpdateAnswer = (newAnswer: string) => {
    if (!user || !editAnswerModal.isOpen) return;
    
    if (!newAnswer.trim()) {
      showToast('الرجاء إدخال إجابة', 'warning');
      return;
    }

    const success = dataStore.updateAnswer(
      editAnswerModal.questionId,
      editAnswerModal.answerId,
      user.id,
      newAnswer
    );
    if (success) {
      setQuestions(dataStore.getQuestionsByPlace(placeId));
      setEditAnswerModal({ ...editAnswerModal, isOpen: false });
      showToast('تم تحديث الإجابة بنجاح', 'success');
    } else {
      showToast('فشل تحديث الإجابة', 'error');
    }
  };

  const handleDeleteAnswer = (questionId: string, answerId: string) => {
    if (!user) return;
    
    setConfirmModal({
      isOpen: true,
      title: 'حذف الإجابة',
      message: 'هل أنت متأكد من حذف هذه الإجابة؟',
      type: 'danger',
      onConfirm: () => {
        const success = dataStore.deleteAnswer(questionId, answerId, user.id);
        if (success) {
          setQuestions(dataStore.getQuestionsByPlace(placeId));
          showToast('تم حذف الإجابة بنجاح', 'success');
        } else {
          showToast('فشل حذف الإجابة', 'error');
        }
        setConfirmModal({ ...confirmModal, isOpen: false });
      },
    });
  };

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !place || user.id !== place.ownerId) return;

    if (!announcementForm.title.trim() || !announcementForm.content.trim()) {
      showToast('الرجاء إدخال عنوان ومحتوى للإعلان', 'warning');
      return;
    }

    dataStore.createAnnouncement({
      placeId: place.id,
      title: announcementForm.title,
      content: announcementForm.content,
      type: announcementForm.type,
      isActive: true,
    });

    // Refresh announcements immediately
    const updatedAnnouncements = dataStore.getAnnouncementsByPlace(place.id);
    setAnnouncements(updatedAnnouncements);
    setAnnouncementForm({ title: '', content: '', type: 'announcement' });
    setShowAnnouncementForm(false);
  };


  if (!place) return null;

  const isOwner = user && place.ownerId === user.id;
  const placeStatus = getPlaceStatus(place);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 pb-24">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-4">
        {/* Top Navigation Bar */}
        <div className="flex items-center justify-between">
          <Link href="/home" className="flex items-center gap-1.5 text-gray-600 hover:text-emerald-600 transition-all text-sm font-medium">
            <span>→</span>
            <span>رجوع</span>
          </Link>
          <button
            onClick={handleShare}
            className="p-2 text-gray-600 hover:text-emerald-600 transition-all"
            title="مشاركة المكان"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>

        {/* Place Header */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          {/* Image */}
          <div className="h-64 w-full bg-gradient-to-br from-emerald-500 to-emerald-600 relative">
            {place.imageUrl ? (
              <img
                src={place.imageUrl}
                alt={place.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <MapPin className="w-24 h-24 text-white opacity-50" />
              </div>
            )}
            {/* Verified Badge on Image - Same style as external card */}
            {place.verified && (
              <div className="absolute top-3 left-3 bg-emerald-500/95 text-white px-2.5 py-1 rounded-full text-[10px] font-bold shadow-sm">
                <span>تم التحقق</span>
              </div>
            )}
          </div>

          <div className="p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h1 className="place-detail-name mb-2">{place.name}</h1>
                <div className="flex items-center space-x-2 space-x-reverse mb-2 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="place-detail-category-badge">
                      {place.category}
                    </span>
                    <div className={`flex items-center space-x-1.5 space-x-reverse text-xs px-2.5 py-1 rounded-full font-semibold ${
                      placeStatus.status === 'open' 
                        ? 'bg-green-100 text-green-700' 
                        : placeStatus.status === 'closing_soon'
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      <Circle className={`w-2.5 h-2.5 fill-current ${
                        placeStatus.status === 'open' ? 'text-green-600' : 
                        placeStatus.status === 'closing_soon' ? 'text-orange-600' : 'text-red-600'
                      }`} />
                      <span>{placeStatus.message}</span>
                    </div>
                  </div>
                  {distance !== null && (
                    <div className="flex items-center space-x-1 space-x-reverse text-gray-600">
                      <Navigation className="w-3.5 h-3.5" />
                      <span className="text-xs">على بعد {distance.toFixed(1)} كم</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="flex items-center space-x-1.5 space-x-reverse bg-yellow-50 px-3 py-1.5 rounded-full">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-base font-bold text-gray-800">
                    {avgRating > 0 ? avgRating.toFixed(1) : 'جديد'}
                  </span>
                </div>
                {/* Favorite Button */}
                <button
                  onClick={handleToggleLike}
                  className={`p-2 rounded-full transition-all ${
                    isLiked 
                      ? 'text-red-500 bg-red-50 hover:bg-red-100' 
                      : 'text-gray-400 hover:text-red-500 hover:bg-gray-100'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>

            <p className="text-gray-700 text-sm mb-4 leading-relaxed">{place.description}</p>

            {place.address && (
              <div className="flex flex-wrap gap-3 mb-4">
                <div className="flex items-center space-x-1.5 space-x-reverse text-gray-600">
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="text-xs">{place.address}</span>
                </div>
              </div>
            )}

            {place.hours && (
              <div className="mb-4 bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                <button
                  onClick={() => setShowHoursExpanded(!showHoursExpanded)}
                  className="w-full p-2.5 flex items-center justify-between hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-1.5 space-x-reverse">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                    <h3 className="place-detail-hours-label">ساعات العمل</h3>
                  </div>
                  {showHoursExpanded ? (
                      <ChevronUp className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    )}
                </button>
                {showHoursExpanded && (
                  <div className="px-2.5 pb-2.5 space-y-0.5">
                    {Object.entries(place.hours).map(([day, hours]) => (
                      <div key={day} className="flex justify-between items-center py-1 text-[10px] border-b border-gray-200 last:border-0">
                        <span className="text-gray-600 font-medium">{day}</span>
                        <span className={`font-semibold ${
                          hours.closed ? 'text-red-600' : 'text-gray-800'
                        }`}>
                          {hours.closed ? 'مغلق' : `${hours.open} - ${hours.close}`}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {place.googleMapsUrl && (
                <a
                  href={place.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-1.5 rounded-lg hover:bg-emerald-100 transition-all text-xs font-medium border border-emerald-200/50"
                >
                  <Navigation className="w-3 h-3" />
                  <span>الاتجاهات</span>
                </a>
              )}
              {place.phone && (
                <>
                  <a
                    href={`tel:${place.phone.replace(/[^0-9+]/g, '')}`}
                    className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2.5 py-1.5 rounded-lg hover:bg-blue-100 transition-all text-xs font-medium border border-blue-200/50"
                  >
                    <Phone className="w-3 h-3" />
                    <span>{place.phone}</span>
                  </a>
                  <a
                    href={`https://wa.me/${place.phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 bg-green-50 text-green-700 px-2.5 py-1.5 rounded-lg hover:bg-green-100 transition-all text-xs font-medium border border-green-200/50"
                  >
                    <MessageCircle className="w-3 h-3" />
                    <span>واتساب</span>
                  </a>
                </>
              )}
            </div>

            {/* Claim Business Section - Small and Secondary */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              {isOwner ? (
                <div className="flex items-center space-x-1.5 space-x-reverse text-[10px] text-green-600">
                  <CheckCircle className="w-3 h-3 text-green-500 fill-current" />
                  <span>أنت صاحب هذا النشاط</span>
                </div>
              ) : (
                <button
                  onClick={handleClaimBusiness}
                  className="text-[10px] text-gray-500 hover:text-emerald-600 transition-all flex items-center space-x-1 space-x-reverse"
                >
                  <CheckCircle className="w-3 h-3" />
                  <span>هل أنت صاحب هذا النشاط؟ المطالبة بالملكية</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Announcements and Events Section */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Bell className="w-4 h-4 text-emerald-600" />
                <h2 className="text-base font-bold text-gray-800">الإعلانات والأحداث</h2>
              </div>
              </div>

            {showAnnouncementForm && isOwner && (
                <form onSubmit={handleCreateAnnouncement} className="bg-gray-50 rounded-lg p-4 mb-4 space-y-4">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2 text-sm">النوع</label>
                    <select
                      value={announcementForm.type}
                      onChange={(e) => setAnnouncementForm({ ...announcementForm, type: e.target.value as any })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-sm"
                    >
                      <option value="announcement">إعلان</option>
                      <option value="offer">عرض</option>
                      <option value="event">حدث</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2 text-sm">العنوان</label>
                    <input
                      type="text"
                      value={announcementForm.title}
                      onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2 text-sm">المحتوى</label>
                    <textarea
                      value={announcementForm.content}
                      onChange={(e) => setAnnouncementForm({ ...announcementForm, content: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-sm"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-2 rounded-lg hover:shadow-lg transition-all font-semibold shadow-md text-sm"
                  >
                    نشر الإعلان
                  </button>
                </form>
              )}

              {announcements.length > 0 ? (
                <div className="space-y-3">
                  {announcements.map((announcement) => {
                    // Ensure announcement data is valid
                    if (!announcement || !announcement.id) return null;
                    return (
                      <div key={announcement.id} className="bg-gradient-to-br from-blue-50 to-indigo-50 border-r-4 border-emerald-600 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2 space-x-reverse">
                          {announcement.type === 'event' && <Calendar className="w-4 h-4 text-emerald-600" />}
                          {announcement.type === 'offer' && <Star className="w-4 h-4 text-yellow-500" />}
                          {announcement.type === 'announcement' && <Bell className="w-4 h-4 text-emerald-600" />}
                          <span className="text-xs font-semibold text-emerald-600 uppercase">
                            {announcement.type === 'event' ? 'حدث' : announcement.type === 'offer' ? 'عرض' : 'إعلان'}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {announcement.createdAt ? new Date(announcement.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          }) : ''}
                        </span>
                      </div>
                      <h4 className="font-bold text-gray-800 mb-1 text-sm">{announcement.title}</h4>
                      <p className="text-gray-700 text-sm leading-relaxed">{announcement.content}</p>
                    </div>
                    );
                  })}
                </div>
              ) : (
                !showAnnouncementForm && (
                  <div className="text-center py-8 text-gray-500">
                    <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">لا توجد إعلانات أو أحداث بعد</p>
                  </div>
                )
              )}
            </div>
          </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('reviews')}
              className={`place-detail-tab ${activeTab === 'reviews' ? 'active' : ''}`}
            >
              التقييمات ({reviews.length})
            </button>
            <button
              onClick={() => setActiveTab('questions')}
              className={`place-detail-tab ${activeTab === 'questions' ? 'active' : ''}`}
            >
              الأسئلة ({questions.length})
            </button>
          </div>

          {/* Rating Statistics - Below Tabs (only show on reviews tab) */}
          {reviews.length > 0 && activeTab === 'reviews' && (
            <div className="px-4 py-3 border-b border-gray-100">
              <button
                onClick={() => setShowRatingStatsExpanded(!showRatingStatsExpanded)}
                className="w-full flex items-center justify-between text-sm text-gray-600 hover:text-emerald-600 transition-colors"
              >
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="font-medium">إحصائيات التقييمات</span>
                </div>
                {showRatingStatsExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
              {showRatingStatsExpanded && (
                <div className="mt-3 bg-gray-50 rounded-lg p-3">
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map(star => {
                      const count = reviews.filter(r => r.rating === star).length;
                      const percentage = (count / reviews.length) * 100;
                      return (
                        <div key={star} className="flex items-center space-x-2 space-x-reverse">
                          <div className="flex items-center space-x-1 space-x-reverse w-10 flex-shrink-0 justify-end">
                            <span className="text-xs font-bold text-gray-700">{star}</span>
                            <Star className="w-3 h-3 text-yellow-500 fill-current" />
                          </div>
                          <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-full rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <div className="w-8 flex-shrink-0 text-left">
                            <span className="text-xs font-semibold text-gray-600">{count}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-center space-x-2 space-x-reverse">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-bold text-gray-800">{avgRating.toFixed(1)}</span>
                    <span className="text-xs text-gray-500">من {reviews.length} تقييم</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div className="p-4">
              {user && user.role === 'user' && !isOwner && (
                <button
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className="w-full mb-4 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-4 py-2.5 rounded-lg hover:shadow-lg transition-all text-xs font-semibold shadow-md"
                >
                  {showReviewForm ? 'إلغاء' : 'إضافة تقييم'}
                </button>
              )}

              {showReviewForm && place && (
                <div className="mb-6">
                  <SmartReviewForm
                    place={place}
                    onSubmit={handleSubmitReview}
                    onCancel={() => {
                      setShowReviewForm(false);
                      setComment('');
                      setRating(5);
                    }}
                  />
                </div>
              )}

                      {/* All Reviews */}
                      <div>
                        <h3 className="text-base font-bold text-gray-800 mb-4">جميع التقييمات</h3>
                        {reviews.length > 0 ? (
                          <div className="space-y-4">
                            {reviews.map((review) => (
                              <div key={review.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all overflow-hidden">
                                {/* Header */}
                                <div className="p-3 sm:p-4">
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-start gap-2">
                                      <Link
                                        href={`/profile/${review.userId}`}
                                        onClick={(e) => e.stopPropagation()}
                                        className="relative flex-shrink-0 hover:opacity-80 transition cursor-pointer"
                                      >
                                        {review.userAvatar ? (
                                          <img
                                            src={review.userAvatar}
                                            alt={review.userName}
                                            className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
                                          />
                                        ) : (
                                          <div className="w-8 h-8 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                                            {review.userName.charAt(0)}
                                          </div>
                                        )}
                                      </Link>
                                      <div className="flex-1 min-w-0">
                                        <Link
                                          href={`/profile/${review.userId}`}
                                          onClick={(e) => e.stopPropagation()}
                                          className="font-semibold text-xs text-gray-800 hover:text-emerald-600 transition leading-none"
                                        >
                                          {review.userName}
                                        </Link>
                                        {review.verified && (
                                          <span className="bg-emerald-500/95 text-white px-2 py-0.5 rounded-full text-[9px] font-bold shadow-sm mr-1.5 align-middle">
                                            تم التحقق
                                          </span>
                                        )}
                                        <span className="text-[9px] text-gray-400 leading-none block">{formatRelativeTime(review.createdAt)}</span>
                                      </div>
                                    </div>
                                    {/* Rating Badge */}
                                    <div className="flex items-center gap-0.5 bg-yellow-50 px-1.5 py-0.5 rounded border border-yellow-200">
                                      <Star className="w-3.5 h-3.5 text-yellow-500 fill-current" />
                                      <span className="text-xs font-bold text-yellow-700">{review.rating}.0</span>
                                    </div>
                                  </div>
                                  
                                  {/* Comment */}
                                  <p className="text-gray-700 text-sm leading-relaxed">{review.comment}</p>
                                  {review.reviewDetails && <ReviewDetailsDisplay review={review} />}
                                </div>
                                
                                {/* Footer Actions */}
                                <div className="px-3 py-1.5 border-t border-gray-100 flex items-center justify-between">
                                  <button
                                    onClick={() => handleLikeReview(review.id)}
                                    className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded transition-all active:scale-125 ${
                                      review.likes?.includes(user?.id || '')
                                        ? 'text-rose-500'
                                        : 'text-gray-400 hover:text-rose-500'
                                    }`}
                                  >
                                    <Heart className={`w-4 h-4 transition-transform ${review.likes?.includes(user?.id || '') ? 'fill-current animate-pulse' : 'hover:scale-110'}`} />
                                    <span className="font-semibold">{review.likes?.length || 0}</span>
                                  </button>
                                  <div className="flex items-center gap-0.5">
                                    {user && user.id !== review.userId && (
                                      <button
                                        onClick={() => handleReportReview(review.id)}
                                        className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-red-500 hover:bg-red-50/50 px-2 py-1 rounded-md transition-all"
                                      >
                                        <Flag className="w-3 h-3" />
                                        <span>إبلاغ</span>
                                      </button>
                                    )}
                                    {user && user.id === review.userId && (
                                      <>
                                        <button
                                          onClick={() => handleEditReview(review)}
                                          className="flex items-center gap-1 text-[11px] text-emerald-600 hover:bg-emerald-50/50 px-2 py-1 rounded-md transition-all"
                                        >
                                          <Edit className="w-3 h-3" />
                                          <span>تعديل</span>
                                        </button>
                                        <button
                                          onClick={() => handleDeleteReview(review.id)}
                                          className="flex items-center gap-1 text-[11px] text-red-500 hover:bg-red-50/50 px-2 py-1 rounded-md transition-all"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                          <span>حذف</span>
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </div>
                                {editingReviewId === review.id && (
                                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                    <h4 className="font-semibold text-gray-800 mb-3 text-sm">تعديل التقييم</h4>
                                    <div className="space-y-3">
                                      <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">التقييم</label>
                                        <div className="flex items-center space-x-1 space-x-reverse">
                                          {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                              key={star}
                                              type="button"
                                              onClick={() => setEditReviewData({ ...editReviewData, rating: star })}
                                              className="focus:outline-none"
                                            >
                                              <Star
                                                className={`w-5 h-5 ${
                                                  star <= editReviewData.rating
                                                    ? 'text-yellow-400 fill-current'
                                                    : 'text-gray-300'
                                                }`}
                                              />
                                            </button>
                                          ))}
                                        </div>
                                      </div>
                                      <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">التعليق</label>
                                        <textarea
                                          value={editReviewData.comment}
                                          onChange={(e) => setEditReviewData({ ...editReviewData, comment: e.target.value })}
                                          rows={3}
                                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-sm"
                                          placeholder="اكتب تعليقك هنا..."
                                        />
                                      </div>
                                      <div className="flex space-x-2 space-x-reverse">
                                        <button
                                          onClick={handleUpdateReview}
                                          className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all text-xs font-semibold shadow-md"
                                        >
                                          حفظ التعديلات
                                        </button>
                                        <button
                                          onClick={() => {
                                            setEditingReviewId(null);
                                            setEditReviewData({ rating: 5, comment: '', reviewDetails: {} });
                                          }}
                                          className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-all text-xs"
                                        >
                                          إلغاء
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                )}
                                {review.ownerResponse && (
                                  <div className="mt-4 pr-4 border-r-4 border-emerald-600 bg-gray-50 rounded-lg p-4">
                                    <div className="flex items-center space-x-2 space-x-reverse mb-2">
                                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                                      <span className="font-semibold text-emerald-600">رد صاحب المكان</span>
                                    </div>
                                    <p className="text-gray-700">{review.ownerResponse.text}</p>
                                    <p className="text-[9px] text-gray-400 mt-2">{formatRelativeTime(review.ownerResponse.respondedAt)}</p>
                                  </div>
                                )}
                                {isOwner && !review.ownerResponse && (
                                  <div className="mt-4">
                                    <button
                                      onClick={() => setShowResponseForm(review.id)}
                                      className="text-emerald-600 text-sm hover:underline font-semibold"
                                    >
                                      {showResponseForm === review.id ? 'إلغاء' : 'رد على التقييم'}
                                    </button>
                                    {showResponseForm === review.id && (
                                      <div className="mt-2 space-y-2">
                                        <textarea
                                          value={responseText}
                                          onChange={(e) => setResponseText(e.target.value)}
                                          rows={3}
                                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition-all"
                                          placeholder="اكتب ردك هنا..."
                                        />
                                        <div className="flex space-x-2 space-x-reverse">
                                          <button
                                            onClick={() => handleSubmitResponse(review.id)}
                                            className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all text-xs font-semibold shadow-md"
                                          >
                                            إرسال
                                          </button>
                                          <button
                                            onClick={() => {
                                              setShowResponseForm(null);
                                              setResponseText('');
                                            }}
                                            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-all text-xs"
                                          >
                                            إلغاء
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p>لا توجد تقييمات بعد. كن أول من يكتب تقييم!</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Questions Tab */}
          {activeTab === 'questions' && (
            <div className="p-4">
              {user && !isOwner && (
                <button
                  onClick={() => setShowQuestionForm(!showQuestionForm)}
                  className="w-full mb-4 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-4 py-2.5 rounded-lg hover:shadow-lg transition-all text-xs font-semibold shadow-md"
                >
                  {showQuestionForm ? 'إلغاء' : 'سؤال جديد'}
                </button>
              )}

              {showQuestionForm && !isOwner && (
                <form onSubmit={handleSubmitQuestion} className="bg-gray-50 rounded-lg p-6 mb-6">
                  <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-2">السؤال</label>
                    <textarea
                      value={questionText}
                      onChange={(e) => setQuestionText(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition-all"
                      placeholder="اكتب سؤالك هنا..."
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-2 rounded-lg hover:shadow-lg transition-all font-semibold shadow-md"
                  >
                    إرسال السؤال
                  </button>
                </form>
              )}

              {questions.length > 0 ? (
                <div className="space-y-4">
                  {questions.map((question) => (
                    <div key={question.id} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden">
                      {/* Question Header */}
                      <div className="p-3 sm:p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-start gap-2">
                            <Link
                              href={`/profile/${question.userId}`}
                              onClick={(e) => e.stopPropagation()}
                              className="flex-shrink-0 hover:opacity-80 transition cursor-pointer"
                            >
                              <div className="w-7 h-7 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-full flex items-center justify-center text-white font-semibold text-[10px]">
                                {question.userName.charAt(0)}
                              </div>
                            </Link>
                            <div className="flex-1 min-w-0">
                              <Link
                                href={`/profile/${question.userId}`}
                                onClick={(e) => e.stopPropagation()}
                                className="font-semibold text-xs text-gray-800 hover:text-emerald-600 transition leading-none"
                              >
                                {question.userName}
                              </Link>
                              <span className="text-[9px] text-gray-400 leading-none block">{formatRelativeTime(question.createdAt)}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-0.5 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            <HelpCircle className="w-3 h-3 text-emerald-600" />
                            <span className="text-[10px] font-medium text-emerald-700">سؤال</span>
                          </div>
                        </div>
                        
                        {/* Question Content */}
                        {editingQuestionId === question.id ? (
                          <div className="space-y-1.5 mt-1">
                            <textarea
                              value={editQuestionText}
                              onChange={(e) => setEditQuestionText(e.target.value)}
                              rows={2}
                              className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-xs resize-none"
                              placeholder="اكتب سؤالك هنا..."
                            />
                            <div className="flex gap-1.5">
                              <button
                                onClick={handleUpdateQuestion}
                                className="bg-emerald-600 text-white px-2.5 py-1 rounded-md hover:bg-emerald-700 transition-all text-[10px] font-semibold"
                              >
                                حفظ
                              </button>
                              <button
                                onClick={() => {
                                  setEditingQuestionId(null);
                                  setEditQuestionText('');
                                }}
                                className="bg-gray-200 text-gray-700 px-2.5 py-1 rounded-md hover:bg-gray-300 transition-all text-[10px]"
                              >
                                إلغاء
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-gray-700 text-sm leading-relaxed">{question.question}</p>
                        )}
                      </div>
                      
                      {/* Question Actions */}
                      {user && user.id === question.userId && editingQuestionId !== question.id && (
                        <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex justify-end gap-1">
                          <button
                            onClick={() => handleEditQuestion(question)}
                            className="flex items-center gap-1 text-xs text-emerald-600 hover:bg-emerald-50 px-2.5 py-1.5 rounded-lg transition-all"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span>تعديل</span>
                          </button>
                          <button
                            onClick={() => handleDeleteQuestion(question.id)}
                            className="flex items-center gap-1 text-xs text-red-500 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>حذف</span>
                          </button>
                        </div>
                      )}

                      {/* Answers Section */}
                      {question.answers.length > 0 && (
                        <div className="bg-emerald-50/50 border-t border-emerald-100 p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <MessageCircle className="w-4 h-4 text-emerald-600" />
                            <span className="text-xs font-semibold text-emerald-700">الإجابات ({question.answers.length})</span>
                          </div>
                          <div className="space-y-3">
                            {question.answers.map((answer) => (
                              <div key={answer.id} className="bg-white rounded-lg p-3 border border-emerald-100">
                                <div className="flex items-start justify-between mb-1.5">
                                  <div className="flex items-start gap-2">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white font-semibold text-[10px] flex-shrink-0 mt-0.5 ${answer.isOwner ? 'bg-emerald-600' : 'bg-gray-400'}`}>
                                      {answer.userName.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-1.5 flex-wrap leading-none">
                                        <span className="font-semibold text-xs text-gray-800 leading-none">{answer.userName}</span>
                                        {answer.isOwner && (
                                          <span className="bg-emerald-500/95 text-white text-[8px] px-1.5 py-0.5 rounded-full font-bold shadow-sm whitespace-nowrap">
                                            صاحب المكان
                                          </span>
                                        )}
                                      </div>
                                      <span className="text-[9px] text-gray-400 leading-none block">{formatRelativeTime(answer.createdAt)}</span>
                                    </div>
                                  </div>
                                  {user && user.id === answer.userId && (
                                    <div className="flex items-center gap-1">
                                      <button
                                        onClick={() => handleEditAnswer(question.id, answer)}
                                        className="text-emerald-600 hover:bg-emerald-50 p-1.5 rounded transition"
                                      >
                                        <Edit className="w-3 h-3" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteAnswer(question.id, answer.id)}
                                        className="text-red-500 hover:bg-red-50 p-1.5 rounded transition"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  )}
                                </div>
                                <p className="text-gray-700 text-sm leading-relaxed">{answer.answer}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Owner Answer Form */}
                      {isOwner && question.answers.length === 0 && (
                        <div className="bg-emerald-50/50 border-t border-emerald-100 p-4">
                          <button
                            onClick={() => setShowAnswerForm(question.id)}
                            className="flex items-center gap-2 text-emerald-600 text-sm font-semibold hover:text-emerald-700 transition"
                          >
                            <MessageCircle className="w-4 h-4" />
                            {showAnswerForm === question.id ? 'إلغاء' : 'إضافة إجابة'}
                          </button>
                          {showAnswerForm === question.id && (
                            <div className="mt-3 space-y-3">
                              <textarea
                                value={answerText}
                                onChange={(e) => setAnswerText(e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm bg-white"
                                placeholder="اكتب إجابتك هنا..."
                              />
                              <button
                                onClick={() => handleSubmitAnswer(question.id)}
                                className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-all text-sm font-semibold"
                              >
                                إرسال الإجابة
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <HelpCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">لا توجد أسئلة بعد. كن أول من يسأل!</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Suggested Places - Compact */}
        {suggestedPlaces.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-3 border border-gray-100">
            <h2 className="text-[10px] font-bold text-gray-800 mb-2 flex items-center gap-1.5">
              <MapPin className="w-3 h-3 text-emerald-600" />
              <span>أماكن مشابهة</span>
            </h2>
            <div className="flex space-x-2 space-x-reverse overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
              {suggestedPlaces.slice(0, 4).map((suggestedPlace) => (
                <div key={suggestedPlace.id} className="flex-shrink-0 w-[160px] sm:w-[200px]">
                  <PlaceCard 
                    place={suggestedPlace} 
                    userLocation={place.location ? { lat: place.location.lat, lng: place.location.lng } : null}
                    compact={true}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Reviewer Profile Modal */}
      {selectedReviewer && (
        <ReviewerProfileModal
          userId={selectedReviewer.userId}
          userName={selectedReviewer.userName}
          isOpen={!!selectedReviewer}
          onClose={() => setSelectedReviewer(null)}
        />
      )}

      {/* Claim Business Modal */}
      {place && (
        <ClaimBusinessModal
          placeId={place.id}
          placeName={place.name}
          isOpen={showClaimModal}
          onClose={() => setShowClaimModal(false)}
          onSuccess={handleClaimSuccess}
        />
      )}

      {/* Toast Container */}
      <ToastContainer />

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal({ ...confirmModal, isOpen: false })}
      />

      {/* Report Modal */}
      {reportModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setReportModal({ isOpen: false, reviewId: null, reason: '', details: '' })}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Flag className="w-5 h-5 text-red-500" />
                الإبلاغ عن التقييم
              </h3>
              <button
                onClick={() => setReportModal({ isOpen: false, reviewId: null, reason: '', details: '' })}
                className="p-1 hover:bg-gray-100 rounded-full transition"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              يرجى اختيار سبب الإبلاغ لمساعدتنا في مراجعة هذا التقييم
            </p>

            <div className="space-y-2 mb-4">
              {[
                { value: 'spam', label: 'محتوى مزعج أو إعلاني' },
                { value: 'inappropriate', label: 'محتوى غير لائق أو مسيء' },
                { value: 'fake', label: 'تقييم مزيف أو غير حقيقي' },
                { value: 'irrelevant', label: 'لا علاقة له بالمكان' },
                { value: 'personal', label: 'معلومات شخصية أو خاصة' },
                { value: 'other', label: 'سبب آخر' },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    reportModal.reason === option.value
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="reportReason"
                    value={option.value}
                    checked={reportModal.reason === option.value}
                    onChange={(e) => setReportModal({ ...reportModal, reason: e.target.value })}
                    className="w-4 h-4 text-red-500 border-gray-300 focus:ring-red-500"
                  />
                  <span className="mr-3 text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>

            {reportModal.reason === 'other' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  تفاصيل إضافية
                </label>
                <textarea
                  value={reportModal.details}
                  onChange={(e) => setReportModal({ ...reportModal, details: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                  placeholder="اكتب تفاصيل إضافية هنا..."
                />
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleSubmitReport}
                disabled={!reportModal.reason}
                className="flex-1 bg-red-500 text-white px-4 py-2.5 rounded-lg hover:bg-red-600 transition-all text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                إرسال البلاغ
              </button>
              <button
                onClick={() => setReportModal({ isOpen: false, reviewId: null, reason: '', details: '' })}
                className="flex-1 bg-gray-100 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-200 transition-all text-sm"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Answer Modal */}
      <EditModal
        isOpen={editAnswerModal.isOpen}
        title="تعديل الإجابة"
        label="الإجابة"
        value={editAnswerModal.answer}
        multiline={true}
        onSave={handleUpdateAnswer}
        onCancel={() => setEditAnswerModal({ ...editAnswerModal, isOpen: false })}
      />

      {/* Bottom Navigation */}
      <TabNavigation />
    </div>
  );
}

