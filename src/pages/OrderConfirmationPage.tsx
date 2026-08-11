import React from 'react';
import { Order } from '../types';
import { useStore } from '../context/StoreContext';
import { CheckCircle2, Download, Package, ArrowRight, Printer, ShieldCheck } from 'lucide-react';

interface OrderConfirmationPageProps {
  onNavigate: (path: string) => void;
  order: Order | null;
}

export const OrderConfirmationPage: React.FC<OrderConfirmationPageProps> = ({ onNavigate, order }) => {
  const { settings } = useStore();

  if (!order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold font-serif text-stone-900">No Order Found</h2>
        <button onClick={() => onNavigate('/')} className="bg-[#C0654B] text-white text-xs font-bold px-6 py-3 rounded-xl">
          RETURN TO HOMEPAGE
        </button>
      </div>
    );
  }

  const handlePrintInvoice = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 text-left">
      {/* SUCCESS HERO BANNER */}
      <div className="bg-emerald-50 border border-emerald-200 p-8 rounded-2xl text-center space-y-3">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-xs">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold font-serif text-emerald-950">
          Thank You! Your Order is Confirmed
        </h1>
        <p className="text-xs sm:text-sm text-emerald-800 font-medium">
          Order Number: <strong className="text-stone-900 font-mono text-base">{order.orderNumber}</strong>
        </p>
        <p className="text-xs text-emerald-700">
          We've sent a detailed order receipt and live tracking updates to <strong>{order.customerEmail}</strong>.
        </p>
      </div>

      {/* ITEMIZED INVOICE RECEIPT */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-sm space-y-6 text-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-stone-200 pb-4 gap-4">
          <div>
            <h3 className="text-lg font-bold font-serif text-stone-900">{settings.storeName} TAX INVOICE</h3>
            <p className="text-stone-500 text-[11px]">GSTIN: {settings.gstNumber} | Date: {new Date(order.createdAt).toLocaleDateString()}</p>
          </div>
          <button
            onClick={handlePrintInvoice}
            className="bg-stone-900 hover:bg-[#C0654B] text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>PRINT / DOWNLOAD PDF INVOICE</span>
          </button>
        </div>

        {/* CUSTOMER & SHIPPING ADDRESS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-stone-50 p-4 rounded-xl border border-stone-100">
          <div>
            <p className="font-bold text-stone-900 uppercase tracking-wider text-[11px] mb-1">Customer Info</p>
            <p className="font-semibold text-stone-800">{order.customerName}</p>
            <p className="text-stone-600">{order.customerPhone}</p>
            <p className="text-stone-600">{order.customerEmail}</p>
          </div>

          <div>
            <p className="font-bold text-stone-900 uppercase tracking-wider text-[11px] mb-1">Delivery Address</p>
            <p className="text-stone-700">
              {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
            </p>
          </div>
        </div>

        {/* ITEMS TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse border border-stone-200">
            <thead>
              <tr className="bg-[#F3E9E4] text-[#2B2620] font-bold">
                <th className="p-3 border border-stone-200">Item Description</th>
                <th className="p-3 border border-stone-200">Variant</th>
                <th className="p-3 border border-stone-200 text-center">Qty</th>
                <th className="p-3 border border-stone-200 text-right">Price</th>
                <th className="p-3 border border-stone-200 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id} className="border border-stone-200">
                  <td className="p-3 font-semibold text-stone-900 flex items-center gap-3">
                    {item.productImage && (
                      <img src={item.productImage} alt={item.productName} className="w-12 h-14 object-cover rounded border border-stone-200 shrink-0" />
                    )}
                    <div>
                      <p className="font-bold text-stone-900">{item.productName}</p>
                      <p className="text-[10px] text-stone-400 font-mono">SKU: {item.variantId}</p>
                    </div>
                  </td>
                  <td className="p-3 text-stone-600">{item.size} / {item.color}</td>
                  <td className="p-3 text-center">{item.quantity}</td>
                  <td className="p-3 text-right">₹{item.price.toLocaleString('en-IN')}</td>
                  <td className="p-3 text-right font-bold">₹{(item.price * item.quantity).toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* TOTALS */}
        <div className="flex justify-end">
          <div className="w-64 space-y-1.5 text-stone-700">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-semibold">₹{order.subtotal.toLocaleString('en-IN')}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>Discount:</span>
                <span>-₹{order.discount.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Shipping:</span>
              <span>₹{order.shippingFee}</span>
            </div>
            <div className="flex justify-between font-bold text-stone-900 text-sm pt-2 border-t border-stone-200">
              <span>Grand Total:</span>
              <span className="text-[#C0654B]">₹{order.total.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* TRACKING ACTION */}
      <div className="flex flex-col sm:flex-row items-center justify-between bg-stone-900 text-white p-6 rounded-2xl gap-4">
        <div>
          <p className="font-bold text-sm font-serif">Want to check delivery progress?</p>
          <p className="text-xs text-stone-400">Track order shipment pipeline in real time</p>
        </div>
        <button
          onClick={() => onNavigate('/account')}
          className="bg-[#C0654B] hover:bg-[#8B4A38] text-white text-xs font-bold px-6 py-3 rounded-xl transition-colors cursor-pointer"
        >
          GO TO MY ORDERS
        </button>
      </div>
    </div>
  );
};
