import { Place, Review, User, Notification, Question, Answer, Announcement, Inquiry, Subscription } from '@/types';
import { mockPlaces, mockReviews, mockQuestions, mockAnswers } from './mockData';

// Simple in-memory data store (can be replaced with a real database)
class DataStore {
  private places: Place[] = [];
  private reviews: Review[] = [];
  private users: User[] = [];
  private notifications: Notification[] = [];
  private questions: Question[] = [];
  private announcements: Announcement[] = [];
  private inquiries: Inquiry[] = [];
  private subscriptions: Subscription[] = [];
  private likedPlaces: { [userId: string]: string[] } = {};
  private initialized = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.loadFromStorage();
      if (!this.initialized) {
        this.initializeMockData();
      }
    }
  }

  private initializeMockData() {
    // Always initialize default users first if they don't exist
    if (this.users.length === 0) {
      // Create user (regular user)
      const user: User = {
        id: 'user',
        name: 'user',
        email: 'user@trustrate.com',
        role: 'user',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=faces',
        bio: 'مراجع نشط ومحترف، أشارك تجاربي الصادقة لمساعدة الآخرين',
        location: {
          lat: 24.7136,
          lng: 46.6753,
          city: 'الرياض',
        },
        phone: '+966501234567',
        gender: 'male',
        dateOfBirth: '1990-05-15',
        createdAt: new Date(),
      };
      this.users.push(user);
      
      // Create owner (user with place ownership)
      const owner: User = {
        id: 'owner',
        name: 'owner',
        email: 'owner@trustrate.com',
        role: 'user',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=faces',
        bio: 'مستخدم نشط وصاحب مكان',
        location: {
          lat: 24.7136,
          lng: 46.6753,
          city: 'الرياض',
        },
        phone: '+966507654321',
        gender: 'male',
        dateOfBirth: '1985-08-20',
        createdAt: new Date(),
      };
      this.users.push(owner);
      
      this.saveToStorage();
    }

    // Only initialize if no data exists, or if we need to update
    const shouldInitialize = this.places.length === 0 || this.places.length < mockPlaces.length;
    
    if (shouldInitialize) {
      // Clear existing data if we're re-initializing
      if (this.places.length > 0 && this.places.length < mockPlaces.length) {
        this.places = [];
        this.reviews = [];
        this.questions = [];
      }

      mockPlaces.forEach((place, index) => {
        // Check if place already exists
        const existingPlace = this.places.find(p => p.name === place.name);
        if (!existingPlace) {
          const newPlace: Place = {
            ...place,
            id: (index + 1).toString(),
            createdAt: new Date(Date.now() - (index * 86400000)), // Spread over days
            updatedAt: new Date(),
          };
          this.places.push(newPlace);
        }
      });

      // Get current review count to continue numbering
      const currentReviewCount = this.reviews.length;
      mockReviews.forEach((review, index) => {
        // Check if review already exists (by checking comment and userId)
        const existingReview = this.reviews.find(r => 
          r.placeId === review.placeId && 
          r.userId === review.userId && 
          r.comment === review.comment
        );
        if (!existingReview) {
          // Get user avatar if user exists
          const reviewUser = this.getUser(review.userId);
          const newReview: Review = {
            ...review,
            id: `review${currentReviewCount + index + 1}`,
            placeId: review.placeId || '1',
            createdAt: new Date(Date.now() - ((currentReviewCount + index) * 3600000)),
            verified: false,
            integrityScore: 0,
            likes: index < 5 ? ['user', 'owner'] : [],
            reports: 0,
            isExpert: false,
            userAvatar: reviewUser?.avatar, // Add user avatar
          };
          newReview.integrityScore = this.calculateReviewIntegrity(newReview);
          if (newReview.integrityScore >= 70) {
            newReview.verified = true;
          }
          this.reviews.push(newReview);
        }
      });

      // Create mock notifications with varied types and dates (only if notifications are empty)
      if (this.notifications.length === 0) {
        const now = Date.now();
        const mockNotifications = [
        // Recent unread notifications
        {
          userId: 'user',
          type: 'review' as const,
          title: 'تقييم جديد',
          message: 'فاطمة علي أضافت تقييم جديد على مطعم الشام الأصيل',
          placeId: '1',
          reviewId: 'review1',
          actionUrl: '/places/1',
          createdAt: new Date(now - 5 * 60000), // 5 minutes ago
          read: false,
        },
        {
          userId: 'user',
          type: 'new_review_on_liked_place' as const,
          title: 'تقييم جديد على مكان مفضل',
          message: 'خالد سعيد أضاف تقييم جديد على مقهى الورد الذي أعجبك',
          placeId: '2',
          reviewId: 'review2',
          actionUrl: '/places/2',
          createdAt: new Date(now - 15 * 60000), // 15 minutes ago
          read: false,
        },
        {
          userId: 'user',
          type: 'response' as const,
          title: 'رد على تقييمك',
          message: 'مطعم الشام الأصيل رد على تقييمك: شكراً لك على ملاحظاتك القيمة',
          placeId: '1',
          reviewId: 'review1',
          actionUrl: '/places/1',
          createdAt: new Date(now - 30 * 60000), // 30 minutes ago
          read: false,
        },
        {
          userId: 'user',
          type: 'question' as const,
          title: 'سؤال جديد',
          message: 'سارة أحمد سألت عن مطعم الشام الأصيل: هل يوجد موقف سيارات؟',
          placeId: '1',
          questionId: 'q1',
          actionUrl: '/places/1',
          createdAt: new Date(now - 2 * 3600000), // 2 hours ago
          read: false,
        },
        {
          userId: 'user',
          type: 'answer' as const,
          title: 'إجابة على سؤالك',
          message: 'صاحب مطعم الشام الأصيل أجاب على سؤالك: نعم يوجد موقف سيارات مجاني',
          placeId: '1',
          questionId: 'q1',
          actionUrl: '/places/1',
          createdAt: new Date(now - 3 * 3600000), // 3 hours ago
          read: false,
        },
        // Older read notifications
        {
          userId: 'user',
          type: 'review' as const,
          title: 'تقييم جديد',
          message: 'محمد علي أضاف تقييم جديد على مركز التسوق الكبير',
          placeId: '3',
          reviewId: 'review3',
          actionUrl: '/places/3',
          createdAt: new Date(now - 24 * 3600000), // 1 day ago
          read: true,
        },
        {
          userId: 'user',
          type: 'response' as const,
          title: 'رد على تقييمك',
          message: 'مقهى الورد رد على تقييمك: نحن سعداء بتجربتك الإيجابية',
          placeId: '2',
          reviewId: 'review2',
          actionUrl: '/places/2',
          createdAt: new Date(now - 2 * 24 * 3600000), // 2 days ago
          read: true,
        },
        {
          userId: 'user',
          type: 'new_review_on_liked_place' as const,
          title: 'تقييم جديد على مكان مفضل',
          message: 'أحمد صالح أضاف تقييم جديد على مطعم الشام الأصيل الذي أعجبك',
          placeId: '1',
          reviewId: 'review4',
          actionUrl: '/places/1',
          createdAt: new Date(now - 3 * 24 * 3600000), // 3 days ago
          read: true,
        },
        {
          userId: 'user',
          type: 'answer' as const,
          title: 'إجابة على سؤالك',
          message: 'صاحب مركز التسوق الكبير أجاب على سؤالك: نعم نقدم خدمة التوصيل',
          placeId: '3',
          questionId: 'q2',
          actionUrl: '/places/3',
          createdAt: new Date(now - 5 * 24 * 3600000), // 5 days ago
          read: true,
        },
        {
          userId: 'user',
          type: 'announcement' as const,
          title: 'إعلان جديد',
          message: 'مطعم الشام الأصيل نشر إعلان جديد: عرض خاص على الوجبات',
          placeId: '1',
          actionUrl: '/places/1',
          createdAt: new Date(now - 7 * 24 * 3600000), // 7 days ago
          read: true,
        },
        // Notifications for owner
        {
          userId: 'owner',
          type: 'review' as const,
          title: 'تقييم جديد',
          message: 'أحمد محمد أضاف تقييم جديد على مطعم الشام الأصيل',
          placeId: '1',
          reviewId: 'review1',
          actionUrl: '/places/1',
          createdAt: new Date(now - 10 * 60000), // 10 minutes ago
          read: false,
        },
        {
          userId: 'owner',
          type: 'question' as const,
          title: 'سؤال جديد',
          message: 'سارة أحمد سألت عن مطعم الشام الأصيل: ما هي أوقات العمل؟',
          placeId: '1',
          questionId: 'q1',
          actionUrl: '/places/1',
          createdAt: new Date(now - 1 * 3600000), // 1 hour ago
          read: false,
        },
        {
          userId: 'owner',
          type: 'review' as const,
          title: 'تقييم جديد',
          message: 'خالد سعيد أضاف تقييم جديد على مطعم الشام الأصيل',
          placeId: '1',
          reviewId: 'review5',
          actionUrl: '/places/1',
          createdAt: new Date(now - 12 * 3600000), // 12 hours ago
          read: true,
        },
      ];

        // Add notifications to the store
        mockNotifications.forEach((notification, index) => {
          const newNotification: Notification = {
            id: `mock-${now}-${index}`,
            ...notification,
          };
          this.notifications.push(newNotification);
        });
      }

      // Get current question count
      const currentQuestionCount = this.questions.length;
      mockQuestions.forEach((question, index) => {
        // Check if question already exists
        const existingQuestion = this.questions.find(q => 
          q.placeId === question.placeId && 
          q.question === question.question
        );
        if (!existingQuestion) {
          const newQuestion: Question = {
            ...question,
            id: `q${currentQuestionCount + index + 1}`,
            answers: [],
            createdAt: new Date(Date.now() - ((currentQuestionCount + index) * 7200000)),
          };
          this.questions.push(newQuestion);
        }
      });

      // Add mock answers to questions
      const currentAnswerCount = this.questions.reduce((sum, q) => sum + q.answers.length, 0);
      mockAnswers.forEach((answer, index) => {
        // Map questionId from mockAnswers (1-based) to actual question id (q1, q2, etc.)
        const questionId = `q${answer.questionId}`;
        const question = this.questions.find(q => q.id === questionId);
        if (question) {
          // Check if answer already exists
          const existingAnswer = question.answers.find(a => 
            a.answer === answer.answer && a.userId === answer.userId
          );
          if (!existingAnswer) {
            const newAnswer: Answer = {
              ...answer,
              id: `a${currentAnswerCount + index + 1}`,
              createdAt: new Date(Date.now() - ((currentAnswerCount + index) * 3600000)),
            };
            question.answers.push(newAnswer);
          }
        }
      });

      this.initialized = true;
      this.saveToStorage();
    }
  }


  // User methods
  createUser(user: Omit<User, 'id' | 'createdAt'>): User {
    const newUser: User = {
      ...user,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    this.users.push(newUser);
    this.saveToStorage();
    return newUser;
  }

  getUser(id: string): User | undefined {
    return this.users.find(u => u.id === id);
  }

  getUserByEmail(email: string): User | undefined {
    return this.users.find(u => u.email === email);
  }

  updateUser(userId: string, updates: Partial<User>) {
    const user = this.users.find(u => u.id === userId);
    if (user) {
      Object.assign(user, updates);
      this.saveToStorage();
    }
  }


  getUserReviewCount(userId: string): number {
    return this.reviews.filter(r => r.userId === userId).length;
  }

  // Place methods
  createPlace(place: Omit<Place, 'id' | 'createdAt' | 'updatedAt'>): Place {
    const newPlace: Place = {
      ...place,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.places.push(newPlace);
    this.saveToStorage();
    return newPlace;
  }

  getPlace(id: string): Place | undefined {
    return this.places.find(p => p.id === id);
  }

  getPlacesByOwner(ownerId: string): Place[] {
    return this.places.filter(p => p.ownerId === ownerId);
  }

  getAllPlaces(): Place[] {
    return this.places;
  }

  getTopRatedPlaces(limit: number = 10): Place[] {
    return this.places
      .map(place => ({
        place,
        rating: this.getAverageRating(place.id),
        reviewCount: this.getReviewsByPlace(place.id).length,
      }))
      .filter(item => item.rating > 0)
      .sort((a, b) => {
        if (b.rating !== a.rating) return b.rating - a.rating;
        return b.reviewCount - a.reviewCount;
      })
      .slice(0, limit)
      .map(item => item.place);
  }

  getNearbyPlaces(lat: number, lng: number, radiusKm: number = 10): Place[] {
    return this.places.filter(place => {
      if (!place.location) return false;
      const distance = this.calculateDistance(lat, lng, place.location.lat, place.location.lng);
      return distance <= radiusKm;
    }).sort((a, b) => {
      if (!a.location || !b.location) return 0;
      const distA = this.calculateDistance(lat, lng, a.location.lat, a.location.lng);
      const distB = this.calculateDistance(lat, lng, b.location.lat, b.location.lng);
      return distA - distB;
    });
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  updatePlace(id: string, updates: Partial<Place>): Place | undefined {
    const place = this.places.find(p => p.id === id);
    if (place) {
      Object.assign(place, updates, { updatedAt: new Date() });
      this.saveToStorage();
      return place;
    }
    return undefined;
  }

  claimPlace(placeId: string, ownerId: string): boolean {
    const place = this.places.find(p => p.id === placeId);
    if (place) {
      // Allow claiming even if already claimed (for transfer or dispute)
      // In real app, this would create a claim request for review
      place.ownerId = ownerId;
      place.isClaimed = true;
      this.saveToStorage();
      return true;
    }
    return false;
  }

  unclaimPlace(placeId: string, ownerId: string): boolean {
    const place = this.places.find(p => p.id === placeId);
    if (place && place.ownerId === ownerId) {
      place.ownerId = '';
      place.isClaimed = false;
      this.saveToStorage();
      return true;
    }
    return false;
  }

  addDelegatedUser(placeId: string, ownerId: string, delegatedUserId: string): boolean {
    const place = this.places.find(p => p.id === placeId);
    if (place && place.ownerId === ownerId) {
      if (!place.delegatedUsers) {
        place.delegatedUsers = [];
      }
      if (!place.delegatedUsers.includes(delegatedUserId)) {
        place.delegatedUsers.push(delegatedUserId);
        this.saveToStorage();
        return true;
      }
    }
    return false;
  }

  removeDelegatedUser(placeId: string, ownerId: string, delegatedUserId: string): boolean {
    const place = this.places.find(p => p.id === placeId);
    if (place && place.ownerId === ownerId && place.delegatedUsers) {
      const index = place.delegatedUsers.indexOf(delegatedUserId);
      if (index > -1) {
        place.delegatedUsers.splice(index, 1);
        this.saveToStorage();
        return true;
      }
    }
    return false;
  }

  isUserDelegated(placeId: string, userId: string): boolean {
    const place = this.places.find(p => p.id === placeId);
    if (place && place.delegatedUsers) {
      return place.delegatedUsers.includes(userId);
    }
    return false;
  }

  // Review methods
  createReview(review: Omit<Review, 'id' | 'createdAt' | 'integrityScore' | 'verified' | 'likes' | 'reports'> & { reviewDetails?: any }): Review {
    const { reviewDetails, ...reviewData } = review;
    
    // Get user to include avatar
    const user = this.getUser(reviewData.userId);
    
    const newReview: Review = {
      ...reviewData,
      reviewDetails: reviewDetails,
      id: Date.now().toString(),
      createdAt: new Date(),
      verified: false,
      integrityScore: 0,
      likes: [],
      reports: 0,
      isExpert: false,
      userAvatar: user?.avatar, // Add user avatar to review
    };
    
    // Calculate integrity score
    newReview.integrityScore = this.calculateReviewIntegrity(newReview);
    
    // Auto-verify if integrity score is high enough
    if (newReview.integrityScore >= 70) {
      newReview.verified = true;
    }
    
    this.reviews.push(newReview);
    
    
    // Create notification for place owner
    const place = this.getPlace(reviewData.placeId);
    if (place) {
      this.createNotification({
        userId: place.ownerId,
        type: 'review',
        title: 'تقييم جديد',
        message: `${reviewData.userName} أضاف تقييم جديد على ${place.name}`,
        placeId: reviewData.placeId,
        reviewId: newReview.id,
        actionUrl: `/places/${reviewData.placeId}`,
      });
      
      // Notify users who liked this place about new review
      Object.keys(this.likedPlaces).forEach(userId => {
        if (this.likedPlaces[userId]?.includes(reviewData.placeId) && userId !== reviewData.userId) {
          this.createNotification({
            userId: userId,
            type: 'new_review_on_liked_place',
            title: 'تقييم جديد على مكان مفضل',
            message: `${reviewData.userName} أضاف تقييم جديد على ${place.name} الذي أعجبك`,
            placeId: reviewData.placeId,
            reviewId: newReview.id,
            actionUrl: `/places/${reviewData.placeId}`,
          });
        }
      });
    }
    
    this.saveToStorage();
    return newReview;
  }

  getReviewsByPlace(placeId: string): Review[] {
    return this.reviews.filter(r => r.placeId === placeId).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  getReviewsByUser(userId: string): Review[] {
    return this.reviews.filter(r => r.userId === userId);
  }

  getWeeklyReviewsCount(userId: string): number {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
    startOfWeek.setHours(0, 0, 0, 0);
    
    return this.reviews.filter(r => 
      r.userId === userId && 
      new Date(r.createdAt) >= startOfWeek
    ).length;
  }

  getAllReviews(): Review[] {
    return this.reviews;
  }

  updateReview(reviewId: string, userId: string, updates: Partial<Review> & { reviewDetails?: any }): boolean {
    const review = this.reviews.find(r => r.id === reviewId);
    if (!review || review.userId !== userId) return false;

    // Update review fields
    if (updates.rating !== undefined) review.rating = updates.rating;
    if (updates.comment !== undefined) review.comment = updates.comment;
    if (updates.reviewDetails !== undefined) review.reviewDetails = updates.reviewDetails;
    if (updates.images !== undefined) review.images = updates.images;

    // Recalculate integrity score
    review.integrityScore = this.calculateReviewIntegrity(review);
    review.verified = review.integrityScore >= 70;

    this.saveToStorage();
    return true;
  }

  deleteReview(reviewId: string, userId: string): boolean {
    const review = this.reviews.find(r => r.id === reviewId);
    if (!review || review.userId !== userId) return false;

    // Remove review
    this.reviews = this.reviews.filter(r => r.id !== reviewId);
    this.saveToStorage();
    return true;
  }

  addReviewResponse(reviewId: string, ownerId: string, responseText: string): boolean {
    const review = this.reviews.find(r => r.id === reviewId);
    const place = this.places.find(p => p.id === review?.placeId);
    
    if (review && place && place.ownerId === ownerId) {
      review.ownerResponse = {
        text: responseText,
        respondedAt: new Date(),
      };
      
      // Notify review author
      this.createNotification({
        userId: review.userId,
        type: 'response',
        title: 'رد على تقييمك',
        message: `${place.name} رد على تقييمك`,
        placeId: place.id,
        reviewId: review.id,
        actionUrl: `/places/${place.id}`,
      });
      
      this.saveToStorage();
      return true;
    }
    return false;
  }

  updateReviewResponse(reviewId: string, ownerId: string, responseText: string): boolean {
    const review = this.reviews.find(r => r.id === reviewId);
    const place = this.places.find(p => p.id === review?.placeId);
    
    if (review && place && place.ownerId === ownerId && review.ownerResponse) {
      review.ownerResponse.text = responseText;
      review.ownerResponse.respondedAt = new Date();
      this.saveToStorage();
      return true;
    }
    return false;
  }

  deleteReviewResponse(reviewId: string, ownerId: string): boolean {
    const review = this.reviews.find(r => r.id === reviewId);
    const place = this.places.find(p => p.id === review?.placeId);
    
    if (review && place && place.ownerId === ownerId && review.ownerResponse) {
      review.ownerResponse = undefined;
      this.saveToStorage();
      return true;
    }
    return false;
  }

  getAverageRating(placeId: string): number {
    const placeReviews = this.reviews.filter(r => r.placeId === placeId);
    if (placeReviews.length === 0) return 0;
    const sum = placeReviews.reduce((acc, r) => acc + r.rating, 0);
    return sum / placeReviews.length;
  }

  // Like methods
  toggleLikePlace(userId: string, placeId: string): boolean {
    if (!this.likedPlaces[userId]) {
      this.likedPlaces[userId] = [];
    }
    const index = this.likedPlaces[userId].indexOf(placeId);
    if (index > -1) {
      this.likedPlaces[userId].splice(index, 1);
      this.saveToStorage();
      return false; // unliked
    } else {
      this.likedPlaces[userId].push(placeId);
      this.saveToStorage();
      return true; // liked
    }
  }

  isPlaceLiked(userId: string, placeId: string): boolean {
    return this.likedPlaces[userId]?.includes(placeId) || false;
  }

  getLikedPlaces(userId: string): string[] {
    return this.likedPlaces[userId] || [];
  }

  getLikedPlacesList(userId: string): Place[] {
    const likedIds = this.likedPlaces[userId] || [];
    return this.places.filter(p => likedIds.includes(p.id));
  }

  // Question & Answer methods
  createQuestion(question: Omit<Question, 'id' | 'createdAt' | 'answers'>): Question {
    const newQuestion: Question = {
      ...question,
      id: Date.now().toString(),
      answers: [],
      createdAt: new Date(),
    };
    this.questions.push(newQuestion);
    
    // Notify place owner
    const place = this.getPlace(question.placeId);
    if (place) {
      this.createNotification({
        userId: place.ownerId,
        type: 'new_question_on_owned_place',
        title: 'سؤال جديد',
        message: `${question.userName} سأل عن ${place.name}`,
        placeId: question.placeId,
        questionId: newQuestion.id,
        actionUrl: `/places/${question.placeId}`,
      });
    }
    
    this.saveToStorage();
    return newQuestion;
  }

  getQuestionsByPlace(placeId: string): Question[] {
    return this.questions
      .filter(q => q.placeId === placeId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  updateQuestion(questionId: string, userId: string, questionText: string): boolean {
    const question = this.questions.find(q => q.id === questionId);
    if (!question || question.userId !== userId) return false;
    
    question.question = questionText;
    this.saveToStorage();
    return true;
  }

  deleteQuestion(questionId: string, userId: string): boolean {
    const question = this.questions.find(q => q.id === questionId);
    if (!question || question.userId !== userId) return false;
    
    this.questions = this.questions.filter(q => q.id !== questionId);
    this.saveToStorage();
    return true;
  }

  addAnswer(questionId: string, answer: Omit<Answer, 'id' | 'createdAt'>): Answer {
    const question = this.questions.find(q => q.id === questionId);
    if (!question) throw new Error('Question not found');
    
    const newAnswer: Answer = {
      ...answer,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    
    question.answers.push(newAnswer);
    
    // Notify question author
    if (answer.isOwner) {
      // Owner answered - notify question author
      this.createNotification({
        userId: question.userId,
        type: 'answer',
        title: 'إجابة على سؤالك',
        message: `صاحب ${this.getPlace(question.placeId)?.name || 'المكان'} أجاب على سؤالك`,
        placeId: question.placeId,
        questionId: questionId,
        answerId: newAnswer.id,
        actionUrl: `/places/${question.placeId}`,
      });
    } else {
      // Another user answered
      this.createNotification({
        userId: question.userId,
        type: 'answer',
        title: 'إجابة على سؤالك',
        message: `${answer.userName} أجاب على سؤالك`,
        placeId: question.placeId,
        questionId: questionId,
        answerId: newAnswer.id,
        actionUrl: `/places/${question.placeId}`,
      });
    }
    
    this.saveToStorage();
    return newAnswer;
  }

  updateAnswer(questionId: string, answerId: string, userId: string, answerText: string): boolean {
    const question = this.questions.find(q => q.id === questionId);
    if (!question) return false;
    
    const answer = question.answers.find(a => a.id === answerId);
    if (!answer || answer.userId !== userId) return false;
    
    answer.answer = answerText;
    this.saveToStorage();
    return true;
  }

  deleteAnswer(questionId: string, answerId: string, userId: string): boolean {
    const question = this.questions.find(q => q.id === questionId);
    if (!question) return false;
    
    const answer = question.answers.find(a => a.id === answerId);
    if (!answer || answer.userId !== userId) return false;
    
    question.answers = question.answers.filter(a => a.id !== answerId);
    this.saveToStorage();
    return true;
  }

  // Notification methods
  createNotification(notification: Omit<Notification, 'id' | 'read' | 'createdAt'>): Notification {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      read: false,
      createdAt: new Date(),
    };
    this.notifications.push(newNotification);
    this.saveToStorage();
    return newNotification;
  }

  getNotifications(userId: string): Notification[] {
    return this.notifications
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Get personal notifications (exclude place-related notifications for owned places)
  getPersonalNotifications(userId: string): Notification[] {
    const userPlaces = this.getPlacesByOwner(userId);
    const ownedPlaceIds = userPlaces.map(p => p.id);
    
    return this.notifications
      .filter(n => {
        if (n.userId !== userId) return false;
        
        // Exclude place-related notifications for owned places
        // These should appear in "My Place" page instead
        if (n.placeId && ownedPlaceIds.includes(n.placeId)) {
          // Exclude 'review', 'question', 'new_question_on_owned_place' for owned places
          if (n.type === 'review' || n.type === 'question' || n.type === 'new_question_on_owned_place') {
            return false;
          }
        }
        
        return true;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Get place-related notifications for owned places
  getPlaceNotifications(userId: string): Notification[] {
    const userPlaces = this.getPlacesByOwner(userId);
    const ownedPlaceIds = userPlaces.map(p => p.id);
    
    return this.notifications
      .filter(n => {
        if (n.userId !== userId) return false;
        if (!n.placeId || !ownedPlaceIds.includes(n.placeId)) return false;
        
        // Include only place-related notifications
        return n.type === 'review' || n.type === 'question' || n.type === 'new_question_on_owned_place';
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getUnreadNotificationCount(userId: string): number {
    return this.notifications.filter(n => n.userId === userId && !n.read).length;
  }

  getUnreadPersonalNotificationCount(userId: string): number {
    return this.getPersonalNotifications(userId).filter(n => !n.read).length;
  }

  getUnreadPlaceNotificationCount(userId: string): number {
    return this.getPlaceNotifications(userId).filter(n => !n.read).length;
  }

  markNotificationAsRead(notificationId: string) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.saveToStorage();
    }
  }

  markAllNotificationsAsRead(userId: string) {
    this.notifications
      .filter(n => n.userId === userId && !n.read)
      .forEach(n => n.read = true);
    this.saveToStorage();
  }


  // Timeline/Feed methods
  getTimeline(userId: string, limit: number = 20): Array<{ type: 'review' | 'place'; data: Review | Place; timestamp: Date }> {
    const user = this.getUser(userId);
    const timeline: Array<{ type: 'review' | 'place'; data: Review | Place; timestamp: Date }> = [];
    
    // Get recent reviews
    const recentReviews = this.reviews
      .slice()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
    
    recentReviews.forEach(review => {
      timeline.push({
        type: 'review',
        data: review,
        timestamp: review.createdAt,
      });
    });
    
    // Get new places (personalized by category if user has preferences)
    const userPreferences = user?.preferences?.categories || [];
    let placesToAdd = this.places;
    
    if (userPreferences.length > 0) {
      placesToAdd = this.places.filter(p => 
        userPreferences.includes(p.category)
      );
    }
    
    const newPlaces = placesToAdd
      .slice()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);
    
    newPlaces.forEach(place => {
      timeline.push({
        type: 'place',
        data: place,
        timestamp: place.createdAt,
      });
    });
    
    // Sort by timestamp
    timeline.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    return timeline.slice(0, limit);
  }

  // Review Integrity Methods
  calculateReviewIntegrity(review: Review): number {
    let score = 50; // Base score

    // Check review length (longer reviews are more trustworthy)
    if (review.comment.length > 100) score += 10;
    if (review.comment.length > 200) score += 10;

    // Check if review has images
    if (review.images && review.images.length > 0) score += 10;

    // Check user's review history (more reviews = more trustworthy)
    const userReviews = this.reviews.filter(r => r.userId === review.userId);
    if (userReviews.length > 5) score += 5;
    if (userReviews.length > 20) score += 5;

    return Math.min(100, score);
  }

  // Announcement Methods
  createAnnouncement(announcement: Omit<Announcement, 'id' | 'createdAt'>): Announcement {
    const newAnnouncement: Announcement = {
      ...announcement,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    this.announcements.push(newAnnouncement);
    
    // Notify users who liked this place about new announcement
    const place = this.getPlace(announcement.placeId);
    if (place) {
      Object.keys(this.likedPlaces).forEach(userId => {
        if (this.likedPlaces[userId]?.includes(announcement.placeId)) {
          const announcementTypeNames: { [key: string]: string } = {
            announcement: 'إعلان',
            offer: 'عرض',
            event: 'حدث',
          };
          this.createNotification({
            userId: userId,
            type: 'announcement',
            title: `${announcementTypeNames[announcement.type] || 'إعلان'} جديد`,
            message: `${place.name} نشر ${announcementTypeNames[announcement.type] || 'إعلان'} جديد: ${announcement.title}`,
            placeId: announcement.placeId,
            actionUrl: `/places/${announcement.placeId}`,
          });
        }
      });
    }
    
    this.saveToStorage();
    return newAnnouncement;
  }

  getAnnouncementsByPlace(placeId: string): Announcement[] {
    return this.announcements
      .filter(a => a.placeId === placeId && a.isActive)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  updateAnnouncement(id: string, updates: Partial<Announcement>) {
    const announcement = this.announcements.find(a => a.id === id);
    if (announcement) {
      Object.assign(announcement, updates);
      this.saveToStorage();
    }
  }

  deleteAnnouncement(id: string, ownerId: string): boolean {
    const announcement = this.announcements.find(a => a.id === id);
    const place = this.places.find(p => p.id === announcement?.placeId);
    
    if (announcement && place && place.ownerId === ownerId) {
      this.announcements = this.announcements.filter(a => a.id !== id);
      this.saveToStorage();
      return true;
    }
    return false;
  }

  // Inquiry Methods
  createInquiry(inquiry: Omit<Inquiry, 'id' | 'createdAt' | 'status'>): Inquiry {
    const newInquiry: Inquiry = {
      ...inquiry,
      id: Date.now().toString(),
      status: 'pending',
      createdAt: new Date(),
    };
    this.inquiries.push(newInquiry);
    
    // Notify place owner
    const place = this.getPlace(inquiry.placeId);
    if (place) {
      this.createNotification({
        userId: place.ownerId,
        type: 'question',
        title: 'استفسار جديد',
        message: `${inquiry.userName} أرسل استفسار عن ${place.name}`,
        placeId: inquiry.placeId,
        questionId: newInquiry.id,
        actionUrl: `/places/${inquiry.placeId}`,
      });
    }
    
    this.saveToStorage();
    return newInquiry;
  }

  getInquiriesByPlace(placeId: string): Inquiry[] {
    return this.inquiries
      .filter(i => i.placeId === placeId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  answerInquiry(inquiryId: string, ownerId: string, response: string): boolean {
    const inquiry = this.inquiries.find(i => i.id === inquiryId);
    const place = this.places.find(p => p.id === inquiry?.placeId);
    
    if (inquiry && place && place.ownerId === ownerId) {
      inquiry.ownerResponse = {
        text: response,
        respondedAt: new Date(),
      };
      inquiry.status = 'answered';
      
      // Notify inquiry author
      this.createNotification({
        userId: inquiry.userId,
        type: 'response',
        title: 'رد على استفسارك',
        message: `${place.name} رد على استفسارك`,
        placeId: place.id,
        questionId: inquiryId,
        actionUrl: `/places/${place.id}`,
      });
      
      this.saveToStorage();
      return true;
    }
    return false;
  }

  // Subscription Methods
  createSubscription(subscription: Omit<Subscription, 'id' | 'createdAt'>): Subscription {
    const newSubscription: Subscription = {
      ...subscription,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    this.subscriptions.push(newSubscription);
    this.saveToStorage();
    return newSubscription;
  }

  getActiveSubscription(userId: string, placeId?: string): Subscription | undefined {
    const now = new Date();
    return this.subscriptions.find(s => 
      s.userId === userId &&
      (!placeId || s.placeId === placeId || !s.placeId) &&
      s.isActive &&
      new Date(s.endDate) > now
    );
  }

  getAllUsers(): User[] {
    return this.users;
  }

  private saveToStorage() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('places', JSON.stringify(this.places));
      localStorage.setItem('reviews', JSON.stringify(this.reviews));
      localStorage.setItem('users', JSON.stringify(this.users));
      localStorage.setItem('notifications', JSON.stringify(this.notifications));
      localStorage.setItem('questions', JSON.stringify(this.questions));
      localStorage.setItem('announcements', JSON.stringify(this.announcements));
      localStorage.setItem('inquiries', JSON.stringify(this.inquiries));
      localStorage.setItem('subscriptions', JSON.stringify(this.subscriptions));
      localStorage.setItem('likedPlaces', JSON.stringify(this.likedPlaces));
    } catch (error) {
      console.error('Error saving to storage:', error);
    }
  }

  // Public method to reset all data (useful for development)
  resetData() {
    if (typeof window === 'undefined') return;
    // Clear all localStorage
    localStorage.removeItem('places');
    localStorage.removeItem('reviews');
    localStorage.removeItem('users');
    localStorage.removeItem('questions');
    localStorage.removeItem('notifications');
    localStorage.removeItem('announcements');
    localStorage.removeItem('inquiries');
    localStorage.removeItem('subscriptions');
    localStorage.removeItem('likedPlaces');
    // Clear in-memory data
    this.places = [];
    this.reviews = [];
    this.users = [];
    this.questions = [];
    this.notifications = [];
    this.announcements = [];
    this.inquiries = [];
    this.subscriptions = [];
    this.likedPlaces = {};
    // Reset initialized flag
    this.initialized = false;
    // Re-initialize with new mock data
    this.initializeMockData();
    // Force save
    this.saveToStorage();
  }

  private loadFromStorage() {
    // Check if we're in browser environment
    if (typeof window === 'undefined') return;
    
    try {
      const placesData = localStorage.getItem('places');
      const reviewsData = localStorage.getItem('reviews');
      const usersData = localStorage.getItem('users');
      const notificationsData = localStorage.getItem('notifications');
      const questionsData = localStorage.getItem('questions');
      const announcementsData = localStorage.getItem('announcements');
      const inquiriesData = localStorage.getItem('inquiries');
      const subscriptionsData = localStorage.getItem('subscriptions');
      const likedData = localStorage.getItem('likedPlaces');

      if (placesData) {
        const parsed = JSON.parse(placesData);
        this.places = parsed.map((p: any) => ({
          ...p,
          createdAt: new Date(p.createdAt),
          updatedAt: new Date(p.updatedAt),
        }));
        
        // Update ownerId for specific places to owner
        const placesToUpdate = ['مطعم الشام الأصيل', 'فندق الرياض جراند'];
        let updated = false;
        this.places.forEach(place => {
          if (placesToUpdate.includes(place.name) && place.ownerId !== 'owner') {
            place.ownerId = 'owner';
            place.isClaimed = true;
            updated = true;
          }
        });
        
        if (updated) {
          this.saveToStorage();
        }
        
        this.initialized = true;
      }
      if (reviewsData) {
        const parsed = JSON.parse(reviewsData);
        this.reviews = parsed.map((r: any) => ({
          ...r,
          createdAt: new Date(r.createdAt),
          ownerResponse: r.ownerResponse ? {
            ...r.ownerResponse,
            respondedAt: new Date(r.ownerResponse.respondedAt),
          } : undefined,
        }));
      }
      if (usersData) {
        const parsed = JSON.parse(usersData);
        this.users = parsed.map((u: any) => ({
          ...u,
          createdAt: new Date(u.createdAt),
        }));
      }
      if (notificationsData) {
        const parsed = JSON.parse(notificationsData);
        this.notifications = parsed.map((n: any) => ({
          ...n,
          createdAt: new Date(n.createdAt),
        }));
      }
      if (questionsData) {
        const parsed = JSON.parse(questionsData);
        this.questions = parsed.map((q: any) => ({
          ...q,
          createdAt: new Date(q.createdAt),
          answers: q.answers.map((a: any) => ({
            ...a,
            createdAt: new Date(a.createdAt),
          })),
        }));
      }
      if (announcementsData) {
        const parsed = JSON.parse(announcementsData);
        this.announcements = parsed.map((a: any) => ({
          ...a,
          createdAt: new Date(a.createdAt),
          startDate: a.startDate ? new Date(a.startDate) : undefined,
          endDate: a.endDate ? new Date(a.endDate) : undefined,
        }));
      }
      if (inquiriesData) {
        const parsed = JSON.parse(inquiriesData);
        this.inquiries = parsed.map((i: any) => ({
          ...i,
          createdAt: new Date(i.createdAt),
          ownerResponse: i.ownerResponse ? {
            ...i.ownerResponse,
            respondedAt: new Date(i.ownerResponse.respondedAt),
          } : undefined,
        }));
      }
      if (subscriptionsData) {
        const parsed = JSON.parse(subscriptionsData);
        this.subscriptions = parsed.map((s: any) => ({
          ...s,
          createdAt: new Date(s.createdAt),
          startDate: new Date(s.startDate),
          endDate: new Date(s.endDate),
        }));
      }
      if (likedData) {
        this.likedPlaces = JSON.parse(likedData);
      }
    } catch (error) {
      console.error('Error loading from storage:', error);
    }
  }
}

// Export singleton instance
export const dataStore = new DataStore();
