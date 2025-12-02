/**
 * Design Tokens - معايير التصميم الموحدة للمنصة
 * Unified Design Standards for TrustRate Platform
 */

export const designTokens = {
  // الألوان الأساسية - Primary Colors
  colors: {
    // الأخضر الفاتح - Light Green
    primary: {
      light: '#86efac',      // emerald-400 - أخضر فاتح جداً
      DEFAULT: '#34d399',    // emerald-500 - أخضر فاتح
      dark: '#10b981',       // emerald-600
      darker: '#059669',     // emerald-700
    },
    // الكحلي الداكن - Dark Navy/Slate
    secondary: {
      light: '#64748b',      // slate-500 - كحلي فاتح
      DEFAULT: '#475569',    // slate-600 - كحلي
      dark: '#334155',       // slate-700 - كحلي داكن
      darker: '#1e293b',     // slate-800 - كحلي داكن جداً
    },
    // الألوان الوظيفية - Functional Colors
    status: {
      success: '#34d399',    // emerald-500 - أخضر فاتح
      warning: '#f59e0b',    // amber-500
      error: '#ef4444',       // red-500
      info: '#475569',       // slate-600 - كحلي
    },
    // الرمادي - Grays
    gray: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    },
  },

  // التدرجات - تم إزالتها - استخدام ألوان صلبة فقط
  // Gradients removed - use solid colors only

  // الظلال - Shadows
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    primary: '0 4px 14px 0 rgba(52, 211, 153, 0.3)',
    primaryHover: '0 6px 20px 0 rgba(52, 211, 153, 0.4)',
  },

  // الحدود - Borders
  borders: {
    radius: {
      sm: '0.375rem',    // 6px
      DEFAULT: '0.5rem', // 8px
      md: '0.75rem',     // 12px
      lg: '1rem',        // 16px
      xl: '1.5rem',      // 24px
      full: '9999px',
    },
    width: {
      thin: '1px',
      DEFAULT: '2px',
      thick: '3px',
    },
  },

  // المسافات - Spacing
  spacing: {
    xs: '0.5rem',   // 8px
    sm: '0.75rem',  // 12px
    md: '1rem',     // 16px
    lg: '1.5rem',   // 24px
    xl: '2rem',     // 32px
    '2xl': '3rem',  // 48px
  },
  
  // المسافات بين البطاقات - Card Gaps
  cardGaps: {
    xs: '0.75rem',  // 12px - للمسافات الصغيرة جداً
    sm: '1rem',     // 16px - للمسافات الصغيرة (افتراضي)
    md: '1.25rem',  // 20px - للمسافات المتوسطة (موصى به)
    lg: '1.5rem',   // 24px - للمسافات الكبيرة
    xl: '2rem',     // 32px - للمسافات الكبيرة جداً
  },
  
  // أحجام الأيقونات الموحدة - Unified Icon Sizes
  iconSizes: {
    xs: '0.875rem',   // 14px - w-3.5 h-3.5
    sm: '1rem',       // 16px - w-4 h-4
    md: '1.25rem',    // 20px - w-5 h-5
    lg: '1.5rem',     // 24px - w-6 h-6
    xl: '2rem',       // 32px - w-8 h-8
    '2xl': '3rem',    // 48px - w-12 h-12
  },
  
  // ألوان الأيقونات مع تباين جيد - Icon Colors with Good Contrast
  iconColors: {
    primary: '#34d399',      // emerald-500 - أخضر فاتح - تباين ممتاز على الأبيض
    primaryDark: '#10b981',   // emerald-600 - تباين ممتاز
    secondary: '#475569',    // slate-600 - كحلي - تباين ممتاز
    secondaryDark: '#334155', // slate-700 - كحلي داكن - تباين ممتاز
    success: '#34d399',      // emerald-500 - أخضر فاتح
    warning: '#f59e0b',      // amber-500 - تباين جيد
    error: '#ef4444',        // red-500 - تباين ممتاز
    info: '#6366f1',        // indigo-500 - كحلي فاتح - تباين جيد
    muted: '#64748b',       // slate-500 - للعناصر الثانوية
    disabled: '#94a3b8',    // slate-400 - للعناصر المعطلة
  },
};

// فئات CSS الموحدة - Unified CSS Classes
export const unifiedClasses = {
  // بطاقات الأماكن - Place Cards
  placeCard: {
    container: 'bg-white rounded-xl shadow-md hover:shadow-lg border border-gray-100 transition-all duration-300 overflow-hidden',
    image: 'w-full h-40 bg-emerald-500 relative overflow-hidden',
    content: 'p-4 flex flex-col flex-1',
    title: 'text-lg font-bold text-slate-800 leading-tight line-clamp-2 mb-2',
    category: 'inline-block bg-emerald-50 text-emerald-600 text-xs px-2.5 py-1 rounded-full font-semibold',
    rating: 'flex items-center space-x-1 space-x-reverse',
  },

  // الأزرار - Buttons
  button: {
    primary: 'bg-emerald-500 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-emerald-600 hover:shadow-lg transition-all shadow-md flex items-center justify-center space-x-2 space-x-reverse disabled:opacity-50 disabled:cursor-not-allowed',
    secondary: 'bg-slate-100 text-slate-700 px-4 py-2.5 rounded-lg font-semibold hover:bg-slate-200 transition-all flex items-center justify-center space-x-2 space-x-reverse',
    outline: 'border-2 border-emerald-400 text-emerald-600 px-4 py-2.5 rounded-lg font-semibold hover:bg-emerald-50 transition-all flex items-center justify-center space-x-2 space-x-reverse',
    ghost: 'text-emerald-500 hover:bg-emerald-50 px-4 py-2.5 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2 space-x-reverse',
    danger: 'bg-red-500 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-red-600 transition-all shadow-md flex items-center justify-center space-x-2 space-x-reverse',
  },

  // التقييمات - Ratings
  rating: {
    container: 'flex items-center space-x-1 space-x-reverse',
    star: {
      filled: 'w-5 h-5 text-amber-400 fill-current',
      empty: 'w-5 h-5 text-gray-300',
      small: {
        filled: 'w-4 h-4 text-amber-400 fill-current',
        empty: 'w-4 h-4 text-gray-300',
      },
    },
    text: 'text-sm font-semibold text-slate-700',
  },

  // الشارات - Badges
  badge: {
    verified: 'flex items-center space-x-1 space-x-reverse bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full text-xs font-semibold',
    expert: 'flex items-center space-x-1 space-x-reverse bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full text-xs font-semibold',
    category: 'inline-block bg-emerald-50 text-emerald-600 text-xs px-2.5 py-1 rounded-full font-semibold',
    status: {
      open: 'bg-emerald-100 text-emerald-700',
      closing: 'bg-orange-100 text-orange-700',
      closed: 'bg-red-100 text-red-700',
    },
  },

  // حقول الإدخال - Input Fields
  input: {
    base: 'w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-500 transition-all text-sm',
    textarea: 'w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-500 transition-all resize-none text-sm',
  },

  // بطاقات التقييمات - Review Cards
  reviewCard: {
    container: 'bg-white rounded-xl shadow-md p-6 border border-gray-100',
    header: 'flex items-start justify-between mb-3',
    content: 'text-slate-700 leading-relaxed mb-3',
    footer: 'flex items-center justify-between pt-3 border-t border-gray-100',
  },
};

