import React, { useState, useEffect, useRef } from 'react';
import {
  Car,
  MapPin,
  RefreshCw,
  Search,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Phone,
  MessageSquare,
  ArrowLeft,
  Calendar,
  User
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import type { WashStatus } from '../types';

interface TrackWashPageProps {
  onNavigateHome: () => void;
  onNavigateBooking: () => void;
}

interface CustomerOrder {
  id: string;
  bookingRef: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  vehicleType: string;
  vehicleBrand: string;
  vehicleNumber: string;
  serviceType: string;
  price: number;
  date: string;
  inTime: string;
  outTime: string;
  timeSlot: string;
  pickupType: string;
  pickupAddress: string;
  status: WashStatus;
  paymentStatus: string;
  createdAt: string;
}

const STAGES: { key: WashStatus; label: string; description: string; icon: string }[] = [
  {
    key: 'CONFIRMED',
    label: '1. Order Confirmed',
    description: 'Booking slot reserved in Karpur Studio bay queue',
    icon: '📋'
  },
  {
    key: 'VALET_DISPATCHED',
    label: '2. Valet Dispatched',
    description: 'Staff driver is en route to your doorstep location',
    icon: '🛵'
  },
  {
    key: 'VEHICLE_PICKED_UP',
    label: '3. Vehicle Picked Up',
    description: 'Vehicle safely picked up & in transit to wash studio',
    icon: '🔑'
  },
  {
    key: 'WASH_IN_PROGRESS',
    label: '4. Foam Wash & Spa In Progress',
    description: 'Active snow foam soak, pressure rinse & interior detailing',
    icon: '🧼'
  },
  {
    key: 'QUALITY_INSPECTED',
    label: '5. Quality Checked',
    description: 'Paint inspection, tire shine & spot-free drying verified',
    icon: '✨'
  },
  {
    key: 'OUT_FOR_DELIVERY',
    label: '6. Out for Delivery',
    description: 'Clean vehicle returning to your doorstep with valet',
    icon: '🚗'
  },
  {
    key: 'COMPLETED',
    label: '7. Delivered & Completed',
    description: 'Wash complete! Vehicle delivered back safely',
    icon: '🏆'
  }
];

export const TrackWashPage: React.FC<TrackWashPageProps> = ({
  onNavigateHome,
  onNavigateBooking
}) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<CustomerOrder | null>(null);
  const detailsRef = useRef<HTMLDivElement>(null);

  const fetchCustomerOrders = async () => {
    setLoading(true);
    try {
      const all = await api.getBookings();
      if (Array.isArray(all)) {
        const userEmail = user?.email?.toLowerCase().trim() || '';
        const matched = all.filter((b: any) => {
          if (userEmail && b.customerEmail && b.customerEmail.toLowerCase().trim() === userEmail) return true;
          return false;
        });

        const listToUse = matched.length > 0 ? matched : all;
        setOrders(listToUse as any[]);
        if (listToUse.length > 0) {
          setSelectedOrder(listToUse[0] as any);
        }
      }
    } catch (err) {
      console.warn('Customer tracker fetch note:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerOrders();
  }, [user]);

  const handleSelectOrder = (order: CustomerOrder) => {
    setSelectedOrder(order);
    setTimeout(() => {
      detailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleSearchManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      fetchCustomerOrders();
      return;
    }
    setLoading(true);
    try {
      const all = await api.getBookings();
      const q = searchQuery.toLowerCase().trim();
      const found = all.filter((b: any) => 
        (b.id && b.id.toLowerCase().includes(q)) ||
        (b.bookingRef && b.bookingRef.toLowerCase().includes(q)) ||
        (b.customerPhone && b.customerPhone.includes(q)) ||
        (b.customerEmail && b.customerEmail.toLowerCase().includes(q)) ||
        (b.customerName && b.customerName.toLowerCase().includes(q)) ||
        (b.vehicleNumber && b.vehicleNumber.toLowerCase().includes(q)) ||
        (b.vehicleBrand && b.vehicleBrand.toLowerCase().includes(q))
      );
      setOrders(found as any[]);
      if (found.length > 0) {
        setSelectedOrder(found[0] as any);
      } else {
        setSelectedOrder(null);
      }
    } catch {}
    setLoading(false);
  };

  // Determine stage progress
  const getStageIndex = (status: WashStatus): number => {
    if (status === 'CANCELLED') return -1;
    const normalized = (status || '').toUpperCase();
    const idx = STAGES.findIndex((s) => s.key === normalized);
    return idx >= 0 ? idx : 0;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-orange-500 selection:text-white flex flex-col">
      
      {/* ── Top Clean Navigation Bar ── */}
      <header className="sticky top-0 z-40 bg-white/95 border-b border-slate-200 backdrop-blur-md shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          
          <button
            onClick={onNavigateHome}
            className="flex items-center gap-2 group cursor-pointer"
          >
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full overflow-hidden border-2 border-orange-500 shadow-md bg-slate-950 flex items-center justify-center">
              <img
                src="/logo.png"
                alt="Sri Thirumala Foam Wash"
                className="w-full h-full object-cover object-center scale-110"
              />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-slate-900 font-extrabold text-xs sm:text-base tracking-wider uppercase leading-none font-['Outfit']">
                SRI THIRUMALA
              </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-600 font-bold text-[9px] sm:text-xs tracking-widest uppercase leading-tight font-['Outfit'] mt-0.5">
                FOAM WASH & DETAILING
              </span>
            </div>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onNavigateHome}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Home</span>
            </button>

            <button
              onClick={onNavigateBooking}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition cursor-pointer flex items-center gap-1.5"
            >
              <Car className="w-4 h-4" />
              <span>Book a Wash</span>
            </button>
          </div>

        </div>
      </header>

      {/* ── Main Page Content ── */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-8 space-y-6">
        
        {/* Page Hero Header Banner */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4 text-center sm:text-left relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live PostgreSQL Real-Time Sync • Karpur Studio</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-['Outfit']">
                LIVE WASH & VALET STAGE TRACKER
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
                Click any order below to view its live 7-stage detailing progress, active foam wash station, and doorstep valet return status.
              </p>
            </div>

            <button
              onClick={fetchCustomerOrders}
              className="self-start sm:self-center px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 transition cursor-pointer flex items-center gap-2 shadow-sm"
              title="Refresh Live Status"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Orders</span>
            </button>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearchManual} className="pt-2 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search orders by Booking ID (e.g. STFW-25588), Customer Name, Vehicle, Phone, or Plate..."
                className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-900 pl-10 pr-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:bg-white transition font-mono shadow-inner"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition cursor-pointer flex items-center justify-center gap-2 shrink-0"
            >
              <span>Search Orders</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Content Body */}
        {loading ? (
          <div className="text-center py-20 bg-white border border-slate-200 rounded-3xl p-8 space-y-3 shadow-sm">
            <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <div className="text-sm font-bold text-slate-700 font-['Outfit']">Synchronizing Live Order Stages...</div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl p-8 space-y-4 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto border border-orange-100">
              <Car className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 font-['Outfit']">No matching orders found</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                Enter your booking reference or phone number above to track an active wash, or schedule a fresh doorstep foam wash now.
              </p>
            </div>
            <button
              onClick={onNavigateBooking}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition cursor-pointer inline-flex items-center gap-2"
            >
              <span>Book a Wash Now</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* 📋 PROMINENT ORDER SELECTION CARDS LIST (Clean Light Studio)    */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-black text-slate-900 flex items-center gap-2 font-['Outfit']">
                    <Car className="w-5 h-5 text-orange-600" />
                    <span>Select an Order to View Real-Time Live Progress ({orders.length} Bookings)</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">Click any booking card below to inspect its live stage status</p>
                </div>
              </div>

              {/* Grid of Interactive Order Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {orders.map((o) => {
                  const isSelected = selectedOrder?.id === o.id;
                  const currentStageIdx = getStageIndex(o.status);
                  const stageObj = STAGES[currentStageIdx] || STAGES[0];

                  return (
                    <div
                      key={o.id}
                      onClick={() => handleSelectOrder(o)}
                      className={`p-5 rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden group text-left ${
                        isSelected
                          ? 'bg-orange-50/40 border-orange-500 shadow-md ring-2 ring-orange-500/10'
                          : 'bg-white border-slate-200 hover:border-orange-300 hover:bg-slate-50/60 shadow-xs'
                      }`}
                    >
                      {/* Top Row: Ref & Status Pill */}
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <span className="font-mono text-xs font-black text-orange-700 bg-orange-100/70 border border-orange-200 px-2.5 py-0.5 rounded-lg">
                          {o.bookingRef || o.id}
                        </span>
                        
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                            o.status === 'COMPLETED'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : o.status === 'WASH_IN_PROGRESS'
                              ? 'bg-blue-100 text-blue-800 border border-blue-200 animate-pulse'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {o.status.replace(/_/g, ' ')}
                        </span>
                      </div>

                      {/* Middle: Vehicle & Customer */}
                      <div className="space-y-1">
                        <div className="text-sm font-black text-slate-900 font-['Outfit'] flex items-center gap-2">
                          <span>{o.vehicleBrand || o.vehicleType}</span>
                          <span className="text-[11px] font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 uppercase">
                            {o.vehicleNumber || 'No Plate'}
                          </span>
                        </div>

                        <div className="text-xs text-slate-600 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-semibold text-slate-800">{o.customerName}</span>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-500 font-mono text-[11px]">{o.customerPhone}</span>
                        </div>

                        <div className="text-xs text-slate-500 truncate mt-1">
                          {o.serviceType}
                        </div>
                      </div>

                      {/* Bottom Row: Slot, Price & Click Hint */}
                      <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{o.date} • {o.timeSlot.split('-')[0].trim()}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="font-black text-slate-900 font-mono text-sm">₹{o.price}</span>
                          <span
                            className={`text-[11px] font-bold flex items-center gap-1 ${
                              isSelected ? 'text-orange-700 font-black' : 'text-slate-500 group-hover:text-orange-600'
                            }`}
                          >
                            <span>{isSelected ? 'Viewing Progress' : 'View Progress'}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>

                      {/* Current Stage Strip indicator */}
                      <div className="mt-2.5 p-2 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] flex items-center gap-2 text-slate-700">
                        <span className="text-base">{stageObj.icon}</span>
                        <div className="truncate">
                          <strong className="text-slate-900">{stageObj.label}</strong>: {stageObj.description}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* 🚀 EXPANDED LIVE 7-STAGE PROGRESS DETAILS FOR SELECTED ORDER     */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            {selectedOrder && (
              <div ref={detailsRef} className="space-y-6 animate-in fade-in duration-200">
                
                {/* Active Order Summary Card */}
                <div className="bg-white border-2 border-orange-500/80 rounded-3xl p-6 sm:p-7 shadow-md space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-sm font-black text-orange-700 bg-orange-50 border border-orange-200 px-3 py-1 rounded-xl">
                          {selectedOrder.bookingRef || selectedOrder.id}
                        </span>
                        <span
                          className={`text-xs font-bold px-3 py-1 rounded-xl uppercase ${
                            selectedOrder.status === 'COMPLETED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-orange-100 text-orange-800'
                          }`}
                        >
                          {selectedOrder.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      
                      <h2 className="text-xl font-black text-slate-900 mt-2 font-['Outfit']">
                        {selectedOrder.vehicleBrand || selectedOrder.vehicleType} • {selectedOrder.serviceType}
                      </h2>

                      <p className="text-xs text-slate-500 mt-0.5">
                        Customer: <strong className="text-slate-800">{selectedOrder.customerName}</strong> ({selectedOrder.customerPhone}) • Vehicle Plate: <span className="font-mono uppercase text-slate-800 font-bold">{selectedOrder.vehicleNumber || 'Registered Plate'}</span>
                      </p>
                    </div>

                    <div className="text-left md:text-right border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                      <div className="text-xs text-slate-500">Scheduled Bay Slot</div>
                      <div className="text-sm font-bold text-slate-900 font-mono mt-0.5">{selectedOrder.date} • {selectedOrder.timeSlot}</div>
                      <div className="text-sm font-black text-emerald-700 font-mono mt-1">₹{selectedOrder.price} ({selectedOrder.paymentStatus || 'PAID'})</div>
                    </div>
                  </div>

                  {/* ── 7-STAGE CLEAN LIGHT LIVE PROGRESS TIMELINE ── */}
                  <div className="space-y-6 pt-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-black text-slate-900 flex items-center gap-2 font-['Outfit']">
                        <Sparkles className="w-5 h-5 text-orange-600" />
                        <span>LIVE SERVICE STAGES & VALET DISPATCH STATUS</span>
                      </h3>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Stage {getStageIndex(selectedOrder.status) + 1} of 7 Active</span>
                      </span>
                    </div>

                    <div className="relative pl-6 sm:pl-10 space-y-7 before:absolute before:left-3 sm:before:left-5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
                      {STAGES.map((stage, idx) => {
                        const currentStageIdx = getStageIndex(selectedOrder.status);
                        const isCompleted = idx < currentStageIdx;
                        const isCurrent = idx === currentStageIdx;

                        return (
                          <div key={stage.key} className="relative flex items-start gap-4">
                            
                            {/* Step icon node */}
                            <div
                              className={`absolute -left-6 sm:-left-10 top-0.5 w-7 h-7 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center text-sm font-bold transition-all shadow-sm ${
                                isCompleted
                                  ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                                  : isCurrent
                                  ? 'bg-gradient-to-br from-red-600 to-orange-500 text-white ring-4 ring-orange-500/20 animate-pulse shadow-md'
                                  : 'bg-slate-100 text-slate-400 border border-slate-200'
                              }`}
                            >
                              {isCompleted ? '✓' : stage.icon}
                            </div>

                            <div className={`flex-1 pt-0.5 p-4 rounded-2xl border transition-all ${
                              isCurrent
                                ? 'bg-orange-50/70 border-orange-300 shadow-sm'
                                : isCompleted
                                ? 'bg-emerald-50/40 border-emerald-200/80'
                                : 'bg-slate-50/60 border-slate-200/80'
                            }`}>
                              <div className="flex items-center justify-between">
                                <span
                                  className={`text-xs sm:text-sm font-bold ${
                                    isCompleted
                                      ? 'text-emerald-700'
                                      : isCurrent
                                      ? 'text-orange-700 font-black'
                                      : 'text-slate-500'
                                  }`}
                                >
                                  {stage.label}
                                </span>
                                {isCurrent && (
                                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 border border-orange-200 uppercase tracking-wide">
                                    Current Stage
                                  </span>
                                )}
                                {isCompleted && (
                                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase tracking-wide">
                                    Completed ✓
                                  </span>
                                )}
                              </div>
                              <p
                                className={`text-xs mt-1 ${
                                  isCurrent ? 'text-slate-800 font-semibold' : 'text-slate-500'
                                }`}
                              >
                                {stage.description}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>

                {/* Valet Pickup & Studio Helpline Strip */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Valet Pickup Address */}
                  <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-xs text-slate-900 uppercase">Valet Doorstep Pickup & Drop Location:</span>
                      <p className="text-xs text-slate-600 mt-1">{selectedOrder.pickupAddress || 'Doorstep Pickup (Karpur Studio Radius)'}</p>
                    </div>
                  </div>

                  {/* Helpline & WhatsApp Support */}
                  <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center justify-between gap-3">
                    <div>
                      <span className="font-bold text-xs text-slate-900 uppercase">Studio Valet Support:</span>
                      <p className="text-xs text-slate-600 mt-0.5 font-mono">085500 00889</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href="tel:08550000889"
                        className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                      >
                        <Phone className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Call</span>
                      </a>
                      <a
                        href={`https://wa.me/918550000889?text=Hi%20Sri%20Thirumala%20Foam%20Wash,%20tracking%20my%20order%20${encodeURIComponent(selectedOrder.bookingRef || selectedOrder.id)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm shadow-emerald-600/20"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </a>
                    </div>
                  </div>

                </div>

              </div>
            )}

          </div>
        )}

      </main>

      {/* ── Footer ── */}
      <footer className="bg-white border-t border-slate-200 py-6 px-4 text-center text-xs text-slate-500 mt-12">
        <p>© 2026 Sri Thirumala Foam Wash & Detailing. Karpur Studio, Karnataka.</p>
      </footer>

    </div>
  );
};
