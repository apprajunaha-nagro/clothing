import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  Search, Eye, Printer, ShoppingBag, Truck, Calendar, DollarSign, X, Check, 
  MapPin, Plus, Trash2, ArrowUpRight, MessageSquare, ShieldCheck, Mail
} from 'lucide-react';
import { Order, OrderItem, OrderStatus, Product, ProductVariant, Address } from '../../types';

export const AdminOrdersView: React.FC = () => {
  const { orders, updateOrderStatus, products, setProducts, showToast, settings } = useStore();

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<OrderStatus | ''>('');
  const [filterPayment, setFilterPayment] = useState('');
  const [filterDate, setFilterDate] = useState<'all' | 'today' | 'week' | 'month'>('all');

  // Selected Order for detail view / modal
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [showInvoicePrint, setShowInvoicePrint] = useState(false);
  const [showLabelPrint, setShowLabelPrint] = useState(false);

  // Manual Order states
  const [isManualOrderOpen, setIsManualOrderOpen] = useState(false);
  const [mCustomerName, setMCustomerName] = useState('');
  const [mPhone, setMPhone] = useState('');
  const [mEmail, setMEmail] = useState('');
  const [mAddress, setMAddress] = useState('');
  const [mCity, setMCity] = useState('');
  const [mState, setMState] = useState('');
  const [mPincode, setMPincode] = useState('');
  const [mSelectedItems, setMSelectedItems] = useState<OrderItem[]>([]);
  
  // Searching product inside manual creator
  const [searchProdQuery, setSearchProdQuery] = useState('');
  const [foundProducts, setFoundProducts] = useState<Product[]>([]);

  // Tracking partner entry state
  const [trackingNo, setTrackingNo] = useState('');
  const [courierPartner, setCourierPartner] = useState('Delhivery');

  // Filtering orders
  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.orderNumber.includes(searchQuery) || 
                          o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          o.customerPhone.includes(searchQuery);
    const matchesStatus = filterStatus ? o.status === filterStatus : true;
    const matchesPayment = filterPayment ? o.paymentStatus === filterPayment : true;

    // Date filters
    let matchesDate = true;
    const orderDate = new Date(o.createdAt);
    const today = new Date();
    if (filterDate === 'today') {
      matchesDate = orderDate.toDateString() === today.toDateString();
    } else if (filterDate === 'week') {
      const diffTime = Math.abs(today.getTime() - orderDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      matchesDate = diffDays <= 7;
    } else if (filterDate === 'month') {
      matchesDate = orderDate.getMonth() === today.getMonth() && orderDate.getFullYear() === today.getFullYear();
    }

    return matchesSearch && matchesStatus && matchesPayment && matchesDate;
  });

  // Handle Manual Product search in creator
  const handleProductSearch = (query: string) => {
    setSearchProdQuery(query);
    if (!query.trim()) {
      setFoundProducts([]);
      return;
    }
    const found = products.filter(p => p.name.toLowerCase().includes(query.toLowerCase())).slice(0, 5);
    setFoundProducts(found);
  };

  const addProductToManualOrder = (prod: Product, variant: ProductVariant) => {
    const existing = mSelectedItems.find(item => item.variantId === variant.id);
    if (existing) {
      setMSelectedItems(prev => prev.map(item => 
        item.variantId === variant.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      const newItem: OrderItem = {
        id: `oi-${Date.now()}`,
        productId: prod.id,
        variantId: variant.id,
        productName: prod.name,
        productImage: variant.images[0] || prod.colors[0]?.images[0] || '',
        size: variant.size,
        color: variant.color,
        price: variant.discountPrice || variant.price,
        quantity: 1
      };
      setMSelectedItems(prev => [...prev, newItem]);
    }
    setSearchProdQuery('');
    setFoundProducts([]);
    showToast(`Added ${prod.name} (${variant.size}) to manual order invoice.`);
  };

  // Submit manual order
  const handleSaveManualOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (mSelectedItems.length === 0) {
      alert('Please add at least one product item to create order.');
      return;
    }

    const subtotal = mSelectedItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const tax = Math.round(subtotal * 0.05); // 5% flat GST
    const shippingFee = subtotal > 999 ? 0 : 79;
    const total = subtotal + tax + shippingFee;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: `PGM-${Math.floor(100000 + Math.random() * 900000)}`,
      customerId: 'manual-customer-id',
      customerName: mCustomerName,
      customerEmail: mEmail || 'walkin.customer@pgmart.com',
      customerPhone: mPhone,
      shippingAddress: {
        id: `addr-${Date.now()}`,
        fullName: mCustomerName,
        phone: mPhone,
        street: mAddress,
        city: mCity,
        state: mState,
        pincode: mPincode,
        type: 'home'
      },
      items: mSelectedItems,
      subtotal,
      discount: 0,
      shippingFee,
      tax,
      total,
      status: 'pending',
      paymentStatus: 'pending',
      paymentMethod: 'cod',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Push back into orders local store via direct mutation / mock API
    orders.unshift(newOrder); // Since it's mutated, the store reacts or syncs
    setIsManualOrderOpen(false);
    // Reset states
    setMCustomerName('');
    setMPhone('');
    setMEmail('');
    setMAddress('');
    setMCity('');
    setMState('');
    setMPincode('');
    setMSelectedItems([]);
    showToast(`Manual order placed successfully under ID #${newOrder.orderNumber}`);
  };

  // Trigger simulated customer tracking alerts
  const handleSimulateStatusAlert = (order: Order, nextStatus: OrderStatus) => {
    updateOrderStatus(order.id, nextStatus, trackingNo);
    setActiveOrder(prev => prev ? { ...prev, status: nextStatus, trackingNumber: trackingNo || prev.trackingNumber } : null);
    
    // Simulate SMTP/SMS Blast
    showToast(`✉️ Triggered Automated Email & SMS notification to ${order.customerName} (${order.customerPhone}): "Order status changed to ${nextStatus.toUpperCase()}"`);
  };

  return (
    <div className="space-y-6 text-stone-800 animate-fade-in text-left">
      
      {/* HEADER SECTION */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold font-serif text-stone-900">Store Orders Fulfillment Center</h2>
          <p className="text-xs text-stone-400">Moderating custom exchanges, status dispatch, and invoice print lists</p>
        </div>

        <button
          onClick={() => setIsManualOrderOpen(true)}
          className="px-5 py-2.5 bg-[#C0654B] hover:bg-[#8B4A38] text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer transition-colors"
        >
          <Plus className="w-4 h-4" /> Manual Order (Cash/Phone)
        </button>
      </div>

      {/* FILTER SEARCH DRAWER */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-sm flex flex-wrap items-center gap-3 text-xs font-medium text-stone-500">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search order ID, customers, or phone..."
            className="w-full pl-9 pr-3 py-2 border border-stone-200 rounded-xl bg-stone-50 focus:bg-white outline-none font-semibold text-stone-700 transition-colors"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          className="p-2 border border-stone-200 rounded-xl bg-white font-bold text-stone-700"
        >
          <option value="">All Dispatch Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
          <option value="returned">Returned</option>
        </select>

        <select
          value={filterPayment}
          onChange={(e) => setFilterPayment(e.target.value)}
          className="p-2 border border-stone-200 rounded-xl bg-white font-bold text-stone-700"
        >
          <option value="">All Payment Status</option>
          <option value="paid">Paid</option>
          <option value="pending">Awaiting (COD)</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>

        <select
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value as any)}
          className="p-2 border border-stone-200 rounded-xl bg-white font-bold text-stone-700"
        >
          <option value="all">Any Date</option>
          <option value="today">Today's Orders</option>
          <option value="week">Past 7 Days</option>
          <option value="month">This Month</option>
        </select>
      </div>

      {/* TABLE DATA LIST */}
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto touch-scroll">
          <table className="w-full text-xs text-left min-w-[640px]">
            <thead className="bg-stone-50 text-stone-500 font-bold border-b border-stone-200">
              <tr>
                <th className="p-3">Order Number</th>
                <th className="p-3">Customer details</th>
                <th className="p-3">Placed Date</th>
                <th className="p-3">Method</th>
                <th className="p-3">Payment</th>
                <th className="p-3">Invoice Total</th>
                <th className="p-3">Dispatch Status</th>
                <th className="p-3 text-right">Fulfill</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-semibold text-stone-700">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-stone-400">No client orders placed under specified parameters yet.</td>
                </tr>
              ) : (
                filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-stone-50/50">
                    <td className="p-3 font-mono font-bold text-stone-900">#{order.orderNumber}</td>
                    <td className="p-3">
                      <div className="font-bold text-stone-800">{order.customerName}</div>
                      <div className="text-[10px] text-stone-400">{order.customerPhone}</div>
                    </td>
                    <td className="p-3 text-stone-500 font-medium">
                      {new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-3 uppercase font-mono font-bold text-[10px] text-stone-500">{order.paymentMethod}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        order.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="p-3 font-mono font-bold text-stone-900">₹{order.total.toLocaleString()}</td>
                    <td className="p-3">
                      <select
                        value={order.status}
                        onChange={(e) => handleSimulateStatusAlert(order, e.target.value as any)}
                        className={`px-2 py-1 rounded-lg border text-[11px] font-bold cursor-pointer outline-none ${
                          order.status === 'delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          order.status === 'shipped' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          order.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-200' :
                          'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="returned">Returned</option>
                      </select>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => { setActiveOrder(order); setTrackingNo(order.trackingNumber || ''); }}
                        className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg cursor-pointer inline-flex items-center gap-1 font-bold text-[10px]"
                      >
                        <Eye className="w-3.5 h-3.5" /> Fulfill
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RETURN MODERATION QUEUE */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm text-left space-y-4">
        <h3 className="text-sm font-bold font-serif text-stone-900">Active Return & Exchange Approvals queue</h3>
        <p className="text-xs text-stone-400">Customers requesting style or size adjustments. Review claims before refund authorization</p>

        <div className="border border-stone-200 rounded-xl divide-y divide-stone-100 text-xs">
          <div className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-50/55 font-semibold text-stone-700">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-stone-900">Exchange Claim #EX-1049</span>
                <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-2 py-0.5 rounded-full">PENDING RE-INSPECTION</span>
              </div>
              <p className="text-stone-500">Priya Sharma wants to exchange "Ethnic Kurta Set" from Size M to L because of fit preference.</p>
              <p className="text-[10px] text-stone-400">Order ID: #PGM-5201 | UPI Payment</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => showToast('Approved return. Dispatched pickup crew Delhivery.')}
                className="px-3 py-1.5 bg-[#C0654B] hover:bg-[#8B4A38] text-white font-bold rounded-lg cursor-pointer"
              >
                Approve Exchange & Pickup
              </button>
              <button
                onClick={() => showToast('Exchange request rejected.')}
                className="px-3 py-1.5 border border-stone-200 hover:bg-stone-50 text-stone-600 font-bold rounded-lg cursor-pointer"
              >
                Reject Request
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* FULFILLMENT SLIDE-OUT / MODAL */}
      {activeOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200 p-4 sm:p-6 space-y-5 animate-scale-in text-left">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-stone-400 font-mono">Invoice reference #{activeOrder.orderNumber}</span>
                <h3 className="text-base font-bold font-serif text-stone-900">Fulfillment Detail Sheet</h3>
              </div>
              <button onClick={() => setActiveOrder(null)} className="text-stone-400 hover:text-stone-800">✕</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Left Column: Customer details */}
              <div className="space-y-3">
                <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 space-y-1.5">
                  <span className="font-bold text-stone-800 uppercase text-[10px] tracking-wider block">Customer Coordinates</span>
                  <div className="font-bold text-stone-900 text-sm">{activeOrder.customerName}</div>
                  <div className="text-stone-500">{activeOrder.customerEmail}</div>
                  <div className="text-stone-500 font-mono font-semibold">{activeOrder.customerPhone}</div>
                </div>

                <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 space-y-2">
                  <span className="font-bold text-stone-800 uppercase text-[10px] tracking-wider block">Delivery Destination Address</span>
                  <div className="font-semibold text-stone-700 leading-relaxed flex items-start gap-1">
                    <MapPin className="w-4 h-4 text-[#C0654B] shrink-0 mt-0.5" />
                    <div>
                      {activeOrder.shippingAddress.street}, <br />
                      {activeOrder.shippingAddress.city}, {activeOrder.shippingAddress.state} - <span className="font-mono font-bold text-stone-900">{activeOrder.shippingAddress.pincode}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Dispatch setups */}
              <div className="space-y-3 bg-stone-50 p-4 rounded-xl border border-stone-200">
                <span className="font-bold text-stone-800 uppercase text-[10px] tracking-wider block">Courier & Tracking Logs</span>
                
                <div className="space-y-2">
                  <div>
                    <label className="block font-bold text-stone-600 mb-1">Logistics Courier Partner</label>
                    <select
                      value={courierPartner}
                      onChange={(e) => setCourierPartner(e.target.value)}
                      className="w-full p-2 bg-white border border-stone-300 rounded-lg font-bold"
                    >
                      <option value="Delhivery">Delhivery Express</option>
                      <option value="Shiprocket">Shiprocket Economy</option>
                      <option value="Blue Dart">Blue Dart Air Cargo</option>
                      <option value="Shadowfax">Shadowfax Local</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-stone-600 mb-1">Tracking ID / Waybill Number</label>
                    <input
                      type="text"
                      value={trackingNo}
                      onChange={(e) => setTrackingNo(e.target.value)}
                      placeholder="e.g. 19284029481"
                      className="w-full p-2 border border-stone-300 bg-white rounded-lg outline-none font-semibold font-mono"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => handleSimulateStatusAlert(activeOrder, 'shipped')}
                      className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm text-[10px] uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Truck className="w-4 h-4" /> Save Dispatch & Trigger SMTP Alert
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Product items table summary */}
            <div className="border border-stone-200 rounded-xl overflow-hidden text-xs">
              <div className="bg-stone-100/50 p-2 border-b border-stone-200 font-bold text-stone-600">Apparel Items Breakdown</div>
              <div className="divide-y divide-stone-100">
                {activeOrder.items.map(item => (
                  <div key={item.id} className="p-3 flex items-center justify-between gap-3 bg-white font-semibold">
                    <div className="flex items-center gap-2.5">
                      <img src={item.productImage} alt="" className="w-10 h-10 object-cover rounded-lg border border-stone-200" referrerPolicy="referrer" />
                      <div>
                        <h4 className="font-bold text-stone-800">{item.productName}</h4>
                        <span className="text-[10px] text-stone-400 font-mono">Col: {item.color} | Sz: {item.size}</span>
                      </div>
                    </div>
                    <div className="text-right font-mono">
                      <span>₹{item.price} x {item.quantity}</span>
                      <p className="text-[#C0654B] font-bold">₹{item.price * item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3.5 bg-stone-50 border-t border-stone-200 flex flex-wrap justify-between items-center text-stone-700 font-semibold font-mono text-xs">
                <span>Total Gst Included: ₹{activeOrder.tax}</span>
                <span className="text-sm font-bold text-[#C0654B]">Grand total Bill: ₹{activeOrder.total}</span>
              </div>
            </div>

            {/* Invoice & shipping Label Printing links */}
            <div className="flex justify-between items-center pt-2 border-t border-stone-100 text-xs">
              <div className="flex gap-2">
                <button
                  onClick={() => setShowInvoicePrint(true)}
                  className="px-3.5 py-2 border border-stone-200 hover:bg-stone-50 rounded-xl font-bold cursor-pointer flex items-center gap-1"
                >
                  <Printer className="w-4 h-4 text-stone-500" /> Invoice
                </button>
                <button
                  onClick={() => setShowLabelPrint(true)}
                  className="px-3.5 py-2 border border-stone-200 hover:bg-stone-50 rounded-xl font-bold cursor-pointer flex items-center gap-1"
                >
                  <Truck className="w-4 h-4 text-stone-500" /> Shipping Label
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleSimulateStatusAlert(activeOrder, 'delivered')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl cursor-pointer"
                >
                  Mark Delivered
                </button>
                <button
                  onClick={() => setActiveOrder(null)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PRINT PREVIEW MODAL: INVOICE */}
      {showInvoicePrint && activeOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-white rounded-none max-w-2xl w-full p-8 border border-stone-300 text-xs text-left text-stone-800 space-y-6">
            <div className="flex justify-between items-start border-b border-stone-200 pb-4">
              <div>
                <h1 className="text-2xl font-serif font-bold text-stone-900">{settings.storeName}</h1>
                <p className="text-stone-400 font-medium">GSTIN: {settings.gstNumber}</p>
                <p className="text-stone-400">{settings.address}</p>
              </div>
              <div className="text-right">
                <h2 className="text-lg font-bold font-mono">RETAIL TAX INVOICE</h2>
                <p className="text-stone-500">Order Ref: #{activeOrder.orderNumber}</p>
                <p className="text-stone-500 font-semibold">Date: {new Date(activeOrder.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div>
                <span className="font-bold text-stone-400 uppercase text-[10px] block mb-1">BILL TO:</span>
                <p className="font-bold text-stone-900">{activeOrder.customerName}</p>
                <p className="text-stone-500">{activeOrder.customerEmail}</p>
                <p className="text-stone-500 font-mono">{activeOrder.customerPhone}</p>
              </div>
              <div>
                <span className="font-bold text-stone-400 uppercase text-[10px] block mb-1">SHIP TO:</span>
                <p className="font-semibold text-stone-700">{activeOrder.shippingAddress.street}</p>
                <p className="text-stone-600">{activeOrder.shippingAddress.city}, {activeOrder.shippingAddress.state} - {activeOrder.shippingAddress.pincode}</p>
              </div>
            </div>

            <table className="w-full text-left divide-y divide-stone-200">
              <thead>
                <tr className="bg-stone-50 text-stone-500 font-bold">
                  <th className="p-2">Description</th>
                  <th className="p-2 text-center">Qty</th>
                  <th className="p-2 text-right">Unit Price</th>
                  <th className="p-2 text-right">Gross Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium">
                {activeOrder.items.map(item => (
                  <tr key={item.id}>
                    <td className="p-2">
                      <div className="font-bold">{item.productName}</div>
                      <div className="text-[10px] text-stone-400">Color: {item.color} | Size: {item.size}</div>
                    </td>
                    <td className="p-2 text-center font-mono">{item.quantity}</td>
                    <td className="p-2 text-right font-mono">₹{item.price}</td>
                    <td className="p-2 text-right font-mono">₹{item.price * item.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="border-t border-stone-200 pt-3 flex justify-end">
              <div className="w-64 space-y-1.5 font-semibold text-stone-600 font-mono">
                <div className="flex justify-between text-stone-400">
                  <span>Subtotal:</span>
                  <span>₹{activeOrder.subtotal}</span>
                </div>
                <div className="flex justify-between text-stone-400">
                  <span>GST Tax (5%):</span>
                  <span>₹{activeOrder.tax}</span>
                </div>
                <div className="flex justify-between text-stone-400">
                  <span>Standard Shipping:</span>
                  <span>₹{activeOrder.shippingFee}</span>
                </div>
                <div className="flex justify-between text-stone-900 font-bold border-t border-stone-200 pt-1.5 text-sm">
                  <span>Grand Total:</span>
                  <span className="text-[#C0654B]">₹{activeOrder.total}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-stone-200 pt-6 flex justify-between items-center text-[10px] text-stone-400 font-medium">
              <span>This is computer-generated invoice, no signature required.</span>
              <div className="flex gap-2">
                <button
                  onClick={() => { window.print(); }}
                  className="px-4 py-2 bg-stone-900 hover:bg-black text-white font-bold rounded-lg cursor-pointer"
                >
                  Print PDF
                </button>
                <button
                  onClick={() => setShowInvoicePrint(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PRINT PREVIEW MODAL: SHIPPING LABEL */}
      {showLabelPrint && activeOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-white rounded-none max-w-sm w-full p-6 border-4 border-double border-stone-900 text-xs text-left text-stone-800 space-y-4">
            <div className="flex justify-between items-center border-b border-stone-300 pb-2">
              <span className="text-sm font-extrabold font-serif">{settings.storeName} Logistics</span>
              <span className="bg-black text-white text-[9px] font-bold px-2 py-0.5 rounded font-mono uppercase">COURIER DISPATCH</span>
            </div>

            {/* Simulated Barcode */}
            <div className="bg-stone-50 border border-stone-300 p-2 flex flex-col items-center">
              <div className="bg-stone-900 w-full h-12 flex items-center justify-between px-3 text-stone-100 select-none">
                |||| | ||||| | ||| |||||| | |||||| | |||| | | ||||
              </div>
              <span className="text-[10px] font-mono mt-1 font-bold">AWB ID: Delhivery_{activeOrder.orderNumber}</span>
            </div>

            <div className="space-y-1.5">
              <span className="font-extrabold text-[10px] text-stone-400">DELIVER TO:</span>
              <p className="text-sm font-black text-stone-900">{activeOrder.customerName}</p>
              <p className="font-bold text-stone-700 leading-snug">{activeOrder.shippingAddress.street}</p>
              <p className="font-extrabold text-stone-900">{activeOrder.shippingAddress.city}, {activeOrder.shippingAddress.state} - <span className="text-sm">{activeOrder.shippingAddress.pincode}</span></p>
              <p className="text-[10.5px] font-mono text-stone-500">Phone: {activeOrder.customerPhone}</p>
            </div>

            <div className="border-t border-stone-200 pt-3 flex justify-between items-center text-[10px] font-mono font-bold">
              <span>Payment Type: COD</span>
              <span className="text-xs text-stone-900">Collectable: ₹{activeOrder.total}</span>
            </div>

            <div className="flex gap-2 pt-2 border-t border-stone-200">
              <button
                onClick={() => window.print()}
                className="w-full py-2 bg-stone-900 hover:bg-black text-white font-bold rounded cursor-pointer text-[10px] uppercase"
              >
                Print Label
              </button>
              <button
                onClick={() => setShowLabelPrint(false)}
                className="w-full py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded cursor-pointer text-[10px] uppercase"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MANUAL ORDER PLACEMENT MODAL */}
      {isManualOrderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200 p-4 sm:p-6 space-y-4 animate-scale-in text-left">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-base font-bold font-serif text-stone-900">Manual Orders Creator</h3>
              <button onClick={() => setIsManualOrderOpen(false)} className="text-stone-400 hover:text-stone-700">✕</button>
            </div>

            <form onSubmit={handleSaveManualOrder} className="space-y-4 text-xs font-medium">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Customer Full Name (Required)</label>
                  <input
                    type="text"
                    required
                    value={mCustomerName}
                    onChange={(e) => setMCustomerName(e.target.value)}
                    placeholder="Amit Bose"
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg outline-none focus:border-[#C0654B]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Phone Number (Required)</label>
                  <input
                    type="text"
                    required
                    value={mPhone}
                    onChange={(e) => setMPhone(e.target.value)}
                    placeholder="+91 90876 54321"
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg outline-none focus:border-[#C0654B] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Complete Delivery Address</label>
                <input
                  type="text"
                  required
                  value={mAddress}
                  onChange={(e) => setMAddress(e.target.value)}
                  placeholder="Street and house specifications..."
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-0.5">City</label>
                  <input type="text" required value={mCity} onChange={(e) => setMCity(e.target.value)} className="w-full px-3 py-1.5 border border-stone-300 rounded-lg" />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-0.5">State</label>
                  <input type="text" required value={mState} onChange={(e) => setMState(e.target.value)} className="w-full px-3 py-1.5 border border-stone-300 rounded-lg" />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-0.5">Pincode</label>
                  <input type="text" required value={mPincode} onChange={(e) => setMPincode(e.target.value)} className="w-full px-3 py-1.5 border border-stone-300 rounded-lg font-mono" />
                </div>
              </div>

              {/* Product selector search block */}
              <div className="border border-stone-200 p-3.5 rounded-xl bg-stone-50 space-y-3">
                <span className="font-bold text-stone-700 block text-xs">Search and Add Apparel Items</span>
                
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    value={searchProdQuery}
                    onChange={(e) => handleProductSearch(e.target.value)}
                    placeholder="Search product e.g. Saree, Kurti..."
                    className="w-full pl-9 pr-3 py-2 border border-stone-300 rounded-xl bg-white outline-none focus:border-[#C0654B]"
                  />
                </div>

                {foundProducts.length > 0 && (
                  <div className="bg-white border border-stone-200 rounded-lg divide-y divide-stone-100 max-h-40 overflow-y-auto">
                    {foundProducts.map(p => (
                      <div key={p.id} className="p-2 flex flex-col gap-1 hover:bg-stone-50">
                        <span className="font-bold text-stone-800">{p.name} (Base: ₹{p.basePrice})</span>
                        <div className="flex flex-wrap gap-1">
                          {(p.variants || []).map(v => (
                            <button
                              key={v.id}
                              type="button"
                              onClick={() => addProductToManualOrder(p, v)}
                              className="px-2 py-0.5 bg-stone-100 hover:bg-[#C0654B] hover:text-white rounded text-[9px] font-bold font-mono transition-colors"
                            >
                              Sz: {v.size} - Col: {v.color} - ₹{v.discountPrice || v.price}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Selected items sheet */}
                {mSelectedItems.length > 0 && (
                  <div className="bg-white border border-stone-200 rounded-xl overflow-hidden divide-y divide-stone-100">
                    <div className="p-2 bg-stone-100/50 font-bold text-stone-600 uppercase text-[9px]">Invoice itemizations</div>
                    {mSelectedItems.map((item, index) => (
                      <div key={item.variantId} className="p-2.5 flex items-center justify-between text-[11px] font-bold">
                        <div className="min-w-0">
                          <h4 className="text-stone-800 truncate">{item.productName}</h4>
                          <span className="text-[9px] text-stone-400 font-mono">Size: {item.size} • Color: {item.color}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="font-mono text-stone-700">₹{item.price}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setMSelectedItems(prev => prev.filter((_, i) => i !== index));
                            }}
                            className="text-red-500 hover:text-red-700"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 border-t border-stone-100 pt-3">
                <button
                  type="button"
                  onClick={() => setIsManualOrderOpen(false)}
                  className="px-4 py-2 bg-stone-100 text-stone-700 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#C0654B] hover:bg-[#8B4A38] text-white font-bold rounded-xl cursor-pointer shadow-sm"
                >
                  Create & Place Order
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
