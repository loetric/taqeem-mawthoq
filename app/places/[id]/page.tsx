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
import { MapPin, Star, Phone, Navigation, FileText, Heart, HelpCircle, CheckCircle, MessageCircle, Flag, ThumbsUp, User, Clock, Circle, Bell, Calendar, Edit, Plus, X, ChevronDown, ChevronUp, Settings, Trash2, ChevronRight, ChevronLeft, Award, Mail, User as UserIcon, Calendar as CalendarIcon, ArrowRight, Share2, Copy } from 'lucide-react';
import ReviewerProfileModal from '@/components/ReviewerProfileModal';
import ClaimBusinessModal from '@/components/ClaimBusinessModal';
import SmartReviewForm from '@/components/SmartReviewForm';
import ReviewDetailsDisplay from '@/components/ReviewDetailsDisplay';
import Navbar from '@/components/Navbar';
import TabNavigation from '@/components/TabNavigation';
import { useToast } from '@/components/Toast';
import ConfirmModal from '@/components/ConfirmModal';
import ReportReviewModal from '@/components/ReportReviewModal';

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
  const [similarPlacesScrollRef, setSimilarPlacesScrollRef] = useState<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
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
  const [editingAnswerId, setEditingAnswerId] = useState<{ questionId: string; answerId: string } | null>(null);
  const [editAnswerText, setEditAnswerText] = useState('');
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
  const [reportReviewModal, setReportReviewModal] = useState<{
    isOpen: boolean;
    reviewId: string;
    reviewUserName: string;
  }>({
    isOpen: false,
    reviewId: '',
    reviewUserName: '',
  });
  const [showShareMenu, setShowShareMenu] = useState(false);

  useEffect(() => {
    const placeData = dataStore.getPlace(placeId);
    if (!placeData) {
      router.push('/');
      return;
    }
    
    setPlace(placeData);
    const placeReviews = dataStore.getReviewsByPlace(placeId);
    // Sort reviews by date
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

  // Handle scroll for similar places
  useEffect(() => {
    const checkScroll = () => {
      if (similarPlacesScrollRef) {
        const { scrollLeft, scrollWidth, clientWidth } = similarPlacesScrollRef;
        setCanScrollLeft(scrollLeft > 0);
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
      }
    };

    if (similarPlacesScrollRef) {
      checkScroll();
      similarPlacesScrollRef.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
    }

    return () => {
      if (similarPlacesScrollRef) {
        similarPlacesScrollRef.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      }
    };
  }, [similarPlacesScrollRef, suggestedPlaces]);

  const scrollSimilarPlaces = (direction: 'left' | 'right') => {
    if (!similarPlacesScrollRef) return;
    const scrollAmount = 220; // Scroll amount based on card width (200px + gap)
    const currentScroll = similarPlacesScrollRef.scrollLeft;
    // Since direction is LTR, 'right' means scroll right (increase scrollLeft)
    // and 'left' means scroll left (decrease scrollLeft)
    const newScroll = direction === 'right' 
      ? currentScroll + scrollAmount 
      : currentScroll - scrollAmount;
    
    // Ensure scroll is within bounds
    const maxScroll = similarPlacesScrollRef.scrollWidth - similarPlacesScrollRef.clientWidth;
    const clampedScroll = Math.max(0, Math.min(newScroll, maxScroll));
    
    similarPlacesScrollRef.scrollTo({ left: clampedScroll, behavior: 'smooth' });
    
    // Update scroll state after animation
    setTimeout(() => {
      if (similarPlacesScrollRef) {
        const { scrollLeft, scrollWidth, clientWidth } = similarPlacesScrollRef;
        setCanScrollLeft(scrollLeft > 10);
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
      }
    }, 300);
  };

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
      if (a.isExpert && !b.isExpert) return -1;
      if (!a.isExpert && b.isExpert) return 1;
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
      if (a.isExpert && !b.isExpert) return -1;
      if (!a.isExpert && b.isExpert) return 1;
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
    const review = reviews.find(r => r.id === reviewId);
    if (review) {
      setReportReviewModal({
        isOpen: true,
        reviewId: review.id,
        reviewUserName: review.userName,
      });
    }
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

  const handleShare = async (method: 'link' | 'whatsapp' | 'copy') => {
    if (!place) return;
    
    const placeUrl = `${window.location.origin}/places/${place.id}`;
    const shareText = `تحقق من ${place.name} على منصة تقييم مُوثَّـق: ${placeUrl}`;
    
    try {
      if (method === 'copy') {
        await navigator.clipboard.writeText(placeUrl);
        showToast('تم نسخ الرابط!', 'success');
        setShowShareMenu(false);
      } else if (method === 'whatsapp') {
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
        window.open(whatsappUrl, '_blank');
        setShowShareMenu(false);
      } else if (method === 'link') {
        if (navigator.share) {
          await navigator.share({
            title: place.name,
            text: shareText,
            url: placeUrl,
          });
          setShowShareMenu(false);
        } else {
          await navigator.clipboard.writeText(placeUrl);
          showToast('تم نسخ الرابط!', 'success');
          setShowShareMenu(false);
        }
      }
    } catch (error) {
      console.error('Error sharing:', error);
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
        if (a.isExpert && !b.isExpert) return -1;
        if (!a.isExpert && b.isExpert) return 1;
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
            if (a.isExpert && !b.isExpert) return -1;
            if (!a.isExpert && b.isExpert) return 1;
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
    setEditingAnswerId({ questionId, answerId: answer.id });
    setEditAnswerText(answer.answer);
  };

  const handleUpdateAnswer = () => {
    if (!user || !editingAnswerId) return;
    
    if (!editAnswerText.trim()) {
      showToast('الرجاء إدخال إجابة', 'warning');
      return;
    }

    const success = dataStore.updateAnswer(
      editingAnswerId.questionId,
      editingAnswerId.answerId,
      user.id,
      editAnswerText
    );
    if (success) {
      setQuestions(dataStore.getQuestionsByPlace(placeId));
      setEditingAnswerId(null);
      setEditAnswerText('');
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/30 to-gray-50 pb-24">
      <Navbar />

      <main className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Back Button and Share Button */}
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => router.back()}
            className="flex items-center space-x-2 space-x-reverse text-slate-600 hover:text-emerald-600 transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
            <span className="text-sm font-semibold">رجوع</span>
          </button>
          
          {/* Share Button */}
          <div className="relative">
            <button
              onClick={() => setShowShareMenu(!showShareMenu)}
              className="flex items-center space-x-2 space-x-reverse text-slate-600 hover:text-emerald-600 transition-colors"
            >
              <span className="text-sm font-semibold">مشاركة</span>
              <Share2 className="w-5 h-5" />
            </button>
            {showShareMenu && (
              <div className="absolute top-full mt-2 right-0 bg-white rounded-lg shadow-xl border border-gray-200 p-2 min-w-[180px] z-50">
                <button
                  onClick={() => handleShare('link')}
                  className="w-full flex items-center space-x-2 space-x-reverse px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-right text-sm"
                >
                  <Share2 className="w-4 h-4 text-emerald-600" />
                  <span>مشاركة الرابط</span>
                </button>
                <button
                  onClick={() => handleShare('whatsapp')}
                  className="w-full flex items-center space-x-2 space-x-reverse px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-right text-sm"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>مشاركة عبر واتساب</span>
                </button>
                <button
                  onClick={() => handleShare('copy')}
                  className="w-full flex items-center space-x-2 space-x-reverse px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-right text-sm"
                >
                  <Copy className="w-4 h-4 text-emerald-600" />
                  <span>نسخ الرابط</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Place Header */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          {/* Image - Clean, no overlays */}
          <div className="h-48 sm:h-56 lg:h-64 w-full bg-emerald-500 relative">
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
            {/* Verified Badge on Image */}
            {place.verified && (
              <div className="absolute top-3 left-3 bg-emerald-500/95 backdrop-blur-sm text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg">
                <span>تم التحقق</span>
              </div>
            )}
          </div>

          <div className="p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <h1 className="text-sm font-bold text-slate-800 truncate flex-1">{place.name}</h1>
                  <button
                    onClick={handleToggleLike}
                    className={`ml-3 p-2 rounded-full transition-all flex-shrink-0 ${
                      isLiked 
                        ? 'text-red-500 bg-red-50 hover:bg-red-100' 
                        : 'text-slate-500 hover:text-red-500 hover:bg-slate-100'
                    }`}
                    title={isLiked ? 'إلغاء الإعجاب' : 'إعجاب'}
                  >
                    <Heart className={`icon-lg ${isLiked ? 'fill-current' : ''}`} />
                  </button>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse mb-2 flex-wrap gap-2">
                  {place.category && (
                    <span className="place-card-category-badge">
                      {place.category}
                    </span>
                  )}
                  <div className={`flex items-center space-x-1 space-x-reverse text-xs px-2 py-1 rounded-full font-semibold ${
                    placeStatus.status === 'open' 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : placeStatus.status === 'closing_soon'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-red-100 text-red-700'
                    }`}>
                    <Circle className={`icon-xs fill-current ${
                      placeStatus.status === 'open' ? 'text-emerald-600' : 
                      placeStatus.status === 'closing_soon' ? 'text-amber-600' : 'text-red-600'
                    }`} />
                    <span>{placeStatus.message}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse flex-shrink-0">
                <div className="flex items-center space-x-1.5 space-x-reverse bg-yellow-50 px-3 py-1.5 rounded-full">
                  <Star className="icon-sm text-yellow-400 fill-current" />
                  <span className="text-base font-bold text-slate-800">
                    {avgRating > 0 ? avgRating.toFixed(1) : 'جديد'}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-slate-700 text-sm mb-4 leading-relaxed">{place.description}</p>

            {place.address && (
              <div className="flex flex-wrap gap-3 mb-4">
                <div className="flex items-center space-x-1.5 space-x-reverse text-slate-600">
                  <MapPin className="w-4 h-4" />
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
                    <h3 className="font-normal text-slate-800 text-[4px]">ساعات العمل</h3>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    {isOwner && (
                      <Link
                        href="/dashboard"
                        onClick={(e) => e.stopPropagation()}
                        className="text-emerald-500 hover:text-emerald-600 transition text-[10px] flex items-center space-x-1 space-x-reverse px-2 py-1 rounded hover:bg-emerald-400/10"
                      >
                        <Settings className="w-3 h-3" />
                        <span>تعديل من لوحة التحكم</span>
                      </Link>
                    )}
                    {showHoursExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500" />
                    )}
                  </div>
                </button>
                {showHoursExpanded && (
                  <div className="px-2.5 pb-2.5 space-y-0.5">
                    {Object.entries(place.hours).map(([day, hours]) => (
                      <div key={day} className="flex justify-between items-center py-1 text-[10px] border-b border-gray-200 last:border-0">
                        <span className="text-slate-600 font-medium">{day}</span>
                        <span className={`font-semibold ${
                          hours.closed ? 'text-red-600' : 'text-slate-800'
                        }`}>
                          {hours.closed ? 'مغلق' : `${hours.open} - ${hours.close}`}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-wrap gap-2 items-center justify-between">
              <div className="flex flex-wrap gap-2 items-center">
                {place.googleMapsUrl && (
                  <a
                    href={place.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center space-x-1.5 space-x-reverse bg-emerald-50/80 backdrop-blur-sm text-emerald-700 px-3 py-2 rounded-lg border border-emerald-200/50 hover:bg-emerald-100/90 hover:shadow-lg transition-all shadow-md text-xs font-semibold group"
                  >
                    <Navigation className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                    <span>الاتجاهات</span>
                  </a>
                )}
                {place.phone && (
                  <>
                    <a
                      href={`tel:${place.phone.replace(/[^0-9+]/g, '')}`}
                      className="flex items-center justify-center space-x-1.5 space-x-reverse bg-emerald-50/80 backdrop-blur-sm text-emerald-700 px-3 py-2 rounded-lg border border-emerald-200/50 hover:bg-emerald-100/90 hover:shadow-lg transition-all shadow-md text-xs font-semibold group"
                    >
                      <Phone className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                      <span>{place.phone}</span>
                    </a>
                    <a
                      href={`https://wa.me/${place.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center space-x-1.5 space-x-reverse bg-emerald-50/80 backdrop-blur-sm text-emerald-700 px-3 py-2 rounded-lg border border-emerald-200/50 hover:bg-emerald-100/90 hover:shadow-lg transition-all shadow-md text-xs font-semibold group"
                    >
                      <MessageCircle className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                      <span>واتساب</span>
                    </a>
                  </>
                )}
              </div>
              {distance !== null && (
                <div className="flex items-center space-x-1.5 space-x-reverse bg-emerald-50/80 backdrop-blur-sm text-emerald-700 px-3 py-2 rounded-lg border border-emerald-200/50 shadow-md text-xs font-semibold">
                  <Navigation className="w-4 h-4 text-emerald-600" />
                  <span>على بعد {distance.toFixed(1)} كم</span>
                </div>
              )}
            </div>

            {/* Claim Business Section - Small and Secondary */}
            {!isOwner && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={handleClaimBusiness}
                  className="text-[10px] text-slate-500 hover:text-emerald-600 transition-all flex items-center space-x-1 space-x-reverse"
                >
                  <CheckCircle className="w-3 h-3" />
                  <span>هل أنت صاحب هذا النشاط؟ المطالبة بالملكية</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Announcements and Events Section */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Bell className="w-4 h-4 text-emerald-600" />
                <h2 className="text-xl font-bold text-slate-800">الإعلانات والأحداث</h2>
              </div>
            </div>

            {false && showAnnouncementForm && isOwner && (
                <form onSubmit={handleCreateAnnouncement} className="bg-gray-50 rounded-lg p-4 mb-4 space-y-4">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-2 text-sm">النوع</label>
                    <select
                      value={announcementForm.type}
                      onChange={(e) => setAnnouncementForm({ ...announcementForm, type: e.target.value as any })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-500 text-sm"
                    >
                      <option value="announcement">إعلان</option>
                      <option value="offer">عرض</option>
                      <option value="event">حدث</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-2 text-sm">العنوان</label>
                    <input
                      type="text"
                      value={announcementForm.title}
                      onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-500 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-2 text-sm">المحتوى</label>
                    <textarea
                      value={announcementForm.content}
                      onChange={(e) => setAnnouncementForm({ ...announcementForm, content: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-500 text-sm"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-emerald-500 text-white py-2 rounded-lg hover:bg-emerald-600 hover:shadow-lg transition-all font-semibold shadow-md text-sm"
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
                      <div key={announcement.id} className="bg-slate-50 border-r-4 border-emerald-500 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2 space-x-reverse">
                          {announcement.type === 'event' && <Calendar className="w-4 h-4 text-emerald-600" />}
                          {announcement.type === 'offer' && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                          {announcement.type === 'announcement' && <Bell className="w-4 h-4 text-emerald-600" />}
                          <span className="text-xs font-semibold text-emerald-600 uppercase">
                            {announcement.type === 'event' ? 'حدث' : announcement.type === 'offer' ? 'عرض' : 'إعلان'}
                          </span>
                        </div>
                        <span className="text-xs text-slate-500">
                          {announcement.createdAt ? new Date(announcement.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          }) : ''}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-800 mb-1 text-sm">{announcement.title}</h4>
                      <p className="text-slate-700 text-sm leading-relaxed">{announcement.content}</p>
                    </div>
                    );
                  })}
                </div>
              ) : (
                !showAnnouncementForm && (
                  <div className="text-center py-8 text-slate-500">
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
              className={`flex-1 py-3 px-4 text-sm font-semibold transition-all ${
                activeTab === 'reviews'
                  ? 'bg-emerald-500 text-white'
                  : 'text-slate-600 hover:bg-gray-50'
              }`}
            >
              التقييمات ({reviews.length})
            </button>
            <button
              onClick={() => setActiveTab('questions')}
              className={`flex-1 py-3 px-4 text-sm font-semibold transition-all ${
                activeTab === 'questions'
                  ? 'bg-emerald-500 text-white'
                  : 'text-slate-600 hover:bg-gray-50'
              }`}
            >
              الأسئلة ({questions.length})
            </button>
          </div>

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div className="p-4">
              {user && user.role === 'user' && !isOwner && (
                <button
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className="w-full mb-4 bg-emerald-500 text-white px-4 py-2.5 rounded-lg hover:bg-emerald-600 hover:shadow-lg transition-all text-xs font-semibold shadow-md"
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

              {/* Rating Statistics - Moved here under reviews */}
              {reviews.length > 0 && (
                <div className="mb-4 bg-white rounded-xl border border-gray-200">
                  <button
                    onClick={() => setShowRatingStatsExpanded(!showRatingStatsExpanded)}
                    className="w-full flex items-center justify-between p-3"
                  >
                    <h3 className="text-xs font-bold text-slate-800 flex items-center space-x-2 space-x-reverse">
                      <Star className="w-3.5 h-3.5 text-yellow-500 fill-current" />
                      <span>إحصائيات التقييمات</span>
                    </h3>
                    {showRatingStatsExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500" />
                    )}
                  </button>
                  {showRatingStatsExpanded && (
                    <div className="px-3 pb-3">
                      <div className="space-y-2">
                        {[5, 4, 3, 2, 1].map((star) => {
                          const count = reviews.filter(r => r.rating === star).length;
                          const percentage = (count / reviews.length) * 100;
                          return (
                            <div key={star} className="flex items-center space-x-2 space-x-reverse">
                              <div className="flex items-center space-x-1 space-x-reverse w-12 flex-shrink-0 justify-end">
                                <span className="text-sm font-bold text-slate-800">{star}</span>
                                <Star className="w-3.5 h-3.5 text-yellow-500 fill-current" />
                              </div>
                              <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                                <div
                                  className="bg-yellow-500 h-full rounded-full transition-all duration-700"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <div className="flex items-center w-12 flex-shrink-0 justify-start">
                                <span className="text-sm font-bold text-slate-700">{count}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-200 text-center">
                        <div className="flex items-center justify-center space-x-1 space-x-reverse">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-base font-bold text-slate-800">{avgRating.toFixed(1)}</span>
                          <span className="text-xs text-slate-600">من {reviews.length} تقييم</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* All Reviews */}
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                              <div key={review.id} className="bg-white rounded-xl shadow-sm p-5 border border-gray-200 hover:shadow-md transition-all">
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
                                    </div>
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
                                  <span className="mr-1.5 text-xs font-semibold text-slate-600">{review.rating}.0</span>
                                </div>
                                <p className="text-slate-700 text-sm leading-relaxed mb-3">{review.comment}</p>
                                {review.reviewDetails && <ReviewDetailsDisplay review={review} />}
                                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                                  <span className="text-[9px] text-slate-400">{formatRelativeTime(review.createdAt)}</span>
                                  <div className="flex items-center space-x-2 space-x-reverse">
                                    {user && user.id !== review.userId && (
                                      <>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleLikeReview(review.id);
                                          }}
                                          className={`flex items-center space-x-1 space-x-reverse text-xs px-2 py-1 rounded-lg transition-all ${
                                            review.likes?.includes(user?.id || '') 
                                              ? 'bg-emerald-400/10 text-emerald-500 hover:bg-emerald-400/20' 
                                              : 'text-slate-500 hover:bg-gray-100 hover:text-emerald-500'
                                          }`}
                                        >
                                          <ThumbsUp className={`w-3.5 h-3.5 ${review.likes?.includes(user?.id || '') ? 'fill-current' : ''}`} />
                                          <span className="font-semibold text-xs">{review.likes?.length || 0}</span>
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleReportReview(review.id);
                                          }}
                                          className="flex items-center space-x-1 space-x-reverse text-xs text-slate-500 hover:text-red-500 hover:bg-red-50 px-2 py-1 rounded-lg transition-all"
                                          title="الإبلاغ عن التقييم"
                                        >
                                          <Flag className="w-3.5 h-3.5" />
                                        </button>
                                      </>
                                    )}
                                    {user && user.id === review.userId && (
                                      <>
                                        {review.likes && review.likes.length > 0 && (
                                          <div className="flex items-center space-x-1 space-x-reverse text-xs text-slate-500">
                                            <ThumbsUp className="w-3.5 h-3.5 text-slate-400" />
                                            <span>{review.likes.length}</span>
                                          </div>
                                        )}
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleEditReview(review);
                                          }}
                                          className="flex items-center space-x-1 space-x-reverse text-xs text-emerald-600 hover:bg-emerald-600/10 px-2 py-1 rounded-lg transition-all"
                                        >
                                          <Edit className="w-3 h-3" />
                                          <span>تعديل</span>
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteReview(review.id);
                                          }}
                                          className="flex items-center space-x-1 space-x-reverse text-xs text-red-500 hover:bg-red-50 px-2 py-1 rounded-lg transition-all"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                          <span>حذف</span>
                                        </button>
                                      </>
                                    )}
                                    {!user && (
                                      <>
                                        {review.likes && review.likes.length > 0 && (
                                          <div className="flex items-center space-x-1 space-x-reverse text-xs text-slate-500">
                                            <ThumbsUp className="w-3.5 h-3.5 text-slate-400" />
                                            <span>{review.likes.length}</span>
                                          </div>
                                        )}
                                      </>
                                    )}
                                  </div>
                                </div>
                                {editingReviewId === review.id && (
                                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                    <h4 className="font-semibold text-slate-800 mb-3 text-sm">تعديل التقييم</h4>
                                    <div className="space-y-3">
                                      <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">التقييم</label>
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
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">التعليق</label>
                                        <textarea
                                          value={editReviewData.comment}
                                          onChange={(e) => setEditReviewData({ ...editReviewData, comment: e.target.value })}
                                          rows={3}
                                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-500 text-sm"
                                          placeholder="اكتب تعليقك هنا..."
                                        />
                                      </div>
                                      <div className="flex space-x-2 space-x-reverse">
                                        <button
                                          onClick={handleUpdateReview}
                                          className="flex-1 bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 hover:shadow-lg transition-all text-xs font-semibold shadow-md"
                                        >
                                          حفظ التعديلات
                                        </button>
                                        <button
                                          onClick={() => {
                                            setEditingReviewId(null);
                                            setEditReviewData({ rating: 5, comment: '', reviewDetails: {} });
                                          }}
                                          className="flex-1 bg-gray-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-all text-xs"
                                        >
                                          إلغاء
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                )}
                                {review.ownerResponse && (
                                  <div className="mt-4 pr-4 border-r-4 border-emerald-500 bg-gray-50 rounded-lg p-4">
                                    <div className="flex items-center space-x-2 space-x-reverse mb-2">
                                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                                      <span className="font-semibold text-emerald-600">رد صاحب المكان</span>
                                    </div>
                                    <p className="text-slate-700">{review.ownerResponse.text}</p>
                                    <p className="text-[9px] text-slate-400 mt-2">{formatRelativeTime(review.ownerResponse.respondedAt)}</p>
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
                                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-500 transition-all"
                                          placeholder="اكتب ردك هنا..."
                                        />
                                        <div className="flex space-x-2 space-x-reverse">
                                          <button
                                            onClick={() => handleSubmitResponse(review.id)}
                                            className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 hover:shadow-lg transition-all text-xs font-semibold shadow-md"
                                          >
                                            إرسال
                                          </button>
                                          <button
                                            onClick={() => {
                                              setShowResponseForm(null);
                                              setResponseText('');
                                            }}
                                            className="bg-gray-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-all text-xs"
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
                  <div className="text-center py-12 text-slate-500">
                    <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p>لا توجد تقييمات بعد. كن أول من يكتب تقييم!</p>
                  </div>
                )}
            </div>
          )}

          {/* Questions Tab */}
          {activeTab === 'questions' && (
            <div className="p-4">
              {user && (
                <button
                  onClick={() => setShowQuestionForm(!showQuestionForm)}
                  className="w-full mb-4 bg-emerald-500 text-white px-4 py-2.5 rounded-lg hover:bg-emerald-600 hover:shadow-lg transition-all text-xs font-semibold shadow-md"
                >
                  {showQuestionForm ? 'إلغاء' : 'سؤال جديد'}
                </button>
              )}

              {showQuestionForm && (
                <form onSubmit={handleSubmitQuestion} className="bg-gray-50 rounded-lg p-6 mb-6">
                  <div className="mb-4">
                    <label className="block text-slate-700 font-semibold mb-2">السؤال</label>
                    <textarea
                      value={questionText}
                      onChange={(e) => setQuestionText(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-500 transition-all"
                      placeholder="اكتب سؤالك هنا..."
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 hover:shadow-lg transition-all font-semibold shadow-md"
                  >
                    إرسال السؤال
                  </button>
                </form>
              )}

              {questions.length > 0 ? (
                <div className="space-y-4">
                  {questions.map((question) => (
                    <div key={question.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all">
                      <div className="mb-3">
                        <div className="flex items-start space-x-2.5 space-x-reverse mb-2">
                          <div className="user-profile-container-xs">
                            <Link
                              href={`/profile/${question.userId}`}
                              onClick={(e) => e.stopPropagation()}
                              className="relative hover:opacity-80 transition cursor-pointer"
                            >
                              <div className="user-avatar-placeholder-xs">
                                {question.userName.charAt(0)}
                              </div>
                            </Link>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-1">
                                <Link
                                  href={`/profile/${question.userId}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="user-name-sm hover:text-emerald-600 transition"
                                >
                                  {question.userName}
                                </Link>
                                <span className="text-[9px] text-slate-400 flex-shrink-0 mr-2 whitespace-nowrap">{formatRelativeTime(question.createdAt)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-start justify-between">
                          {editingQuestionId === question.id ? (
                            <div className="flex-1 pr-2">
                              <textarea
                                value={editQuestionText}
                                onChange={(e) => setEditQuestionText(e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-sm"
                                placeholder="اكتب سؤالك هنا..."
                              />
                              <div className="flex space-x-2 space-x-reverse mt-2">
                                <button
                                  onClick={handleUpdateQuestion}
                                  className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700 hover:shadow-lg transition-all text-xs font-semibold"
                                >
                                  حفظ
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingQuestionId(null);
                                    setEditQuestionText('');
                                  }}
                                  className="bg-gray-200 text-slate-700 px-3 py-1.5 rounded-lg hover:bg-gray-300 transition-all text-xs"
                                >
                                  إلغاء
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-slate-700 text-sm leading-relaxed pr-10 flex-1">{question.question}</p>
                          )}
                          {user && user.id === question.userId && editingQuestionId !== question.id && (
                            <div className="flex items-center space-x-2 space-x-reverse flex-shrink-0">
                              <button
                                onClick={() => handleEditQuestion(question)}
                                  className="text-emerald-500 hover:text-emerald-600 transition text-xs flex items-center space-x-1 space-x-reverse px-2 py-1 rounded hover:bg-emerald-400/10"
                              >
                                <Edit className="w-3 h-3" />
                                <span>تعديل</span>
                              </button>
                              <button
                                onClick={() => handleDeleteQuestion(question.id)}
                                className="text-red-500 hover:text-red-600 transition text-xs flex items-center space-x-1 space-x-reverse px-2 py-1 rounded hover:bg-red-50"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>حذف</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {question.answers.length > 0 && (
                        <div className="space-y-2.5 pr-3 border-r-2 border-emerald-500 mt-3">
                          {question.answers.map((answer) => (
                            <div key={answer.id} className="bg-gray-50 rounded-lg p-3">
                              <div className="flex items-start justify-between mb-1.5">
                                <div className="flex items-center space-x-1.5 space-x-reverse flex-1">
                                  {answer.isOwner && (
                                    <CheckCircle className="w-3 h-3 text-emerald-600 fill-current" />
                                  )}
                                  <Link
                                    href={`/profile/${answer.userId}`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="font-semibold text-xs text-slate-800 hover:text-emerald-600 transition"
                                  >
                                    {answer.userName}
                                    {answer.isOwner && <span className="text-emerald-600 text-[10px] mr-1"> (صاحب المكان)</span>}
                                  </Link>
                                  <span className="text-[9px] text-slate-400 mr-2">{formatRelativeTime(answer.createdAt)}</span>
                                </div>
                                {user && user.id === answer.userId && editingAnswerId?.answerId !== answer.id && (
                                  <div className="flex items-center space-x-2 space-x-reverse flex-shrink-0">
                                    <button
                                      onClick={() => handleEditAnswer(question.id, answer)}
                                      className="text-emerald-500 hover:text-emerald-600 transition text-[10px] flex items-center space-x-1 space-x-reverse px-1.5 py-0.5 rounded hover:bg-emerald-400/10"
                                    >
                                      <Edit className="w-2.5 h-2.5" />
                                      <span>تعديل</span>
                                    </button>
                                    <button
                                      onClick={() => handleDeleteAnswer(question.id, answer.id)}
                                      className="text-red-500 hover:text-red-600 transition text-[10px] flex items-center space-x-1 space-x-reverse px-1.5 py-0.5 rounded hover:bg-red-50"
                                    >
                                      <Trash2 className="w-2.5 h-2.5" />
                                      <span>حذف</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                              {editingAnswerId?.answerId === answer.id ? (
                                <div className="space-y-2">
                                  <textarea
                                    value={editAnswerText}
                                    onChange={(e) => setEditAnswerText(e.target.value)}
                                    rows={2}
                                    className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-500 text-xs"
                                    placeholder="اكتب إجابتك هنا..."
                                  />
                                  <div className="flex space-x-2 space-x-reverse">
                                    <button
                                      onClick={handleUpdateAnswer}
                                      className="bg-emerald-500 text-white px-2 py-1 rounded-lg hover:bg-emerald-600 hover:shadow-lg transition-all text-[10px] font-semibold"
                                    >
                                      حفظ
                                    </button>
                                    <button
                                      onClick={() => {
                                        setEditingAnswerId(null);
                                        setEditAnswerText('');
                                      }}
                                      className="bg-gray-200 text-slate-700 px-2 py-1 rounded-lg hover:bg-gray-300 transition-all text-[10px]"
                                    >
                                      إلغاء
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-slate-700 text-xs leading-relaxed">{answer.answer}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <HelpCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">لا توجد أسئلة بعد. كن أول من يسأل!</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Suggested Places - Unified */}
        {suggestedPlaces.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100 relative overflow-visible">
            <div className="flex items-center space-x-2 space-x-reverse mb-4">
              <Navigation className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base font-bold text-slate-800">أماكن مشابهة</h2>
            </div>
            <div className="relative">
              {/* Left Arrow - Scroll left (decrease scrollLeft) */}
              <button
                onClick={() => scrollSimilarPlaces('left')}
                className={`similar-places-nav-button similar-places-nav-button-left ${!canScrollLeft ? 'opacity-30 cursor-not-allowed' : ''}`}
                aria-label="التمرير لليسار"
                disabled={!canScrollLeft}
              >
                <ChevronLeft className="w-3.5 h-3.5 text-emerald-600" />
              </button>
              
              {/* Right Arrow - Scroll right (increase scrollLeft) */}
              <button
                onClick={() => scrollSimilarPlaces('right')}
                className={`similar-places-nav-button similar-places-nav-button-right ${!canScrollRight ? 'opacity-30 cursor-not-allowed' : ''}`}
                aria-label="التمرير لليمين"
                disabled={!canScrollRight}
              >
                <ChevronRight className="w-3.5 h-3.5 text-emerald-600" />
              </button>
              
              <div 
                ref={setSimilarPlacesScrollRef}
                className="similar-places-container"
              >
                {suggestedPlaces.slice(0, 4).map((suggestedPlace) => (
                  <div key={suggestedPlace.id} className="similar-place-card">
                    <PlaceCard 
                      place={suggestedPlace} 
                      userLocation={place.location ? { lat: place.location.lat, lng: place.location.lng } : null}
                    />
                  </div>
                ))}
              </div>
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

      {/* Report Review Modal */}
      <ReportReviewModal
        isOpen={reportReviewModal.isOpen}
        reviewUserName={reportReviewModal.reviewUserName}
        onConfirm={(reason) => {
          const review = reviews.find(r => r.id === reportReviewModal.reviewId);
          if (review) {
            review.reports = (review.reports || 0) + 1;
            setReviews([...reviews]);
            showToast('تم الإبلاغ عن التقييم. شكراً لملاحظاتك.', 'success');
          }
          setReportReviewModal({ ...reportReviewModal, isOpen: false });
        }}
        onCancel={() => setReportReviewModal({ ...reportReviewModal, isOpen: false })}
      />
      <TabNavigation />
      
      {/* Click outside to close share menu */}
      {showShareMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowShareMenu(false)}
        />
      )}
    </div>
  );
}


