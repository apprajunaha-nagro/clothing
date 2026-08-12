import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  Users, Search, UserCheck, ShieldCheck, ShoppingBag, 
  DollarSign, Calendar, MapPin, Phone, Mail, Clock, 
  FileText, ExternalLink, Plus, Download, Edit3, CheckCircle2, 
  AlertTriangle, Filter, ChevronRight, Package, ArrowUpRight, Award
} from 'lucide-react';
import { Order, UserAccount, UserActivity } from '../../types';

export const AdminUserAccountsView: React.FC = () => {
  const { orders, user: currentUser, showToast, updateOrderStatus } = useStore();

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'vip' | 'flagged'>('all');
  const [spendFilter, setSpendFilter] = useState<'all' | 'high' | 'medium' | 'new'>('all');

  // Selected User for Detail View Modal
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);
  const [activeModalTab, setActiveModalTab] = useState<'overview' | 'orders' | 'activities' | 'notes'>('overview');

  // Local state for custom admin user notes & overrides
  const [userNotesMap, setUserNotesMap] = useState<{ [key: string]: string }>(() => {
    try {
      const saved = localStorage.getItem('pgmart_admin_user_notes');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [userStatusMap, setUserStatusMap] = useState<{ [key: string]: 'active' | 'vip' | 'flagged' | 'inactive' }>(() => {
    try {
      const saved = localStorage.getItem('pgmart_admin_user_statuses');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [editingNote, setEditingNote] = useState('');

  // Add User Modal State
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserCity, setNewUserCity] = useState('');

  // ---------------- AGGREGATE USER ACCOUNTS ----------------
  const userAccounts = useMemo<UserAccount[]>(() => {
    const userMap = new Map<string, {
      id: string;
      name: string;
      email: string;
      phone: string;
      addresses: any[];
      orders: Order[];
      totalSpent: number;
      lastOrderDate: string;
      firstOrderDate: string;
    }>();

    // Seed default current storefront user if present
    if (currentUser && currentUser.email) {
      userMap.set(currentUser.email.toLowerCase(), {
        id: currentUser.id || `u-${currentUser.email}`,
        name: currentUser.name || 'Storefront Customer',
        email: currentUser.email,
        phone: currentUser.phone || '+91 98765 43210',
        addresses: currentUser.addresses || [],
        orders: [],
        totalSpent: 0,
        lastOrderDate: currentUser.createdAt || new Date().toISOString(),
        firstOrderDate: currentUser.createdAt || new Date().toISOString(),
      });
    }

    // Process all orders to aggregate user accounts & activities
    orders.forEach(order => {
      const key = (order.customerEmail || order.customerPhone || order.id).toLowerCase();
      const existing = userMap.get(key);

      const orderTotal = order.total || 0;
      const orderDate = order.createdAt || new Date().toISOString();

      if (existing) {
        existing.orders.push(order);
        existing.totalSpent += orderTotal;
        if (new Date(orderDate) > new Date(existing.lastOrderDate)) {
          existing.lastOrderDate = orderDate;
        }
        if (new Date(orderDate) < new Date(existing.firstOrderDate)) {
          existing.firstOrderDate = orderDate;
        }
        if (order.shippingAddress && !existing.addresses.some(a => a.street === order.shippingAddress.street)) {
          existing.addresses.push(order.shippingAddress);
        }
      } else {
        userMap.set(key, {
          id: order.customerId && order.customerId !== 'guest' ? order.customerId : `user-${Math.abs(hashCode(key))}`,
          name: order.customerName || 'Customer',
          email: order.customerEmail || 'no-email@pgmart.in',
          phone: order.customerPhone || '+91 94711 55434',
          addresses: order.shippingAddress ? [order.shippingAddress] : [],
          orders: [order],
          totalSpent: orderTotal,
          lastOrderDate: orderDate,
          firstOrderDate: orderDate,
        });
      }
    });

    // Transform into UserAccount objects
    return Array.from(userMap.values()).map(item => {
      const ordersCount = item.orders.length;
      const totalSpent = Math.round(item.totalSpent);
      
      // Calculate Loyalty Tier
      let loyaltyTier: 'Silver' | 'Gold' | 'Platinum' | 'Diamond' = 'Silver';
      if (totalSpent >= 25000) loyaltyTier = 'Diamond';
      else if (totalSpent >= 10000) loyaltyTier = 'Platinum';
      else if (totalSpent >= 4000) loyaltyTier = 'Gold';

      // Default status
      const savedStatus = userStatusMap[item.id];
      const computedStatus: 'active' | 'vip' | 'flagged' | 'inactive' = savedStatus || (totalSpent >= 5000 ? 'vip' : 'active');

      // Generate activity history
      const activities: UserActivity[] = [];
      
      // Account created activity
      activities.push({
        id: `act-create-${item.id}`,
        timestamp: item.firstOrderDate,
        type: 'login',
        description: `Customer account registered on PGmart`
      });

      // Order activities
      item.orders.forEach(ord => {
        activities.push({
          id: `act-ord-${ord.id}`,
          timestamp: ord.createdAt,
          type: 'order',
          description: `Placed Order #${ord.orderNumber} for ₹${ord.total.toLocaleString('en-IN')}`,
          details: ord
        });

        if (ord.status === 'delivered') {
          activities.push({
            id: `act-deliv-${ord.id}`,
            timestamp: ord.updatedAt || ord.createdAt,
            type: 'order',
            description: `Order #${ord.orderNumber} delivered successfully`
          });
        }

        if (ord.returnStatus && ord.returnStatus !== 'none') {
          activities.push({
            id: `act-ret-${ord.id}`,
            timestamp: ord.updatedAt || ord.createdAt,
            type: 'return',
            description: `Requested ${ord.returnType === 'exchange' ? 'Exchange' : 'Return'} for Order #${ord.orderNumber}`
          });
        }
      });

      // Sort activities newest first
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      return {
        id: item.id,
        name: item.name,
        email: item.email,
        phone: item.phone,
        addresses: item.addresses,
        createdAt: item.firstOrderDate,
        ordersCount,
        totalSpent,
        lastOrderDate: item.lastOrderDate,
        status: computedStatus,
        notes: userNotesMap[item.id] || '',
        loyaltyPoints: Math.round(totalSpent * 0.05), // 5% cashback points
        loyaltyTier,
        activities
      };
    });
  }, [orders, currentUser, userNotesMap, userStatusMap]);

  // Helper hashing function for unique numeric IDs
  function hashCode(str: string) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }

  // ---------------- FILTERING USERS ----------------
  const filteredUsers = useMemo(() => {
    return userAccounts.filter(u => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = u.name.toLowerCase().includes(q) ||
                            u.email.toLowerCase().includes(q) ||
                            (u.phone && u.phone.includes(q)) ||
                            u.id.toLowerCase().includes(q);

      const matchesStatus = statusFilter === 'all' || u.status === statusFilter;

      let matchesSpend = true;
      if (spendFilter === 'high') matchesSpend = u.totalSpent >= 5000;
      else if (spendFilter === 'medium') matchesSpend = u.totalSpent >= 1000 && u.totalSpent < 5000;
      else if (spendFilter === 'new') matchesSpend = u.ordersCount === 0 || u.totalSpent < 1000;

      return matchesSearch && matchesStatus && matchesSpend;
    });
  }, [userAccounts, searchQuery, statusFilter, spendFilter]);

  // Summary Metrics
  const metrics = useMemo(() => {
    const totalCount = userAccounts.length;
    const activeBuyers = userAccounts.filter(u => u.ordersCount > 0).length;
    const vipCount = userAccounts.filter(u => u.status === 'vip' || u.totalSpent >= 5000).length;
    const totalLifetimeSpend = userAccounts.reduce((acc, u) => acc + u.totalSpent, 0);
    return { totalCount, activeBuyers, vipCount, totalLifetimeSpend };
  }, [userAccounts]);

  // Save User Note
  const handleSaveNote = (userId: string) => {
    const updatedNotes = { ...userNotesMap, [userId]: editingNote };
    setUserNotesMap(updatedNotes);
    localStorage.setItem('pgmart_admin_user_notes', JSON.stringify(updatedNotes));
    if (selectedUser) {
      setSelectedUser({ ...selectedUser, notes: editingNote });
    }
    showToast('Customer account note updated successfully');
  };

  // Change User Status
  const handleStatusChange = (userId: string, newStatus: 'active' | 'vip' | 'flagged' | 'inactive') => {
    const updatedStatuses = { ...userStatusMap, [userId]: newStatus };
    setUserStatusMap(updatedStatuses);
    localStorage.setItem('pgmart_admin_user_statuses', JSON.stringify(updatedStatuses));
    if (selectedUser) {
      setSelectedUser({ ...selectedUser, status: newStatus });
    }
    showToast(`User account status updated to "${newStatus.toUpperCase()}"`);
  };

  // Export Users to CSV
  const handleExportCSV = () => {
    const headers = ['User ID', 'Name', 'Email', 'Phone', 'Joined Date', 'Total Orders', 'Total Spent (INR)', 'Loyalty Tier', 'Status'];
    const rows = filteredUsers.map(u => [
      u.id,
      `"${u.name}"`,
      u.email,
      u.phone || '',
      new Date(u.createdAt).toLocaleDateString(),
      u.ordersCount,
      u.totalSpent,
      u.loyaltyTier || 'Silver',
      u.status
    ]);
    
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PGmart_User_Accounts_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Customer accounts database exported to CSV');
  };

  // Handle Manual User Creation
  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail) return;

    const newId = `u-${Date.now()}`;
    const newNote = `Manually added by Admin on ${new Date().toLocaleDateString()}`;
    
    setUserNotesMap(prev => ({ ...prev, [newId]: newNote }));

    showToast(`New user account created for ${newUserName}`);
    setIsAddUserOpen(false);
    setNewUserName('');
    setNewUserEmail('');
    setNewUserPhone('');
    setNewUserCity('');
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 text-left font-sans max-w-[1600px] mx-auto">
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-[#C0654B]/10 text-[#C0654B] rounded-xl font-bold">
              <Users className="w-6 h-6" />
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
              User Accounts & Customer History
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 font-medium">
            Manage customer accounts, track lifetime orders, view user activity logs, and edit internal notes
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-700 font-bold text-xs shadow-2xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-stone-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setIsAddUserOpen(true)}
            className="flex items-center gap-2 bg-[#C0654B] hover:bg-[#8B4A38] text-white font-bold px-4 py-2.5 rounded-xl shadow-sm transition-colors text-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add User Account</span>
          </button>
        </div>
      </div>

      {/* KPI METRICS OVERVIEW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Total Registered Users</span>
            <Users className="w-5 h-5 text-indigo-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-stone-900 mt-2">{metrics.totalCount}</p>
          <p className="text-[11px] text-stone-500 mt-1">PGmart customer directory</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Active Buyers</span>
            <UserCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-stone-900 mt-2">{metrics.activeBuyers}</p>
          <p className="text-[11px] text-emerald-700 font-medium mt-1">Placed 1 or more orders</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">VIP Members</span>
            <Award className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-stone-900 mt-2">{metrics.vipCount}</p>
          <p className="text-[11px] text-amber-700 font-medium mt-1">High-value buyers (&gt; ₹5,000)</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Lifetime Customer Spend</span>
            <DollarSign className="w-5 h-5 text-rose-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-stone-900 mt-2">
            ₹{metrics.totalLifetimeSpend.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-stone-500 mt-1">Cumulative order value</p>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by User Name, Email, Phone, or ID..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-300 focus:border-[#C0654B] focus:ring-2 focus:ring-[#C0654B]/20 text-xs outline-none transition-all font-sans"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          <div className="flex items-center gap-1.5 text-xs font-bold text-stone-600 shrink-0">
            <Filter className="w-3.5 h-3.5 text-stone-400" />
            <span>Filter By:</span>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            aria-label="Filter user accounts by status"
            className="px-3 py-2 rounded-xl border border-stone-300 text-xs font-semibold text-stone-800 bg-white focus:border-[#C0654B] outline-none cursor-pointer"
          >
            <option value="all">All Account Statuses</option>
            <option value="active">Active Customers</option>
            <option value="vip">VIP Members</option>
            <option value="flagged">Flagged Accounts</option>
          </select>

          <select
            value={spendFilter}
            onChange={(e) => setSpendFilter(e.target.value as any)}
            aria-label="Filter user accounts by spend"
            className="px-3 py-2 rounded-xl border border-stone-300 text-xs font-semibold text-stone-800 bg-white focus:border-[#C0654B] outline-none cursor-pointer"
          >
            <option value="all">All Spend Tiers</option>
            <option value="high">High Spend (&gt; ₹5,000)</option>
            <option value="medium">Medium Spend (₹1k - ₹5k)</option>
            <option value="new">New / Guest Users (&lt; ₹1k)</option>
          </select>
        </div>
      </div>

      {/* USER ACCOUNTS TABLE */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-[11px] font-extrabold uppercase tracking-wider text-stone-600">
                <th className="py-3.5 px-4">User Profile</th>
                <th className="py-3.5 px-4">Contact Info</th>
                <th className="py-3.5 px-4 text-center">Orders</th>
                <th className="py-3.5 px-4 text-right">Lifetime Spend</th>
                <th className="py-3.5 px-4">Loyalty Tier</th>
                <th className="py-3.5 px-4">Account Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-xs text-stone-800 font-medium">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-stone-400">
                    <Users className="w-10 h-10 mx-auto mb-2 text-stone-300" />
                    <p className="font-bold text-stone-700">No matching user accounts found</p>
                    <p className="text-xs text-stone-500">Try adjusting your search query or status filter</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((userAccount) => {
                  const initialLetter = userAccount.name.charAt(0).toUpperCase() || 'U';
                  const primaryAddr = userAccount.addresses && userAccount.addresses.length > 0 ? userAccount.addresses[0] : null;

                  return (
                    <tr 
                      key={userAccount.id}
                      className="hover:bg-stone-50/80 transition-colors cursor-pointer group"
                      onClick={() => {
                        setSelectedUser(userAccount);
                        setEditingNote(userAccount.notes || '');
                        setActiveModalTab('overview');
                      }}
                    >
                      {/* USER PROFILE */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#C0654B] text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                            {initialLetter}
                          </div>
                          <div>
                            <div className="font-extrabold text-stone-900 group-hover:text-[#C0654B] transition-colors flex items-center gap-1.5">
                              <span>{userAccount.name}</span>
                              {userAccount.status === 'vip' && (
                                <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.5 rounded font-extrabold border border-amber-300">
                                  VIP
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-stone-500 font-mono">ID: {userAccount.id}</div>
                          </div>
                        </div>
                      </td>

                      {/* CONTACT INFO */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-stone-700 font-medium">
                            <Mail className="w-3 h-3 text-stone-400" />
                            <span>{userAccount.email}</span>
                          </div>
                          {userAccount.phone && (
                            <div className="flex items-center gap-1.5 text-stone-500 text-[11px]">
                              <Phone className="w-3 h-3 text-stone-400" />
                              <span>{userAccount.phone}</span>
                            </div>
                          )}
                          {primaryAddr && (
                            <div className="flex items-center gap-1 text-[10px] text-stone-400">
                              <MapPin className="w-2.5 h-2.5" />
                              <span>{primaryAddr.city}, {primaryAddr.state}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* ORDERS COUNT */}
                      <td className="py-3.5 px-4 text-center font-extrabold text-stone-900">
                        <span className="bg-stone-100 text-stone-800 px-2.5 py-1 rounded-lg border border-stone-200">
                          {userAccount.ordersCount}
                        </span>
                      </td>

                      {/* LIFETIME SPEND */}
                      <td className="py-3.5 px-4 text-right font-extrabold text-stone-900">
                        ₹{userAccount.totalSpent.toLocaleString('en-IN')}
                      </td>

                      {/* LOYALTY TIER */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-1 rounded-full border ${
                          userAccount.loyaltyTier === 'Diamond' ? 'bg-indigo-100 text-indigo-900 border-indigo-300' :
                          userAccount.loyaltyTier === 'Platinum' ? 'bg-purple-100 text-purple-900 border-purple-300' :
                          userAccount.loyaltyTier === 'Gold' ? 'bg-amber-100 text-amber-900 border-amber-300' :
                          'bg-stone-100 text-stone-700 border-stone-300'
                        }`}>
                          <Award className="w-3 h-3" />
                          <span>{userAccount.loyaltyTier || 'Silver'}</span>
                        </span>
                      </td>

                      {/* ACCOUNT STATUS */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                          userAccount.status === 'vip' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                          userAccount.status === 'flagged' ? 'bg-red-100 text-red-800 border-red-300' :
                          'bg-emerald-100 text-emerald-800 border-emerald-300'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            userAccount.status === 'vip' ? 'bg-amber-600' :
                            userAccount.status === 'flagged' ? 'bg-red-600' : 'bg-emerald-600'
                          }`} />
                          <span>{userAccount.status.toUpperCase()}</span>
                        </span>
                      </td>

                      {/* ACTIONS */}
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => {
                            setSelectedUser(userAccount);
                            setEditingNote(userAccount.notes || '');
                            setActiveModalTab('overview');
                          }}
                          className="inline-flex items-center gap-1 text-xs font-bold text-[#C0654B] hover:text-[#8B4A38] bg-[#C0654B]/10 hover:bg-[#C0654B]/20 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                        >
                          <span>View Account & History</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* USER ACCOUNT DETAIL & HISTORY MODAL */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-stone-200 overflow-hidden text-left font-sans flex flex-col max-h-[90vh]">
            
            {/* MODAL HEADER */}
            <div className="bg-[#2B2620] text-white p-4 sm:p-5 flex items-center justify-between border-b border-stone-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#C0654B] text-white flex items-center justify-center font-extrabold text-lg shadow-md shrink-0">
                  {selectedUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg sm:text-xl font-extrabold text-white">{selectedUser.name}</h2>
                    <span className="bg-amber-400/20 text-amber-300 text-[10px] font-extrabold px-2 py-0.5 rounded border border-amber-400/30">
                      {selectedUser.loyaltyTier} Member
                    </span>
                  </div>
                  <p className="text-xs text-stone-300 font-mono mt-0.5">
                    User ID: {selectedUser.id} • Registered: {new Date(selectedUser.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedUser(null)}
                aria-label="Close user details modal"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* MODAL TABS */}
            <div className="bg-stone-100 border-b border-stone-200 px-4 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
              <button
                onClick={() => setActiveModalTab('overview')}
                className={`py-3 px-4 text-xs font-extrabold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                  activeModalTab === 'overview'
                    ? 'border-[#C0654B] text-[#C0654B] bg-white'
                    : 'border-transparent text-stone-600 hover:text-stone-900'
                }`}
              >
                Overview & Profile
              </button>

              <button
                onClick={() => setActiveModalTab('orders')}
                className={`py-3 px-4 text-xs font-extrabold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                  activeModalTab === 'orders'
                    ? 'border-[#C0654B] text-[#C0654B] bg-white'
                    : 'border-transparent text-stone-600 hover:text-stone-900'
                }`}
              >
                Past Orders ({selectedUser.ordersCount})
              </button>

              <button
                onClick={() => setActiveModalTab('activities')}
                className={`py-3 px-4 text-xs font-extrabold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                  activeModalTab === 'activities'
                    ? 'border-[#C0654B] text-[#C0654B] bg-white'
                    : 'border-transparent text-stone-600 hover:text-stone-900'
                }`}
              >
                Activity Timeline ({selectedUser.activities?.length || 0})
              </button>

              <button
                onClick={() => setActiveModalTab('notes')}
                className={`py-3 px-4 text-xs font-extrabold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                  activeModalTab === 'notes'
                    ? 'border-[#C0654B] text-[#C0654B] bg-white'
                    : 'border-transparent text-stone-600 hover:text-stone-900'
                }`}
              >
                Admin Notes & Status
              </button>
            </div>

            {/* MODAL BODY CONTENT */}
            <div className="p-5 overflow-y-auto space-y-6 text-stone-800 flex-1">
              
              {/* TAB 1: OVERVIEW & PROFILE */}
              {activeModalTab === 'overview' && (
                <div className="space-y-6">
                  {/* METRICS SUMMARY */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200">
                      <span className="text-[10px] font-bold uppercase text-stone-500">Total Orders</span>
                      <p className="text-xl font-extrabold text-stone-900 mt-1">{selectedUser.ordersCount}</p>
                    </div>

                    <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200">
                      <span className="text-[10px] font-bold uppercase text-stone-500">Total Lifetime Spend</span>
                      <p className="text-xl font-extrabold text-emerald-700 mt-1">₹{selectedUser.totalSpent.toLocaleString('en-IN')}</p>
                    </div>

                    <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200">
                      <span className="text-[10px] font-bold uppercase text-stone-500">Avg Order Value (AOV)</span>
                      <p className="text-xl font-extrabold text-stone-900 mt-1">
                        ₹{selectedUser.ordersCount > 0 ? Math.round(selectedUser.totalSpent / selectedUser.ordersCount).toLocaleString('en-IN') : 0}
                      </p>
                    </div>

                    <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200">
                      <span className="text-[10px] font-bold uppercase text-stone-500">Cashback Points</span>
                      <p className="text-xl font-extrabold text-amber-600 mt-1">{selectedUser.loyaltyPoints} pts</p>
                    </div>
                  </div>

                  {/* CONTACT & ADDRESS DETAILS */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-3">
                      <h3 className="font-extrabold text-stone-900 text-sm uppercase tracking-wider text-[11px]">Contact Information</h3>
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-stone-400" />
                          <span className="font-bold text-stone-800">{selectedUser.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-stone-400" />
                          <span className="font-bold text-stone-800">{selectedUser.phone || 'N/A'}</span>
                        </div>
                        {selectedUser.phone && (
                          <a
                            href={`https://wa.me/91${selectedUser.phone.replace(/\D/g, '')}?text=Hi%20${encodeURIComponent(selectedUser.name)}%2C%20greeting%20from%20PGmart!`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 bg-[#25D366] text-white text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-xs hover:bg-[#20ba5a] transition-colors mt-2"
                          >
                            <span>Chat on WhatsApp</span>
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-3">
                      <h3 className="font-extrabold text-stone-900 text-sm uppercase tracking-wider text-[11px]">Shipping Addresses ({selectedUser.addresses?.length || 0})</h3>
                      {selectedUser.addresses && selectedUser.addresses.length > 0 ? (
                        <div className="space-y-2 text-xs">
                          {selectedUser.addresses.slice(0, 2).map((addr, idx) => (
                            <div key={idx} className="p-2.5 bg-white rounded-lg border border-stone-200">
                              <p className="font-bold text-stone-900">{addr.fullName || selectedUser.name} • {addr.phone || selectedUser.phone}</p>
                              <p className="text-stone-600 text-[11px] mt-0.5">{addr.street}, {addr.city}, {addr.state} - {addr.pincode}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-stone-500">No saved addresses on file yet.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: PAST ORDERS HISTORY */}
              {activeModalTab === 'orders' && (
                <div className="space-y-4">
                  {selectedUser.activities?.filter(a => a.type === 'order' && a.details).length === 0 ? (
                    <div className="py-8 text-center text-stone-500 text-xs">
                      <Package className="w-8 h-8 mx-auto mb-2 text-stone-400" />
                      <p className="font-bold text-stone-700">No past orders found for this customer.</p>
                    </div>
                  ) : (
                    selectedUser.activities?.filter(a => a.type === 'order' && a.details).map((act) => {
                      const ord: Order = act.details;
                      return (
                        <div key={ord.id} className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-3 text-left">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div>
                              <span className="font-mono font-extrabold text-stone-900 text-sm">Order #{ord.orderNumber}</span>
                              <span className="text-xs text-stone-500 ml-2 font-medium">
                                {new Date(ord.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full uppercase border ${
                                ord.status === 'delivered' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                                ord.status === 'shipped' ? 'bg-sky-100 text-sky-800 border-sky-300' :
                                ord.status === 'confirmed' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                                'bg-amber-100 text-amber-800 border-amber-300'
                              }`}>
                                {ord.status}
                              </span>
                              <span className="font-extrabold text-stone-900 text-sm">₹{ord.total.toLocaleString('en-IN')}</span>
                            </div>
                          </div>

                          {/* ORDER ITEMS LIST */}
                          <div className="space-y-2 pt-2 border-t border-stone-200/80">
                            {ord.items.map((item, i) => (
                              <div key={i} className="flex items-center gap-3 bg-white p-2 rounded-lg border border-stone-200">
                                <img
                                  src={item.productImage || (item as any).image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=100&q=80'}
                                  alt={item.productName}
                                  className="w-10 h-10 object-cover rounded-md border border-stone-200 shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="font-bold text-stone-900 text-xs truncate">{item.productName}</p>
                                  <p className="text-[11px] text-stone-500">Size: {item.size || 'Free Size'} • Qty: {item.quantity} • ₹{item.price}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* TAB 3: ACTIVITY TIMELINE */}
              {activeModalTab === 'activities' && (
                <div className="space-y-4">
                  <h3 className="font-bold text-stone-900 text-xs uppercase tracking-wider">Customer Event Log</h3>
                  <div className="relative border-l-2 border-stone-200 ml-3 space-y-6">
                    {selectedUser.activities?.map((act) => (
                      <div key={act.id} className="relative pl-6">
                        <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-[#C0654B] border-2 border-white shadow-xs" />
                        <div>
                          <p className="font-bold text-stone-900 text-xs">{act.description}</p>
                          <p className="text-[10px] text-stone-400 mt-0.5">
                            {new Date(act.timestamp).toLocaleString('en-IN', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: ADMIN NOTES & STATUS */}
              {activeModalTab === 'notes' && (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider">
                      Account Status Level
                    </label>
                    <select
                      value={selectedUser.status}
                      onChange={(e) => handleStatusChange(selectedUser.id, e.target.value as any)}
                      className="w-full sm:w-64 px-3 py-2 rounded-xl border border-stone-300 font-bold text-xs bg-white outline-none focus:border-[#C0654B] cursor-pointer"
                    >
                      <option value="active">ACTIVE CUSTOMER</option>
                      <option value="vip">VIP MEMBER (Priority Support)</option>
                      <option value="flagged">FLAGGED / SUSPENDED ACCOUNT</option>
                      <option value="inactive">INACTIVE</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider">
                      Internal Admin Notes & Customer Logs
                    </label>
                    <textarea
                      rows={5}
                      value={editingNote}
                      onChange={(e) => setEditingNote(e.target.value)}
                      placeholder="Add custom notes about this customer (e.g. preferred sizing, special packaging requests, VIP treatment)..."
                      className="w-full p-3 rounded-xl border border-stone-300 focus:border-[#C0654B] focus:ring-2 focus:ring-[#C0654B]/20 outline-none text-xs text-stone-800 font-sans transition-all"
                    />
                    <button
                      onClick={() => handleSaveNote(selectedUser.id)}
                      className="bg-[#C0654B] hover:bg-[#8B4A38] text-white font-bold px-4 py-2 rounded-xl text-xs shadow-xs transition-colors cursor-pointer"
                    >
                      Save Admin Notes
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* MODAL FOOTER */}
            <div className="bg-stone-100 p-4 border-t border-stone-200 flex justify-end shrink-0">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-5 py-2 rounded-xl bg-stone-900 text-white font-bold text-xs hover:bg-stone-800 transition-colors cursor-pointer"
              >
                Close Account Modal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD NEW USER ACCOUNT MODAL */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-stone-200 p-6 space-y-4 text-left font-sans">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h2 className="font-extrabold text-stone-900 text-lg">Add New User Account</h2>
              <button onClick={() => setIsAddUserOpen(false)} className="text-stone-400 hover:text-stone-700">✕</button>
            </div>

            <form onSubmit={handleAddUserSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="e.g. Ananya Roy"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:border-[#C0654B] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="e.g. ananya.roy@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:border-[#C0654B] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">Phone Number</label>
                <input
                  type="text"
                  value={newUserPhone}
                  onChange={(e) => setNewUserPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:border-[#C0654B] outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 font-bold text-xs hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#C0654B] hover:bg-[#8B4A38] text-white font-bold text-xs shadow-xs"
                >
                  Create User Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
