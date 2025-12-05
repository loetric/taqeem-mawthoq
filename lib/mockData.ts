import { Place, User, Review, Question, Category } from '@/types';

export const categories: Category[] = [
  { id: '1', name: 'Restaurant', nameAr: 'مطعم', icon: '🍽️', color: '#ef4444' },
  { id: '2', name: 'Cafe', nameAr: 'مقهى', icon: '☕', color: '#f59e0b' },
  { id: '3', name: 'Shopping', nameAr: 'تسوق', icon: '🛍️', color: '#3b82f6' },
  { id: '4', name: 'Entertainment', nameAr: 'ترفيه', icon: '🎬', color: '#8b5cf6' },
  { id: '5', name: 'Hotel', nameAr: 'فندق', icon: '🏨', color: '#ec4899' },
  { id: '6', name: 'Beauty', nameAr: 'جمال', icon: '💅', color: '#f43f5e' },
  { id: '7', name: 'Fitness', nameAr: 'لياقة', icon: '💪', color: '#10b981' },
  { id: '8', name: 'Medical', nameAr: 'طبي', icon: '🏥', color: '#06b6d4' },
  { id: '9', name: 'School', nameAr: 'مدرسة', icon: '🎓', color: '#f59e0b' },
  { id: '10', name: 'Hospital', nameAr: 'مستشفى', icon: '🏥', color: '#ef4444' },
  { id: '11', name: 'Municipal', nameAr: 'بلدية', icon: '🏛️', color: '#6366f1' },
  { id: '12', name: 'Government', nameAr: 'حكومي', icon: '🏢', color: '#8b5cf6' },
  { id: '13', name: 'Public Garden', nameAr: 'حديقة عامة', icon: '🌳', color: '#10b981' },
];

export const mockPlaces: Omit<Place, 'id' | 'createdAt' | 'updatedAt'>[] = [
  // Restaurants
  {
    ownerId: 'owner',
    name: 'مطعم الشام الأصيل',
    description: 'مطعم سوري أصيل يقدم أشهى المأكولات الشامية التقليدية في أجواء عربية أصيلة',
    category: 'مطعم',
    placeType: 'restaurant',
    googleMapsUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3610.198509811!2d46.6753!3d24.7136!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjTCsDQyJzQ5LjAiTiA0NsKwNDAnMzEuMSJF!5e0!3m2!1sen!2ssa!4v1234567890',
    phone: '+966501234567',
    address: 'طريق الملك فهد، الرياض',
    imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
    location: { lat: 24.7136, lng: 46.6753 },
    isClaimed: true,
    verified: true,
    verifiedBy: 'system',
    hours: {
      'الأحد': { open: '10:00', close: '23:00' },
      'الإثنين': { open: '10:00', close: '23:00' },
      'الثلاثاء': { open: '10:00', close: '23:00' },
      'الأربعاء': { open: '10:00', close: '23:00' },
      'الخميس': { open: '10:00', close: '00:00' },
      'الجمعة': { open: '12:00', close: '00:00' },
      'السبت': { open: '10:00', close: '23:00' },
    },
  },
  {
    ownerId: 'owner13',
    name: 'مطعم البحر الأحمر',
    description: 'مطعم بحري يقدم أشهى المأكولات البحرية الطازجة من البحر الأحمر',
    category: 'مطعم',
    placeType: 'restaurant',
    googleMapsUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3610.198509811!2d46.6753!3d24.7136!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjTCsDQyJzQ5LjAiTiA0NsKwNDAnMzEuMSJF!5e0!3m2!1sen!2ssa!4v1234567890',
    phone: '+966501234580',
    address: 'حي العليا، الرياض',
    imageUrl: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800',
    location: { lat: 24.7250, lng: 46.6900 },
    isClaimed: true,
    verified: true,
    verifiedBy: 'system',
    hours: {
      'الأحد': { open: '12:00', close: '23:00' },
      'الإثنين': { open: '12:00', close: '23:00' },
      'الثلاثاء': { open: '12:00', close: '23:00' },
      'الأربعاء': { open: '12:00', close: '23:00' },
      'الخميس': { open: '12:00', close: '00:00' },
      'الجمعة': { open: '13:00', close: '00:00' },
      'السبت': { open: '12:00', close: '23:00' },
    },
  },
  {
    ownerId: 'owner14',
    name: 'مطعم النخيل الذهبي',
    description: 'مطعم سعودي أصيل يقدم المأكولات التقليدية السعودية في أجواء تراثية',
    category: 'مطعم',
    placeType: 'restaurant',
    googleMapsUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3610.198509811!2d46.6753!3d24.7136!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjTCsDQyJzQ5LjAiTiA0NsKwNDAnMzEuMSJF!5e0!3m2!1sen!2ssa!4v1234567890',
    phone: '+966501234581',
    address: 'طريق العروبة، الرياض',
    imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop',
    location: { lat: 24.7150, lng: 46.6750 },
    isClaimed: true,
    verified: false,
    hours: {
      'الأحد': { open: '11:00', close: '23:00' },
      'الإثنين': { open: '11:00', close: '23:00' },
      'الثلاثاء': { open: '11:00', close: '23:00' },
      'الأربعاء': { open: '11:00', close: '23:00' },
      'الخميس': { open: '11:00', close: '00:00' },
      'الجمعة': { open: '12:00', close: '00:00' },
      'السبت': { open: '11:00', close: '23:00' },
    },
  },
  // Cafes
  {
    ownerId: 'owner2',
    name: 'مقهى البن العربي',
    description: 'قهوة عربية أصيلة من أجود أنواع البن المحمص محلياً مع أجواء هادئة للعمل والاسترخاء',
    category: 'مقهى',
    placeType: 'cafe',
    googleMapsUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3610.198509811!2d46.6753!3d24.7136!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjTCsDQyJzQ5LjAiTiA0NsKwNDAnMzEuMSJF!5e0!3m2!1sen!2ssa!4v1234567890',
    phone: '+966501234568',
    address: 'حي العليا، الرياض',
    imageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800',
    location: { lat: 24.7200, lng: 46.6800 },
    isClaimed: true,
    verified: false,
    hours: {
      'الأحد': { open: '07:00', close: '23:00' },
      'الإثنين': { open: '07:00', close: '23:00' },
      'الثلاثاء': { open: '07:00', close: '23:00' },
      'الأربعاء': { open: '07:00', close: '23:00' },
      'الخميس': { open: '07:00', close: '00:00' },
      'الجمعة': { open: '08:00', close: '00:00' },
      'السبت': { open: '07:00', close: '23:00' },
    },
  },
  {
    ownerId: 'owner15',
    name: 'كافيه ستاربكس - فرع العليا',
    description: 'مقهى عالمي يقدم القهوة المختصة والحلويات في أجواء عصرية مريحة',
    category: 'مقهى',
    placeType: 'cafe',
    googleMapsUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3610.198509811!2d46.6753!3d24.7136!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjTCsDQyJzQ5LjAiTiA0NsKwNDAnMzEuMSJF!5e0!3m2!1sen!2ssa!4v1234567890',
    phone: '+966501234582',
    address: 'طريق الأمير سلطان، الرياض',
    imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800',
    location: { lat: 24.7100, lng: 46.6850 },
    isClaimed: true,
    verified: true,
    verifiedBy: 'system',
    hours: {
      'الأحد': { open: '06:00', close: '23:00' },
      'الإثنين': { open: '06:00', close: '23:00' },
      'الثلاثاء': { open: '06:00', close: '23:00' },
      'الأربعاء': { open: '06:00', close: '23:00' },
      'الخميس': { open: '06:00', close: '00:00' },
      'الجمعة': { open: '07:00', close: '00:00' },
      'السبت': { open: '06:00', close: '23:00' },
    },
  },
  // Shopping
  {
    ownerId: 'owner3',
    name: 'مركز التسوق الذهبي',
    description: 'أكبر مركز تسوق في المنطقة مع أكثر من 200 متجر وماركة عالمية',
    category: 'تسوق',
    placeType: 'shopping',
    googleMapsUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3610.198509811!2d46.6753!3d24.7136!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjTCsDQyJzQ5LjAiTiA0NsKwNDAnMzEuMSJF!5e0!3m2!1sen!2ssa!4v1234567890',
    phone: '+966501234569',
    address: 'طريق العروبة، الرياض',
    imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',
    location: { lat: 24.7000, lng: 46.6700 },
    isClaimed: false,
    verified: false,
    hours: {
      'الأحد': { open: '10:00', close: '23:00' },
      'الإثنين': { open: '10:00', close: '23:00' },
      'الثلاثاء': { open: '10:00', close: '23:00' },
      'الأربعاء': { open: '10:00', close: '23:00' },
      'الخميس': { open: '10:00', close: '00:00' },
      'الجمعة': { open: '14:00', close: '00:00' },
      'السبت': { open: '10:00', close: '23:00' },
    },
  },
  {
    ownerId: 'owner16',
    name: 'سوق العليا',
    description: 'سوق شعبي يقدم المنتجات المحلية والأطعمة التقليدية',
    category: 'تسوق',
    placeType: 'shopping',
    googleMapsUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3610.198509811!2d46.6753!3d24.7136!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjTCsDQyJzQ5LjAiTiA0NsKwNDAnMzEuMSJF!5e0!3m2!1sen!2ssa!4v1234567890',
    phone: '+966501234583',
    address: 'حي العليا، الرياض',
    imageUrl: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800',
    location: { lat: 24.7200, lng: 46.6800 },
    isClaimed: false,
    verified: false,
    hours: {
      'الأحد': { open: '08:00', close: '22:00' },
      'الإثنين': { open: '08:00', close: '22:00' },
      'الثلاثاء': { open: '08:00', close: '22:00' },
      'الأربعاء': { open: '08:00', close: '22:00' },
      'الخميس': { open: '08:00', close: '23:00' },
      'الجمعة': { open: '14:00', close: '23:00' },
      'السبت': { open: '08:00', close: '22:00' },
    },
  },
  // Entertainment
  {
    ownerId: 'owner17',
    name: 'سينما فوكس - العليا',
    description: 'مجمع سينمائي حديث مع أحدث تقنيات العرض والصوت',
    category: 'ترفيه',
    placeType: 'entertainment',
    googleMapsUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3610.198509811!2d46.6753!3d24.7136!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjTCsDQyJzQ5LjAiTiA0NsKwNDAnMzEuMSJF!5e0!3m2!1sen!2ssa!4v1234567890',
    phone: '+966501234584',
    address: 'طريق الملك فهد، الرياض',
    imageUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800',
    location: { lat: 24.7300, lng: 46.6900 },
    isClaimed: true,
    verified: true,
    verifiedBy: 'system',
    hours: {
      'الأحد': { open: '12:00', close: '00:00' },
      'الإثنين': { open: '12:00', close: '00:00' },
      'الثلاثاء': { open: '12:00', close: '00:00' },
      'الأربعاء': { open: '12:00', close: '00:00' },
      'الخميس': { open: '12:00', close: '01:00' },
      'الجمعة': { open: '14:00', close: '01:00' },
      'السبت': { open: '12:00', close: '00:00' },
    },
  },
  // Hotels
  {
    ownerId: 'owner',
    name: 'فندق الرياض جراند',
    description: 'فندق فاخر 5 نجوم في قلب الرياض مع خدمات راقية ومرافق متكاملة',
    category: 'فندق',
    placeType: 'hotel',
    googleMapsUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3610.198509811!2d46.6753!3d24.7136!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjTCsDQyJzQ5LjAiTiA0NsKwNDAnMzEuMSJF!5e0!3m2!1sen!2ssa!4v1234567890',
    phone: '+966501234585',
    address: 'طريق الملك فهد، الرياض',
    imageUrl: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
    images: [
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
      'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800',
    ],
    location: { lat: 24.7400, lng: 46.7000 },
    isClaimed: true,
    verified: true,
    verifiedBy: 'system',
    hours: {
      'الأحد': { open: '00:00', close: '23:59' },
      'الإثنين': { open: '00:00', close: '23:59' },
      'الثلاثاء': { open: '00:00', close: '23:59' },
      'الأربعاء': { open: '00:00', close: '23:59' },
      'الخميس': { open: '00:00', close: '23:59' },
      'الجمعة': { open: '00:00', close: '23:59' },
      'السبت': { open: '00:00', close: '23:59' },
    },
  },
  // Beauty
  {
    ownerId: 'owner4',
    name: 'صالون الجمال الملكي',
    description: 'صالون تجميل متخصص في قص وتصفيف الشعر والعناية بالبشرة',
    category: 'جمال',
    placeType: 'beauty',
    googleMapsUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3610.198509811!2d46.6753!3d24.7136!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjTCsDQyJzQ5LjAiTiA0NsKwNDAnMzEuMSJF!5e0!3m2!1sen!2ssa!4v1234567890',
    phone: '+966501234570',
    address: 'حي النرجس، الرياض',
    imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800',
    location: { lat: 24.7300, lng: 46.6900 },
    isClaimed: true,
    verified: true,
    verifiedBy: 'system',
    hours: {
      'الأحد': { open: '09:00', close: '21:00' },
      'الإثنين': { open: '09:00', close: '21:00' },
      'الثلاثاء': { open: '09:00', close: '21:00' },
      'الأربعاء': { open: '09:00', close: '21:00' },
      'الخميس': { open: '09:00', close: '22:00' },
      'الجمعة': { open: '14:00', close: '22:00' },
      'السبت': { open: '09:00', close: '21:00' },
    },
  },
  // Fitness
  {
    ownerId: 'owner5',
    name: 'نادي اللياقة البدنية',
    description: 'صالة ألعاب رياضية حديثة مع أحدث الأجهزة والمدربين المحترفين',
    category: 'لياقة',
    placeType: 'fitness',
    googleMapsUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3610.198509811!2d46.6753!3d24.7136!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjTCsDQyJzQ5LjAiTiA0NsKwNDAnMzEuMSJF!5e0!3m2!1sen!2ssa!4v1234567890',
    phone: '+966501234571',
    address: 'طريق الأمير سلطان، الرياض',
    imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800',
    location: { lat: 24.7100, lng: 46.6850 },
    isClaimed: true,
    verified: false,
    hours: {
      'الأحد': { open: '06:00', close: '23:00' },
      'الإثنين': { open: '06:00', close: '23:00' },
      'الثلاثاء': { open: '06:00', close: '23:00' },
      'الأربعاء': { open: '06:00', close: '23:00' },
      'الخميس': { open: '06:00', close: '23:00' },
      'الجمعة': { open: '08:00', close: '22:00' },
      'السبت': { open: '06:00', close: '23:00' },
    },
  },
  // Medical
  {
    ownerId: 'owner19',
    name: 'عيادة النور الطبية',
    description: 'عيادة طبية متخصصة تقدم خدمات صحية شاملة مع أطباء خبراء',
    category: 'طبي',
    placeType: 'medical',
    googleMapsUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3610.198509811!2d46.6753!3d24.7136!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjTCsDQyJzQ5LjAiTiA0NsKwNDAnMzEuMSJF!5e0!3m2!1sen!2ssa!4v1234567890',
    phone: '+966501234586',
    address: 'حي النرجس، الرياض',
    imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800',
    images: [
      'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800',
      'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800',
      'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=800',
      'https://images.unsplash.com/photo-1504439468489-c8920d796a29?w=800',
    ],
    location: { lat: 24.7350, lng: 46.6950 },
    isClaimed: true,
    verified: true,
    verifiedBy: 'system',
    hours: {
      'الأحد': { open: '08:00', close: '20:00' },
      'الإثنين': { open: '08:00', close: '20:00' },
      'الثلاثاء': { open: '08:00', close: '20:00' },
      'الأربعاء': { open: '08:00', close: '20:00' },
      'الخميس': { open: '08:00', close: '20:00' },
      'الجمعة': { open: '14:00', close: '20:00' },
      'السبت': { open: '08:00', close: '20:00' },
    },
  },
  // Schools
  {
    ownerId: 'owner6',
    name: 'مدرسة النور الدولية',
    description: 'مدرسة دولية معتمدة تقدم تعليماً متميزاً من الروضة حتى الثانوية العامة',
    category: 'مدرسة',
    placeType: 'school',
    googleMapsUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3610.198509811!2d46.6753!3d24.7136!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjTCsDQyJzQ5LjAiTiA0NsKwNDAnMzEuMSJF!5e0!3m2!1sen!2ssa!4v1234567890',
    phone: '+966501234572',
    address: 'حي النرجس، الرياض',
    imageUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800',
    location: { lat: 24.7400, lng: 46.7000 },
    isClaimed: true,
    verified: true,
    verifiedBy: 'system',
  },
  {
    ownerId: 'owner20',
    name: 'مدرسة الأمل الابتدائية',
    description: 'مدرسة ابتدائية حكومية تقدم تعليماً متميزاً للطلاب والطالبات',
    category: 'مدرسة',
    placeType: 'school',
    googleMapsUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3610.198509811!2d46.6753!3d24.7136!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjTCsDQyJzQ5LjAiTiA0NsKwNDAnMzEuMSJF!5e0!3m2!1sen!2ssa!4v1234567890',
    phone: '+966501234587',
    address: 'حي العليا، الرياض',
    imageUrl: 'https://images.unsplash.com/photo-1580584126903-c17d41830450?w=800',
    location: { lat: 24.7250, lng: 46.6900 },
    isClaimed: false,
    verified: true,
    verifiedBy: 'system',
  },
  // Hospitals
  {
    ownerId: 'owner7',
    name: 'مستشفى الملك فهد التخصصي',
    description: 'مستشفى متخصص يقدم خدمات طبية متقدمة في مختلف التخصصات مع أحدث الأجهزة الطبية',
    category: 'مستشفى',
    placeType: 'hospital',
    googleMapsUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3610.198509811!2d46.6753!3d24.7136!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjTCsDQyJzQ5LjAiTiA0NsKwNDAnMzEuMSJF!5e0!3m2!1sen!2ssa!4v1234567890',
    phone: '+966501234573',
    address: 'طريق الملك فهد، الرياض',
    imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800',
    location: { lat: 24.7500, lng: 46.7100 },
    isClaimed: true,
    verified: true,
    verifiedBy: 'system',
    hours: {
      'الأحد': { open: '00:00', close: '23:59' },
      'الإثنين': { open: '00:00', close: '23:59' },
      'الثلاثاء': { open: '00:00', close: '23:59' },
      'الأربعاء': { open: '00:00', close: '23:59' },
      'الخميس': { open: '00:00', close: '23:59' },
      'الجمعة': { open: '00:00', close: '23:59' },
      'السبت': { open: '00:00', close: '23:59' },
    },
  },
  {
    ownerId: 'owner21',
    name: 'مستشفى الملك سعود',
    description: 'مستشفى حكومي كبير يقدم خدمات طبية شاملة للمواطنين',
    category: 'مستشفى',
    placeType: 'hospital',
    googleMapsUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3610.198509811!2d46.6753!3d24.7136!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjTCsDQyJzQ5LjAiTiA0NsKwNDAnMzEuMSJF!5e0!3m2!1sen!2ssa!4v1234567890',
    phone: '+966501234588',
    address: 'طريق العروبة، الرياض',
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999e8?w=800',
    location: { lat: 24.7050, lng: 46.6820 },
    isClaimed: false,
    verified: true,
    verifiedBy: 'system',
    hours: {
      'الأحد': { open: '00:00', close: '23:59' },
      'الإثنين': { open: '00:00', close: '23:59' },
      'الثلاثاء': { open: '00:00', close: '23:59' },
      'الأربعاء': { open: '00:00', close: '23:59' },
      'الخميس': { open: '00:00', close: '23:59' },
      'الجمعة': { open: '00:00', close: '23:59' },
      'السبت': { open: '00:00', close: '23:59' },
    },
  },
  // Municipal
  {
    ownerId: 'owner8',
    name: 'بلدية الرياض - فرع العليا',
    description: 'مكتب بلدية يقدم خدمات البلدية للمواطنين في منطقة العليا',
    category: 'بلدية',
    placeType: 'other',
    googleMapsUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3610.198509811!2d46.6753!3d24.7136!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjTCsDQyJzQ5LjAiTiA0NsKwNDAnMzEuMSJF!5e0!3m2!1sen!2ssa!4v1234567890',
    phone: '+966112345678',
    address: 'حي العليا، الرياض',
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800',
    location: { lat: 24.7200, lng: 46.6800 },
    isClaimed: false,
    verified: true,
    verifiedBy: 'system',
    hours: {
      'الأحد': { open: '07:30', close: '14:30' },
      'الإثنين': { open: '07:30', close: '14:30' },
      'الثلاثاء': { open: '07:30', close: '14:30' },
      'الأربعاء': { open: '07:30', close: '14:30' },
      'الخميس': { open: '07:30', close: '14:30' },
      'الجمعة': { open: '00:00', close: '00:00', closed: true },
      'السبت': { open: '00:00', close: '00:00', closed: true },
    },
  },
  {
    ownerId: 'owner12',
    name: 'بلدية الرياض - فرع النرجس',
    description: 'مكتب بلدية يقدم جميع الخدمات البلدية للمواطنين',
    category: 'بلدية',
    placeType: 'other',
    googleMapsUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3610.198509811!2d46.6753!3d24.7136!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjTCsDQyJzQ5LjAiTiA0NsKwNDAnMzEuMSJF!5e0!3m2!1sen!2ssa!4v1234567890',
    phone: '+966112345682',
    address: 'حي النرجس، الرياض',
    imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
    location: { lat: 24.7600, lng: 46.7200 },
    isClaimed: false,
    verified: true,
    verifiedBy: 'system',
    hours: {
      'الأحد': { open: '07:30', close: '14:30' },
      'الإثنين': { open: '07:30', close: '14:30' },
      'الثلاثاء': { open: '07:30', close: '14:30' },
      'الأربعاء': { open: '07:30', close: '14:30' },
      'الخميس': { open: '07:30', close: '14:30' },
      'الجمعة': { open: '00:00', close: '00:00', closed: true },
      'السبت': { open: '00:00', close: '00:00', closed: true },
    },
  },
  {
    ownerId: 'owner22',
    name: 'بلدية الرياض - فرع العروبة',
    description: 'مكتب بلدية يقدم خدمات تراخيص البناء والنظافة والصحة العامة',
    category: 'بلدية',
    placeType: 'other',
    googleMapsUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3610.198509811!2d46.6753!3d24.7136!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjTCsDQyJzQ5LjAiTiA0NsKwNDAnMzEuMSJF!5e0!3m2!1sen!2ssa!4v1234567890',
    phone: '+966112345689',
    address: 'طريق العروبة، الرياض',
    imageUrl: 'https://images.unsplash.com/photo-1587440871875-191322ee64b0?w=800',
    location: { lat: 24.7050, lng: 46.6820 },
    isClaimed: false,
    verified: true,
    verifiedBy: 'system',
    hours: {
      'الأحد': { open: '07:30', close: '14:30' },
      'الإثنين': { open: '07:30', close: '14:30' },
      'الثلاثاء': { open: '07:30', close: '14:30' },
      'الأربعاء': { open: '07:30', close: '14:30' },
      'الخميس': { open: '07:30', close: '14:30' },
      'الجمعة': { open: '00:00', close: '00:00', closed: true },
      'السبت': { open: '00:00', close: '00:00', closed: true },
    },
  },
  // Government
  {
    ownerId: 'owner9',
    name: 'وزارة الصحة - مكتب الخدمات',
    description: 'مكتب حكومي يقدم خدمات صحية وتراخيص للمواطنين',
    category: 'حكومي',
    placeType: 'other',
    googleMapsUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3610.198509811!2d46.6753!3d24.7136!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjTCsDQyJzQ5LjAiTiA0NsKwNDAnMzEuMSJF!5e0!3m2!1sen!2ssa!4v1234567890',
    phone: '+966112345679',
    address: 'طريق الملك فهد، الرياض',
    imageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
    location: { lat: 24.7300, lng: 46.6900 },
    isClaimed: false,
    verified: true,
    verifiedBy: 'system',
    hours: {
      'الأحد': { open: '07:30', close: '14:30' },
      'الإثنين': { open: '07:30', close: '14:30' },
      'الثلاثاء': { open: '07:30', close: '14:30' },
      'الأربعاء': { open: '07:30', close: '14:30' },
      'الخميس': { open: '07:30', close: '14:30' },
      'الجمعة': { open: '00:00', close: '00:00', closed: true },
      'السبت': { open: '00:00', close: '00:00', closed: true },
    },
  },
  {
    ownerId: 'owner23',
    name: 'وزارة التجارة - مكتب الخدمات',
    description: 'مكتب حكومي يقدم خدمات تراخيص التجارة والاستثمار',
    category: 'حكومي',
    placeType: 'other',
    googleMapsUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3610.198509811!2d46.6753!3d24.7136!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjTCsDQyJzQ5LjAiTiA0NsKwNDAnMzEuMSJF!5e0!3m2!1sen!2ssa!4v1234567890',
    phone: '+966112345690',
    address: 'طريق الأمير سلطان، الرياض',
    imageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800',
    location: { lat: 24.7150, lng: 46.6750 },
    isClaimed: false,
    verified: true,
    verifiedBy: 'system',
    hours: {
      'الأحد': { open: '07:30', close: '14:30' },
      'الإثنين': { open: '07:30', close: '14:30' },
      'الثلاثاء': { open: '07:30', close: '14:30' },
      'الأربعاء': { open: '07:30', close: '14:30' },
      'الخميس': { open: '07:30', close: '14:30' },
      'الجمعة': { open: '00:00', close: '00:00', closed: true },
      'السبت': { open: '00:00', close: '00:00', closed: true },
    },
  },
  // Public Gardens
  {
    ownerId: 'owner10',
    name: 'حديقة الملك فهد',
    description: 'حديقة عامة واسعة مع مساحات خضراء وملاعب للأطفال ومناطق للتنزه',
    category: 'حديقة عامة',
    placeType: 'other',
    googleMapsUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3610.198509811!2d46.6753!3d24.7136!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjTCsDQyJzQ5LjAiTiA0NsKwNDAnMzEuMSJF!5e0!3m2!1sen!2ssa!4v1234567890',
    phone: undefined,
    address: 'طريق الملك فهد، الرياض',
    imageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800',
    location: { lat: 24.7400, lng: 46.7000 },
    isClaimed: false,
    verified: true,
    verifiedBy: 'system',
    hours: {
      'الأحد': { open: '06:00', close: '22:00' },
      'الإثنين': { open: '06:00', close: '22:00' },
      'الثلاثاء': { open: '06:00', close: '22:00' },
      'الأربعاء': { open: '06:00', close: '22:00' },
      'الخميس': { open: '06:00', close: '22:00' },
      'الجمعة': { open: '06:00', close: '22:00' },
      'السبت': { open: '06:00', close: '22:00' },
    },
  },
  {
    ownerId: 'owner11',
    name: 'حديقة العليا العامة',
    description: 'حديقة عامة جميلة مع مسارات للمشي وملاعب ومساحات خضراء',
    category: 'حديقة عامة',
    placeType: 'other',
    googleMapsUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3610.198509811!2d46.6753!3d24.7136!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjTCsDQyJzQ5LjAiTiA0NsKwNDAnMzEuMSJF!5e0!3m2!1sen!2ssa!4v1234567890',
    phone: undefined,
    address: 'حي العليا، الرياض',
    imageUrl: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=800',
    location: { lat: 24.7500, lng: 46.7100 },
    isClaimed: false,
    verified: true,
    verifiedBy: 'system',
    hours: {
      'الأحد': { open: '06:00', close: '22:00' },
      'الإثنين': { open: '06:00', close: '22:00' },
      'الثلاثاء': { open: '06:00', close: '22:00' },
      'الأربعاء': { open: '06:00', close: '22:00' },
      'الخميس': { open: '06:00', close: '22:00' },
      'الجمعة': { open: '06:00', close: '22:00' },
      'السبت': { open: '06:00', close: '22:00' },
    },
  },
  {
    ownerId: 'owner24',
    name: 'حديقة النرجس',
    description: 'حديقة عامة صغيرة ونظيفة مع مساحات خضراء وملاعب للأطفال',
    category: 'حديقة عامة',
    placeType: 'other',
    googleMapsUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3610.198509811!2d46.6753!3d24.7136!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjTCsDQyJzQ5LjAiTiA0NsKwNDAnMzEuMSJF!5e0!3m2!1sen!2ssa!4v1234567890',
    phone: undefined,
    address: 'حي النرجس، الرياض',
    imageUrl: 'https://images.unsplash.com/photo-1519336056116-9e384d0fbd30?w=800',
    location: { lat: 24.7300, lng: 46.6900 },
    isClaimed: false,
    verified: true,
    verifiedBy: 'system',
    hours: {
      'الأحد': { open: '06:00', close: '22:00' },
      'الإثنين': { open: '06:00', close: '22:00' },
      'الثلاثاء': { open: '06:00', close: '22:00' },
      'الأربعاء': { open: '06:00', close: '22:00' },
      'الخميس': { open: '06:00', close: '22:00' },
      'الجمعة': { open: '06:00', close: '22:00' },
      'السبت': { open: '06:00', close: '22:00' },
    },
  },
];

export const mockReviews: Omit<Review, 'id' | 'createdAt' | 'integrityScore' | 'verified' | 'likes' | 'reports'>[] = [
  // Restaurant Reviews - Expert
  {
    placeId: '1',
    userId: 'user',
    userName: 'أحمد محمد الخبير',
    rating: 5,
    comment: 'مطعم رائع بكل المقاييس! الطعام لذيذ جداً والخدمة ممتازة. أنصح الجميع بتجربته. الجودة عالية والأسعار معقولة.',
  },
  {
    placeId: '1',
    userId: 'user',
    userName: 'أحمد محمد الخبير',
    rating: 5,
    comment: 'هذه زيارتي الثانية وكانت أفضل! الجودة ثابتة والموظفون يتذكرون العملاء الدائمين. تجربة استثنائية.',
  },
  // Restaurant Reviews - Regular Users
  {
    placeId: '1',
    userId: 'user',
    userName: 'فاطمة علي',
    rating: 4,
    comment: 'تجربة جميلة، الأسعار معقولة والجو هادئ. الطعام لذيذ لكن الخدمة تحتاج تحسين بسيط.',
  },
  {
    placeId: '1',
    userId: 'owner',
    userName: 'خالد سعيد',
    rating: 5,
    comment: 'مطعم ممتاز! أنصح به بشدة. الطعام طازج والخدمة سريعة.',
  },
  {
    placeId: '1',
    userId: 'user',
    userName: 'سارة أحمد',
    rating: 4,
    comment: 'المكان نظيف والطعام لذيذ. الأسعار مناسبة للجودة المقدمة.',
  },
  {
    placeId: '2',
    userId: 'user',
    userName: 'أحمد محمد الخبير',
    rating: 5,
    comment: 'أفضل قهوة في المدينة! المكان نظيف والموظفون ودودون. أجواء هادئة للعمل والاسترخاء.',
  },
  {
    placeId: '2',
    userId: 'user',
    userName: 'فاطمة علي',
    rating: 4,
    comment: 'قهوة جيدة والأجواء مريحة. مناسب للعمل والدراسة.',
  },
  {
    placeId: '2',
    userId: 'owner',
    userName: 'محمد عبدالله',
    rating: 5,
    comment: 'مقهى رائع! القهوة ممتازة والخدمة سريعة. المكان هادئ ومناسب للاجتماعات.',
  },
  {
    placeId: '3',
    userId: 'owner',
    userName: 'خالد سعيد',
    rating: 4,
    comment: 'مركز تسوق كبير مع العديد من المتاجر. موقف السيارات مريح.',
  },
  {
    placeId: '3',
    userId: 'user',
    userName: 'سارة أحمد',
    rating: 5,
    comment: 'أفضل مركز تسوق! جميع الماركات متوفرة والخدمة ممتازة.',
  },
  {
    placeId: '4',
    userId: 'user',
    userName: 'فاطمة علي',
    rating: 5,
    comment: 'صالون رائع! الخدمة احترافية والنتائج ممتازة. أنصح به بشدة.',
  },
  {
    placeId: '4',
    userId: 'user',
    userName: 'نورا حسن',
    rating: 5,
    comment: 'أفضل صالون في المنطقة! الفريق محترف والنتائج رائعة دائماً.',
  },
  {
    placeId: '5',
    userId: 'owner',
    userName: 'خالد سعيد',
    rating: 4,
    comment: 'صالة ألعاب حديثة مع أحدث الأجهزة. المدربون محترفون.',
  },
  {
    placeId: '5',
    userId: 'owner',
    userName: 'عمر يوسف',
    rating: 5,
    comment: 'نادي ممتاز! الأجهزة حديثة والمدربون خبراء. أنصح به بشدة.',
  },
  {
    placeId: '6',
    userId: 'user',
    userName: 'فاطمة علي',
    rating: 5,
    comment: 'مدرسة ممتازة! التعليم عالي الجودة والمعلمون محترفون.',
  },
  {
    placeId: '6',
    userId: 'user',
    userName: 'ليلى محمد',
    rating: 4,
    comment: 'مدرسة جيدة مع معلمين محترفين. المنهج قوي والبيئة تعليمية ممتازة.',
  },
  {
    placeId: '7',
    userId: 'owner',
    userName: 'خالد سعيد',
    rating: 5,
    comment: 'مستشفى متقدم مع أحدث الأجهزة الطبية. الأطباء خبراء والخدمة ممتازة.',
  },
  {
    placeId: '7',
    userId: 'owner',
    userName: 'يوسف أحمد',
    rating: 5,
    comment: 'مستشفى ممتاز! الخدمة الطبية احترافية والأطباء خبراء. أنصح به بشدة.',
  },
  // Municipal Reviews - Expert
  {
    placeId: '8',
    userId: 'user',
    userName: 'أحمد محمد الخبير',
    rating: 4,
    comment: 'مكتب بلدية منظم والموظفون محترفون. الخدمة سريعة والاستقبال جيد. الإجراءات واضحة والانتظار معقول.',
  },
  {
    placeId: '8',
    userId: 'user',
    userName: 'أحمد محمد الخبير',
    rating: 4,
    comment: 'خدمة بلدية جيدة. الموظفون متعاونون والإجراءات واضحة. يحتاج لتحسين في سرعة المعاملات.',
  },
  // Municipal Reviews - Regular Users
  {
    placeId: '8',
    userId: 'user',
    userName: 'فاطمة علي',
    rating: 3,
    comment: 'الخدمة جيدة لكن الانتظار طويل قليلاً. الموقع مناسب والموظفون ودودون.',
  },
  {
    placeId: '8',
    userId: 'user',
    userName: 'عبدالرحمن خالد',
    rating: 4,
    comment: 'مكتب بلدية منظم. الخدمة متاحة والموظفون يساعدون. الإجراءات واضحة.',
  },
  {
    placeId: '8',
    userId: 'owner',
    userName: 'مريم سعد',
    rating: 3,
    comment: 'الخدمة متوسطة. يحتاج لتحسين في التنظيم والسرعة. الموظفون ودودون.',
  },
  {
    placeId: '12',
    userId: 'user',
    userName: 'أحمد محمد الخبير',
    rating: 4,
    comment: 'مكتب بلدية جيد. الخدمة متاحة والموظفون متعاونون. الانتظار معقول.',
  },
  {
    placeId: '12',
    userId: 'user',
    userName: 'فاطمة علي',
    rating: 3,
    comment: 'الخدمة متوسطة. يحتاج لتحسين في التنظيم والسرعة.',
  },
  {
    placeId: '12',
    userId: 'user',
    userName: 'حسام الدين',
    rating: 4,
    comment: 'مكتب بلدية منظم. الخدمة جيدة والموظفون محترفون. الإجراءات واضحة.',
  },
  {
    placeId: '13',
    userId: 'owner',
    userName: 'رانيا فهد',
    rating: 4,
    comment: 'مكتب بلدية يقدم خدمات جيدة. الموظفون متعاونون والإجراءات واضحة.',
  },
  {
    placeId: '13',
    userId: 'user',
    userName: 'طارق علي',
    rating: 3,
    comment: 'الخدمة جيدة لكن الانتظار طويل. يحتاج لتحسين في التنظيم.',
  },
  // Government Reviews
  {
    placeId: '9',
    userId: 'owner',
    userName: 'خالد سعيد',
    rating: 4,
    comment: 'مكتب حكومي يقدم خدمات ممتازة. الإجراءات واضحة والموظفون يساعدون.',
  },
  {
    placeId: '9',
    userId: 'user',
    userName: 'أحمد محمد الخبير',
    rating: 5,
    comment: 'خدمة حكومية احترافية. كل شيء منظم والاستقبال ممتاز.',
  },
  {
    placeId: '9',
    userId: 'owner',
    userName: 'سعد عبدالله',
    rating: 4,
    comment: 'مكتب حكومي منظم. الخدمة متاحة والموظفون محترفون.',
  },
  {
    placeId: '14',
    userId: 'user',
    userName: 'هند محمد',
    rating: 4,
    comment: 'مكتب حكومي يقدم خدمات جيدة. الإجراءات واضحة والموظفون يساعدون.',
  },
  // Public Garden Reviews
  {
    placeId: '10',
    userId: 'user',
    userName: 'فاطمة علي',
    rating: 5,
    comment: 'حديقة رائعة! نظيفة وواسعة مع مساحات خضراء جميلة. مثالية للعائلات والأطفال.',
  },
  {
    placeId: '10',
    userId: 'owner',
    userName: 'خالد سعيد',
    rating: 5,
    comment: 'أفضل حديقة في المنطقة! المساحات الخضراء واسعة والملاعب ممتازة للأطفال.',
  },
  {
    placeId: '10',
    userId: 'user',
    userName: 'أحمد محمد الخبير',
    rating: 4,
    comment: 'حديقة جميلة ونظيفة. مناسبة للتنزه والرياضة. تحتاج لبعض التحسينات في الإضاءة.',
  },
  {
    placeId: '11',
    userId: 'user',
    userName: 'فاطمة علي',
    rating: 4,
    comment: 'حديقة لطيفة مع مسارات للمشي. نظيفة وهادئة. مكان رائع للاسترخاء.',
  },
  {
    placeId: '11',
    userId: 'owner',
    userName: 'خالد سعيد',
    rating: 5,
    comment: 'حديقة عامة ممتازة! المساحات الخضراء واسعة والجو هادئ. أنصح بزيارتها.',
  },
  {
    placeId: '15',
    userId: 'owner',
    userName: 'نور الدين',
    rating: 4,
    comment: 'حديقة صغيرة ونظيفة. مناسبة للعائلات والأطفال. المكان هادئ وجميل.',
  },
  // Additional Restaurant Reviews
  {
    placeId: '2',
    userId: 'user',
    userName: 'ريم فهد',
    rating: 5,
    comment: 'مطعم بحري ممتاز! المأكولات البحرية طازجة والخدمة رائعة.',
  },
  {
    placeId: '3',
    userId: 'owner',
    userName: 'وليد خالد',
    rating: 4,
    comment: 'مطعم سعودي أصيل. المأكولات التقليدية لذيذة والأجواء تراثية جميلة.',
  },
  // Additional Cafe Reviews
  {
    placeId: '3',
    userId: 'user',
    userName: 'لينا سامي',
    rating: 5,
    comment: 'مقهى رائع! القهوة ممتازة والخدمة سريعة. المكان نظيف وهادئ.',
  },
  // Additional Shopping Reviews
  {
    placeId: '4',
    userId: 'owner',
    userName: 'ماجد علي',
    rating: 4,
    comment: 'سوق شعبي جميل. المنتجات المحلية متوفرة والأسعار معقولة.',
  },
  // Additional Entertainment Reviews
  {
    placeId: '5',
    userId: 'user',
    userName: 'سلمى يوسف',
    rating: 5,
    comment: 'سينما ممتازة! التقنيات حديثة والصوت واضح. تجربة رائعة.',
  },
  // Additional Hotel Reviews
  {
    placeId: '6',
    userId: 'owner',
    userName: 'فهد عبدالعزيز',
    rating: 5,
    comment: 'فندق فاخر بكل المقاييس! الخدمة راقية والمرافق متكاملة.',
  },
  // Additional Medical Reviews
  {
    placeId: '7',
    userId: 'user',
    userName: 'داليا أحمد',
    rating: 5,
    comment: 'عيادة طبية ممتازة! الأطباء خبراء والخدمة احترافية.',
  },
  // Additional School Reviews
  {
    placeId: '8',
    userId: 'owner',
    userName: 'عبدالله محمد',
    rating: 4,
    comment: 'مدرسة ابتدائية جيدة. المعلمون محترفون والبيئة تعليمية مناسبة.',
  },
  // Additional Hospital Reviews
  {
    placeId: '9',
    userId: 'user',
    userName: 'نورا خالد',
    rating: 5,
    comment: 'مستشفى حكومي ممتاز! الخدمة الطبية شاملة والأطباء خبراء.',
  },
];

export const mockQuestions: Omit<Question, 'id' | 'createdAt' | 'answers'>[] = [
  // Restaurant Questions
  {
    placeId: '1',
    userId: 'user',
    userName: 'سارة أحمد',
    question: 'هل المطعم يقدم وجبات نباتية؟',
  },
  {
    placeId: '1',
    userId: 'user',
    userName: 'محمد خالد',
    question: 'ما هي أوقات العمل في عطلة نهاية الأسبوع؟',
  },
  {
    placeId: '1',
    userId: 'owner',
    userName: 'فاطمة علي',
    question: 'هل يمكن الحجز مسبقاً؟',
  },
  {
    placeId: '2',
    userId: 'user',
    userName: 'خالد سعيد',
    question: 'هل المطعم يقدم توصيل للمنازل؟',
  },
  // Cafe Questions
  {
    placeId: '2',
    userId: 'owner',
    userName: 'نورا حسن',
    question: 'هل المقهى يوفر إنترنت مجاني؟',
  },
  {
    placeId: '2',
    userId: 'user',
    userName: 'عمر يوسف',
    question: 'ما هي أنواع القهوة المتوفرة؟',
  },
  {
    placeId: '3',
    userId: 'owner',
    userName: 'ليلى محمد',
    question: 'هل المقهى مناسب للعمل؟',
  },
  // Municipal Questions - Important for testing
  {
    placeId: '8',
    userId: 'user',
    userName: 'يوسف أحمد',
    question: 'ما هي الخدمات التي يمكن الحصول عليها في هذا المكتب؟',
  },
  {
    placeId: '8',
    userId: 'owner',
    userName: 'عبدالرحمن خالد',
    question: 'ما هي الأوراق المطلوبة لترخيص البناء؟',
  },
  {
    placeId: '8',
    userId: 'user',
    userName: 'مريم سعد',
    question: 'هل يمكن الحصول على الخدمات إلكترونياً؟',
  },
  {
    placeId: '8',
    userId: 'owner',
    userName: 'حسام الدين',
    question: 'ما هي أوقات العمل في المكتب؟',
  },
  {
    placeId: '8',
    userId: 'user',
    userName: 'رانيا فهد',
    question: 'كيف يمكن التقديم على خدمة النظافة؟',
  },
  {
    placeId: '12',
    userId: 'owner',
    userName: 'طارق علي',
    question: 'ما هي الخدمات المتوفرة في فرع النرجس؟',
  },
  {
    placeId: '12',
    userId: 'user',
    userName: 'سعد عبدالله',
    question: 'هل يمكن الحصول على ترخيص محطة وقود من هذا المكتب؟',
  },
  {
    placeId: '13',
    userId: 'owner',
    userName: 'هند محمد',
    question: 'ما هي الإجراءات المطلوبة لترخيص محل تجاري؟',
  },
  {
    placeId: '13',
    userId: 'user',
    userName: 'نور الدين',
    question: 'هل يمكن الحصول على شهادة صلاحية البناء من هذا المكتب؟',
  },
  // Government Questions
  {
    placeId: '9',
    userId: 'owner',
    userName: 'ريم فهد',
    question: 'ما هي الخدمات الصحية المتوفرة في هذا المكتب؟',
  },
  {
    placeId: '9',
    userId: 'user',
    userName: 'وليد خالد',
    question: 'كيف يمكن الحصول على ترخيص مزاولة مهنة طبية؟',
  },
  {
    placeId: '14',
    userId: 'owner',
    userName: 'لينا سامي',
    question: 'ما هي الإجراءات المطلوبة لتسجيل شركة جديدة؟',
  },
  {
    placeId: '14',
    userId: 'user',
    userName: 'ماجد علي',
    question: 'هل يمكن الحصول على ترخيص استيراد من هذا المكتب؟',
  },
  // Public Garden Questions
  {
    placeId: '10',
    userId: 'owner',
    userName: 'سلمى يوسف',
    question: 'هل الحديقة متاحة للجميع أم تحتاج تصريح؟',
  },
  {
    placeId: '10',
    userId: 'user',
    userName: 'فهد عبدالعزيز',
    question: 'هل يوجد موقف سيارات في الحديقة؟',
  },
  {
    placeId: '11',
    userId: 'owner',
    userName: 'داليا أحمد',
    question: 'هل الحديقة مناسبة للأطفال؟',
  },
  {
    placeId: '15',
    userId: 'user',
    userName: 'عبدالله محمد',
    question: 'ما هي أوقات فتح الحديقة؟',
  },
  // Shopping Questions
  {
    placeId: '3',
    userId: 'owner',
    userName: 'نورا خالد',
    question: 'هل المركز يوفر موقف سيارات مجاني؟',
  },
  {
    placeId: '4',
    userId: 'user',
    userName: 'سارة أحمد',
    question: 'ما هي أوقات عمل السوق؟',
  },
  // Entertainment Questions
  {
    placeId: '5',
    userId: 'user',
    userName: 'محمد خالد',
    question: 'هل السينما تعرض أفلام باللغة العربية؟',
  },
  // Hotel Questions
  {
    placeId: '6',
    userId: 'user',
    userName: 'فاطمة علي',
    question: 'هل الفندق يوفر خدمة الواي فاي المجانية؟',
  },
  // Medical Questions
  {
    placeId: '7',
    userId: 'owner',
    userName: 'خالد سعيد',
    question: 'هل العيادة تقبل التأمين الطبي؟',
  },
  // School Questions
  {
    placeId: '6',
    userId: 'user',
    userName: 'نورا حسن',
    question: 'ما هي رسوم التسجيل في المدرسة؟',
  },
  {
    placeId: '8',
    userId: 'owner',
    userName: 'عمر يوسف',
    question: 'هل المدرسة تقبل الطلاب من جميع الأعمار؟',
  },
  // Hospital Questions
  {
    placeId: '7',
    userId: 'user',
    userName: 'ليلى محمد',
    question: 'هل المستشفى يوفر خدمة الطوارئ على مدار الساعة؟',
  },
  {
    placeId: '9',
    userId: 'owner',
    userName: 'يوسف أحمد',
    question: 'ما هي التخصصات الطبية المتوفرة في المستشفى؟',
  },
];

// Mock Answers - These will be added to questions by owners
export const mockAnswers = [
  {
    questionId: '1', // First question about vegetarian meals
    userId: 'owner',
    userName: 'صاحب المطعم',
    answer: 'نعم، نقدم وجبات نباتية متنوعة. يمكنكم الاطلاع على القائمة أو التواصل معنا للحجز.',
    isOwner: true,
  },
  {
    questionId: '2', // Question about weekend hours
    userId: 'owner',
    userName: 'صاحب المطعم',
    answer: 'نعم، نعمل في عطلة نهاية الأسبوع من الساعة 12:00 ظهراً حتى 12:00 منتصف الليل.',
    isOwner: true,
  },
  {
    questionId: '3', // Question about reservations
    userId: 'owner',
    userName: 'صاحب المطعم',
    answer: 'نعم، يمكنكم الحجز مسبقاً عبر الهاتف أو عبر تطبيقنا الإلكتروني.',
    isOwner: true,
  },
  {
    questionId: '4', // Question about delivery
    userId: 'owner13',
    userName: 'صاحب المطعم',
    answer: 'نعم، نقدم خدمة التوصيل للمنازل في جميع أنحاء الرياض. يمكنكم الطلب عبر الهاتف أو التطبيق.',
    isOwner: true,
  },
  {
    questionId: '5', // Question about WiFi
    userId: 'owner2',
    userName: 'صاحب المقهى',
    answer: 'نعم، نوفر إنترنت مجاني عالي السرعة لجميع العملاء.',
    isOwner: true,
  },
  {
    questionId: '6', // Question about coffee types
    userId: 'owner2',
    userName: 'صاحب المقهى',
    answer: 'نقدم أنواعاً متنوعة من القهوة العربية والإيطالية والتركية. يمكنكم الاطلاع على القائمة الكاملة.',
    isOwner: true,
  },
  {
    questionId: '7', // Question about working space
    userId: 'owner15',
    userName: 'صاحب المقهى',
    answer: 'نعم، المقهى مناسب جداً للعمل مع مساحات مخصصة ومقابس كهربائية وواي فاي مجاني.',
    isOwner: true,
  },
  // Municipal Answers - Important for testing
  {
    questionId: '8', // Question about services
    userId: 'owner8',
    userName: 'بلدية الرياض',
    answer: 'نقدم خدمات تراخيص البناء، تراخيص المحلات التجارية، خدمات النظافة، والصحة العامة. يمكنكم زيارة المكتب أو التواصل معنا.',
    isOwner: true,
  },
  {
    questionId: '9', // Question about building permit documents
    userId: 'owner8',
    userName: 'بلدية الرياض',
    answer: 'الأوراق المطلوبة: صورة من الهوية الوطنية، صورة من سند الملكية، المخططات المعمارية المعتمدة، وطلب الترخيص. يمكنكم الاطلاع على القائمة الكاملة في موقعنا الإلكتروني.',
    isOwner: true,
  },
  {
    questionId: '10', // Question about online services
    userId: 'owner8',
    userName: 'بلدية الرياض',
    answer: 'نعم، العديد من الخدمات متاحة إلكترونياً عبر منصة بلدية الرياض الإلكترونية. يمكنكم التسجيل والاستفادة من الخدمات.',
    isOwner: true,
  },
  {
    questionId: '11', // Question about working hours
    userId: 'owner8',
    userName: 'بلدية الرياض',
    answer: 'أوقات العمل: من الأحد إلى الخميس من الساعة 7:30 صباحاً حتى 2:30 ظهراً. المكتب مغلق يومي الجمعة والسبت.',
    isOwner: true,
  },
  {
    questionId: '12', // Question about cleaning service
    userId: 'owner8',
    userName: 'بلدية الرياض',
    answer: 'يمكنكم التقديم على خدمة النظافة عبر زيارة المكتب أو عبر المنصة الإلكترونية. نحتاج صورة من الهوية الوطنية وطلب الخدمة.',
    isOwner: true,
  },
  {
    questionId: '13', // Question about services in branch
    userId: 'owner12',
    userName: 'بلدية الرياض',
    answer: 'فرع النرجس يقدم جميع الخدمات البلدية: تراخيص البناء، تراخيص المحلات، خدمات النظافة، والصحة العامة.',
    isOwner: true,
  },
  {
    questionId: '14', // Question about gas station permit
    userId: 'owner12',
    userName: 'بلدية الرياض',
    answer: 'نعم، يمكن الحصول على ترخيص محطة وقود من هذا المكتب. نحتاج دراسة موقع معتمدة وموافقات الأمان والبيئة.',
    isOwner: true,
  },
  {
    questionId: '15', // Question about commercial shop permit
    userId: 'owner22',
    userName: 'بلدية الرياض',
    answer: 'الإجراءات: تقديم طلب الترخيص، صورة من الهوية، سند الملكية أو عقد الإيجار، المخططات المعمارية، وموافقة الدفاع المدني.',
    isOwner: true,
  },
  {
    questionId: '16', // Question about building certificate
    userId: 'owner22',
    userName: 'بلدية الرياض',
    answer: 'نعم، يمكن الحصول على شهادة صلاحية البناء من هذا المكتب بعد استكمال جميع الإجراءات والموافقات المطلوبة.',
    isOwner: true,
  },
  // Government Answers
  {
    questionId: '17', // Question about health services
    userId: 'owner9',
    userName: 'وزارة الصحة',
    answer: 'نقدم خدمات تراخيص المهن الطبية، تراخيص المرافق الصحية، شهادات الصحة المهنية، وخدمات أخرى. يمكنكم الاطلاع على موقعنا.',
    isOwner: true,
  },
  {
    questionId: '18', // Question about medical practice license
    userId: 'owner9',
    userName: 'وزارة الصحة',
    answer: 'للحصول على ترخيص مزاولة مهنة طبية: شهادة التخرج، شهادة التخصص (إن وجدت)، الهوية الوطنية، وطلب الترخيص.',
    isOwner: true,
  },
  {
    questionId: '19', // Question about company registration
    userId: 'owner23',
    userName: 'وزارة التجارة',
    answer: 'الإجراءات: اختيار اسم الشركة، تحديد نوع النشاط، رأس المال، الهوية الوطنية للمساهمين، وطلب التسجيل. يمكنكم التسجيل إلكترونياً.',
    isOwner: true,
  },
  {
    questionId: '20', // Question about import license
    userId: 'owner23',
    userName: 'وزارة التجارة',
    answer: 'نعم، يمكن الحصول على ترخيص استيراد من هذا المكتب. نحتاج سجل تجاري، نشاط استيراد، وطلب الترخيص.',
    isOwner: true,
  },
  // Public Garden Answers
  {
    questionId: '21', // Question about access
    userId: 'owner10',
    userName: 'إدارة الحدائق',
    answer: 'الحديقة متاحة للجميع مجاناً ولا تحتاج تصريح. مرحب بكم في أي وقت خلال ساعات العمل.',
    isOwner: true,
  },
  {
    questionId: '22', // Question about parking
    userId: 'owner10',
    userName: 'إدارة الحدائق',
    answer: 'نعم، يوجد موقف سيارات واسع ومجاني بجوار الحديقة.',
    isOwner: true,
  },
  {
    questionId: '23', // Question about children
    userId: 'owner11',
    userName: 'إدارة الحدائق',
    answer: 'نعم، الحديقة مناسبة جداً للأطفال مع ملاعب آمنة ومساحات خضراء واسعة.',
    isOwner: true,
  },
  {
    questionId: '24', // Question about opening hours
    userId: 'owner24',
    userName: 'إدارة الحدائق',
    answer: 'الحديقة مفتوحة من الساعة 6:00 صباحاً حتى 10:00 مساءً يومياً.',
    isOwner: true,
  },
  // Shopping Answers
  {
    questionId: '25', // Question about parking
    userId: 'owner3',
    userName: 'إدارة المركز',
    answer: 'نعم، نوفر موقف سيارات مجاني واسع لجميع الزوار.',
    isOwner: true,
  },
  {
    questionId: '26', // Question about market hours
    userId: 'owner16',
    userName: 'إدارة السوق',
    answer: 'السوق يعمل من الساعة 8:00 صباحاً حتى 10:00 مساءً يومياً، ويغلق في صلاة الجمعة.',
    isOwner: true,
  },
  // Entertainment Answers
  {
    questionId: '27', // Question about Arabic movies
    userId: 'owner17',
    userName: 'إدارة السينما',
    answer: 'نعم، نعرض أفلاماً باللغة العربية والإنجليزية مع ترجمة عربية.',
    isOwner: true,
  },
  // Hotel Answers
  {
    questionId: '28', // Question about WiFi
    userId: 'owner18',
    userName: 'إدارة الفندق',
    answer: 'نعم، نوفر خدمة الواي فاي المجانية عالية السرعة في جميع الغرف والمناطق العامة.',
    isOwner: true,
  },
  // Medical Answers
  {
    questionId: '29', // Question about insurance
    userId: 'owner19',
    userName: 'إدارة العيادة',
    answer: 'نعم، نقبل معظم شركات التأمين الطبي. يمكنكم التواصل معنا للتحقق من تغطية التأمين.',
    isOwner: true,
  },
  // School Answers
  {
    questionId: '30', // Question about registration fees
    userId: 'owner6',
    userName: 'إدارة المدرسة',
    answer: 'الرسوم تختلف حسب المرحلة الدراسية. يمكنكم التواصل معنا للحصول على معلومات مفصلة عن الرسوم.',
    isOwner: true,
  },
  {
    questionId: '31', // Question about age groups
    userId: 'owner20',
    userName: 'إدارة المدرسة',
    answer: 'المدرسة تقبل الطلاب من مرحلة الروضة حتى الصف السادس الابتدائي.',
    isOwner: true,
  },
  // Hospital Answers
  {
    questionId: '32', // Question about emergency service
    userId: 'owner7',
    userName: 'إدارة المستشفى',
    answer: 'نعم، قسم الطوارئ يعمل على مدار الساعة طوال أيام الأسبوع.',
    isOwner: true,
  },
  {
    questionId: '33', // Question about medical specialties
    userId: 'owner21',
    userName: 'إدارة المستشفى',
    answer: 'نقدم خدمات في جميع التخصصات: الباطنية، الجراحة، الأطفال، النساء والولادة، القلب، والعظام وغيرها.',
    isOwner: true,
  },
];
