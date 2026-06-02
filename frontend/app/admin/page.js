'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  productService, 
  rentalService, 
  maintenanceService, 
  authService 
} from '../../services/api';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  Legend
} from 'recharts';
import { 
  LayoutDashboard, 
  Package, 
  Receipt, 
  Wrench, 
  Users, 
  Plus, 
  Trash2, 
  DollarSign, 
  TrendingUp, 
  Wrench as WrenchIcon,
  PlusCircle,
  ShieldAlert,
  Loader2,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();

  // Tab State
  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics' | 'inventory' | 'rentals' | 'maintenance'
  
  // App Core Data
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [tickets, setTickets] = useState([]);
  
  // Interaction & UI utilities
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // New Product Form Fields
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('furniture');
  const [newDesc, setNewDesc] = useState('');
  const [newRent, setNewRent] = useState('');
  const [newDeposit, setNewDeposit] = useState('');
  const [newStock, setNewStock] = useState('5');
  const [newCity, setNewCity] = useState('New York');
  const [newImage, setNewImage] = useState('');

  async function loadAdminData() {
    setLoading(true);
    try {
      const prodData = await productService.getAll();
      setProducts(prodData);

      const rentData = await rentalService.getAll();
      setRentals(rentData);

      const ticketData = await maintenanceService.getAllTickets();
      setTickets(ticketData);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setIsClient(true);
    const currentUser = authService.getCurrentUser();
    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'vendor')) {
      // Force non-admins out
      router.push('/');
    } else {
      setUser(currentUser);
      loadAdminData();
    }
  }, []);

  if (!isClient || !user) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-10 h-10 text-teal-600 animate-spin" />
      </div>
    );
  }

  // Create Product handler
  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!newTitle || !newRent || !newDeposit || !newCity) {
      alert('Please fill out all mandatory fields');
      return;
    }

    setActionLoading(true);
    try {
      const payload = {
        title: newTitle,
        category: newCategory,
        description: newDesc,
        monthlyRent: Number(newRent),
        securityDeposit: Number(newDeposit),
        stock: Number(newStock),
        city: newCity,
        images: newImage ? [newImage] : ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80']
      };

      await productService.create(payload);
      alert('Product created successfully inside lease catalog!');
      
      // Reset form
      setNewTitle('');
      setNewDesc('');
      setNewRent('');
      setNewDeposit('');
      setNewStock('5');
      setNewImage('');

      loadAdminData();
    } catch (err) {
      console.error('Create product failed:', err);
      alert(err.response?.data?.message || 'Error creating product');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Product handler
  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to remove this product from the lease catalog?')) {
      return;
    }
    setActionLoading(true);
    try {
      await productService.delete(id);
      alert('Product deleted successfully');
      loadAdminData();
    } catch (err) {
      console.error('Delete failed:', err);
      alert(err.response?.data?.message || 'Error deleting product');
    } finally {
      setActionLoading(false);
    }
  };

  // Resolve Ticket handler
  const handleUpdateTicketStatus = async (ticketId, nextStatus) => {
    setActionLoading(true);
    try {
      await maintenanceService.updateStatus(ticketId, nextStatus);
      alert(`Ticket updated successfully to: ${nextStatus.toUpperCase()}`);
      loadAdminData();
    } catch (err) {
      console.error('Ticket status update failed:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // Compute Aggregated Statistics
  const activeRentalsCount = rentals.filter((r) => r.status === 'active' || r.status === 'pending').length;
  const cumulativeRevenue = rentals.reduce((sum, r) => sum + r.totalAmount, 0);
  const pendingTicketsCount = tickets.filter((t) => t.status !== 'resolved').length;
  const utilizationPercentage = products.length > 0 
    ? Math.round((activeRentalsCount / products.reduce((sum, p) => sum + p.stock + (p.stock === 0 ? 0 : 1), 0)) * 100) 
    : 0;

  // Chart Data: Monthly Revenue simulation
  const revenueChartData = [
    { month: 'Jan', Revenue: Math.round(cumulativeRevenue * 0.15) || 500 },
    { month: 'Feb', Revenue: Math.round(cumulativeRevenue * 0.3) || 1200 },
    { month: 'Mar', Revenue: Math.round(cumulativeRevenue * 0.5) || 1800 },
    { month: 'Apr', Revenue: Math.round(cumulativeRevenue * 0.75) || 2700 },
    { month: 'May', Revenue: cumulativeRevenue || 3800 }
  ];

  // Chart Data: Category Utilizations
  const categoryChartData = [
    { name: 'Furniture', value: products.filter(p => p.category === 'furniture').length },
    { name: 'Appliances', value: products.filter(p => p.category === 'appliances').length }
  ];
  
  const COLORS = ['#0d9488', '#f59e0b'];

  return (
    <div className="flex flex-col gap-10">
      {/* Intro Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="relative z-10">
          <span className="px-3 py-1 rounded-full text-[10px] bg-teal-500/20 border border-teal-500/30 text-teal-300 font-extrabold uppercase tracking-wider flex items-center gap-1.5 self-start w-fit">
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
            RentEase Operational Console
          </span>
          <h1 className="font-outfit font-extrabold text-2xl md:text-3xl mt-2 leading-tight">Welcome, {user.name}</h1>
          <p className="text-slate-400 text-xs mt-1">
            Role: {user.role.toUpperCase()} &bull; Suite: {user.email}
          </p>
        </div>

        {/* Tab Controls buttons */}
        <div className="flex flex-wrap gap-2.5 relative z-10">
          {[
            { id: 'analytics', label: 'Analytics Hub', icon: LayoutDashboard },
            { id: 'inventory', label: 'Inventory', icon: Package },
            { id: 'rentals', label: 'Rentals Log', icon: Receipt },
            { id: 'maintenance', label: 'Repair Tickets', icon: Wrench }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border ${
                activeTab === tab.id
                  ? 'bg-teal-600 border-teal-600 text-white shadow-md shadow-teal-600/25'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
        </div>
      ) : (
        <div className="flex flex-col gap-10">
          {/* TAB 1: ANALYTICS HUB */}
          {activeTab === 'analytics' && (
            <div className="flex flex-col gap-10">
              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { title: 'Cumulative Revenue', value: `$${cumulativeRevenue}`, desc: 'Paid + Deposit subtotal', icon: DollarSign, color: 'text-teal-600 bg-teal-50 dark:bg-teal-950/40 dark:text-teal-400' },
                  { title: 'Active Leases', value: activeRentalsCount, desc: 'Current active products', icon: Receipt, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400' },
                  { title: 'Utilization %', value: `${utilizationPercentage}%`, desc: 'Active stock occupancy', icon: TrendingUp, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400' },
                  { title: 'Pending Upkeep', value: pendingTicketsCount, desc: 'Unresolved claims', icon: WrenchIcon, color: 'text-red-600 bg-red-50 dark:bg-red-950/40 dark:text-red-400' }
                ].map((stat, idx) => (
                  <div key={idx} className="bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 p-6 rounded-[2rem] shadow-sm flex items-center justify-between gap-4">
                    <div className="flex flex-col gap-1">
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{stat.title}</p>
                      <h3 className="font-outfit font-extrabold text-2xl text-slate-900 dark:text-white mt-1">{stat.value}</h3>
                      <p className="text-[10px] text-slate-500 mt-1">{stat.desc}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${stat.color}`}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Charts Panel */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Revenue line chart */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 p-8 rounded-[2.5rem] shadow-sm flex flex-col gap-6">
                  <h3 className="font-outfit font-bold text-base text-slate-900 dark:text-white flex items-center gap-1.5">
                    <DollarSign className="w-5 h-5 text-teal-600" />
                    Monthly Rental Inflows ($)
                  </h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={revenueChartData}>
                        <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                        <Tooltip contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '8px', color: '#f8fafc', fontSize: 11 }} />
                        <Bar dataKey="Revenue" fill="#0d9488" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Categories pie chart */}
                <div className="bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 p-8 rounded-[2.5rem] shadow-sm flex flex-col gap-6">
                  <h3 className="font-outfit font-bold text-base text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Layers className="w-5 h-5 text-teal-600" />
                    Catalog Distribution
                  </h3>
                  <div className="h-64 w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {categoryChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INVENTORY & CATALOG MANAGER */}
          {activeTab === 'inventory' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              {/* Product Insertion Form */}
              <form 
                onSubmit={handleCreateProduct}
                className="lg:col-span-5 bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 p-8 rounded-[2.5rem] shadow-sm flex flex-col gap-5"
              >
                <h3 className="font-outfit font-bold text-base text-slate-900 dark:text-white flex items-center gap-1.5 mb-2">
                  <PlusCircle className="w-5 h-5 text-teal-600" />
                  Add New Product
                </h3>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Product Title *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Ergonomic Velvet Armchair"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs font-semibold w-full focus:outline-none focus:border-teal-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Category</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 dark:text-slate-300 w-full focus:outline-none"
                    >
                      <option value="furniture">Furniture</option>
                      <option value="appliances">Appliances</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">City location</label>
                    <select
                      value={newCity}
                      onChange={(e) => setNewCity(e.target.value)}
                      className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 dark:text-slate-300 w-full focus:outline-none"
                    >
                      <option value="New York">New York</option>
                      <option value="San Francisco">San Francisco</option>
                      <option value="Los Angeles">Los Angeles</option>
                      <option value="Chicago">Chicago</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Rent ($/mo) *</label>
                    <input 
                      type="number" 
                      placeholder="35"
                      value={newRent}
                      onChange={(e) => setNewRent(e.target.value)}
                      className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs font-semibold w-full focus:outline-none focus:border-teal-500"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Deposit ($) *</label>
                    <input 
                      type="number" 
                      placeholder="100"
                      value={newDeposit}
                      onChange={(e) => setNewDeposit(e.target.value)}
                      className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs font-semibold w-full focus:outline-none focus:border-teal-500"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Stock qty</label>
                    <input 
                      type="number" 
                      placeholder="5"
                      value={newStock}
                      onChange={(e) => setNewStock(e.target.value)}
                      className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs font-semibold w-full focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Product Image URL</label>
                  <input 
                    type="text" 
                    placeholder="https://unsplash.com/photo-abc..."
                    value={newImage}
                    onChange={(e) => setNewImage(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs font-semibold w-full focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Description</label>
                  <textarea 
                    placeholder="Describe size, materials, dynamic configurations..."
                    rows="3"
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs font-semibold w-full focus:outline-none focus:border-teal-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={actionLoading}
                  className="w-full py-3.5 bg-teal-600 hover:bg-teal-500 text-white rounded-2xl font-bold flex items-center justify-center gap-1.5 shadow-md shadow-teal-600/20 text-xs mt-2 disabled:bg-slate-400"
                >
                  Create Catalog Entry
                </button>
              </form>

              {/* Product Listing CRUD Manager */}
              <div className="lg:col-span-7 bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 p-8 rounded-[2.5rem] shadow-sm flex flex-col gap-6">
                <h3 className="font-outfit font-bold text-base text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Package className="w-5 h-5 text-teal-600" />
                  Product Catalog ({products.length})
                </h3>

                <div className="flex flex-col gap-4 max-h-[500px] overflow-y-auto pr-2">
                  {products.map((prod) => (
                    <div 
                      key={prod._id}
                      className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200/40 dark:border-slate-700/30 rounded-2xl flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-9 aspect-[4/3] rounded-lg overflow-hidden bg-slate-200 shrink-0">
                          <img src={prod.images && prod.images[0]} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <h4 className="font-outfit font-bold text-xs text-slate-800 dark:text-slate-200 line-clamp-1">
                            {prod.title}
                          </h4>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {prod.category.toUpperCase()} &bull; {prod.city} &bull; Stock: {prod.stock} &bull; Rent: ${prod.monthlyRent}/mo
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteProduct(prod._id)}
                        disabled={actionLoading}
                        className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CUSTOMER RENTALS TRANSACTION LOG */}
          {activeTab === 'rentals' && (
            <div className="bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 p-8 rounded-[2.5rem] shadow-sm flex flex-col gap-6">
              <h3 className="font-outfit font-bold text-base text-slate-900 dark:text-white flex items-center gap-1.5 mb-2">
                <Receipt className="w-5 h-5 text-teal-600" />
                Customer Leases Transaction Database ({rentals.length})
              </h3>

              {rentals.length === 0 ? (
                <p className="text-xs text-slate-500 italic p-4 text-center">No leases registered on the platform yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-semibold">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-700 text-slate-400 uppercase tracking-wider">
                        <th className="py-3 px-4">Lease ID</th>
                        <th className="py-3 px-4">Customer</th>
                        <th className="py-3 px-4">Product details</th>
                        <th className="py-3 px-4">Tenure</th>
                        <th className="py-3 px-4">Invoiced Total</th>
                        <th className="py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                      {rentals.map((r) => (
                        <tr key={r._id} className="text-slate-700 dark:text-slate-300">
                          <td className="py-4 px-4 font-mono font-bold">#RE-{r._id.slice(0,5).toUpperCase()}</td>
                          <td className="py-4 px-4">
                            <p className="font-bold text-slate-800 dark:text-white">{r.userName || 'John Doe'}</p>
                            <p className="text-[10px] text-slate-400 font-normal truncate max-w-[120px]">{r.deliveryAddress}</p>
                          </td>
                          <td className="py-4 px-4 font-bold text-slate-900 dark:text-white">{r.product.title}</td>
                          <td className="py-4 px-4">{r.tenure} Months</td>
                          <td className="py-4 px-4 font-extrabold text-teal-600 dark:text-teal-400">${r.totalAmount}</td>
                          <td className="py-4 px-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                              r.status === 'completed' 
                                ? 'bg-slate-200 text-slate-500' 
                                : 'bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400'
                            }`}>
                              {r.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: PLATFORM MAINTENANCE TICKET MANAGEMENT */}
          {activeTab === 'maintenance' && (
            <div className="bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 p-8 rounded-[2.5rem] shadow-sm flex flex-col gap-6">
              <h3 className="font-outfit font-bold text-base text-slate-900 dark:text-white flex items-center gap-1.5 mb-2">
                <Wrench className="w-5 h-5 text-teal-600" />
                Customer Repair Dispatch Desk ({tickets.length})
              </h3>

              {tickets.length === 0 ? (
                <p className="text-xs text-slate-500 italic p-4 text-center">No maintenance claims currently submitted.</p>
              ) : (
                <div className="flex flex-col gap-6">
                  {tickets.map((t) => (
                    <div 
                      key={t._id}
                      className="p-6 bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-700/30 rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-12 rounded-xl overflow-hidden bg-slate-200 shrink-0">
                          <img src={t.productImage} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase ${
                            t.priority === 'high' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                          }`}>
                            {t.priority} priority
                          </span>
                          <h4 className="font-outfit font-bold text-sm text-slate-800 dark:text-white mt-1">
                            {t.productTitle}
                          </h4>
                          <p className="text-xs text-slate-500 mt-1">
                            <span className="font-bold text-slate-700 dark:text-slate-300">Issue:</span> {t.issue}
                          </p>
                        </div>
                      </div>

                      {/* Ticket Transition actions */}
                      <div className="flex items-center gap-3 shrink-0">
                        {t.status === 'pending' && (
                          <button
                            onClick={() => handleUpdateTicketStatus(t._id, 'assigned')}
                            disabled={actionLoading}
                            className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl shadow-sm"
                          >
                            Assign Engineer
                          </button>
                        )}
                        {t.status === 'assigned' && (
                          <button
                            onClick={() => handleUpdateTicketStatus(t._id, 'resolved')}
                            disabled={actionLoading}
                            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-sm"
                          >
                            Mark Resolved
                          </button>
                        )}
                        {t.status === 'resolved' && (
                          <span className="px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 text-xs font-extrabold uppercase">
                            Resolved
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
