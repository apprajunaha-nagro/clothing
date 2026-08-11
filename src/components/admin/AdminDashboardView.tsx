import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  TrendingUp, ShoppingBag, DollarSign, AlertCircle, Users, ArrowUpRight, 
  Package, Calendar, CheckCircle2, ShoppingCart, Star, MessageSquare, Plus, Check
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid 
} from 'recharts';
import { Order, Product, ProductVariant } from '../../types';

export const AdminDashboardView: React.FC = () => {
  const { products, orders, updateOrderStatus, updateProduct, showToast } = useStore();
  const [timeRange, setTimeRange] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [restockStock, setRestockStock] = useState<{ [variantId: string]: number }>({});

  const lowStockThreshold = 10;
  const newCustomersCount = 14;

  const trendData = {
    daily: [
      { name: '9 AM', Sales: 4200, Orders: 3 },
      { name: '12 PM', Sales: 8500, Orders: 6 },
      { name: '3 PM', Sales: 12400, Orders: 9 },
      { name: '6 PM', Sales: 21500, Orders: 14 },
      { name: '9 PM', Sales: 31000, Orders: 19 },
      { name: '11 PM', Sales: 36500, Orders: 22 },
    ],
    weekly: [
      { name: 'Mon', Sales: 24000, Orders: 16 },
      { name: 'Tue', Sales: 32000, Orders: 21 },
      { name: 'Wed', Sales: 28000, Orders: 18 },
      { name: 'Thu', Sales: 45000, Orders: 30 },
      { name: 'Fri', Sales: 52000, Orders: 35 },
      { name: 'Sat', Sales: 61000, Orders: 42 },
      { name: 'Sun', Sales: 58000, Orders: 39 },
    ],
    monthly: [
      { name: 'Week 1', Sales: 145000, Orders: 98 },
      { name: 'Week 2', Sales: 189000, Orders: 124 },
      { name: 'Week 3', Sales: 210000, Orders: 142 },
      { name: 'Week 4', Sales: 245000, Orders: 165 },
    ]
  };

  // Memoized Calculations for Lightning-Fast Dashboard Snapshots
  const dashboardStats = React.useMemo(() => {
    const prodMap = new Map<string, Product>();
    for (let i = 0; i < products.length; i++) {
      prodMap.set(products[i].id, products[i]);
    }

    const today = new Date().toISOString().split('T')[0];
    const todayOrdersList = orders.filter(o => o.createdAt.startsWith(today) || o.createdAt.startsWith('2026-08-03'));
    const todaySales = todayOrdersList.reduce((acc, curr) => acc + curr.total, 0);

    const totalRevenue = orders
      .filter(o => o.paymentStatus === 'paid' || o.status !== 'cancelled')
      .reduce((acc, curr) => acc + curr.total, 0);

    const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;

    // Stock tracking
    const lowStockVariants: { product: Product; variant: ProductVariant }[] = [];
    for (let i = 0; i < products.length; i++) {
      const p = products[i];
      const vars = p.variants || [];
      for (let j = 0; j < vars.length; j++) {
        if (vars[j].stock <= lowStockThreshold) {
          lowStockVariants.push({ product: p, variant: vars[j] });
          if (lowStockVariants.length >= 15) break;
        }
      }
      if (lowStockVariants.length >= 15) break;
    }

    // Product Sales Ranking using O(1) Map
    const productSalesMap: { [prodId: string]: { product: Product; count: number; rev: number } } = {};
    orders.forEach(o => {
      o.items.forEach(item => {
        if (!productSalesMap[item.productId]) {
          const prod = prodMap.get(item.productId);
          if (prod) {
            productSalesMap[item.productId] = { product: prod, count: 0, rev: 0 };
          }
        }
        if (productSalesMap[item.productId]) {
          productSalesMap[item.productId].count += item.quantity;
          productSalesMap[item.productId].rev += item.price * item.quantity;
        }
      });
    });

    const bestSellers = Object.values(productSalesMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      todaySales,
      todayOrders: todayOrdersList,
      todayOrdersCount: todayOrdersList.length,
      totalRevenue,
      pendingOrdersCount,
      lowStockVariants,
      lowStockAlertsCount: lowStockVariants.length,
      bestSellers
    };
  }, [products, orders]);

  const {
    todaySales,
    todayOrders,
    todayOrdersCount,
    totalRevenue,
    pendingOrdersCount,
    lowStockVariants,
    lowStockAlertsCount,
    bestSellers
  } = dashboardStats;

  // Quick Restock action
  const handleQuickRestock = async (product: Product, variant: ProductVariant) => {
    const qty = restockStock[variant.id];
    if (!qty || qty <= 0) return;
    const updatedVariants = (product.variants || []).map(v => 
      v.id === variant.id ? { ...v, stock: v.stock + Number(qty) } : v
    );
    await updateProduct(product.id, { variants: updatedVariants });
    setRestockStock(prev => ({ ...prev, [variant.id]: 0 }));
    showToast(`Restocked ${product.name} (${variant.size} - ${variant.color}) with +${qty} items.`);
  };

  return (
    <div className="space-y-8 animate-fade-in text-stone-800">
      {/* SNAPSHOT STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Today's Sales */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-sm space-y-2 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-stone-400 uppercase">Today's Sales</span>
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold font-mono text-stone-900">₹{todaySales.toLocaleString()}</h3>
            <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 mt-0.5">
              <span>+18.4%</span>
              <span className="text-stone-400 font-normal">vs yesterday</span>
            </p>
          </div>
        </div>

        {/* Today's Orders */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-sm space-y-2 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-stone-400 uppercase">Today's Orders</span>
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold font-mono text-stone-900">{todayOrdersCount}</h3>
            <p className="text-[10px] text-stone-500 font-medium mt-0.5">
              <span>Avg: ₹{(todaySales / (todayOrdersCount || 1)).toFixed(0)}</span>
            </p>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-sm space-y-2 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-stone-400 uppercase">Total Revenue</span>
            <div className="p-1.5 bg-[#C0654B]/10 text-[#C0654B] rounded-lg">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold font-mono text-stone-900">₹{totalRevenue.toLocaleString()}</h3>
            <p className="text-[10px] text-stone-400 font-normal mt-0.5">This Month Sales</p>
          </div>
        </div>

        {/* Pending Orders */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-sm space-y-2 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-stone-400 uppercase">Pending Orders</span>
            <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold font-mono text-amber-600">{pendingOrdersCount}</h3>
            <p className="text-[10px] text-amber-600 font-bold mt-0.5">Awaiting dispatch</p>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-sm space-y-2 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-stone-400 uppercase">Low Stock Alerts</span>
            <div className="p-1.5 bg-red-50 text-red-600 rounded-lg">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold font-mono text-red-600">{lowStockAlertsCount}</h3>
            <p className="text-[10px] text-stone-400 font-normal mt-0.5">SKUs &lt; {lowStockThreshold} units</p>
          </div>
        </div>

        {/* New Customers */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-sm space-y-2 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-stone-400 uppercase">New Customers</span>
            <div className="p-1.5 bg-sky-50 text-sky-600 rounded-lg">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold font-mono text-stone-900">{newCustomersCount}</h3>
            <p className="text-[10px] text-emerald-600 font-bold mt-0.5">+4 this week</p>
          </div>
        </div>
      </div>

      {/* CHARTS & RECENT SUMMARY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Trend Recharts Graph */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm lg:col-span-2 space-y-4 text-left">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold font-serif text-stone-900">Sales Trend Analysis</h2>
              <p className="text-xs text-stone-400">Monitor store checkout velocity & earnings</p>
            </div>
            <div className="flex gap-1 bg-stone-100 p-1 rounded-xl text-xs">
              {(['daily', 'weekly', 'monthly'] as const).map(range => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1 rounded-lg font-semibold capitalize cursor-pointer transition-all ${
                    timeRange === range ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData[timeRange]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C0654B" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#C0654B" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAE6E2" />
                <XAxis dataKey="name" stroke="#8c8276" fontSize={10} tickLine={false} />
                <YAxis stroke="#8c8276" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ background: '#2B2620', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  labelStyle={{ fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="Sales" stroke="#C0654B" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Best Sellers */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm space-y-4 text-left flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold font-serif text-stone-900">Top Performing Styles</h2>
            <p className="text-xs text-stone-400">Best selling apparel variants this month</p>
          </div>

          <div className="space-y-4 flex-1 mt-4">
            {bestSellers.length === 0 ? (
              <div className="text-center py-8 text-stone-400 text-xs">
                No orders placed yet. Products sold will appear here.
              </div>
            ) : (
              bestSellers.map((item, idx) => (
                <div key={item.product.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg font-mono text-xs font-bold bg-stone-100 flex items-center justify-center text-stone-600 border border-stone-200">
                    {idx + 1}
                  </div>
                  <img 
                    src={item.product.colors[0]?.images[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=120&q=80'} 
                    alt={item.product.name} 
                    className="w-10 h-10 rounded-lg object-cover border border-stone-100"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-stone-800 truncate">{item.product.name}</h4>
                    <p className="text-[10px] text-stone-400 truncate">{item.product.fabric} • ₹{item.product.discountPrice || item.product.basePrice}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold font-mono text-[#C0654B]">{item.count} Sold</span>
                    <p className="text-[10px] text-stone-400 font-mono">₹{item.rev.toLocaleString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="pt-4 border-t border-stone-100 flex justify-between items-center text-xs">
            <span className="text-stone-500">Live inventory synced</span>
            <span className="text-[#C0654B] font-bold cursor-pointer hover:underline flex items-center gap-0.5">
              Full Inventory <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>

      {/* RECENT ORDERS TABLE & FEEDS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders Table */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm lg:col-span-2 space-y-4 text-left">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold font-serif text-stone-900">Recent Customer Orders</h2>
              <p className="text-xs text-stone-400">Instantly update checkout status from this list</p>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 bg-stone-100 text-stone-600 rounded-lg font-mono">
              Total: {orders.length}
            </span>
          </div>

          <div className="overflow-x-auto border border-stone-200/60 rounded-xl touch-scroll">
            <table className="w-full text-xs text-left min-w-[600px]">
              <thead className="bg-stone-50 text-stone-500 font-bold border-b border-stone-200">
                <tr>
                  <th className="p-3">Order ID</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Payment</th>
                  <th className="p-3">Total Amount</th>
                  <th className="p-3">Order Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center p-8 text-stone-400">
                      No order data available yet. Complete a checkout!
                    </td>
                  </tr>
                ) : (
                  orders.slice(0, 10).map(order => (
                    <tr key={order.id} className="hover:bg-stone-50/50">
                      <td className="p-3 font-mono font-bold text-stone-900">#{order.orderNumber}</td>
                      <td className="p-3">
                        <div className="font-bold text-stone-800">{order.customerName}</div>
                        <div className="text-[10px] text-stone-400">{order.customerPhone}</div>
                      </td>
                      <td className="p-3 text-stone-500 text-[11px]">
                        {new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
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
                          onChange={(e) => updateOrderStatus(order.id, e.target.value as any)}
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
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Dynamic Activity Feed */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm space-y-4 text-left">
          <h2 className="text-base font-bold font-serif text-stone-900">Recent Customer Activity</h2>
          
          <div className="space-y-4">
            <div className="flex gap-3 text-xs leading-relaxed">
              <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg shrink-0 h-fit">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <p className="text-stone-800 font-medium">New Account Registered</p>
                <p className="text-stone-500">Amit Mukherjee (amit.m@gmail.com) from Kolkata</p>
                <span className="text-[10px] text-stone-400 font-mono font-semibold">12 mins ago</span>
              </div>
            </div>

            <div className="flex gap-3 text-xs leading-relaxed border-t border-stone-100 pt-3">
              <div className="p-1.5 bg-yellow-50 text-yellow-600 rounded-lg shrink-0 h-fit">
                <Star className="w-4 h-4" />
              </div>
              <div>
                <p className="text-stone-800 font-medium">New Product Review</p>
                <p className="text-stone-500">Rohan Das gave 5 stars to "Cotton Saree"</p>
                <span className="text-[10px] text-stone-400 font-mono font-semibold">45 mins ago</span>
              </div>
            </div>

            <div className="flex gap-3 text-xs leading-relaxed border-t border-stone-100 pt-3">
              <div className="p-1.5 bg-pink-50 text-pink-600 rounded-lg shrink-0 h-fit">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <p className="text-stone-800 font-medium">Support Ticket Raised</p>
                <p className="text-stone-500">Query regarding sizing of Anarkali suit (Ticket #912)</p>
                <span className="text-[10px] text-stone-400 font-mono font-semibold">2 hours ago</span>
              </div>
            </div>

            <div className="flex gap-3 text-xs leading-relaxed border-t border-stone-100 pt-3">
              <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg shrink-0 h-fit">
                <ShoppingCart className="w-4 h-4" />
              </div>
              <div>
                <p className="text-stone-800 font-medium">Abandoned Cart Alert</p>
                <p className="text-stone-500">User placed 3 items worth ₹4,290 in cart without checking out</p>
                <span className="text-[10px] text-stone-400 font-mono font-semibold">4 hours ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QUICK LOW-STOCK RESTOCK PANEL */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm text-left space-y-4">
        <div>
          <h2 className="text-base font-bold font-serif text-stone-900">Low Stock & Out-of-Stock Alert Center</h2>
          <p className="text-xs text-stone-400">Instantly refill stock levels for the catalog without entering product forms</p>
        </div>

        {lowStockVariants.length === 0 ? (
          <div className="p-6 bg-emerald-50 text-emerald-800 border border-emerald-200/60 rounded-xl text-xs font-semibold text-center">
            🎉 Excellent! All product variants have high stock levels (above 10 units).
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lowStockVariants.slice(0, 9).map(({ product, variant }) => (
              <div key={variant.id} className="flex items-center justify-between border border-stone-200 p-3 rounded-xl bg-stone-50/50 hover:bg-white transition-all">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img 
                    src={variant.images[0] || product.colors[0]?.images[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=120&q=80'} 
                    alt={product.name} 
                    className="w-10 h-10 object-cover rounded-lg border border-stone-200"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0 text-xs">
                    <h4 className="font-bold text-stone-800 truncate leading-snug">{product.name}</h4>
                    <p className="text-[10px] text-stone-400 font-mono truncate">
                      Size: <span className="font-bold text-stone-700">{variant.size}</span> | Col: <span className="font-bold text-stone-700">{variant.color}</span>
                    </p>
                    <span className={`inline-block font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-md mt-1 ${
                      variant.stock === 0 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {variant.stock} Left
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <input
                    type="number"
                    min={1}
                    value={restockStock[variant.id] || ''}
                    placeholder="+ Qty"
                    onChange={(e) => setRestockStock(prev => ({ ...prev, [variant.id]: Number(e.target.value) }))}
                    className="w-16 px-2 py-1.5 border border-stone-300 rounded-lg text-xs font-semibold font-mono text-center outline-none focus:border-[#C0654B] bg-white"
                  />
                  <button
                    onClick={() => handleQuickRestock(product, variant)}
                    disabled={!restockStock[variant.id]}
                    className="p-1.5 bg-[#C0654B] hover:bg-[#8B4A38] disabled:bg-stone-200 disabled:cursor-not-allowed text-white rounded-lg cursor-pointer shadow-sm transition-colors"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
