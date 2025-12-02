'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { dataStore } from '@/lib/data';
import { categories } from '@/lib/mockData';
import { useToast } from '@/components/Toast';
import Navbar from '@/components/Navbar';
import TabNavigation from '@/components/TabNavigation';
import { Building2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function AddPlacePage() {
  const router = useRouter();
  const { showToast, ToastContainer } = useToast();
  const [addPlaceForm, setAddPlaceForm] = useState({
    name: '',
    description: '',
    category: '',
    googleMapsUrl: '',
    phone: '',
    address: '',
    imageUrl: '',
    lat: '',
    lng: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }

    dataStore.createPlace({
      ownerId: currentUser.id,
      name: addPlaceForm.name,
      description: addPlaceForm.description,
      category: addPlaceForm.category,
      placeType: 'other',
      googleMapsUrl: addPlaceForm.googleMapsUrl,
      phone: addPlaceForm.phone || undefined,
      address: addPlaceForm.address || undefined,
      imageUrl: addPlaceForm.imageUrl || undefined,
      location: addPlaceForm.lat && addPlaceForm.lng ? {
        lat: parseFloat(addPlaceForm.lat),
        lng: parseFloat(addPlaceForm.lng),
      } : undefined,
      isClaimed: true,
      verified: false,
    });

    showToast('تم إضافة المكان بنجاح!', 'success');
    
    // Redirect to dashboard or account page after 1 second
    setTimeout(() => {
      router.push('/account');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />
      
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/account"
            className="inline-flex items-center space-x-2 space-x-reverse text-slate-600 hover:text-emerald-600 transition mb-4"
          >
            <ArrowRight className="w-4 h-4" />
            <span className="text-sm font-semibold">رجوع</span>
          </Link>
          
          <div className="flex items-center space-x-3 space-x-reverse mb-2">
            <div className="p-3 bg-emerald-100 rounded-xl">
              <Building2 className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">إضافة مكان جديد</h1>
              <p className="text-sm text-slate-600">أضف مكانك التجاري إلى المنصة</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-slate-700 font-semibold mb-2 text-sm">
                اسم المكان *
              </label>
              <input
                type="text"
                required
                value={addPlaceForm.name}
                onChange={(e) => setAddPlaceForm({ ...addPlaceForm, name: e.target.value })}
                className="input-unified"
                placeholder="مثال: مطعم الأصالة"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-2 text-sm">
                الفئة *
              </label>
              <select
                required
                value={addPlaceForm.category}
                onChange={(e) => setAddPlaceForm({ ...addPlaceForm, category: e.target.value })}
                className="input-unified"
              >
                <option value="">اختر الفئة</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.nameAr}>
                    {cat.icon} {cat.nameAr}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-2 text-sm">
                الوصف *
              </label>
              <textarea
                required
                value={addPlaceForm.description}
                onChange={(e) => setAddPlaceForm({ ...addPlaceForm, description: e.target.value })}
                rows={4}
                className="input-unified resize-none"
                placeholder="اكتب وصفاً مختصراً عن المكان..."
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-2 text-sm">
                رابط خرائط جوجل *
              </label>
              <input
                type="url"
                required
                value={addPlaceForm.googleMapsUrl}
                onChange={(e) => setAddPlaceForm({ ...addPlaceForm, googleMapsUrl: e.target.value })}
                className="input-unified"
                placeholder="https://maps.google.com/..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-2 text-sm">
                  خط العرض (Latitude)
                </label>
                <input
                  type="number"
                  step="any"
                  value={addPlaceForm.lat}
                  onChange={(e) => setAddPlaceForm({ ...addPlaceForm, lat: e.target.value })}
                  className="input-unified"
                  placeholder="24.7136"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-2 text-sm">
                  خط الطول (Longitude)
                </label>
                <input
                  type="number"
                  step="any"
                  value={addPlaceForm.lng}
                  onChange={(e) => setAddPlaceForm({ ...addPlaceForm, lng: e.target.value })}
                  className="input-unified"
                  placeholder="46.6753"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-2 text-sm">
                  رقم الهاتف
                </label>
                <input
                  type="tel"
                  value={addPlaceForm.phone}
                  onChange={(e) => setAddPlaceForm({ ...addPlaceForm, phone: e.target.value })}
                  className="input-unified"
                  placeholder="05xxxxxxxx"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-2 text-sm">
                  العنوان
                </label>
                <input
                  type="text"
                  value={addPlaceForm.address}
                  onChange={(e) => setAddPlaceForm({ ...addPlaceForm, address: e.target.value })}
                  className="input-unified"
                  placeholder="العنوان الكامل"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-2 text-sm">
                رابط الصورة
              </label>
              <input
                type="url"
                value={addPlaceForm.imageUrl}
                onChange={(e) => setAddPlaceForm({ ...addPlaceForm, imageUrl: e.target.value })}
                className="input-unified"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="flex space-x-3 space-x-reverse pt-4 border-t border-gray-200">
              <Link
                href="/account"
                className="button-secondary-unified flex-1 text-center"
              >
                إلغاء
              </Link>
              <button
                type="submit"
                className="button-primary-unified flex-1"
              >
                إضافة المكان
              </button>
            </div>
          </form>
        </div>
      </main>

      <TabNavigation />
      <ToastContainer />
    </div>
  );
}

