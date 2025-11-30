'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { login } from '@/lib/auth';
import { User, Store, MapPin } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'user' | 'owner'>('user');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email) {
      setError('الرجاء إدخال الاسم والبريد الإلكتروني');
      return;
    }

    login(email, name, role);
    router.push(role === 'owner' ? '/dashboard' : '/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-md mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-[#0ea5e9] to-[#0284c7] bg-clip-text text-transparent mb-2">
              تقييم موثوق
            </h2>
            <p className="text-gray-600">منصة تقييم الأماكن الموثوقة</p>
          </div>
          <h3 className="text-2xl font-bold text-center text-gray-800 mb-8">
            تسجيل الدخول
          </h3>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Quick Login Info */}
          <div className="mb-6 p-4 bg-trust-light rounded-lg border border-trust/20">
            <p className="text-sm font-semibold text-gray-700 mb-2">حسابات تجريبية:</p>
            <div className="text-xs text-gray-600 space-y-1">
              <p><strong>مستخدم:</strong> user@trustrate.com</p>
              <p><strong>صاحب مكان:</strong> owner@trustrate.com</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                الاسم
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-trust focus:border-trust transition-all"
                placeholder="أدخل اسمك"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                البريد الإلكتروني
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="example@email.com"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                نوع الحساب
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRole('user')}
                  className={`flex items-center justify-center space-x-2 space-x-reverse p-4 rounded-lg border-2 transition-all ${
                    role === 'user'
                      ? 'border-trust bg-trust-light text-trust shadow-md'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <User className="w-5 h-5" />
                  <span>مستخدم</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('owner')}
                  className={`flex items-center justify-center space-x-2 space-x-reverse p-4 rounded-lg border-2 transition-all ${
                    role === 'owner'
                      ? 'border-trust bg-trust-light text-trust shadow-md'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Store className="w-5 h-5" />
                  <span>صاحب مكان</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-trust-gradient text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all shadow-md"
            >
              تسجيل الدخول
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

