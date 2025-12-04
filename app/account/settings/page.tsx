'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import TabNavigation from '@/components/TabNavigation';
import Navbar from '@/components/Navbar';
import { useToast } from '@/components/Toast';
import { getCurrentUser } from '@/lib/auth';
import { dataStore } from '@/lib/data';
import { User } from '@/types';
import { Settings, X, MapPin, Phone, Mail, User as UserIcon, Calendar as CalendarIcon, Eye, EyeOff, ArrowLeft, Upload, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';

export default function AccountSettingsPage() {
  const router = useRouter();
  const { showToast, ToastContainer } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    bio: '',
    city: '',
    avatar: '',
    email: '',
    phone: '',
    gender: '' as 'male' | 'female' | '',
    dateOfBirth: '',
  });
  const [privacySettings, setPrivacySettings] = useState({
    showEmail: true,
    showPhone: true,
    showDateOfBirth: true,
    showGender: true,
    showLocation: true,
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setUser(currentUser);
    setEditForm({
      name: currentUser.name,
      bio: currentUser.bio || '',
      city: currentUser.location?.city || '',
      avatar: currentUser.avatar || '',
      email: currentUser.email || '',
      phone: currentUser.phone || '',
      gender: currentUser.gender || '',
      dateOfBirth: currentUser.dateOfBirth ? new Date(currentUser.dateOfBirth).toISOString().split('T')[0] : '',
    });
    setPrivacySettings({
      showEmail: currentUser.privacySettings?.showEmail ?? true,
      showPhone: currentUser.privacySettings?.showPhone ?? true,
      showDateOfBirth: currentUser.privacySettings?.showDateOfBirth ?? true,
      showGender: currentUser.privacySettings?.showGender ?? true,
      showLocation: currentUser.privacySettings?.showLocation ?? true,
    });
    if (currentUser.avatar) {
      setAvatarPreview(currentUser.avatar);
    }
  }, [router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        showToast('الرجاء اختيار ملف صورة', 'error');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showToast('حجم الصورة يجب أن يكون أقل من 5 ميجابايت', 'error');
        return;
      }
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setAvatarPreview(result);
        setEditForm({ ...editForm, avatar: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!user) return;
    
    dataStore.updateUser(user.id, {
      name: editForm.name,
      bio: editForm.bio,
      avatar: editForm.avatar || undefined,
      email: editForm.email,
      phone: editForm.phone || undefined,
      gender: editForm.gender || undefined,
      dateOfBirth: editForm.dateOfBirth ? new Date(editForm.dateOfBirth) : undefined,
      location: user.location ? {
        ...user.location,
        city: editForm.city,
      } : {
        lat: 24.7136,
        lng: 46.6753,
        city: editForm.city,
      },
      privacySettings: privacySettings,
    });
    
    setUser(getCurrentUser());
    showToast('تم حفظ البيانات بنجاح', 'success');
    setTimeout(() => {
      router.push('/account');
    }, 1000);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/30 to-gray-50 pb-24">
      <Navbar />

      <main className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/account"
            className="flex items-center space-x-2 space-x-reverse text-slate-600 hover:text-emerald-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-semibold">العودة</span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center space-x-3 space-x-reverse">
            <Settings className="w-7 h-7 text-emerald-600" />
            <span>إعدادات الحساب</span>
          </h1>
        </div>

        {/* Edit Form */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-6 sm:p-8">
          <div className="space-y-6">
            {/* Avatar Upload */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3">الصورة الشخصية</label>
              <div className="flex items-center space-x-4 space-x-reverse">
                <div className="relative">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Preview"
                      className="w-24 h-24 rounded-full object-cover border-4 border-emerald-200"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center border-4 border-emerald-200">
                      <UserIcon className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center space-x-2 space-x-reverse px-4 py-2 bg-emerald-100 text-emerald-700 rounded-xl font-semibold hover:bg-emerald-200 transition-all"
                  >
                    <Upload className="w-5 h-5" />
                    <span>رفع صورة</span>
                  </button>
                  <p className="text-xs text-slate-500 mt-2">الصيغ المدعومة: JPG, PNG, GIF (حد أقصى 5 ميجابايت)</p>
                </div>
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center space-x-2 space-x-reverse">
                  <UserIcon className="w-4 h-4 text-emerald-600" />
                  <span>الاسم الكامل</span>
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="الاسم الكامل"
                  className="w-full bg-gray-50 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center space-x-2 space-x-reverse">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span>المدينة</span>
                </label>
                <input
                  type="text"
                  value={editForm.city}
                  onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                  placeholder="المدينة"
                  className="w-full bg-gray-50 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center space-x-2 space-x-reverse">
                  <Mail className="w-4 h-4 text-emerald-600" />
                  <span>البريد الإلكتروني</span>
                </label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  placeholder="example@email.com"
                  className="w-full bg-gray-50 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                />
                <div className="mt-2 flex items-center space-x-2 space-x-reverse">
                  <button
                    type="button"
                    onClick={() => setPrivacySettings({ ...privacySettings, showEmail: !privacySettings.showEmail })}
                    className={`flex items-center space-x-1.5 space-x-reverse text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                      privacySettings.showEmail 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-gray-100 text-slate-600 hover:bg-gray-200'
                    }`}
                  >
                    {privacySettings.showEmail ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>{privacySettings.showEmail ? 'مرئي' : 'مخفي'}</span>
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center space-x-2 space-x-reverse">
                  <Phone className="w-4 h-4 text-emerald-600" />
                  <span>رقم الهاتف</span>
                </label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  placeholder="05xxxxxxxx"
                  className="w-full bg-gray-50 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                />
                <div className="mt-2 flex items-center space-x-2 space-x-reverse">
                  <button
                    type="button"
                    onClick={() => setPrivacySettings({ ...privacySettings, showPhone: !privacySettings.showPhone })}
                    className={`flex items-center space-x-1.5 space-x-reverse text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                      privacySettings.showPhone 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-gray-100 text-slate-600 hover:bg-gray-200'
                    }`}
                  >
                    {privacySettings.showPhone ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>{privacySettings.showPhone ? 'مرئي' : 'مخفي'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Personal Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center space-x-2 space-x-reverse">
                  <UserIcon className="w-4 h-4 text-emerald-600" />
                  <span>الجنس</span>
                </label>
                <select
                  value={editForm.gender}
                  onChange={(e) => setEditForm({ ...editForm, gender: e.target.value as 'male' | 'female' | '' })}
                  className="w-full bg-gray-50 rounded-xl px-4 py-3 text-slate-800 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                >
                  <option value="">اختر الجنس</option>
                  <option value="male">ذكر</option>
                  <option value="female">أنثى</option>
                </select>
                <div className="mt-2 flex items-center space-x-2 space-x-reverse">
                  <button
                    type="button"
                    onClick={() => setPrivacySettings({ ...privacySettings, showGender: !privacySettings.showGender })}
                    className={`flex items-center space-x-1.5 space-x-reverse text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                      privacySettings.showGender 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-gray-100 text-slate-600 hover:bg-gray-200'
                    }`}
                  >
                    {privacySettings.showGender ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>{privacySettings.showGender ? 'مرئي' : 'مخفي'}</span>
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center space-x-2 space-x-reverse">
                  <CalendarIcon className="w-4 h-4 text-emerald-600" />
                  <span>تاريخ الميلاد</span>
                </label>
                <input
                  type="date"
                  value={editForm.dateOfBirth}
                  onChange={(e) => setEditForm({ ...editForm, dateOfBirth: e.target.value })}
                  className="w-full bg-gray-50 rounded-xl px-4 py-3 text-slate-800 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                />
                <div className="mt-2 flex items-center space-x-2 space-x-reverse">
                  <button
                    type="button"
                    onClick={() => setPrivacySettings({ ...privacySettings, showDateOfBirth: !privacySettings.showDateOfBirth })}
                    className={`flex items-center space-x-1.5 space-x-reverse text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                      privacySettings.showDateOfBirth 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-gray-100 text-slate-600 hover:bg-gray-200'
                    }`}
                  >
                    {privacySettings.showDateOfBirth ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>{privacySettings.showDateOfBirth ? 'مرئي' : 'مخفي'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">نبذة عنك</label>
              <textarea
                value={editForm.bio}
                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                placeholder="اكتب نبذة عنك..."
                rows={4}
                className="w-full bg-gray-50 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 resize-none border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              />
            </div>

            {/* Location Privacy */}
            <div className="pt-4 border-t-2 border-gray-200">
              <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <MapPin className="w-5 h-5 text-emerald-600" />
                  <span className="text-sm font-bold text-slate-800">إظهار الموقع</span>
                </div>
                <button
                  type="button"
                  onClick={() => setPrivacySettings({ ...privacySettings, showLocation: !privacySettings.showLocation })}
                  className={`flex items-center space-x-1.5 space-x-reverse text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                    privacySettings.showLocation 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : 'bg-gray-100 text-slate-600 hover:bg-gray-200'
                  }`}
                >
                  {privacySettings.showLocation ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  <span>{privacySettings.showLocation ? 'مرئي' : 'مخفي'}</span>
                </button>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex items-center justify-end space-x-3 space-x-reverse pt-4 border-t-2 border-gray-200">
              <Link
                href="/account"
                className="px-6 py-3 bg-gray-100 text-slate-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
              >
                إلغاء
              </Link>
              <button
                onClick={handleSave}
                className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 transition-all shadow-lg"
              >
                حفظ التغييرات
              </button>
            </div>
          </div>
        </div>
      </main>

      <TabNavigation />
      
      {/* Toast Container */}
      <ToastContainer />
    </div>
  );
}


