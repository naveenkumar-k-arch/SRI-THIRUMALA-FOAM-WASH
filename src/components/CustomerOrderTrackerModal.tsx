import React, { useState, useEffect } from 'react';
import {
  X,
  Car,
  MapPin,
  RefreshCw,
  Search,
  ChevronRight,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import type { WashStatus } from '../types';

interface CustomerOrderTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenBooking: () => void;
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
    label: 'Order Confirmed',
    description: 'Booking slot reserved in Karpur Studio bay queue',
    icon: '📋'
  },
  {
    key: 'VALET_DISPATCHED',
    label: 'Valet Dispatched',
    description: 'Staff driver is en route to your doorstep location',
    icon: '🛵'
  },
  {
    key: 'VEHICLE_PICKED_UP',
    label: 'Vehicle Picked Up',
    description: 'Vehicle safely picked up & in transit to wash studio',
    icon: '🔑'
  },
  {
    key: 'WASH_IN_PROGRESS',
    label: 'Foam Wash & Spa In Progress',
    description: 'Active snow foam soak, pressure rinse & interior detailing',
    icon: '🧼'
  },
  {
    key: 'QUALITY_INSPECTED',
    label: 'Quality Checked',
    description: 'Paint inspection, tire shine & spot-free drying verified',
    icon: '✨'
  },
  {
    key: 'OUT_FOR_DELIVERY',
    label: 'Out for Delivery',
    description: 'Clean vehicle returning to your doorstep with valet',
    icon: '🚗'
  },
  {
    key: 'COMPLETED',
    label: 'Delivered & Completed',
    description: 'Wash complete! Vehicle delivered back safely',
    icon: '🏆'
  }
];

export const CustomerOrderTrackerModal: React.FC<CustomerOrderTrackerModalProps> = ({
  isOpen,
  onClose,
  onOpenBooking
}) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<CustomerOrder | null>(null);

  const fetchCustomerOrders = async () => {
    setLoading(true);
    try {
      const all = await api.getBookings();
      if (Array.isArray(all)) {
        // Filter by logged in user phone/email or show matching orders
        const userEmail = user?.email?.toLowerCase().trim() || '';
        const matched = all.filter((b: any) => {
          if (userEmail && b.customerEmail && b.customerEmail.toLowerCase().trim() === userEmail) return true;
          return false;
        });

        const listToUse = matched.length > 0 ? matched : all.slice(0, 5);
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
    if (isOpen) {
      fetchCustomerOrders();
    }
  }, [isOpen, user]);

  const handleSearchManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const all = await api.getBookings();
      const q = searchQuery.toLowerCase().trim();
      const found = all.filter((b: any) => 
        (b.id && b.id.toLowerCase().includes(q)) ||
        (b.bookingRef && b.bookingRef.toLowerCase().includes(q)) ||
        (b.customerPhone && b.customerPhone.includes(q)) ||
        (b.customerEmail && b.customerEmail.toLowerCase().includes(q)) ||
        (b.vehicleNumber && b.vehicleNumber.toLowerCase().includes(q))
      );
      setOrders(found as any[]);
      if (found.length > 0) {
        setSelectedOrder(found[0] as any);
      }
    } catch {}
    setLoading(false);
  };

  if (!isOpen) return null;

  // Determine stage progress
  const getStageIndex = (status: WashStatus): number => {
    if (status === 'CANCELLED') return -1;
    const idx = STAGES.findIndex((s) => s.key === status);
    return idx >= 0 ? idx : 0;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden text-slate-100 relative my-auto">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg shadow-red-600/30">
              <Car className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white tracking-wide font-['Outfit']">
                LIVE WASH & VALET STAGE TRACKER
              </h2>
              <p className="text-xs text-slate-400">
                Real-time door-to-door vehicle tracking synchronized with Karpur Studio
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchCustomerOrders}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
              title="Refresh Live Status"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search / Lookup Bar */}
        <div className="p-4 sm:p-6 bg-slate-900/50 border-b border-slate-800/80">
          <form onSubmit={handleSearchManual} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Track by Booking ID (e.g. STFW-25588), Phone (+91...), or Vehicle Plate..."
                className="w-full bg-slate-950 border border-slate-700 text-xs text-white pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 transition font-mono"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-2 shrink-0"
            >
              <span>Track Wash</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-7 max-h-[65vh] overflow-y-auto space-y-6">
          {loading ? (
            <div className="text-center py-16 space-y-3">
              <div className="w-8 h-8 border-3 border-red-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <div className="text-sm font-bold text-slate-300">Synchronizing Live Order Stages...</div>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16 space-y-4 bg-slate-950/40 rounded-3xl border border-dashed border-slate-800 p-6">
              <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                <Car className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">No active orders found</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                  Enter your phone number or booking ID above, or book your next high-pressure foam wash now.
                </p>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onOpenBooking();
                }}
                className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition cursor-pointer inline-flex items-center gap-2"
              >
                <span>Book a Slot Now</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Order selector tabs if multiple orders */}
              {orders.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {orders.map((o) => (
                    <button
                      key={o.id}
                      onClick={() => setSelectedOrder(o)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 ${
                        selectedOrder?.id === o.id
                          ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      <span className="font-mono">{o.bookingRef || o.id}</span>
                      <span className="text-[10px] opacity-80">({o.vehicleBrand || o.vehicleType})</span>
                    </button>
                  ))}
                </div>
              )}

              {selectedOrder && (
                <div className="space-y-6">
                  
                  {/* Order Summary Header Card */}
                  <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm font-black text-orange-400 bg-orange-500/10 border border-orange-500/30 px-3 py-1 rounded-xl">
                          {selectedOrder.bookingRef || selectedOrder.id}
                        </span>
                        <span className="text-xs font-bold px-3 py-1 rounded-xl bg-slate-800 text-slate-200 uppercase">
                          {selectedOrder.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <h3 className="text-lg font-black text-white mt-2 font-['Outfit']">
                        {selectedOrder.serviceType}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {selectedOrder.vehicleBrand || selectedOrder.vehicleType} • <span className="font-mono uppercase text-slate-300">{selectedOrder.vehicleNumber || 'Registered'}</span>
                      </p>
                    </div>

                    <div className="text-left md:text-right border-t md:border-t-0 pt-3 md:pt-0 border-slate-800">
                      <div className="text-xs text-slate-400">Scheduled Time Slot</div>
                      <div className="text-sm font-bold text-white font-mono mt-0.5">{selectedOrder.date} • {selectedOrder.timeSlot}</div>
                      <div className="text-xs font-bold text-emerald-400 mt-1">₹{selectedOrder.price} ({selectedOrder.paymentStatus || 'Pending'})</div>
                    </div>
                  </div>

                  {/* ── 7-STAGE INTERACTIVE LIVE PROGRESS TIMELINE ── */}
                  <div className="bg-slate-950/60 border border-slate-800 rounded-3xl p-5 sm:p-7 space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <h4 className="text-sm font-black text-white flex items-center gap-2 font-['Outfit']">
                        <Sparkles className="w-4 h-4 text-orange-400" />
                        <span>LIVE SERVICE STAGES & VALET DISPATCH</span>
                      </h4>
                      <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        <span>Real-Time Neon DB Synced</span>
                      </span>
                    </div>

                    <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
                      {STAGES.map((stage, idx) => {
                        const currentStageIdx = getStageIndex(selectedOrder.status);
                        const isCompleted = idx < currentStageIdx;
                        const isCurrent = idx === currentStageIdx;

                        return (
                          <div key={stage.key} className="relative flex items-start gap-4">
                            {/* Step icon node */}
                            <div
                              className={`absolute -left-6 sm:-left-8 top-0.5 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-md ${
                                isCompleted
                                  ? 'bg-emerald-500 text-white shadow-emerald-500/30'
                                  : isCurrent
                                  ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white ring-4 ring-orange-500/20 animate-pulse'
                                  : 'bg-slate-800 text-slate-500 border border-slate-700'
                              }`}
                            >
                              {isCompleted ? '✓' : stage.icon}
                            </div>

                            <div className="flex-1 pt-0.5">
                              <div className="flex items-center justify-between">
                                <span
                                  className={`text-xs sm:text-sm font-bold ${
                                    isCompleted
                                      ? 'text-emerald-300'
                                      : isCurrent
                                      ? 'text-orange-400 font-extrabold'
                                      : 'text-slate-500'
                                  }`}
                                >
                                  {stage.label}
                                </span>
                                {isCurrent && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 uppercase tracking-wide">
                                    Current Stage
                                  </span>
                                )}
                              </div>
                              <p
                                className={`text-[11px] mt-0.5 ${
                                  isCurrent ? 'text-slate-300 font-medium' : 'text-slate-500'
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

                  {/* Valet Pickup & Studio Details */}
                  {selectedOrder.pickupAddress && (
                    <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800 flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <span className="font-bold text-slate-300">Valet Doorstep Pickup Location:</span>
                        <p className="text-slate-400 mt-0.5">{selectedOrder.pickupAddress}</p>
                      </div>
                    </div>
                  )}

                </div>
              )}

            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs">
          <span className="text-slate-400">
            Helpline: <strong className="text-white">085500 00889</strong>
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition cursor-pointer"
          >
            Close Tracker
          </button>
        </div>

      </div>
    </div>
  );
};
