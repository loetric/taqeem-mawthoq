'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import TabNavigation from '@/components/TabNavigation';
import { login } from '@/lib/auth';
import { User, Store } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  const accounts = [
    {
      id: 'user',
      name: 'مستخدم عادي',
      email: 'user@trustrate.com',
      icon: User,
    },
    {
      id: 'owner',
      name: 'صاحب مكان',
      email: 'owner@trustrate.com',
      icon: Store,
    },
  ];

  const handleLogin = (accountId: 'user' | 'owner') => {
    setError('');
    const account = accounts.find(a => a.id === accountId);
    if (!account) return;

    const result = login(account.email, account.name, accountId);
    
    if (!result) {
      setError('فشل تسجيل الدخول. يرجى المحاولة مرة أخرى.');
      return;
    }

    router.push('/home');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Navbar />
      
      <main className="max-w-md mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-emerald-600 mb-2">
              تقييم موثوق
            </h2>
            <p className="text-slate-600">منصة تقييم الأماكن الموثوقة</p>
          </div>
          <h3 className="text-2xl font-bold text-center text-slate-800 mb-8">
            تسجيل الدخول
          </h3>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {accounts.map((account) => {
              const Icon = account.icon;
              return (
                <button
                  key={account.id}
                  onClick={() => handleLogin(account.id as 'user' | 'owner')}
                  className="w-full flex items-center space-x-3 space-x-reverse p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition-all text-right"
                >
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <Icon className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-800">{account.name}</h3>
                    <p className="text-sm text-slate-600">{account.email}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <TabNavigation />
    </div>
  );
}

