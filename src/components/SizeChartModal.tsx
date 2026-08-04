import React from 'react';
import { useStore } from '../context/StoreContext';
import { X, Ruler } from 'lucide-react';

export const SizeChartModal: React.FC = () => {
  const { sizeChartCategory, setSizeChartCategory } = useStore();

  if (!sizeChartCategory) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-12 text-left">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={() => setSizeChartCategory(null)}
      />

      <div className="relative max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl p-6 sm:p-8 overflow-hidden z-10 animate-slide-up">
        <div className="flex items-center justify-between border-b border-stone-200 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <Ruler className="w-5 h-5 text-[#C0654B]" />
            <h3 className="text-lg font-bold text-stone-900 font-serif">
              Standard Size Guide (Inches)
            </h3>
          </div>
          <button
            onClick={() => setSizeChartCategory(null)}
            className="p-1.5 text-stone-400 hover:text-stone-900 rounded-full cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-x-auto text-xs">
          <table className="w-full border-collapse border border-stone-200 text-stone-700 text-center">
            <thead>
              <tr className="bg-[#F3E9E4] text-[#2B2620] font-bold">
                <th className="border border-stone-200 p-2.5">Brand Size</th>
                <th className="border border-stone-200 p-2.5">Bust / Chest (in)</th>
                <th className="border border-stone-200 p-2.5">Waist (in)</th>
                <th className="border border-stone-200 p-2.5">Hip (in)</th>
                <th className="border border-stone-200 p-2.5">Length (in)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="hover:bg-stone-50">
                <td className="border border-stone-200 p-2 font-bold text-[#C0654B]">XS</td>
                <td className="border border-stone-200 p-2">32 - 34</td>
                <td className="border border-stone-200 p-2">26 - 28</td>
                <td className="border border-stone-200 p-2">34 - 36</td>
                <td className="border border-stone-200 p-2">38</td>
              </tr>
              <tr className="hover:bg-stone-50">
                <td className="border border-stone-200 p-2 font-bold text-[#C0654B]">S</td>
                <td className="border border-stone-200 p-2">34 - 36</td>
                <td className="border border-stone-200 p-2">28 - 30</td>
                <td className="border border-stone-200 p-2">36 - 38</td>
                <td className="border border-stone-200 p-2">39</td>
              </tr>
              <tr className="hover:bg-stone-50">
                <td className="border border-stone-200 p-2 font-bold text-[#C0654B]">M</td>
                <td className="border border-stone-200 p-2">36 - 38</td>
                <td className="border border-stone-200 p-2">30 - 32</td>
                <td className="border border-stone-200 p-2">38 - 40</td>
                <td className="border border-stone-200 p-2">40</td>
              </tr>
              <tr className="hover:bg-stone-50">
                <td className="border border-stone-200 p-2 font-bold text-[#C0654B]">L</td>
                <td className="border border-stone-200 p-2">38 - 40</td>
                <td className="border border-stone-200 p-2">32 - 34</td>
                <td className="border border-stone-200 p-2">40 - 42</td>
                <td className="border border-stone-200 p-2">41</td>
              </tr>
              <tr className="hover:bg-stone-50">
                <td className="border border-stone-200 p-2 font-bold text-[#C0654B]">XL</td>
                <td className="border border-stone-200 p-2">40 - 42</td>
                <td className="border border-stone-200 p-2">34 - 36</td>
                <td className="border border-stone-200 p-2">42 - 44</td>
                <td className="border border-stone-200 p-2">42</td>
              </tr>
              <tr className="hover:bg-stone-50">
                <td className="border border-stone-200 p-2 font-bold text-[#C0654B]">XXL / Curves</td>
                <td className="border border-stone-200 p-2">44 - 46</td>
                <td className="border border-stone-200 p-2">38 - 40</td>
                <td className="border border-stone-200 p-2">46 - 48</td>
                <td className="border border-stone-200 p-2">43</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-4 bg-stone-50 p-3 rounded-lg border border-stone-200 text-[11px] text-stone-600 space-y-1">
          <p className="font-bold text-stone-800">Measuring Tips:</p>
          <p>• <strong>Bust/Chest:</strong> Measure around the fullest part of your chest with a soft measuring tape.</p>
          <p>• <strong>Waist:</strong> Measure around your natural waistline keeping the tape comfortably loose.</p>
        </div>
      </div>
    </div>
  );
};
