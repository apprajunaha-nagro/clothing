import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Order } from '../types';
import { Crown, Package, MapPin, Heart, LogOut, Truck, CheckCircle2, Clock, RotateCcw, ChevronRight } from 'lucide-react';

interface AccountPageProps {
  onNavigate: (path: string) => void;
}

export const AccountPage: React.FC<AccountPageProps> = ({ onNavigate }) => {
  const { user, orders, wishlist, showToast } = useStore();
  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'points' | 'returns'>('orders');

  // Return request form modal state
  const [returnOrderId, setReturnOrderId] = useState<string | null>(null);
  const [returnReason, setReturnReason] = useState('Size mismatch');
  const [returnNote, setReturnNote] = useState('');

  const handleReturnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast(`Return request logged for Order #${returnOrderId}! Pickup will be scheduled within 48 hours.`);
    setReturnOrderId(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      {/* ACCOUNT HEADER PROFILE CARD */}
      <div className="bg-stone-900 text-white p-6 sm:p-8 rounded-2xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden border border-stone-800">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#C0654B] text-white font-bold text-2xl flex items-center justify-center font-serif shadow-md border-2 border-stone-700">
            {user?.name.charAt(0) || 'U'}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-serif">{user?.name}</h1>
            <p className="text-xs text-stone-300">{user?.email} | +91 98765 12345</p>
            <span className="inline-flex items-center gap-1 text-[10px] bg-amber-500/20 text-amber-400 font-bold px-2.5 py-0.5 rounded-full border border-amber-500/30 mt-1">
              <Crown className="w-3 h-3 text-amber-400" />
              TERRA CLUB GOLD MEMBER
            </span>
          </div>
        </div>

        {/* LOYALTY POINTS CARD */}
        <div className="bg-stone-800/80 p-4 rounded-xl border border-stone-700 text-center min-w-[200px]">
          <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Available Loyalty Points</p>
          <p className="text-3xl font-extrabold text-[#C0654B]">{user?.points || 350} <span className="text-xs text-amber-400">PTS</span></p>
          <p className="text-[10px] text-stone-400 mt-0.5">Worth ₹{(user?.points || 350)} discount voucher</p>
        </div>
      </div>

      {/* ACCOUNT TABS */}
      <div className="flex border-b border-stone-200 gap-4 text-xs font-bold overflow-x-auto no-scrollbar">
        {[
          { id: 'orders', label: `My Orders (${orders.length})`, icon: Package },
          { id: 'addresses', label: 'Saved Addresses', icon: MapPin },
          { id: 'points', label: 'Club Benefits & Points', icon: Crown },
          { id: 'returns', label: 'Returns & Exchange', icon: RotateCcw },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-3 px-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-[#C0654B] text-[#C0654B] font-extrabold'
                  : 'border-transparent text-stone-600 hover:text-stone-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT: ORDERS LIST WITH PIPELINE TRACKING */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {orders.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-stone-200 text-center space-y-3">
              <Package className="w-12 h-12 text-stone-300 mx-auto" />
              <p className="font-bold text-stone-800 text-base">No Past Orders Found</p>
              <p className="text-xs text-stone-500">Your shopping history will appear here once you place an order.</p>
            </div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4 text-xs">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-stone-100 pb-3 gap-2">
                  <div>
                    <span className="font-bold text-stone-900 text-sm font-serif">Order #{order.orderNumber}</span>
                    <p className="text-stone-500 text-[11px]">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-stone-900 text-sm">₹{order.total.toLocaleString('en-IN')}</span>
                    <span className={`px-2.5 py-1 rounded-full font-bold uppercase text-[10px] ${
                      order.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                      order.status === 'shipped' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>

                {/* TRACKING PIPELINE BAR */}
                <div className="bg-stone-50 p-3 rounded-xl border border-stone-100 flex items-center justify-between text-[11px] font-semibold text-stone-700">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#C0654B]" />
                    <span>Pipeline: </span>
                    <span className="text-[#C0654B] font-bold uppercase">{order.status}</span>
                  </div>
                  {order.trackingNumber && (
                    <span className="text-stone-500">Courier: <strong>{order.courierPartner || 'Delhivery'}</strong> ({order.trackingNumber})</span>
                  )}
                </div>

                {/* ITEMS LIST */}
                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-2 rounded-lg bg-stone-50/50">
                      <div className="flex items-center gap-3">
                        <img src={item.productImage} alt={item.productName} className="w-10 h-12 object-cover rounded-md bg-stone-200" />
                        <div>
                          <p className="font-bold text-stone-900">{item.productName}</p>
                          <p className="text-stone-500 text-[11px]">Size: {item.size} | Color: {item.color} | Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <span className="font-bold text-stone-900">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>

                {/* ACTIONS */}
                <div className="pt-2 flex justify-end gap-3">
                  <button
                    onClick={() => setReturnOrderId(order.id)}
                    className="text-stone-700 hover:text-[#C0654B] font-bold text-xs underline cursor-pointer"
                  >
                    Request Return / Exchange
                  </button>
                  <button
                    onClick={() => onNavigate(`/order-confirmation/${order.id}`)}
                    className="bg-[#C0654B] text-white text-xs font-bold px-4 py-2 rounded-lg cursor-pointer"
                  >
                    View Tax Invoice
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* RETURN MODAL */}
      {returnOrderId && (
        <div className="fixed inset-0 z-50 p-4 flex items-center justify-center bg-black/60">
          <div className="bg-white p-6 rounded-2xl max-w-md w-full space-y-4 text-xs">
            <h3 className="font-serif font-bold text-base text-stone-900">Return / Exchange Request</h3>
            <form onSubmit={handleReturnSubmit} className="space-y-3">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Reason for Return</label>
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full border border-stone-300 rounded-lg p-2.5"
                >
                  <option value="Size mismatch">Size mismatch / Too tight / Too loose</option>
                  <option value="Color variation">Color differs from photos</option>
                  <option value="Fabric quality">Fabric texture issue</option>
                  <option value="Changed mind">Changed mind</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Additional Notes</label>
                <textarea
                  rows={3}
                  value={returnNote}
                  onChange={(e) => setReturnNote(e.target.value)}
                  placeholder="Provide feedback for quality improvement..."
                  className="w-full border border-stone-300 rounded-lg p-2.5"
                />
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setReturnOrderId(null)}
                  className="px-4 py-2 border border-stone-300 rounded-lg font-bold text-stone-700"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-[#C0654B] text-white rounded-lg font-bold">
                  Confirm Pickup Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
