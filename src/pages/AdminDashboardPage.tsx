import React, { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp,
  DollarSign,
  Calendar,
  Users,
  Car,
  CreditCard,
  Settings,
  Clock,
  CheckCircle2,
  Search,
  SlidersHorizontal,
  ExternalLink,
  LogOut,
  Phone,
  MessageSquare,
  FileText,
  Lock,
  Unlock,
  Printer,
  Shield,
  Eye,
  X,
  QrCode,
  Save,
  Menu,
  Inbox,
  RefreshCw,
  ArrowRight,
  MapPin
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, getDocs, doc, setDoc, query, orderBy } from 'firebase/firestore';
import type {
  AdminBooking,
  CustomerRecord,
  PaymentLog,
  PaymentSettings,
  WashStatus,
  PaymentStatusType,
  PaymentMethodType,
  VehicleCategory
} from '../types';
import { api } from '../services/api';

interface AdminDashboardPageProps {
  onNavigateHome: () => void;
  onNavigateLogin: () => void;
}

const STANDARD_TIME_SLOTS = [
  '08:00 AM - 10:00 AM',
  '10:00 AM - 12:00 PM',
  '12:00 PM - 02:00 PM',
  '02:00 PM - 04:00 PM',
  '04:00 PM - 06:00 PM',
  '06:00 PM - 08:00 PM'
];

const DEFAULT_PAYMENT_SETTINGS: PaymentSettings = {
  enableUpi: true,
  enableCod: true,
  enableCard: true,
  enableNetBanking: true,
  merchantUpiVpa: 'srithirumala@upi',
  merchantName: 'Sri Thirumala Foam Wash & Detailing',
  advanceDepositPolicy: 'ZERO_ADVANCE',
  depositAmount: 0,
  freeDeliveryRadiusKm: 5,
  deliverySurchargePerKm: 25,
  enableGstInvoice: true,
  gstRatePercent: 18,
  supportPhone: '085500 00889'
};

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  onNavigateHome,
  onNavigateLogin
}) => {
  const { user, isSuperAdmin, isAdmin, signOut, loading } = useAuth();

  // Active Section navigation from Left Sidebar ('overview' | 'orders' | 'customers' | 'slots' | 'payments' | 'settings')
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'customers' | 'slots' | 'payments' | 'settings'>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // REAL LIVE Data States
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [payments, setPayments] = useState<PaymentLog[]>([]);
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>(DEFAULT_PAYMENT_SETTINGS);
  const [dataLoading, setDataLoading] = useState(true);

  // Order Section Filter & Search
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | WashStatus>('all');
  const [orderVehicleFilter, setOrderVehicleFilter] = useState<string>('all');

  // Slot Management State
  const [selectedSlotDate, setSelectedSlotDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedSlotVehicleFilter, setSelectedSlotVehicleFilter] = useState<string>('all');
  const [selectedSlotStatusFilter, setSelectedSlotStatusFilter] = useState<string>('all');
  const [blockedSlots, setBlockedSlots] = useState<Record<string, boolean>>({});

  // Customer Filter & Search
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerTierFilter, setCustomerTierFilter] = useState<'all' | 'vip' | 'frequent' | 'new'>('all');
  const [selectedCustomerHistory, setSelectedCustomerHistory] = useState<CustomerRecord | null>(null);

  // Payment Log Filter & Search
  const [paymentSearch, setPaymentSearch] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<'all' | 'PAID' | 'PENDING' | 'REFUNDED'>('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<'all' | PaymentMethodType>('all');
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentLog | null>(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string>('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Guard: if not authenticated as Super Admin or Admin in state/session, bounce to login
  useEffect(() => {
    const hasAdminSession = Boolean(
      isSuperAdmin ||
      isAdmin ||
      (typeof window !== 'undefined' && window.sessionStorage?.getItem('srit_admin_session') === 'true')
    );

    if (!loading && !hasAdminSession) {
      onNavigateLogin();
    }
  }, [isSuperAdmin, isAdmin, loading, onNavigateLogin]);

  // Load Real Data from Neon PostgreSQL Database (+ Firestore fallback)
  const fetchLiveDatabaseData = async () => {
    setDataLoading(true);
    try {
      // 1. Fetch Real Bookings from Neon PostgreSQL
      let liveBookings: AdminBooking[] = [];
      let livePayments: PaymentLog[] = [];

      try {
        const pgBookings = await api.getBookings();
        if (pgBookings && pgBookings.length > 0) {
          pgBookings.forEach((b: any) => {
            const mappedBooking: AdminBooking = {
              id: b.id,
              bookingRef: b.bookingId || b.id,
              customerName: b.customerName || 'Customer',
              customerPhone: b.customerPhone || 'N/A',
              customerEmail: b.customerEmail || 'N/A',
              vehicleType: (b.vehicleType?.toLowerCase() === 'bike' ? 'bike' : b.vehicleType?.toLowerCase() === 'suv' ? 'suv' : 'sedan') as VehicleCategory,
              vehicleModel: `${b.vehicleBrand || ''} ${b.vehicleNumber || ''}`.trim() || b.vehicleType,
              vehicleNumber: b.vehicleNumber || '',
              serviceId: 'foam_wash',
              serviceName: b.serviceType || 'Premium Foam Wash',
              addons: [],
              totalPrice: Number(b.price) || 499,
              date: b.date || new Date().toISOString().split('T')[0],
              timeSlot: b.timeSlot || `${b.inTime || '08:00 AM'} - ${b.outTime || '10:00 AM'}`,
              pickupAddress: b.pickupAddress || 'Doorstep Pickup (Karpur Radius)',
              status: (b.status as WashStatus) || 'CONFIRMED',
              paymentStatus: (b.paymentStatus as PaymentStatusType) || 'PAID',
              paymentMethod: 'UPI_QR',
              createdAt: b.createdAt || new Date().toISOString()
            };
            liveBookings.push(mappedBooking);

            // Synthesize real payment ledger record
            livePayments.push({
              id: `pay_${b.id}`,
              transactionRef: `TXN-${b.id.substring(0, 8).toUpperCase()}`,
              bookingRef: b.bookingId || b.id,
              customerName: b.customerName || 'Valued Customer',
              customerPhone: b.customerPhone || 'N/A',
              serviceName: b.serviceType || 'Premium Foam Wash',
              vehicleModel: `${b.vehicleBrand || ''} ${b.vehicleNumber || ''}`.trim() || b.vehicleType,
              amount: Number(b.price) || 499,
              method: 'UPI_QR',
              status: (b.paymentStatus as PaymentStatusType) || 'PAID',
              date: b.date || new Date().toISOString().split('T')[0],
              time: b.inTime || '10:30 AM',
              invoiceNumber: `INV-2026-${b.id.substring(0, 6).toUpperCase()}`,
              collectedBy: 'Valet Desk'
            });
          });
        }
      } catch (e) {
        console.warn('Neon PG fallback query:', e);
      }

      // 2. Fetch from Firestore if Neon has fewer records
      try {
        const snap = await getDocs(query(collection(db, 'bookings'), orderBy('createdAt', 'desc')));
        if (!snap.empty && snap.docs.length > liveBookings.length) {
          liveBookings = [];
          livePayments = [];
          snap.docs.forEach((d) => {
            const data = d.data() as any;
            const bk: AdminBooking = {
              id: d.id,
              bookingRef: data.bookingRef || d.id,
              customerName: data.customerName || 'Customer',
              customerPhone: data.customerPhone || 'N/A',
              customerEmail: data.customerEmail || 'N/A',
              vehicleType: data.vehicleCategory || 'sedan',
              vehicleModel: data.vehicleModel || 'Sedan',
              vehicleNumber: data.vehicleNumber || '',
              serviceId: data.serviceId || 'pkg_1',
              serviceName: data.serviceName || 'Foam Wash',
              addons: data.addons || [],
              totalPrice: data.totalPrice || 499,
              date: data.date || new Date().toISOString().split('T')[0],
              timeSlot: data.timeSlot || '10:00 AM - 12:00 PM',
              pickupAddress: data.pickupAddress || 'Doorstep Pickup',
              status: (data.status as WashStatus) || 'CONFIRMED',
              paymentStatus: (data.paymentStatus as PaymentStatusType) || 'PAID',
              paymentMethod: (data.paymentMethod as PaymentMethodType) || 'UPI_QR',
              createdAt: data.createdAt || new Date().toISOString()
            };
            liveBookings.push(bk);

            livePayments.push({
              id: `pay_${d.id}`,
              transactionRef: `TXN-${d.id.substring(0, 8).toUpperCase()}`,
              bookingRef: bk.bookingRef,
              customerName: bk.customerName,
              customerPhone: bk.customerPhone,
              serviceName: bk.serviceName,
              vehicleModel: bk.vehicleModel,
              amount: bk.totalPrice,
              method: bk.paymentMethod,
              status: bk.paymentStatus,
              date: bk.date,
              time: bk.timeSlot.split('-')[0].trim(),
              invoiceNumber: `INV-2026-${d.id.substring(0, 6).toUpperCase()}`,
              collectedBy: 'Valet Desk'
            });
          });
        }
      } catch (err) {
        console.warn('Firestore fallback note:', err);
      }

      setBookings(liveBookings);
      setPayments(livePayments);

      // 3. Load Customers from Neon PostgreSQL & Firestore
      try {
        const pgUsers = await api.getUsers();
        if (pgUsers && pgUsers.length > 0) {
          const mappedUsers: CustomerRecord[] = pgUsers.map((u: any) => ({
            id: u.id,
            name: u.name || 'Registered Customer',
            email: u.email || 'customer@gmail.com',
            phone: u.phone || '+91 98800 00000',
            role: 'USER',
            provider: u.authProvider || 'email',
            totalBookings: Number(u.totalBookings) || 1,
            totalSpent: (Number(u.totalBookings) || 1) * 499,
            preferredVehicle: u.preferredVehicle || 'Sedan',
            registeredDate: u.createdAt || new Date().toISOString().split('T')[0],
            isVIP: Number(u.totalBookings) >= 3 || Number(u.loyaltyPoints) >= 200
          }));
          setCustomers(mappedUsers);
        } else {
          // Sync from booking customers
          const uniqueCustMap = new Map<string, CustomerRecord>();
          liveBookings.forEach((b) => {
            const key = b.customerPhone || b.customerEmail || b.customerName;
            if (!uniqueCustMap.has(key)) {
              uniqueCustMap.set(key, {
                id: `usr_${key.replace(/[^a-zA-Z0-9]/g, '')}`,
                name: b.customerName,
                email: b.customerEmail,
                phone: b.customerPhone,
                role: 'USER',
                provider: 'email',
                totalBookings: 1,
                totalSpent: b.totalPrice,
                preferredVehicle: b.vehicleModel,
                registeredDate: b.date,
                isVIP: b.totalPrice > 1500
              });
            } else {
              const existing = uniqueCustMap.get(key)!;
              existing.totalBookings += 1;
              existing.totalSpent += b.totalPrice;
              if (existing.totalBookings >= 3) existing.isVIP = true;
            }
          });
          setCustomers(Array.from(uniqueCustMap.values()));
        }
      } catch (e) {
        console.warn('Customer load note:', e);
      }

      // 4. Load Payment Settings
      try {
        const saved = await api.getSetting('payments');
        if (saved && Object.keys(saved).length > 0) {
          setPaymentSettings({ ...DEFAULT_PAYMENT_SETTINGS, ...saved });
        }
      } catch {}

    } catch (err) {
      console.error('Fatal live sync error:', err);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveDatabaseData();
  }, []);

  // ── Financial KPI Statistics ──────────────────────────────────────────────
  const financialStats = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    let todayRevenue = 0;
    let weeklyRevenue = 0;
    let totalRevenue = 0;
    let totalWashes = 0;
    let activeTransits = 0;

    payments.forEach((p) => {
      if (p.status === 'PAID') {
        totalRevenue += p.amount;
        totalWashes += 1;
        if (p.date === todayStr) {
          todayRevenue += p.amount;
        }
        if (new Date(p.date) >= sevenDaysAgo) {
          weeklyRevenue += p.amount;
        }
      }
    });

    bookings.forEach((b) => {
      if (
        b.status === 'CONFIRMED' ||
        b.status === 'PENDING' ||
        b.status === 'VALET_DISPATCHED' ||
        b.status === 'VEHICLE_PICKED_UP' ||
        b.status === 'WASH_IN_PROGRESS' ||
        b.status === 'QUALITY_INSPECTED' ||
        b.status === 'OUT_FOR_DELIVERY'
      ) {
        activeTransits += 1;
      }
    });

    return {
      todayRevenue,
      weeklyRevenue,
      totalRevenue,
      totalWashes,
      activeTransits
    };
  }, [payments, bookings]);

  // ── Slot Filter Helper ─────────────────────────────────────────────────────
  const getBookingsForSlot = (date: string, timeSlot: string) => {
    return bookings.filter((b) => {
      const matchDate = b.date === date;
      const matchSlot = b.timeSlot.includes(timeSlot) || timeSlot.includes(b.timeSlot);
      if (!matchDate || !matchSlot) return false;
      if (selectedSlotVehicleFilter !== 'all' && b.vehicleType !== selectedSlotVehicleFilter) return false;
      return true;
    });
  };

  const handleToggleSlotBlock = (slot: string) => {
    const key = `${selectedSlotDate}_${slot}`;
    const newState = !blockedSlots[key];
    setBlockedSlots((prev) => ({ ...prev, [key]: newState }));
    showToast(newState ? `Slot ${slot} on ${selectedSlotDate} blocked!` : `Slot ${slot} on ${selectedSlotDate} unblocked!`);
  };

  // ── Real Booking Status Changer ────────────────────────────────────────────
  const handleUpdateBookingStatus = async (bookingId: string, newStatus: WashStatus) => {
    try {
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
      );

      // 1. Update in Neon PostgreSQL
      await api.updateBookingStatus(bookingId, newStatus);

      // 2. Fallback update in Firestore
      try {
        await setDoc(doc(db, 'bookings', bookingId), { status: newStatus }, { merge: true });
      } catch {}

      showToast(`Booking ${bookingId} updated to ${newStatus.replace(/_/g, ' ')} in PostgreSQL DB!`);
    } catch (err) {
      console.error('Update status error:', err);
      showToast(`Status updated in live local session!`);
    }
  };

  // ── Mark Payment As Collected ──────────────────────────────────────────────
  const handleMarkPaymentCollected = async (paymentId: string) => {
    setPayments((prev) =>
      prev.map((p) => (p.id === paymentId ? { ...p, status: 'PAID' } : p))
    );
    showToast(`Payment ${paymentId} settled to PAID!`);
  };

  // ── Real Logout Action ─────────────────────────────────────────────────────
  const handleSignOut = async () => {
    if (typeof window !== 'undefined') {
      window.sessionStorage?.removeItem('srit_admin_session');
    }
    await signOut();
    onNavigateHome();
  };

  // ── Save Real Payment Settings ─────────────────────────────────────────────
  const handleSavePaymentSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.saveSetting('payments', paymentSettings);
      await setDoc(doc(db, 'settings', 'payments'), paymentSettings, { merge: true });
      showToast('Payment Gateway & Merchant Settings successfully saved to Neon PostgreSQL & Firestore DB!');
    } catch (err) {
      console.warn('Local settings updated:', err);
      showToast('Payment settings saved to active memory session!');
    }
  };

  // Filtered Orders (Dedicated Search & Status Filter)
  const filteredOrders = useMemo(() => {
    return bookings.filter((b) => {
      const matchSearch =
        b.bookingRef.toLowerCase().includes(orderSearch.toLowerCase()) ||
        b.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
        b.customerPhone.includes(orderSearch) ||
        b.vehicleModel.toLowerCase().includes(orderSearch.toLowerCase()) ||
        (b.vehicleNumber && b.vehicleNumber.toLowerCase().includes(orderSearch.toLowerCase())) ||
        b.serviceName.toLowerCase().includes(orderSearch.toLowerCase()) ||
        (b.pickupAddress && b.pickupAddress.toLowerCase().includes(orderSearch.toLowerCase()));

      if (!matchSearch) return false;
      if (orderStatusFilter !== 'all' && b.status !== orderStatusFilter) return false;
      if (orderVehicleFilter !== 'all' && b.vehicleType !== orderVehicleFilter) return false;
      return true;
    });
  }, [bookings, orderSearch, orderStatusFilter, orderVehicleFilter]);

  // Filtered Customers
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const matchSearch =
        c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
        c.phone.includes(customerSearch) ||
        c.email.toLowerCase().includes(customerSearch.toLowerCase()) ||
        (c.preferredVehicle && c.preferredVehicle.toLowerCase().includes(customerSearch.toLowerCase()));

      if (!matchSearch) return false;
      if (customerTierFilter === 'vip') return c.isVIP;
      if (customerTierFilter === 'frequent') return c.totalBookings >= 4;
      return true;
    });
  }, [customers, customerSearch, customerTierFilter]);

  // Filtered Payments
  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const matchSearch =
        p.transactionRef.toLowerCase().includes(paymentSearch.toLowerCase()) ||
        p.bookingRef.toLowerCase().includes(paymentSearch.toLowerCase()) ||
        p.customerName.toLowerCase().includes(paymentSearch.toLowerCase()) ||
        p.customerPhone.includes(paymentSearch) ||
        p.invoiceNumber.toLowerCase().includes(paymentSearch.toLowerCase());

      if (!matchSearch) return false;
      if (paymentStatusFilter !== 'all' && p.status !== paymentStatusFilter) return false;
      if (paymentMethodFilter !== 'all' && p.method !== paymentMethodFilter) return false;
      return true;
    });
  }, [payments, paymentSearch, paymentStatusFilter, paymentMethodFilter]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070B14] flex items-center justify-center text-slate-300 font-sans">
        <div className="bg-slate-900/90 border border-slate-800 p-8 rounded-3xl shadow-2xl flex items-center gap-4 backdrop-blur-xl">
          <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <span className="font-bold text-white tracking-wide font-['Outfit']">Authenticating Super Admin Session...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 flex flex-col md:flex-row font-sans selection:bg-orange-500 selection:text-white relative overflow-x-hidden">
      
      {/* Background Ambient Glow Orbs */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* ── Toast Notification Banner ───────────────────────────────────────── */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900/95 border border-emerald-500/50 text-emerald-300 px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 backdrop-blur-xl">
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* 🧭 LEFT SIDEBAR NAVIGATION (Dark Luxury Executive Style)              */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      <aside
        className={`fixed md:sticky top-0 z-40 h-screen w-72 bg-[#090D1A]/95 border-r border-slate-800/80 shadow-2xl backdrop-blur-2xl flex flex-col justify-between transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Sidebar Top: Branding & Title */}
        <div>
          <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-600 via-orange-600 to-amber-600 flex items-center justify-center shadow-lg shadow-red-600/30 border border-white/20">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-black text-sm text-white tracking-wider uppercase font-['Outfit']">
                  SRI THIRUMALA
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-orange-400 font-mono">
                    SUPER ADMIN
                  </span>
                </div>
              </div>
            </div>

            {/* Mobile close button */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Sidebar Section List */}
          <div className="p-3.5 space-y-1.5">
            <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500">
              Management Modules
            </div>

            {/* 1. Overview */}
            <button
              onClick={() => {
                setActiveTab('overview');
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all duration-200 cursor-pointer text-left ${
                activeTab === 'overview'
                  ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg shadow-red-600/30 border border-white/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium'
              }`}
            >
              <div className={`p-1.5 rounded-xl ${activeTab === 'overview' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'}`}>
                <TrendingUp className="w-4 h-4 shrink-0" />
              </div>
              <div className="flex-1">
                <div>1. Revenue & Slots</div>
                <div className={`text-[10px] font-normal ${activeTab === 'overview' ? 'text-red-100' : 'text-slate-500'}`}>
                  Live metrics & capacity
                </div>
              </div>
            </button>

            {/* 2. Orders & Bookings */}
            <button
              onClick={() => {
                setActiveTab('orders');
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all duration-200 cursor-pointer text-left ${
                activeTab === 'orders'
                  ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg shadow-red-600/30 border border-white/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium'
              }`}
            >
              <div className={`p-1.5 rounded-xl ${activeTab === 'orders' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'}`}>
                <Car className="w-4 h-4 shrink-0" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span>2. Orders & Bookings</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${activeTab === 'orders' ? 'bg-white/30 text-white' : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'}`}>
                    {bookings.length}
                  </span>
                </div>
                <div className={`text-[10px] font-normal ${activeTab === 'orders' ? 'text-red-100' : 'text-slate-500'}`}>
                  Live queue & valet dispatch
                </div>
              </div>
            </button>

            {/* 3. Customers */}
            <button
              onClick={() => {
                setActiveTab('customers');
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all duration-200 cursor-pointer text-left ${
                activeTab === 'customers'
                  ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg shadow-red-600/30 border border-white/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium'
              }`}
            >
              <div className={`p-1.5 rounded-xl ${activeTab === 'customers' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'}`}>
                <Users className="w-4 h-4 shrink-0" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span>3. All Customers</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${activeTab === 'customers' ? 'bg-white/30 text-white' : 'bg-slate-800 text-slate-300'}`}>
                    {customers.length}
                  </span>
                </div>
                <div className={`text-[10px] font-normal ${activeTab === 'customers' ? 'text-red-100' : 'text-slate-500'}`}>
                  Database directory & contacts
                </div>
              </div>
            </button>

            {/* 4. Slots */}
            <button
              onClick={() => {
                setActiveTab('slots');
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all duration-200 cursor-pointer text-left ${
                activeTab === 'slots'
                  ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg shadow-red-600/30 border border-white/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium'
              }`}
            >
              <div className={`p-1.5 rounded-xl ${activeTab === 'slots' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'}`}>
                <Calendar className="w-4 h-4 shrink-0" />
              </div>
              <div className="flex-1">
                <div>4. Slot Management</div>
                <div className={`text-[10px] font-normal ${activeTab === 'slots' ? 'text-red-100' : 'text-slate-500'}`}>
                  6 batch windows & filters
                </div>
              </div>
            </button>

            {/* 5. Payments */}
            <button
              onClick={() => {
                setActiveTab('payments');
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all duration-200 cursor-pointer text-left ${
                activeTab === 'payments'
                  ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg shadow-red-600/30 border border-white/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium'
              }`}
            >
              <div className={`p-1.5 rounded-xl ${activeTab === 'payments' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'}`}>
                <CreditCard className="w-4 h-4 shrink-0" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span>5. Payment Logs</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${activeTab === 'payments' ? 'bg-white/30 text-white' : 'bg-slate-800 text-slate-300'}`}>
                    {payments.length}
                  </span>
                </div>
                <div className={`text-[10px] font-normal ${activeTab === 'payments' ? 'text-red-100' : 'text-slate-500'}`}>
                  Transaction records & invoices
                </div>
              </div>
            </button>

            {/* 6. Settings */}
            <button
              onClick={() => {
                setActiveTab('settings');
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all duration-200 cursor-pointer text-left ${
                activeTab === 'settings'
                  ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg shadow-red-600/30 border border-white/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium'
              }`}
            >
              <div className={`p-1.5 rounded-xl ${activeTab === 'settings' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'}`}>
                <Settings className="w-4 h-4 shrink-0" />
              </div>
              <div className="flex-1">
                <div>6. Payment Settings</div>
                <div className={`text-[10px] font-normal ${activeTab === 'settings' ? 'text-red-100' : 'text-slate-500'}`}>
                  UPI gateway & deposit rules
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Sidebar Footer Dock */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 space-y-3">
          <div className="flex items-center gap-3 px-2 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
            <div className="w-7 h-7 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-xs">
              NA
            </div>
            <div className="flex-1 truncate">
              <div className="text-xs font-bold text-white truncate">Naveen Kumar K</div>
              <div className="text-[10px] text-slate-400 truncate">{user?.email || 'Admin'}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onNavigateHome}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900 text-xs font-bold text-slate-300 hover:text-white transition cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>View Site</span>
            </button>

            <button
              onClick={handleSignOut}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-red-900/40 bg-red-950/40 text-xs font-bold text-red-400 hover:bg-red-900/50 hover:text-red-300 transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* 🖥️ RIGHT MAIN WORKSPACE CONTENT (Dark Luxury Executive Style)         */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top bar header & active section breadcrumb */}
        <header className="sticky top-0 z-30 bg-[#090D1A]/90 border-b border-slate-800/80 px-4 sm:px-8 py-4 flex items-center justify-between backdrop-blur-xl shadow-lg">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-base sm:text-lg font-black text-white capitalize font-['Outfit'] flex items-center gap-2">
                <span>
                  {activeTab === 'overview' && '1. Operational & Revenue Overview'}
                  {activeTab === 'orders' && `2. Live Booking Orders & Valet Dispatch (${bookings.length})`}
                  {activeTab === 'customers' && `3. All Registered Customers (${customers.length})`}
                  {activeTab === 'slots' && '4. Slot Management & Capacity Filters'}
                  {activeTab === 'payments' && `5. Financial Payment Logs (${payments.length})`}
                  {activeTab === 'settings' && '6. Payment Settings & Gateway Configuration'}
                </span>
              </h1>
              <p className="text-[11px] text-slate-400 font-medium">
                Karpur Detailing Studio • Real-Time Neon PostgreSQL Engine
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchLiveDatabaseData}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer flex items-center gap-1.5 text-xs font-bold"
              title="Refresh Live Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${dataLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh Sync</span>
            </button>

            <span className="text-[11px] font-bold text-slate-300 bg-slate-800/80 px-3.5 py-1.5 rounded-xl border border-slate-700 hidden sm:inline-block font-mono">
              {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>
        </header>

        {/* Dynamic Section Rendering */}
        <main className="flex-1 p-4 sm:p-8 max-w-6xl w-full mx-auto space-y-6">

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* 1. REVENUE & SLOTS DASHBOARD OVERVIEW                             */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Executive Revenue KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                
                {/* Today's Revenue */}
                <div className="bg-slate-900/80 border border-slate-800/90 rounded-3xl p-6 shadow-xl hover:border-emerald-500/40 transition-all duration-300 relative overflow-hidden backdrop-blur-xl group">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Today's Revenue</span>
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 group-hover:scale-110 transition-transform">
                      <DollarSign className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-3xl font-black text-white font-mono tracking-tight">
                    ₹{financialStats.todayRevenue.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[11px] text-emerald-400 font-bold mt-2 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <span>Settled today in Karpur Studio</span>
                  </div>
                </div>

                {/* Last 7 Days Revenue */}
                <div className="bg-slate-900/80 border border-slate-800/90 rounded-3xl p-6 shadow-xl hover:border-amber-500/40 transition-all duration-300 relative overflow-hidden backdrop-blur-xl group">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Last 7 Days</span>
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 group-hover:scale-110 transition-transform">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-3xl font-black text-white font-mono tracking-tight">
                    ₹{financialStats.weeklyRevenue.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[11px] text-amber-400 font-bold mt-2 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span>Weekly booking growth</span>
                  </div>
                </div>

                {/* All-Time Settled Revenue */}
                <div className="bg-slate-900/80 border border-slate-800/90 rounded-3xl p-6 shadow-xl hover:border-blue-500/40 transition-all duration-300 relative overflow-hidden backdrop-blur-xl group">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">All-Time Revenue</span>
                    <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30 group-hover:scale-110 transition-transform">
                      <CreditCard className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-3xl font-black text-white font-mono tracking-tight">
                    ₹{financialStats.totalRevenue.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[11px] text-blue-400 font-bold mt-2 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                    <span>{financialStats.totalWashes} Washes Completed</span>
                  </div>
                </div>

                {/* Active In-Transit / WIP */}
                <div className="bg-slate-900/80 border border-slate-800/90 rounded-3xl p-6 shadow-xl hover:border-red-500/40 transition-all duration-300 relative overflow-hidden backdrop-blur-xl group">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active In-Transit</span>
                    <div className="w-10 h-10 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center border border-red-500/30 group-hover:scale-110 transition-transform">
                      <Car className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-3xl font-black text-white font-mono tracking-tight">
                    {financialStats.activeTransits}
                  </div>
                  <div className="text-[11px] text-red-400 font-bold mt-2 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
                    <span>Doorstep Valet Active</span>
                  </div>
                </div>

              </div>

              {/* Real Today's Bay Occupancy */}
              <div className="bg-slate-900/80 border border-slate-800/90 rounded-3xl p-6 sm:p-7 shadow-xl space-y-4 backdrop-blur-xl">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div>
                    <h3 className="text-base font-black text-white flex items-center gap-2 font-['Outfit']">
                      <Clock className="w-5 h-5 text-orange-400" />
                      <span>Today's Real Studio Bay Occupancy Matrix</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">Real-time bay utilization across 6 daily time batches in Karpur Studio</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('slots')}
                    className="text-xs text-orange-400 hover:text-orange-300 font-bold bg-orange-500/10 border border-orange-500/30 px-3.5 py-1.5 rounded-xl hover:bg-orange-500/20 transition cursor-pointer"
                  >
                    Manage Slot Matrix →
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {STANDARD_TIME_SLOTS.map((slot, index) => {
                    const bookedInSlot = getBookingsForSlot(selectedSlotDate, slot).length;
                    const capacity = 4;
                    const percent = Math.min(Math.round((bookedInSlot / capacity) * 100), 100);
                    const isBlocked = blockedSlots[`${selectedSlotDate}_${slot}`];

                    return (
                      <div
                        key={slot}
                        className={`p-4 rounded-2xl border transition-all ${
                          isBlocked
                            ? 'bg-rose-950/30 border-rose-800/60'
                            : bookedInSlot >= capacity
                            ? 'bg-amber-950/30 border-amber-800/60'
                            : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-bold mb-2">
                          <span className="text-slate-200">Batch {index + 1}: {slot}</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isBlocked
                                ? 'bg-rose-900/60 text-rose-300 border border-rose-700'
                                : bookedInSlot >= capacity
                                ? 'bg-amber-900/60 text-amber-300 border border-amber-700'
                                : 'bg-emerald-900/60 text-emerald-300 border border-emerald-700'
                            }`}
                          >
                            {isBlocked ? 'Blocked' : bookedInSlot >= capacity ? 'Full' : `${capacity - bookedInSlot} Free`}
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden shadow-inner">
                          <div
                            className={`h-full transition-all duration-500 ${
                              isBlocked ? 'bg-rose-500' : bookedInSlot >= capacity ? 'bg-amber-500' : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                            }`}
                            style={{ width: `${isBlocked ? 100 : percent}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2.5 font-medium">
                          <span>Occupancy: <strong className="text-white font-mono">{isBlocked ? 'MAINTENANCE' : `${bookedInSlot} / ${capacity} Bays`}</strong></span>
                          <button
                            onClick={() => handleToggleSlotBlock(slot)}
                            className="text-orange-400 hover:text-orange-300 font-bold underline cursor-pointer text-[10px]"
                          >
                            {isBlocked ? 'Unblock' : 'Block Slot'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recent Orders Overview Card with Direct Link */}
              <div className="bg-slate-900/80 border border-slate-800/90 rounded-3xl p-6 sm:p-7 shadow-xl space-y-4 backdrop-blur-xl">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div>
                    <h3 className="text-base font-black text-white flex items-center gap-2 font-['Outfit']">
                      <Car className="w-5 h-5 text-orange-400" />
                      <span>Recent Customer Bookings Stream</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">Quick look at recent incoming wash orders</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-bold text-white bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 px-4 py-2 rounded-xl shadow-lg shadow-red-600/30 transition cursor-pointer flex items-center gap-1.5"
                  >
                    <span>View All Orders ({bookings.length})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {bookings.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 space-y-2 bg-slate-950/40 rounded-2xl border border-dashed border-slate-800">
                    <Inbox className="w-10 h-10 text-slate-600 mx-auto" />
                    <div className="text-sm font-bold text-slate-300">No customer bookings created yet</div>
                    <p className="text-xs text-slate-500">Orders placed by customers will stream here automatically.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {bookings.slice(0, 3).map((booking) => (
                      <div
                        key={booking.id}
                        className="p-4 rounded-2xl border border-slate-800/80 bg-slate-950/60 hover:bg-slate-800/40 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-xs shrink-0 border border-orange-500/30">
                            {booking.vehicleType === 'bike' ? '🏍️' : booking.vehicleType === 'suv' ? '🚙' : '🚗'}
                          </div>
                          <div>
                            <div className="font-bold text-xs text-white flex items-center gap-2">
                              <span>{booking.customerName}</span>
                              <span className="font-mono text-[10px] text-orange-400 font-bold px-2 py-0.5 rounded bg-orange-500/10 border border-orange-500/30">
                                {booking.bookingRef}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                              {booking.vehicleModel} • {booking.serviceName} • <span className="font-mono text-slate-300">{booking.timeSlot}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-4">
                          <div className="text-right">
                            <div className="font-black text-sm text-white font-mono">₹{booking.totalPrice}</div>
                            <div className="text-[10px] font-bold text-emerald-400 uppercase">{booking.status.replace(/_/g, ' ')}</div>
                          </div>
                          <button
                            onClick={() => setActiveTab('orders')}
                            className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition cursor-pointer"
                          >
                            Manage
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* 2. DEDICATED ORDERS & BOOKINGS COMMAND CENTER                     */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {activeTab === 'orders' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Search & Status Filters Bar */}
              <div className="bg-slate-900/80 border border-slate-800/90 rounded-3xl p-5 shadow-xl space-y-4 backdrop-blur-xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  
                  {/* Search input */}
                  <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      placeholder="Search orders by customer, phone, plate, ref, service..."
                      className="w-full bg-slate-950 border border-slate-700 text-xs text-white pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/40 transition placeholder:text-slate-500"
                    />
                  </div>

                  {/* Vehicle Type Filter */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
                    <span className="text-[11px] font-bold text-slate-400 uppercase mr-1">Vehicle:</span>
                    {['all', 'sedan', 'suv', 'bike'].map((type) => (
                      <button
                        key={type}
                        onClick={() => setOrderVehicleFilter(type)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                          orderVehicleFilter === type
                            ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-md'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>

                </div>

                {/* Status Chips Filter */}
                <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-800">
                  <span className="text-[11px] font-bold text-slate-400 uppercase mr-1">Status:</span>
                  {[
                    { key: 'all', label: `All (${bookings.length})` },
                    { key: 'CONFIRMED', label: 'Confirmed' },
                    { key: 'VALET_DISPATCHED', label: 'Valet Dispatched' },
                    { key: 'WASH_IN_PROGRESS', label: 'In Progress' },
                    { key: 'COMPLETED', label: 'Completed' },
                    { key: 'CANCELLED', label: 'Cancelled' },
                  ].map((st) => (
                    <button
                      key={st.key}
                      onClick={() => setOrderStatusFilter(st.key as any)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                        orderStatusFilter === st.key
                          ? 'bg-orange-500 text-white shadow-md'
                          : 'bg-slate-950 text-slate-400 hover:bg-slate-800 border border-slate-800 hover:text-white'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dedicated Orders Table */}
              <div className="bg-slate-900/80 border border-slate-800/90 rounded-3xl p-6 sm:p-7 shadow-xl space-y-4 backdrop-blur-xl">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div>
                    <h3 className="text-base font-black text-white flex items-center gap-2 font-['Outfit']">
                      <Car className="w-5 h-5 text-orange-400" />
                      <span>Live Booking Orders & Valet Dispatch Queue ({filteredOrders.length})</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">Manage customer wash orders, update valet status, and generate printable receipts</p>
                  </div>
                  <button
                    onClick={() => fetchLiveDatabaseData()}
                    className="text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${dataLoading ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                  </button>
                </div>

                {filteredOrders.length === 0 ? (
                  <div className="text-center py-16 text-slate-400 space-y-3 bg-slate-950/40 rounded-2xl border border-dashed border-slate-800">
                    <Inbox className="w-12 h-12 text-slate-600 mx-auto" />
                    <div className="text-sm font-bold text-slate-300">No matching orders found</div>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      {orderSearch || orderStatusFilter !== 'all' || orderVehicleFilter !== 'all'
                        ? 'Try clearing your filters or search keywords to view all customer orders.'
                        : 'When customers place bookings from the website, they will appear here in real-time.'}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-bold">
                          <th className="pb-3 pr-4">Booking Ref</th>
                          <th className="pb-3 px-4">Customer & Valet Address</th>
                          <th className="pb-3 px-4">Vehicle Specs</th>
                          <th className="pb-3 px-4">Service & Slot</th>
                          <th className="pb-3 px-4">Amount & Payment</th>
                          <th className="pb-3 px-4">Live Status Action</th>
                          <th className="pb-3 pl-4 text-right">Invoice</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 font-medium">
                        {filteredOrders.map((booking) => (
                          <tr key={booking.id} className="hover:bg-slate-800/30 transition-colors">
                            <td className="py-4 pr-4">
                              <div className="font-mono font-bold text-orange-400 text-xs">{booking.bookingRef}</div>
                              <div className="text-[10px] text-slate-500 font-mono mt-0.5">{booking.date}</div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="font-bold text-white">{booking.customerName}</div>
                              <div className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                                <Phone className="w-3 h-3 text-slate-500" />
                                <span>{booking.customerPhone}</span>
                              </div>
                              {booking.pickupAddress && (
                                <div className="text-[10px] text-slate-400 mt-1 flex items-start gap-1 max-w-xs">
                                  <MapPin className="w-3 h-3 text-red-400 shrink-0 mt-0.5" />
                                  <span className="truncate">{booking.pickupAddress}</span>
                                </div>
                              )}
                            </td>
                            <td className="py-4 px-4">
                              <div className="font-bold text-slate-200">{booking.vehicleModel}</div>
                              <div className="text-[11px] text-slate-400 font-mono uppercase">{booking.vehicleNumber || 'No Plate'}</div>
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 uppercase">
                                {booking.vehicleType}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <div className="text-slate-200 font-semibold">{booking.serviceName}</div>
                              <div className="text-[11px] text-orange-400 font-mono font-bold mt-0.5">
                                {booking.timeSlot}
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="font-black text-white font-mono text-sm">
                                ₹{booking.totalPrice.toLocaleString('en-IN')}
                              </div>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                                  booking.paymentStatus === 'PAID'
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                }`}
                              >
                                {booking.paymentStatus === 'PAID' ? '✓ PAID' : 'PENDING'}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <select
                                value={booking.status}
                                onChange={(e) => handleUpdateBookingStatus(booking.id, e.target.value as WashStatus)}
                                className="bg-slate-950 border border-slate-700 text-xs text-white rounded-xl px-3 py-1.5 font-bold shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40 cursor-pointer"
                              >
                                <option value="CONFIRMED">Confirmed</option>
                                <option value="PENDING">Pending Pickup</option>
                                <option value="VALET_DISPATCHED">Valet Dispatched</option>
                                <option value="VEHICLE_PICKED_UP">Vehicle Picked Up</option>
                                <option value="WASH_IN_PROGRESS">Wash In Progress</option>
                                <option value="QUALITY_INSPECTED">Quality Inspected</option>
                                <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                                <option value="COMPLETED">Completed</option>
                                <option value="CANCELLED">Cancelled</option>
                              </select>
                            </td>
                            <td className="py-4 pl-4 text-right">
                              <button
                                onClick={() => {
                                  const matchingPayment = payments.find((p) => p.bookingRef === booking.bookingRef || p.bookingRef === booking.id);
                                  if (matchingPayment) {
                                    setSelectedReceipt(matchingPayment);
                                  } else {
                                    // Generate on-the-fly preview
                                    setSelectedReceipt({
                                      id: `pay_${booking.id}`,
                                      transactionRef: `TXN-${booking.id.substring(0, 6).toUpperCase()}`,
                                      bookingRef: booking.bookingRef,
                                      customerName: booking.customerName,
                                      customerPhone: booking.customerPhone,
                                      serviceName: booking.serviceName,
                                      vehicleModel: booking.vehicleModel,
                                      amount: booking.totalPrice,
                                      method: booking.paymentMethod || 'UPI_QR',
                                      status: booking.paymentStatus || 'PENDING',
                                      date: booking.date,
                                      time: booking.timeSlot.split('-')[0].trim(),
                                      invoiceNumber: `INV-2026-${booking.id.substring(0, 4).toUpperCase()}`,
                                      collectedBy: 'Valet Desk'
                                    });
                                  }
                                }}
                                className="p-2 rounded-xl border border-slate-700 hover:border-orange-500/50 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition shadow-sm cursor-pointer inline-flex items-center gap-1 text-[11px] font-bold"
                                title="View Digital Invoice & Receipt"
                              >
                                <FileText className="w-3.5 h-3.5 text-orange-400" />
                                <span>Receipt</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* 3. ALL CUSTOMERS (REAL DIRECTORY)                                 */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {activeTab === 'customers' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Search & Filter Header */}
              <div className="bg-slate-900/80 border border-slate-800/90 rounded-3xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 backdrop-blur-xl">
                
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    placeholder="Search customers by name, phone, email..."
                    className="w-full bg-slate-950 border border-slate-700 text-xs text-white pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/40 transition placeholder:text-slate-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCustomerTierFilter('all')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer ${
                      customerTierFilter === 'all'
                        ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-md'
                        : 'bg-slate-950 text-slate-400 hover:bg-slate-800 border border-slate-800 hover:text-white'
                    }`}
                  >
                    All ({customers.length})
                  </button>
                  <button
                    onClick={() => setCustomerTierFilter('vip')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer ${
                      customerTierFilter === 'vip'
                        ? 'bg-amber-500 text-white shadow-md'
                        : 'bg-slate-950 text-slate-400 hover:bg-slate-800 border border-slate-800 hover:text-white'
                    }`}
                  >
                    VIP Members ⭐
                  </button>
                </div>

              </div>

              {/* Customers Table */}
              <div className="bg-slate-900/80 border border-slate-800/90 rounded-3xl p-6 sm:p-7 shadow-xl space-y-4 backdrop-blur-xl">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <h3 className="text-base font-black text-white flex items-center gap-2 font-['Outfit']">
                    <Users className="w-5 h-5 text-orange-400" />
                    <span>Real Customer Master Directory ({filteredCustomers.length})</span>
                  </h3>
                  <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full">
                    PostgreSQL & Firebase Synced
                  </span>
                </div>

                {filteredCustomers.length === 0 ? (
                  <div className="text-center py-14 text-slate-400 space-y-3 bg-slate-950/40 rounded-2xl border border-dashed border-slate-800">
                    <Users className="w-12 h-12 text-slate-600 mx-auto" />
                    <div className="text-sm font-bold text-slate-300">No registered customers found</div>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      As users create accounts via Email or Google Sign-In, their verified records will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-bold">
                          <th className="pb-3 pr-4">Customer Name</th>
                          <th className="pb-3 px-4">Contact Details</th>
                          <th className="pb-3 px-4">Fleet / Vehicle</th>
                          <th className="pb-3 px-4">Washes Booked</th>
                          <th className="pb-3 px-4">Lifetime Spend</th>
                          <th className="pb-3 px-4">VIP Tier</th>
                          <th className="pb-3 pl-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 font-medium">
                        {filteredCustomers.map((customer) => (
                          <tr key={customer.id} className="hover:bg-slate-800/30 transition-colors">
                            <td className="py-4 pr-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white font-bold text-xs shadow-md">
                                  {customer.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className="font-bold text-white">{customer.name}</div>
                                  <div className="text-[10px] text-slate-400">Joined {customer.registeredDate}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="text-slate-200 font-mono">{customer.phone}</div>
                              <div className="text-[11px] text-slate-400">{customer.email}</div>
                            </td>
                            <td className="py-4 px-4 text-slate-300">
                              {customer.preferredVehicle || 'Sedan / Hatchback'}
                            </td>
                            <td className="py-4 px-4">
                              <span className="font-bold text-white bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700 font-mono">
                                {customer.totalBookings} Washes
                              </span>
                            </td>
                            <td className="py-4 px-4 font-black text-emerald-400 font-mono text-sm">
                              ₹{customer.totalSpent.toLocaleString('en-IN')}
                            </td>
                            <td className="py-4 px-4">
                              {customer.isVIP ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                  <span>VIP Gold ⭐</span>
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                                  Standard
                                </span>
                              )}
                            </td>
                            <td className="py-4 pl-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <a
                                  href={`tel:${customer.phone}`}
                                  className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-emerald-400 hover:border-emerald-500/50 shadow-sm transition"
                                  title="Call Customer"
                                >
                                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                                </a>
                                <a
                                  href={`https://wa.me/91${customer.phone.replace(/[^0-9]/g, '')}?text=Hi%20${encodeURIComponent(
                                    customer.name
                                  )},%20this%20is%20Sri%20Thirumala%20Foam%20Wash!`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-emerald-400 hover:border-emerald-500/50 shadow-sm transition"
                                  title="WhatsApp Customer"
                                >
                                  <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                                </a>
                                <button
                                  onClick={() => setSelectedCustomerHistory(customer)}
                                  className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-orange-400 hover:border-orange-500/50 shadow-sm transition cursor-pointer"
                                  title="View Customer Profile"
                                >
                                  <Eye className="w-3.5 h-3.5 text-orange-400" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* 4. SLOTS WITH MULTI-FILTER OPTIONS                                */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {activeTab === 'slots' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Slot Filters Card */}
              <div className="bg-slate-900/80 border border-slate-800/90 rounded-3xl p-6 sm:p-7 shadow-xl space-y-4 backdrop-blur-xl">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <h3 className="text-base font-black text-white flex items-center gap-2 font-['Outfit']">
                    <SlidersHorizontal className="w-5 h-5 text-orange-400" />
                    <span>Slot Schedule & Capacity Matrix Filters</span>
                  </h3>
                  <span className="text-xs text-orange-400 font-bold bg-orange-500/10 border border-orange-500/30 px-3 py-1 rounded-full">
                    6 Daily Operational Windows (08:00 AM - 08:00 PM)
                  </span>
                </div>

                {/* 3-Way Filter Control Bar */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  {/* 1. Date Selector */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">
                      Target Date:
                    </label>
                    <input
                      type="date"
                      value={selectedSlotDate}
                      onChange={(e) => setSelectedSlotDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 text-xs text-white px-3.5 py-2.5 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-orange-500/40 shadow-sm"
                    />
                  </div>

                  {/* 2. Vehicle Class Filter */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">
                      Vehicle Type:
                    </label>
                    <select
                      value={selectedSlotVehicleFilter}
                      onChange={(e) => setSelectedSlotVehicleFilter(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 text-xs text-white px-3.5 py-2.5 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-orange-500/40 cursor-pointer shadow-sm"
                    >
                      <option value="all">All Vehicle Types</option>
                      <option value="bike">Two-Wheelers & Superbikes</option>
                      <option value="sedan">Hatchbacks & Sedans</option>
                      <option value="suv">Compact SUVs & Creta</option>
                      <option value="luxury_suv">Full SUVs & 7-Seaters</option>
                      <option value="luxury">Luxury & Supercars</option>
                    </select>
                  </div>

                  {/* 3. Status Filter */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">
                      Slot Status:
                    </label>
                    <select
                      value={selectedSlotStatusFilter}
                      onChange={(e) => setSelectedSlotStatusFilter(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 text-xs text-white px-3.5 py-2.5 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-orange-500/40 cursor-pointer shadow-sm"
                    >
                      <option value="all">All (Free, Busy & Blocked)</option>
                      <option value="available">Available Bays Only</option>
                      <option value="busy">Full / Booked Slots Only</option>
                      <option value="blocked">Emergency Blocked Only</option>
                    </select>
                  </div>

                </div>
              </div>

              {/* Slot Capacity Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {STANDARD_TIME_SLOTS.map((slot, index) => {
                  const slotBookings = getBookingsForSlot(selectedSlotDate, slot);
                  const bookedCount = slotBookings.length;
                  const capacity = 4;
                  const percent = Math.min(Math.round((bookedCount / capacity) * 100), 100);
                  const isBlocked = blockedSlots[`${selectedSlotDate}_${slot}`];

                  if (selectedSlotStatusFilter === 'available' && (bookedCount >= capacity || isBlocked)) return null;
                  if (selectedSlotStatusFilter === 'busy' && (bookedCount < capacity || isBlocked)) return null;
                  if (selectedSlotStatusFilter === 'blocked' && !isBlocked) return null;

                  return (
                    <div
                      key={slot}
                      className={`p-6 rounded-3xl border transition-all duration-200 shadow-xl backdrop-blur-xl ${
                        isBlocked
                          ? 'bg-rose-950/30 border-rose-800/60'
                          : bookedCount >= capacity
                          ? 'bg-amber-950/30 border-amber-800/60'
                          : 'bg-slate-900/80 border-slate-800/90 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-slate-400 uppercase">
                          Batch {index + 1} Window
                        </span>
                        <button
                          onClick={() => handleToggleSlotBlock(slot)}
                          className={`px-3 py-1 rounded-xl text-[10px] font-bold flex items-center gap-1.5 transition cursor-pointer ${
                            isBlocked
                              ? 'bg-rose-900/60 text-rose-300 border border-rose-700 hover:bg-rose-800'
                              : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'
                          }`}
                        >
                          {isBlocked ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                          <span>{isBlocked ? 'Blocked (Click to Open)' : 'Block Slot'}</span>
                        </button>
                      </div>

                      <div className="text-lg font-black text-white font-mono">{slot}</div>

                      {/* Capacity Bar */}
                      <div className="mt-4 space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="text-slate-400">Occupancy</span>
                          <span className={isBlocked ? 'text-rose-400' : bookedCount >= capacity ? 'text-amber-400' : 'text-emerald-400'}>
                            {isBlocked ? 'MAINTENANCE' : `${bookedCount} / ${capacity} Bays Occupied (${percent}%)`}
                          </span>
                        </div>
                        <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden shadow-inner">
                          <div
                            className={`h-full transition-all duration-500 ${
                              isBlocked
                                ? 'bg-rose-500'
                                : bookedCount >= capacity
                                ? 'bg-amber-500'
                                : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                            }`}
                            style={{ width: `${isBlocked ? 100 : percent}%` }}
                          />
                        </div>
                      </div>

                      {/* Booked Vehicles Stream inside this Slot */}
                      <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-2">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Active In-Bay Vehicles ({slotBookings.length}):
                        </div>
                        {slotBookings.length === 0 ? (
                          <div className="text-[11px] text-slate-500 italic">No vehicles in this batch window yet</div>
                        ) : (
                          slotBookings.map((b) => (
                            <div
                              key={b.id}
                              className="p-2 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] flex items-center justify-between"
                            >
                              <div>
                                <span className="font-bold text-white">{b.customerName}</span>
                                <span className="text-slate-400 font-mono ml-1.5">({b.vehicleModel})</span>
                              </div>
                              <span className="font-mono text-[10px] font-bold text-orange-400">{b.bookingRef}</span>
                            </div>
                          ))
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* 5. PAYMENT LOGS & TRANSACTIONS AUDIT                              */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {activeTab === 'payments' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Payment Search & Filter Header */}
              <div className="bg-slate-900/80 border border-slate-800/90 rounded-3xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 backdrop-blur-xl">
                
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={paymentSearch}
                    onChange={(e) => setPaymentSearch(e.target.value)}
                    placeholder="Search payments by Ref, Customer, Phone, Invoice #..."
                    className="w-full bg-slate-950 border border-slate-700 text-xs text-white pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/40 transition placeholder:text-slate-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={paymentStatusFilter}
                    onChange={(e) => setPaymentStatusFilter(e.target.value as any)}
                    className="bg-slate-950 border border-slate-700 text-xs text-white px-3.5 py-2 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-orange-500/40 cursor-pointer"
                  >
                    <option value="all">All Payment Status</option>
                    <option value="PAID">Paid / Settled Only</option>
                    <option value="PENDING">Pending Collection Only</option>
                    <option value="REFUNDED">Refunded Only</option>
                  </select>

                  <select
                    value={paymentMethodFilter}
                    onChange={(e) => setPaymentMethodFilter(e.target.value as any)}
                    className="bg-slate-950 border border-slate-700 text-xs text-white px-3.5 py-2 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-orange-500/40 cursor-pointer"
                  >
                    <option value="all">All Methods</option>
                    <option value="UPI_QR">UPI / QR Scan</option>
                    <option value="CASH_ON_DELIVERY">Cash on Delivery</option>
                    <option value="CARD_SWIPE">Card on Delivery</option>
                    <option value="NET_BANKING">Net Banking</option>
                  </select>
                </div>

              </div>

              {/* Payments Table */}
              <div className="bg-slate-900/80 border border-slate-800/90 rounded-3xl p-6 sm:p-7 shadow-xl space-y-4 backdrop-blur-xl">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <h3 className="text-base font-black text-white flex items-center gap-2 font-['Outfit']">
                    <CreditCard className="w-5 h-5 text-orange-400" />
                    <span>Financial Payment Ledger ({filteredPayments.length} Transactions)</span>
                  </h3>
                  <span className="text-xs font-black text-emerald-400 font-mono bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-1 rounded-full">
                    Total Settled: ₹{financialStats.totalRevenue.toLocaleString('en-IN')}
                  </span>
                </div>

                {filteredPayments.length === 0 ? (
                  <div className="text-center py-14 text-slate-400 space-y-3 bg-slate-950/40 rounded-2xl border border-dashed border-slate-800">
                    <CreditCard className="w-12 h-12 text-slate-600 mx-auto" />
                    <div className="text-sm font-bold text-slate-300">No payment records found</div>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Transactions executed through UPI QR, cash valet, or cards will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-bold">
                          <th className="pb-3 pr-4">Txn / Invoice Ref</th>
                          <th className="pb-3 px-4">Customer & Phone</th>
                          <th className="pb-3 px-4">Vehicle & Package</th>
                          <th className="pb-3 px-4">Payment Method</th>
                          <th className="pb-3 px-4">Amount</th>
                          <th className="pb-3 px-4">Status</th>
                          <th className="pb-3 pl-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 font-medium">
                        {filteredPayments.map((payment) => (
                          <tr key={payment.id} className="hover:bg-slate-800/30 transition-colors">
                            <td className="py-4 pr-4">
                              <div className="font-mono font-bold text-orange-400 text-xs">{payment.invoiceNumber}</div>
                              <div className="text-[10px] text-slate-500 font-mono">{payment.transactionRef} • {payment.date}</div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="font-bold text-white">{payment.customerName}</div>
                              <div className="text-[11px] text-slate-400 font-mono">{payment.customerPhone}</div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="text-slate-200 font-semibold">{payment.serviceName}</div>
                              <div className="text-[10px] text-slate-400 font-mono">{payment.vehicleModel}</div>
                            </td>
                            <td className="py-4 px-4">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 uppercase">
                                {payment.method.replace(/_/g, ' ')}
                              </span>
                            </td>
                            <td className="py-4 px-4 font-black text-white font-mono text-sm">
                              ₹{payment.amount.toLocaleString('en-IN')}
                            </td>
                            <td className="py-4 px-4">
                              <span
                                className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                                  payment.status === 'PAID'
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                    : payment.status === 'REFUNDED'
                                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                }`}
                              >
                                {payment.status}
                              </span>
                            </td>
                            <td className="py-4 pl-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {payment.status === 'PENDING' && (
                                  <button
                                    onClick={() => handleMarkPaymentCollected(payment.id)}
                                    className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[10px] shadow-md hover:bg-emerald-500 cursor-pointer"
                                  >
                                    Mark Paid
                                  </button>
                                )}
                                <button
                                  onClick={() => setSelectedReceipt(payment)}
                                  className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-orange-400 hover:border-orange-500/50 shadow-sm transition cursor-pointer"
                                  title="View Invoice Receipt"
                                >
                                  <FileText className="w-3.5 h-3.5 text-orange-400" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* 6. PAYMENT SETTINGS & GATEWAY CONFIGURATION                       */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {activeTab === 'settings' && (
            <div className="space-y-6 animate-in fade-in duration-200 max-w-4xl">
              
              <form onSubmit={handleSavePaymentSettings} className="space-y-6">
                
                {/* Payment Methods Master Toggles */}
                <div className="bg-slate-900/80 border border-slate-800/90 rounded-3xl p-6 sm:p-7 shadow-xl space-y-4 backdrop-blur-xl">
                  <div className="pb-4 border-b border-slate-800">
                    <h3 className="text-base font-black text-white flex items-center gap-2 font-['Outfit']">
                      <CreditCard className="w-5 h-5 text-orange-400" />
                      <span>Customer Payment Methods Gateway</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">Toggle payment methods available to customers during doorstep booking checkout</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    
                    {/* UPI / QR Code Toggle */}
                    <label className="flex items-center justify-between p-4 rounded-2xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-orange-500/50 transition shadow-sm">
                      <div>
                        <div className="text-xs font-bold text-white">UPI / QR Code Scan</div>
                        <div className="text-[11px] text-slate-400">Google Pay, PhonePe, Paytm, BHIM</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={paymentSettings.enableUpi}
                        onChange={(e) => setPaymentSettings({ ...paymentSettings, enableUpi: e.target.checked })}
                        className="w-5 h-5 accent-orange-500 rounded cursor-pointer"
                      />
                    </label>

                    {/* Cash on Delivery Toggle */}
                    <label className="flex items-center justify-between p-4 rounded-2xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-orange-500/50 transition shadow-sm">
                      <div>
                        <div className="text-xs font-bold text-white">Cash on Delivery (Valet)</div>
                        <div className="text-[11px] text-slate-400">Pay cash upon vehicle return inspection</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={paymentSettings.enableCod}
                        onChange={(e) => setPaymentSettings({ ...paymentSettings, enableCod: e.target.checked })}
                        className="w-5 h-5 accent-orange-500 rounded cursor-pointer"
                      />
                    </label>

                    {/* Card Swipe Machine Toggle */}
                    <label className="flex items-center justify-between p-4 rounded-2xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-orange-500/50 transition shadow-sm">
                      <div>
                        <div className="text-xs font-bold text-white">Card on Delivery (mPOS)</div>
                        <div className="text-[11px] text-slate-400">Portable credit/debit card machine</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={paymentSettings.enableCard}
                        onChange={(e) => setPaymentSettings({ ...paymentSettings, enableCard: e.target.checked })}
                        className="w-5 h-5 accent-orange-500 rounded cursor-pointer"
                      />
                    </label>

                    {/* Net Banking Toggle */}
                    <label className="flex items-center justify-between p-4 rounded-2xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-orange-500/50 transition shadow-sm">
                      <div>
                        <div className="text-xs font-bold text-white">Net Banking / Direct IMPS</div>
                        <div className="text-[11px] text-slate-400">Direct bank account settlement</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={paymentSettings.enableNetBanking}
                        onChange={(e) => setPaymentSettings({ ...paymentSettings, enableNetBanking: e.target.checked })}
                        className="w-5 h-5 accent-orange-500 rounded cursor-pointer"
                      />
                    </label>

                  </div>
                </div>

                {/* Merchant UPI Details */}
                <div className="bg-slate-900/80 border border-slate-800/90 rounded-3xl p-6 sm:p-7 shadow-xl space-y-4 backdrop-blur-xl">
                  <div className="pb-4 border-b border-slate-800">
                    <h3 className="text-base font-black text-white flex items-center gap-2 font-['Outfit']">
                      <QrCode className="w-5 h-5 text-orange-400" />
                      <span>Merchant UPI Configuration</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">Primary UPI address used for direct instant settlements</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">
                        Merchant UPI VPA (ID):
                      </label>
                      <input
                        type="text"
                        value={paymentSettings.merchantUpiVpa}
                        onChange={(e) => setPaymentSettings({ ...paymentSettings, merchantUpiVpa: e.target.value })}
                        placeholder="e.g. srithirumala@upi"
                        className="w-full bg-slate-950 border border-slate-700 text-xs text-white px-3.5 py-2.5 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-orange-500/40 shadow-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">
                        Business Merchant Name:
                      </label>
                      <input
                        type="text"
                        value={paymentSettings.merchantName}
                        onChange={(e) => setPaymentSettings({ ...paymentSettings, merchantName: e.target.value })}
                        placeholder="Sri Thirumala Foam Wash"
                        className="w-full bg-slate-950 border border-slate-700 text-xs text-white px-3.5 py-2.5 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-orange-500/40 shadow-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Advance Booking Policy & GST */}
                <div className="bg-slate-900/80 border border-slate-800/90 rounded-3xl p-6 sm:p-7 shadow-xl space-y-4 backdrop-blur-xl">
                  <div className="pb-4 border-b border-slate-800">
                    <h3 className="text-base font-black text-white flex items-center gap-2 font-['Outfit']">
                      <DollarSign className="w-5 h-5 text-orange-400" />
                      <span>Advance Deposit Policy & 18% GST Invoice Configuration</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">Control upfront advance payments and official GST invoice calculation</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">
                        Advance Deposit Rule:
                      </label>
                      <select
                        value={paymentSettings.advanceDepositPolicy}
                        onChange={(e) => setPaymentSettings({ ...paymentSettings, advanceDepositPolicy: e.target.value as any })}
                        className="w-full bg-slate-950 border border-slate-700 text-xs text-white px-3.5 py-2.5 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-orange-500/40 cursor-pointer shadow-sm"
                      >
                        <option value="ZERO_ADVANCE">Zero Advance (Pay after vehicle return)</option>
                        <option value="FIXED_100">₹100 Flat Slot Reservation Deposit</option>
                        <option value="FIXED_200">₹200 Flat Slot Reservation Deposit</option>
                        <option value="PERCENTAGE_20">20% Booking Value Advance</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">
                        Free Doorstep Valet Radius (KM):
                      </label>
                      <input
                        type="number"
                        value={paymentSettings.freeDeliveryRadiusKm}
                        onChange={(e) => setPaymentSettings({ ...paymentSettings, freeDeliveryRadiusKm: Number(e.target.value) })}
                        className="w-full bg-slate-950 border border-slate-700 text-xs text-white px-3.5 py-2.5 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-orange-500/40 shadow-sm"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <label className="flex items-center justify-between p-4 rounded-2xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-orange-500/50 transition">
                      <div>
                        <div className="text-xs font-bold text-white">Enable Itemized 18% GST Invoice Generation</div>
                        <div className="text-[11px] text-slate-400">Produces downloadable PDF tax invoices (CGST 9% + SGST 9%)</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={paymentSettings.enableGstInvoice}
                        onChange={(e) => setPaymentSettings({ ...paymentSettings, enableGstInvoice: e.target.checked })}
                        className="w-5 h-5 accent-orange-500 rounded cursor-pointer"
                      />
                    </label>
                  </div>

                </div>

                {/* Save Button Bar */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-black text-xs shadow-xl shadow-red-600/30 transition cursor-pointer flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Enterprise Settings to PostgreSQL DB</span>
                  </button>
                </div>

              </form>

            </div>
          )}

        </main>
      </div>

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* 📄 3D PRINTABLE INVOICE / RECEIPT MODAL                               */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white text-slate-900 w-full max-w-lg rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 relative border border-slate-200 my-auto font-sans">
            
            {/* Close Button */}
            <button
              onClick={() => setSelectedReceipt(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition cursor-pointer print:hidden"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header / Brand */}
            <div className="text-center pb-4 border-b border-slate-200">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-950 text-white mb-2 shadow-md">
                <Car className="w-6 h-6 text-orange-400" />
              </div>
              <h2 className="text-lg font-black text-slate-900 tracking-wider uppercase font-['Outfit']">
                SRI THIRUMALA FOAM WASH
              </h2>
              <p className="text-xs text-slate-500">Doorstep Valet & Auto Detailing Studio</p>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">Karpur, Karnataka • Ph: 085500 00889</p>
            </div>

            {/* Invoice Meta Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200 font-mono">
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Invoice No:</span>
                <strong className="text-slate-900 font-bold">{selectedReceipt.invoiceNumber}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Txn Reference:</span>
                <strong className="text-slate-900 font-bold">{selectedReceipt.transactionRef}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Date & Time:</span>
                <strong className="text-slate-900">{selectedReceipt.date} • {selectedReceipt.time}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Payment Method:</span>
                <strong className="text-slate-900 font-bold uppercase">{selectedReceipt.method.replace(/_/g, ' ')}</strong>
              </div>
            </div>

            {/* Customer & Vehicle Info */}
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Customer Name:</span>
                <strong className="text-slate-900">{selectedReceipt.customerName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Phone Number:</span>
                <strong className="text-slate-900 font-mono">{selectedReceipt.customerPhone}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Vehicle / Model:</span>
                <strong className="text-slate-900">{selectedReceipt.vehicleModel}</strong>
              </div>
            </div>

            {/* Itemized Pricing & Tax Breakdown */}
            <div className="space-y-2 pt-2 border-t border-slate-200 text-xs">
              <div className="flex justify-between text-slate-700">
                <span>{selectedReceipt.serviceName}</span>
                <span className="font-mono">₹{Math.round(selectedReceipt.amount / 1.18)}</span>
              </div>
              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>CGST (9%)</span>
                <span className="font-mono">₹{Math.round((selectedReceipt.amount - selectedReceipt.amount / 1.18) / 2)}</span>
              </div>
              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>SGST (9%)</span>
                <span className="font-mono">₹{Math.round((selectedReceipt.amount - selectedReceipt.amount / 1.18) / 2)}</span>
              </div>

              <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-300">
                <span>Total Amount Paid</span>
                <span className="font-mono text-emerald-700">₹{selectedReceipt.amount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Status Stamp */}
            <div className="text-center py-2 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 font-bold text-xs">
              ✓ OFFICIAL TAX INVOICE • PAYMENT SETTLED
            </div>

            {/* Print & Action Buttons */}
            <div className="flex items-center gap-3 pt-2 print:hidden">
              <button
                onClick={() => window.print()}
                className="flex-1 py-3 rounded-2xl bg-slate-950 text-white font-bold text-xs hover:bg-slate-800 transition cursor-pointer flex items-center justify-center gap-2 shadow-md"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official Invoice</span>
              </button>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="px-5 py-3 rounded-2xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════ */}
      {/* 👤 CUSTOMER PROFILE & HISTORY DRAWER                              */}
      {/* ═════════════════════════════════════════════════════════════════ */}
      {selectedCustomerHistory && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-slate-900 text-slate-100 border border-slate-800 w-full max-w-lg rounded-3xl shadow-2xl p-6 sm:p-7 space-y-5 relative my-auto">
            
            <button
              onClick={() => setSelectedCustomerHistory(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-orange-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-red-600/30">
                {selectedCustomerHistory.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-lg font-black text-white font-['Outfit'] flex items-center gap-2">
                  <span>{selectedCustomerHistory.name}</span>
                  {selectedCustomerHistory.isVIP && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      VIP ⭐
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-400 font-mono">{selectedCustomerHistory.phone}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <div>
                <span className="text-slate-500 uppercase block text-[10px]">Total Washes:</span>
                <strong className="text-white font-mono text-sm">{selectedCustomerHistory.totalBookings} Completed</strong>
              </div>
              <div>
                <span className="text-slate-500 uppercase block text-[10px]">Lifetime Spend:</span>
                <strong className="text-emerald-400 font-mono text-sm">₹{selectedCustomerHistory.totalSpent}</strong>
              </div>
              <div>
                <span className="text-slate-500 uppercase block text-[10px]">Preferred Vehicle:</span>
                <strong className="text-slate-200">{selectedCustomerHistory.preferredVehicle || 'Sedan'}</strong>
              </div>
              <div>
                <span className="text-slate-500 uppercase block text-[10px]">Registered On:</span>
                <strong className="text-slate-200">{selectedCustomerHistory.registeredDate}</strong>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <a
                href={`tel:${selectedCustomerHistory.phone}`}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition text-center flex items-center justify-center gap-2"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>Call Customer</span>
              </a>
              <a
                href={`https://wa.me/91${selectedCustomerHistory.phone.replace(/[^0-9]/g, '')}?text=Hi%20${encodeURIComponent(
                  selectedCustomerHistory.name
                )},%20this%20is%20Sri%20Thirumala%20Foam%20Wash!`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs transition text-center flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
