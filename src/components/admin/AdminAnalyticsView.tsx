import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import { 
  TrendingUp, ShoppingCart, DollarSign, Percent, AlertCircle, Award, 
  ArrowDownRight, ArrowUpRight, Filter, Download 
} from 'lucide-react';

export const AdminAnalyticsView: React.FC = () => {
  const { products, orders, showToast } = useStore();
  const [timePeriod, setTimePeriod] = useState<'7days' | '30days' | 'thisYear'>('7days');

  // Interactive revenue calculations
  const totalRevenue = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.total, 0);

  const totalOrders = orders.filter(o => o.status !== 'cancelled').length;
  const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  // Chart 1: Revenue trend data simulation
  const revenueData7Days = [
    { name: 'Mon', Revenue: 14200, Orders: 8, Margin: 45 },
    { name: 'Tue', Revenue: 18900, Orders: 11, Margin: 48 },
    { name: 'Wed', Revenue: 21000, Orders: 14, Margin: 46 },
    { name: 'Thu', Revenue: 16500, Orders: 9, Margin: 44 },
    { name: 'Fri', Revenue: 34000, Orders: 22, Margin: 51 },
    { name: 'Sat', Revenue: 45000, Orders: 29, Margin: 53 },
    { name: 'Sun', Revenue: 39000, Orders: 24, Margin: 50 },
  ];

  const revenueData30Days = [
    { name: 'Week 1', Revenue: 95000, Orders: 62, Margin: 46 },
    { name: 'Week 2', Revenue: 124000, Orders: 84, Margin: 49 },
    { name: 'Week 3', Revenue: 154000, Orders: 104, Margin: 51 },
    { name: 'Week 4', Revenue: 189000, Orders: 122, Margin: 53 },
  ];

  const activeRevenueData = timePeriod === '7days' ? revenueData7Days : revenueData30Days;

  // Chart 2: Category Breakdown Sales Split
  const categorySplitData = [
    { name: 'Women Ethnic', value: 48000, color: '#C0654B' },
    { name: 'Men Traditional', value: 29000, color: '#E6D5B8' },
    { name: 'Kids Celebration', value: 18000, color: '#005F54' },
    { name: 'Premium Undergarments', value: 12000, color: '#1C1C1C' }
  ];

  // Best sellers calculations / simulation
  const bestSellers = [
    { name: 'Kanjeevaram Silk Brocade Saree', category: 'Women Ethnic', sales: 48, stock: 12, revenue: 191952 },
    { name: 'Earthy Clay Cotton Kurta Set', category: 'Men Traditional', sales: 34, stock: 25, revenue: 50966 },
    { name: 'Pastel Handloom Silk Kurti', category: 'Women Ethnic', sales: 29, stock: 40, revenue: 43471 },
    { name: 'Traditional Sherwani Set for Boys', category: 'Kids Celebration', sales: 18, stock: 9, revenue: 35982 }
  ];

  // Dead Stock Tracker: low sales velocity items (items that have high stock but almost zero sales)
  const deadStockItems = products
    .filter(p => {
      const totalStock = p.variants?.reduce((acc, v) => acc + v.stock, 0) || 0;
      return totalStock > 30; // High stock items
    })
    .slice(0, 4)
    .map(p => ({
      name: p.name,
      stock: p.variants?.reduce((acc, v) => acc + v.stock, 0) || 0,
      daysInInventory: 120, // simulated
      price: p.basePrice
    }));

  return (
    <div className="space-y-6 text-stone-800 animate-fade-in text-left">
      
      {/* TIME BAR OVERRIDE */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold font-serif text-stone-900">Apparel Intelligence Dashboard</h2>
          <p className="text-xs text-stone-400">Review real-time revenue margins, category velocities, and inventory age indexes</p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={timePeriod}
            onChange={(e) => setTimePeriod(e.target.value as any)}
            className="p-2 border border-stone-200 rounded-xl bg-white text-xs font-bold text-stone-700 cursor-pointer"
          >
            <option value="7days">Past 7 Days</option>
            <option value="30days">Past 30 Days</option>
          </select>

          <button
            onClick={() => showToast('Generated full PDF audit ledger.')}
            className="px-4 py-2 bg-stone-900 hover:bg-black text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Download className="w-4 h-4" /> Export Report
          </button>
        </div>
      </div>

      {/* CORE STATS BLOCKS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Sales */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Gross Sales Revenue</span>
            <span className="text-xl font-bold font-mono text-stone-900">₹{totalRevenue.toLocaleString()}</span>
            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 mt-0.5">
              <ArrowUpRight className="w-3 h-3" /> +12.4% vs last week
            </span>
          </div>
          <div className="p-3 bg-emerald-50 rounded-2xl">
            <DollarSign className="w-5 h-5 text-emerald-600" />
          </div>
        </div>

        {/* Orders Placed */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Fulfillment Volume</span>
            <span className="text-xl font-bold font-mono text-stone-900">{totalOrders} Orders</span>
            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 mt-0.5">
              <ArrowUpRight className="w-3 h-3" /> +8.2% vs yesterday
            </span>
          </div>
          <div className="p-3 bg-indigo-50 rounded-2xl">
            <ShoppingCart className="w-5 h-5 text-indigo-600" />
          </div>
        </div>

        {/* Average Order Value */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Avg Ticket Checkout</span>
            <span className="text-xl font-bold font-mono text-stone-900">₹{averageOrderValue.toLocaleString()}</span>
            <span className="text-[10px] text-stone-400 font-bold flex items-center gap-0.5 mt-0.5">
              Stable ticket baseline
            </span>
          </div>
          <div className="p-3 bg-amber-50 rounded-2xl">
            <TrendingUp className="w-5 h-5 text-amber-600" />
          </div>
        </div>

        {/* Gross profit margin */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Gross Profit Margin</span>
            <span className="text-xl font-bold font-mono text-stone-900">49.4%</span>
            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 mt-0.5">
              <ArrowUpRight className="w-3 h-3" /> +1.2% optimal sizing markup
            </span>
          </div>
          <div className="p-3 bg-rose-50 rounded-2xl">
            <Percent className="w-5 h-5 text-rose-600" />
          </div>
        </div>
      </div>

      {/* REVENUE CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart 1: Revenue & Order trends */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-sm lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-2">
            <div>
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Store Progression Line</span>
              <h3 className="text-xs font-bold font-serif text-stone-900">Weekly Sales Velocity vs Margins</h3>
            </div>
            <span className="text-[10px] font-mono text-stone-400">Live feed updated 2 mins ago</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activeRevenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C0654B" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#C0654B" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EBEBEB" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#8C8C8C' }} stroke="#D3D3D3" />
                <YAxis tick={{ fontSize: 10, fill: '#8C8C8C' }} stroke="#D3D3D3" />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 12 }} />
                <Area type="monotone" dataKey="Revenue" stroke="#C0654B" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" name="Gross Revenue (₹)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Category sales breakdown pie */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="border-b border-stone-100 pb-2">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Niche splits</span>
            <h3 className="text-xs font-bold font-serif text-stone-900">Revenue Contribution by Category</h3>
          </div>

          <div className="h-44 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categorySplitData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={65}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categorySplitData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 text-[10.5px] font-semibold text-stone-700">
            {categorySplitData.map(entry => (
              <div key={entry.name} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span>{entry.name}</span>
                </div>
                <span className="font-mono text-stone-900 font-bold">₹{entry.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* BEST SELLERS & DEAD STOCK SPLIT ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Best sellers list */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-sm space-y-4 text-left">
          <div className="flex items-center justify-between border-b border-stone-100 pb-2">
            <div className="flex items-center gap-1.5">
              <Award className="w-4.5 h-4.5 text-[#C0654B]" />
              <h3 className="text-xs font-bold font-serif text-stone-900">Top Performing Store Styles</h3>
            </div>
            <span className="text-[9px] bg-[#C0654B]/5 text-[#C0654B] px-2 py-0.5 rounded-full font-bold">By Volumes</span>
          </div>

          <div className="divide-y divide-stone-100 text-xs font-semibold text-stone-700">
            {bestSellers.map((item, idx) => (
              <div key={item.name} className="py-2.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-5 h-5 bg-stone-100 rounded-full flex items-center justify-center font-bold text-stone-500 font-mono text-[10px]">{idx + 1}</span>
                  <div className="min-w-0">
                    <h4 className="text-stone-900 truncate font-bold">{item.name}</h4>
                    <span className="text-[10px] text-stone-400 font-medium">{item.category}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-mono text-stone-800 font-bold">{item.sales} sold</span>
                  <p className="text-[10px] text-stone-400 font-mono">₹{item.revenue.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dead stock analyzer */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-sm space-y-4 text-left">
          <div className="flex items-center justify-between border-b border-stone-100 pb-2">
            <div className="flex items-center gap-1.5">
              <AlertCircle className="w-4.5 h-4.5 text-amber-500" />
              <h3 className="text-xs font-bold font-serif text-stone-900">Dead Stock Clearance Warning</h3>
            </div>
            <span className="text-[9px] bg-red-100 text-red-700 px-2.5 py-0.5 rounded-full font-bold uppercase">No movement</span>
          </div>

          <div className="divide-y divide-stone-100 text-xs font-semibold text-stone-700">
            {deadStockItems.map(item => (
              <div key={item.name} className="py-2.5 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <h4 className="text-stone-900 font-bold truncate">{item.name}</h4>
                  <span className="text-[10px] text-[#C0654B] font-semibold">Age: {item.daysInInventory} days in racks</span>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-mono text-stone-800 font-bold">{item.stock} left</span>
                  <p className="text-[10px] text-stone-400 font-mono">₹{item.price} base</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200/40 rounded-xl flex items-start gap-2 text-[10.5px] leading-relaxed text-stone-600">
            <span>💡 **Action Tip:** Bundle these dead stock styles into an automated **Exit-Intent Rescue Popup** or apply a bulk 25% discount to flush inventory!</span>
          </div>
        </div>

      </div>

    </div>
  );
};
