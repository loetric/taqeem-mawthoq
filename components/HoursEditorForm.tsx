'use client';

import { useState } from 'react';
import { Place } from '@/types';
import { X, Check } from 'lucide-react';

interface HoursEditorFormProps {
  hours: Place['hours'];
  onSave: (hours: Place['hours']) => void;
  onCancel: () => void;
}

export default function HoursEditorForm({ hours, onSave, onCancel }: HoursEditorFormProps) {
  const [editedHours, setEditedHours] = useState<Place['hours']>(hours || {
    'الأحد': { open: '09:00', close: '17:00', closed: false },
    'الإثنين': { open: '09:00', close: '17:00', closed: false },
    'الثلاثاء': { open: '09:00', close: '17:00', closed: false },
    'الأربعاء': { open: '09:00', close: '17:00', closed: false },
    'الخميس': { open: '09:00', close: '17:00', closed: false },
    'الجمعة': { open: '09:00', close: '17:00', closed: false },
    'السبت': { open: '09:00', close: '17:00', closed: false },
  });

  const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

  const handleDayChange = (day: string, field: 'open' | 'close' | 'closed', value: string | boolean) => {
    const currentDayHours = editedHours?.[day] || { open: '09:00', close: '17:00', closed: false };
    setEditedHours({
      ...(editedHours || {}),
      [day]: {
        ...currentDayHours,
        [field]: value,
      },
    });
  };

  const handleSave = () => {
    onSave(editedHours);
  };

  return (
    <div className="space-y-3">
      {days.map((day) => {
        const dayHours = editedHours?.[day] || { open: '09:00', close: '17:00', closed: false };
        return (
          <div key={day} className="flex items-center space-x-2 space-x-reverse p-2 bg-white rounded-lg border border-gray-200">
            <div className="w-20 text-xs font-semibold text-slate-700">{day}</div>
            <label className="flex items-center space-x-1 space-x-reverse text-xs">
              <input
                type="checkbox"
                checked={dayHours.closed || false}
                onChange={(e) => handleDayChange(day, 'closed', e.target.checked)}
                className="icon-sm text-emerald-600 rounded focus:ring-emerald-600"
              />
              <span className="text-slate-600">مغلق</span>
            </label>
            {!dayHours.closed && (
              <>
                <input
                  type="time"
                  value={dayHours.open || '09:00'}
                  onChange={(e) => handleDayChange(day, 'open', e.target.value)}
                  className="px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-[emerald-600] focus:border-[emerald-600]"
                />
                <span className="text-slate-500 text-xs">-</span>
                <input
                  type="time"
                  value={dayHours.close || '17:00'}
                  onChange={(e) => handleDayChange(day, 'close', e.target.value)}
                  className="px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-[emerald-600] focus:border-[emerald-600]"
                />
              </>
            )}
          </div>
        );
      })}
      <div className="flex space-x-2 space-x-reverse pt-2">
        <button
          onClick={handleSave}
          className="button-primary-unified flex-1 text-xs"
        >
          <Check className="icon-sm" />
          <span>حفظ</span>
        </button>
        <button
          onClick={onCancel}
          className="button-secondary-unified text-xs"
        >
          <X className="icon-sm" />
          <span>إلغاء</span>
        </button>
      </div>
    </div>
  );
}

