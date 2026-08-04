import React from 'react';
import { useStore } from '../context/StoreContext';
import { CheckCircle, AlertCircle } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toastMessage } = useStore();

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#2B2620] text-white px-5 py-3.5 rounded-lg shadow-2xl border border-stone-700 animate-slide-up text-sm font-medium">
      <CheckCircle className="w-5 h-5 text-[#C0654B] shrink-0" />
      <span>{toastMessage}</span>
    </div>
  );
};
