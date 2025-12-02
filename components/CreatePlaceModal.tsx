'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { dataStore } from '@/lib/data';
import { getCurrentUser } from '@/lib/auth';
import { categories } from '@/lib/mockData';

interface CreatePlaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreatePlaceModal({ isOpen, onClose, onSuccess }: CreatePlaceModalProps) {
  const [formData, setFormData] = useState({
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
    const user = getCurrentUser();
    if (!user) return;

    dataStore.createPlace({
      ownerId: user.id,
      name: formData.name,
      description: formData.description,
      category: formData.category,
      placeType: 'other',
      googleMapsUrl: formData.googleMapsUrl,
      phone: formData.phone || undefined,
      address: formData.address || undefined,
      imageUrl: formData.imageUrl || undefined,
      location: formData.lat && formData.lng ? {
        lat: parseFloat(formData.lat),
        lng: parseFloat(formData.lng),
      } : undefined,
      isClaimed: true,
      verified: false,
    });

    setFormData({
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
    onSuccess();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-800">إضافة مكان جديد</h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-slate-700 font-semibold mb-2 text-sm">
              اسم المكان *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-unified"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-2 text-sm">
              الفئة *
            </label>
            <select
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
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
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="input-unified"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-2 text-sm">
              رابط خرائط جوجل *
            </label>
            <input
              type="url"
              required
              value={formData.googleMapsUrl}
              onChange={(e) => setFormData({ ...formData, googleMapsUrl: e.target.value })}
              className="input-unified"
              placeholder="https://maps.google.com/..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-2 text-sm">
                خط العرض (Latitude)
              </label>
              <input
                type="number"
                step="any"
                value={formData.lat}
                onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
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
                value={formData.lng}
                onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                className="input-unified"
                placeholder="46.6753"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-2 text-sm">
                رقم الهاتف
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="input-unified"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-2 text-sm">
                العنوان
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="input-unified"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-2 text-sm">
              رابط الصورة
            </label>
            <input
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              className="input-unified"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="flex space-x-3 space-x-reverse pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="button-secondary-unified flex-1"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="button-primary-unified flex-1"
            >
              إضافة المكان
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

