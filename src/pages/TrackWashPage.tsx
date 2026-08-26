import React, { useState, useEffect } from 'react';
import {
  Car,
  MapPin,
  RefreshCw,
  Search,
  Sparkles,
  ArrowRight,
  Phone,
  MessageSquare,
  ArrowLeft,
  Calendar,
  User,
  ChevronDown,
  ChevronUp
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
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

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
          // Default first order expanded
          setExpandedOrderId(listToUse[0].id);
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

  const toggleOrderExpand = (orderId: string) => {
    setExpandedOrderId((prev) => (prev === orderId ? null : orderId));
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
        setExpandedOrderId(found[0].id);
      } else {
        setExpandedOrderId(null);
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
              <span className="text-slate-900 font-black text-xs sm:text-base tracking-wider uppercase leading-none font-['Outfit']">
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
                Click any order below to reveal its real-time 7-stage cleaning status, doorstep valet driver location, and completion stage directly in place.
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
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            
            <div className="flex items-center justify-between px-2">
              <h2 className="text-sm font-black text-slate-700 uppercase tracking-wider font-['Outfit'] flex items-center gap-2">
                <span>Active Booking Orders ({orders.length})</span>
                <span className="text-xs text-slate-400 font-normal font-sans">Click any order to expand / collapse progress</span>
              </h2>
            </div>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* 📋 IN-PLACE EXPANDABLE ORDER CARDS LIST (Clean Light Studio)   */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <div className="space-y-4">
              {orders.map((o) => {
                const isExpanded = expandedOrderId === o.id;
                const currentStageIdx = getStageIndex(o.status);
                const stageObj = STAGES[currentStageIdx] || STAGES[0];

                return (
                  <div
                    key={o.id}
                    className={`bg-white border-2 rounded-3xl transition-all duration-200 overflow-hidden ${
                      isExpanded
                        ? 'border-orange-500 shadow-lg ring-4 ring-orange-500/10'
                        : 'border-slate-200/90 hover:border-orange-300 shadow-sm hover:shadow-md'
                    }`}
                  >
                    {/* ── Order Header Bar (Clickable) ── */}
                    <div
                      onClick={() => toggleOrderExpand(o.id)}
                      className="p-5 sm:p-6 cursor-pointer select-none transition-colors hover:bg-slate-50/50"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        
                        {/* Left: Ref, Vehicle, Customer */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2.5">
                            <span className="font-mono text-xs font-black text-orange-700 bg-orange-50 border border-orange-200 px-3 py-1 rounded-xl">
                              {o.bookingRef || o.id}
                            </span>
                            
                            <span
                              className={`text-[11px] font-bold px-3 py-1 rounded-xl uppercase tracking-wider ${
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

                          <div className="text-base sm:text-lg font-black text-slate-900 font-['Outfit'] flex flex-wrap items-center gap-2">
                            <span>{o.vehicleBrand || o.vehicleType}</span>
                            <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200 uppercase">
                              {o.vehicleNumber || 'No Plate'}
                            </span>
                            <span className="text-xs font-medium text-slate-500">
                              • {o.serviceType}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                            <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                              <User className="w-3.5 h-3.5 text-slate-400" />
                              <span>{o.customerName}</span>
                            </div>
                            <span className="text-slate-300">•</span>
                            <div className="font-mono text-slate-500">
                              {o.customerPhone}
                            </div>
                            <span className="text-slate-300">•</span>
                            <div className="font-mono text-slate-600 flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              <span>{o.date} ({o.timeSlot})</span>
                            </div>
                          </div>
                        </div>

                        {/* Right: Price & In-Place Expand Toggle Button */}
                        <div className="flex items-center justify-between md:justify-end gap-4 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                          <div className="text-left md:text-right">
                            <div className="font-black text-lg text-slate-900 font-mono">₹{o.price}</div>
                            <div className="text-[11px] font-bold text-emerald-700">{o.paymentStatus || 'PAID'}</div>
                          </div>

                          <button
                            type="button"
                            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm ${
                              isExpanded
                                ? 'bg-orange-600 text-white'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            <span>{isExpanded ? 'Hide Progress' : 'View Live Progress'}</span>
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </div>

                      </div>

                      {/* Mini Preview Stage Strip if collapsed */}
                      {!isExpanded && (
                        <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs flex items-center justify-between text-slate-700">
                          <div className="flex items-center gap-2 truncate">
                            <span className="text-base">{stageObj.icon}</span>
                            <span className="font-bold text-slate-900">{stageObj.label}</span>
                            <span className="text-slate-500 truncate hidden sm:inline">— {stageObj.description}</span>
                          </div>
                          <span className="text-[11px] text-orange-600 font-bold shrink-0 ml-2">Click to expand live stages →</span>
                        </div>
                      )}
                    </div>

                    {/* ═════════════════════════════════════════════════════════ */}
                    {/* 🚀 EXPANDED IN-PLACE 7-STAGE PROGRESS TIMELINE            */}
                    {/* ═════════════════════════════════════════════════════════ */}
                    {isExpanded && (
                      <div className="p-6 sm:p-8 bg-slate-50/70 border-t-2 border-orange-100 space-y-6 animate-in fade-in slide-in-from-top-2 duration-200">
                        
                        {/* Stage Progress Header */}
                        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-orange-600" />
                            <h3 className="text-sm sm:text-base font-black text-slate-900 font-['Outfit'] uppercase">
                              Live Detailing Stages & Valet Dispatch Pipeline
                            </h3>
                          </div>

                          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Stage {currentStageIdx + 1} of 7 Active</span>
                          </span>
                        </div>

                        {/* 7-Stage Vertical Stepper */}
                        <div className="relative pl-6 sm:pl-10 space-y-6 before:absolute before:left-3 sm:before:left-5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
                          {STAGES.map((stage, idx) => {
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
                                      : 'bg-white text-slate-400 border border-slate-200'
                                  }`}
                                >
                                  {isCompleted ? '✓' : stage.icon}
                                </div>

                                <div className={`flex-1 pt-0.5 p-4 rounded-2xl border transition-all ${
                                  isCurrent
                                    ? 'bg-orange-50/80 border-orange-300 shadow-sm'
                                    : isCompleted
                                    ? 'bg-white border-emerald-200 shadow-xs'
                                    : 'bg-white border-slate-200/80'
                                }`}>
                                  <div className="flex items-center justify-between">
                                    <span
                                      className={`text-xs sm:text-sm font-bold ${
                                        isCompleted
                                          ? 'text-emerald-800'
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

                        {/* Valet Pickup & Studio Helpline Strip inside expanded card */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                          
                          {/* Valet Pickup Address */}
                          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-start gap-3">
                            <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold text-xs text-slate-900 uppercase">Valet Doorstep Pickup & Return Location:</span>
                              <p className="text-xs text-slate-600 mt-0.5">{o.pickupAddress || 'Doorstep Pickup (Karpur Studio Radius)'}</p>
                            </div>
                          </div>

                          {/* Helpline & WhatsApp Support */}
                          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between gap-3">
                            <div>
                              <span className="font-bold text-xs text-slate-900 uppercase">Studio Valet Support:</span>
                              <p className="text-xs text-slate-600 mt-0.5 font-mono">085500 00889</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <a
                                href="tel:08550000889"
                                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center gap-1.5"
                              >
                                <Phone className="w-3 h-3 text-emerald-600" />
                                <span>Call</span>
                              </a>
                              <a
                                href={`https://wa.me/918550000889?text=Hi%20Sri%20Thirumala%20Foam%20Wash,%20tracking%20my%20order%20${encodeURIComponent(o.bookingRef || o.id)}`}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                              >
                                <MessageSquare className="w-3 h-3" />
                                <span>WhatsApp</span>
                              </a>
                            </div>
                          </div>

                        </div>

                      </div>
                    )}
                  </div>
                );
              })}
            </div>

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
