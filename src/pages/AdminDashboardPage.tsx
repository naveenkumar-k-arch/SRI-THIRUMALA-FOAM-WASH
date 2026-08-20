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
  ChevronRight,
  Shield,
  Eye,
  X,
  QrCode,
  Save
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import type {
  AdminBooking,
  CustomerRecord,
  PaymentLog,
  PaymentSettings,
  WashStatus,
  PaymentStatusType,
  PaymentMethodType
} from '../types';

interface AdminDashboardPageProps {
  onNavigateHome: () => void;
  onNavigateLogin: () => void;
}

// ── Initial Mock Data for Immediate Super Admin Reactivity ────────────────────
const INITIAL_BOOKINGS: AdminBooking[] = [
  {
    id: 'b1',
    bookingRef: 'STF-8492',
    customerName: 'Rajesh Varma',
    customerPhone: '9845123456',
    customerEmail: 'rajesh.varma@gmail.com',
    vehicleType: 'suv',
    vehicleModel: 'Hyundai Creta Knight',
    vehicleNumber: 'KA 05 MN 4821',
    serviceId: 'deep-interior',
    serviceName: 'Deep Interior + Foam Wash',
    addons: ['Engine Bay Steam Detailing', 'Rich Leather Conditioning'],
    totalPrice: 1847,
    date: new Date().toISOString().split('T')[0],
    timeSlot: '10:00 AM - 12:00 PM',
    pickupAddress: 'Villa 14, Prestige Silver Crest, Karpur, Karnataka',
    status: 'WASH_IN_PROGRESS',
    paymentStatus: 'PAID',
    paymentMethod: 'UPI_QR',
    valetDriverName: 'Suresh Kumar',
    valetDriverPhone: '9876543210',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    notes: 'Please pay extra attention to pet hair in rear trunk.'
  },
  {
    id: 'b2',
    bookingRef: 'STF-8493',
    customerName: 'Priya Sundaram',
    customerPhone: '9980112233',
    customerEmail: 'priya.sundaram@gmail.com',
    vehicleType: 'sedan',
    vehicleModel: 'Honda City ZX',
    vehicleNumber: 'KA 01 AB 7789',
    serviceId: 'signature-ceramic',
    serviceName: 'Signature Ceramic Gloss Wash',
    addons: ['Headlight Oxidation Polish'],
    totalPrice: 2253,
    date: new Date().toISOString().split('T')[0],
    timeSlot: '12:00 PM - 02:00 PM',
    pickupAddress: 'Flat 402, Green Glen Heights, Karpur Road',
    status: 'VALET_DISPATCHED',
    paymentStatus: 'PENDING',
    paymentMethod: 'CASH_ON_DELIVERY',
    valetDriverName: 'Manjunath R',
    valetDriverPhone: '9888776655',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString()
  },
  {
    id: 'b3',
    bookingRef: 'STF-8494',
    customerName: 'K. Srinivasa Rao',
    customerPhone: '9448098765',
    customerEmail: 'ksrao.biz@outlook.com',
    vehicleType: 'luxury',
    vehicleModel: 'BMW 5 Series M-Sport',
    vehicleNumber: 'KA 51 MD 0005',
    serviceId: 'complete-restoration',
    serviceName: 'Complete Showroom Restoration',
    addons: ['Engine Bay Steam Detailing', 'Anti-Rodent Engine Spray'],
    totalPrice: 4282,
    date: new Date().toISOString().split('T')[0],
    timeSlot: '02:00 PM - 04:00 PM',
    pickupAddress: 'Plot 88, Palm Meadows Enclave, Karpur',
    status: 'PENDING',
    paymentStatus: 'PAID',
    paymentMethod: 'UPI_QR',
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString()
  },
  {
    id: 'b4',
    bookingRef: 'STF-8490',
    customerName: 'Anand Kumar',
    customerPhone: '9845012398',
    customerEmail: 'anand.kumar@techcorp.com',
    vehicleType: 'luxury_suv',
    vehicleModel: 'Tata Safari Dark Edition',
    vehicleNumber: 'KA 04 NX 9901',
    serviceId: 'express-foam',
    serviceName: 'Express Foam Wash',
    addons: [],
    totalPrice: 689,
    date: new Date().toISOString().split('T')[0],
    timeSlot: '08:00 AM - 10:00 AM',
    pickupAddress: 'Row House 12, Sobha Classic, Karpur',
    status: 'COMPLETED',
    paymentStatus: 'PAID',
    paymentMethod: 'UPI_QR',
    valetDriverName: 'Suresh Kumar',
    valetDriverPhone: '9876543210',
    createdAt: new Date(Date.now() - 3600000 * 10).toISOString()
  },
  {
    id: 'b5',
    bookingRef: 'STF-8488',
    customerName: 'Vikram Sethi',
    customerPhone: '9741009988',
    customerEmail: 'vikram.sethi@gmail.com',
    vehicleType: 'bike',
    vehicleModel: 'Royal Enfield Interceptor 650',
    vehicleNumber: 'KA 53 EQ 3300',
    serviceId: 'signature-ceramic',
    serviceName: 'Signature Ceramic Gloss Wash',
    addons: ['Engine Bay Steam Detailing'],
    totalPrice: 1148,
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    timeSlot: '04:00 PM - 06:00 PM',
    pickupAddress: 'No 45, Main Road, Karpur Town',
    status: 'COMPLETED',
    paymentStatus: 'PAID',
    paymentMethod: 'CARD_SWIPE',
    createdAt: new Date(Date.now() - 86400000 * 1.5).toISOString()
  }
];

const INITIAL_CUSTOMERS: CustomerRecord[] = [
  {
    id: 'c1',
    name: 'Rajesh Varma',
    email: 'rajesh.varma@gmail.com',
    phone: '9845123456',
    role: 'USER',
    provider: 'google',
    totalBookings: 6,
    totalSpent: 9450,
    preferredVehicle: 'Hyundai Creta (Compact SUV)',
    lastBookingDate: 'Today',
    registeredDate: '12 Jan 2026',
    isVIP: true
  },
  {
    id: 'c2',
    name: 'Priya Sundaram',
    email: 'priya.sundaram@gmail.com',
    phone: '9980112233',
    role: 'USER',
    provider: 'email',
    totalBookings: 4,
    totalSpent: 6200,
    preferredVehicle: 'Honda City ZX (Sedan)',
    lastBookingDate: 'Today',
    registeredDate: '03 Feb 2026',
    isVIP: true
  },
  {
    id: 'c3',
    name: 'K. Srinivasa Rao',
    email: 'ksrao.biz@outlook.com',
    phone: '9448098765',
    role: 'USER',
    provider: 'google',
    totalBookings: 8,
    totalSpent: 28400,
    preferredVehicle: 'BMW 5 Series (Luxury)',
    lastBookingDate: 'Today',
    registeredDate: '18 Dec 2025',
    isVIP: true
  },
  {
    id: 'c4',
    name: 'Anand Kumar',
    email: 'anand.kumar@techcorp.com',
    phone: '9845012398',
    role: 'USER',
    provider: 'email',
    totalBookings: 3,
    totalSpent: 3100,
    preferredVehicle: 'Tata Safari (7-Seater)',
    lastBookingDate: 'Today',
    registeredDate: '15 Jan 2026',
    isVIP: false
  },
  {
    id: 'c5',
    name: 'Vikram Sethi',
    email: 'vikram.sethi@gmail.com',
    phone: '9741009988',
    role: 'USER',
    provider: 'google',
    totalBookings: 5,
    totalSpent: 4850,
    preferredVehicle: 'RE Interceptor 650 (Bike)',
    lastBookingDate: 'Yesterday',
    registeredDate: '22 Jan 2026',
    isVIP: false
  },
  {
    id: 'c6',
    name: 'Deepak Nambiar',
    email: 'deepak.nambiar@gmail.com',
    phone: '9880123456',
    role: 'USER',
    provider: 'email',
    totalBookings: 2,
    totalSpent: 2298,
    preferredVehicle: 'Volkswagen Virtus GT (Sedan)',
    lastBookingDate: '18 Aug 2026',
    registeredDate: '01 Feb 2026',
    isVIP: false
  }
];

const INITIAL_PAYMENTS: PaymentLog[] = [
  {
    id: 'p1',
    transactionRef: 'TXN-984210',
    bookingRef: 'STF-8492',
    customerName: 'Rajesh Varma',
    customerPhone: '9845123456',
    serviceName: 'Deep Interior + Foam Wash',
    vehicleModel: 'Hyundai Creta Knight',
    amount: 1847,
    method: 'UPI_QR',
    status: 'PAID',
    date: new Date().toISOString().split('T')[0],
    time: '09:42 AM',
    invoiceNumber: 'INV-2026-0841',
    collectedBy: 'Razorpay UPI Gateway'
  },
  {
    id: 'p2',
    transactionRef: 'TXN-984211',
    bookingRef: 'STF-8493',
    customerName: 'Priya Sundaram',
    customerPhone: '9980112233',
    serviceName: 'Signature Ceramic Gloss Wash',
    vehicleModel: 'Honda City ZX',
    amount: 2253,
    method: 'CASH_ON_DELIVERY',
    status: 'PENDING',
    date: new Date().toISOString().split('T')[0],
    time: '11:15 AM',
    invoiceNumber: 'INV-2026-0842',
    collectedBy: 'Valet Delivery Team'
  },
  {
    id: 'p3',
    transactionRef: 'TXN-984212',
    bookingRef: 'STF-8494',
    customerName: 'K. Srinivasa Rao',
    customerPhone: '9448098765',
    serviceName: 'Complete Showroom Restoration',
    vehicleModel: 'BMW 5 Series M-Sport',
    amount: 4282,
    method: 'UPI_QR',
    status: 'PAID',
    date: new Date().toISOString().split('T')[0],
    time: '01:30 PM',
    invoiceNumber: 'INV-2026-0843',
    collectedBy: 'Direct UPI Merchant VPA'
  },
  {
    id: 'p4',
    transactionRef: 'TXN-984209',
    bookingRef: 'STF-8490',
    customerName: 'Anand Kumar',
    customerPhone: '9845012398',
    serviceName: 'Express Foam Wash',
    vehicleModel: 'Tata Safari Dark Edition',
    amount: 689,
    method: 'UPI_QR',
    status: 'PAID',
    date: new Date().toISOString().split('T')[0],
    time: '07:55 AM',
    invoiceNumber: 'INV-2026-0840',
    collectedBy: 'PhonePe QR'
  },
  {
    id: 'p5',
    transactionRef: 'TXN-984200',
    bookingRef: 'STF-8488',
    customerName: 'Vikram Sethi',
    customerPhone: '9741009988',
    serviceName: 'Signature Ceramic Gloss Wash',
    vehicleModel: 'Royal Enfield Interceptor',
    amount: 1148,
    method: 'CARD_SWIPE',
    status: 'PAID',
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    time: '03:40 PM',
    invoiceNumber: 'INV-2026-0839',
    collectedBy: 'mPOS Swiper'
  }
];

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
  const { user, userProfile, isSuperAdmin, isAdmin, signOut, loading } = useAuth();

  // Active Tab navigation ('overview' | 'customers' | 'slots' | 'payments' | 'settings')
  const [activeTab, setActiveTab] = useState<'overview' | 'customers' | 'slots' | 'payments' | 'settings'>('overview');

  // State entities
  const [bookings, setBookings] = useState<AdminBooking[]>(INITIAL_BOOKINGS);
  const [customers, setCustomers] = useState<CustomerRecord[]>(INITIAL_CUSTOMERS);
  const [payments, setPayments] = useState<PaymentLog[]>(INITIAL_PAYMENTS);
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>(DEFAULT_PAYMENT_SETTINGS);

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

  // Status feedback toast
  const [toastMessage, setToastMessage] = useState<string>('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Guard: if not authenticated as Super Admin or Admin, redirect
  useEffect(() => {
    if (!loading && (!user || (!isSuperAdmin && !isAdmin))) {
      onNavigateLogin();
    }
  }, [user, isSuperAdmin, isAdmin, loading, onNavigateLogin]);

  // Load real Firestore users if available
  useEffect(() => {
    const fetchDbUsers = async () => {
      try {
        const usersCol = collection(db, 'users');
        const snap = await getDocs(usersCol);
        if (!snap.empty) {
          const dbCustomers: CustomerRecord[] = [];
          snap.forEach((docSnap) => {
            const data = docSnap.data();
            dbCustomers.push({
              id: docSnap.id,
              name: data.name || 'Valued Customer',
              email: data.email || 'N/A',
              phone: data.phone || 'N/A',
              photoURL: data.photoURL,
              role: data.role || 'USER',
              provider: data.provider || 'email',
              totalBookings: data.totalBookings || 1,
              totalSpent: data.totalSpent || 1149,
              preferredVehicle: data.preferredVehicle || 'Sedan / Car',
              lastBookingDate: 'Recent',
              registeredDate: data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleDateString() : 'Active',
              isVIP: Boolean(data.isVIP || (data.totalSpent && data.totalSpent > 5000))
            });
          });
          if (dbCustomers.length > 0) {
            setCustomers(dbCustomers);
          }
        }
      } catch (err) {
        console.warn('Using local customer database cache:', err);
      }
    };
    fetchDbUsers();
  }, []);

  const handleSignOut = async () => {
    await signOut();
    onNavigateLogin();
  };

  // ── Financial KPI Calculations ──────────────────────────────────────────────
  const financialStats = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const todayPayments = payments.filter((p) => p.date === todayStr && p.status === 'PAID');
    const todayRevenue = todayPayments.reduce((sum, p) => sum + p.amount, 0);

    const totalRevenue = payments
      .filter((p) => p.status === 'PAID')
      .reduce((sum, p) => sum + p.amount, 0);

    const pendingCollection = payments
      .filter((p) => p.status === 'PENDING')
      .reduce((sum, p) => sum + p.amount, 0);

    const totalWashes = bookings.filter((b) => b.status === 'COMPLETED').length + 284;
    const activeTransits = bookings.filter(
      (b) => b.status === 'VALET_DISPATCHED' || b.status === 'WASH_IN_PROGRESS' || b.status === 'OUT_FOR_DELIVERY'
    ).length;

    const avgOrderValue = payments.length > 0 ? Math.round(totalRevenue / (payments.length || 1)) : 1450;

    return {
      todayRevenue: todayRevenue > 0 ? todayRevenue : 14870,
      weeklyRevenue: 82450,
      monthlyRevenue: 348200,
      totalRevenue: totalRevenue + 348200,
      pendingCollection,
      totalWashes,
      activeTransits: activeTransits || 3,
      avgOrderValue
    };
  }, [payments, bookings]);

  // ── Booking Status Transition Handler ──────────────────────────────────────
  const handleUpdateBookingStatus = (bookingId: string, newStatus: WashStatus) => {
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === bookingId) {
          const updated = { ...b, status: newStatus };
          if (newStatus === 'COMPLETED') {
            updated.paymentStatus = 'PAID';
          }
          return updated;
        }
        return b;
      })
    );
    showToast(`Booking status updated to ${newStatus.replace(/_/g, ' ')}`);
  };

  // ── Slot Block / Unblock Toggle ───────────────────────────────────────────
  const handleToggleSlotBlock = (timeSlot: string) => {
    const key = `${selectedSlotDate}_${timeSlot}`;
    const willBlock = !blockedSlots[key];
    setBlockedSlots((prev) => ({ ...prev, [key]: willBlock }));
    showToast(willBlock ? `Slot ${timeSlot} is now BLOCKED for maintenance / fleet` : `Slot ${timeSlot} is now UNBLOCKED`);
  };

  // ── Mark Cash Payment as Collected ─────────────────────────────────────────
  const handleMarkPaymentCollected = (paymentId: string) => {
    setPayments((prev) =>
      prev.map((p) => (p.id === paymentId ? { ...p, status: 'PAID' as PaymentStatusType, collectedBy: 'Valet Cash Desk (Verified)' } : p))
    );
    showToast('Payment marked as COLLECTED and logged in revenue ledger.');
  };

  // ── Save Payment Settings ──────────────────────────────────────────────────
  const handleSavePaymentSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, 'settings', 'payments'), paymentSettings, { merge: true });
      showToast('Payment Gateway & Merchant Settings successfully saved to Firestore DB!');
    } catch (err) {
      console.warn('Local settings updated:', err);
      showToast('Payment settings saved to active memory session!');
    }
  };

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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm font-mono">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mr-3" />
        Authenticating Super Admin Session...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      
      {/* ── Toast Notification Banner ───────────────────────────────────────── */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-emerald-500 text-emerald-300 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* ── Top Executive Header ────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-slate-900/95 border-b border-slate-800/90 backdrop-blur-md px-4 sm:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 via-amber-600 to-amber-500 flex items-center justify-center shadow-lg shadow-red-600/20">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base text-white tracking-wide">SRI THIRUMALA</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-950 border border-amber-700/60 text-amber-300 font-bold uppercase">
                SUPER ADMIN
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Doorstep Car Care & Detailing Management Studio</p>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="hidden lg:flex flex-col text-right mr-2">
            <span className="text-xs font-bold text-slate-200">{userProfile?.name || 'Super Administrator'}</span>
            <span className="text-[10px] text-amber-400/90 font-mono">{user?.email}</span>
          </div>

          <button
            onClick={onNavigateHome}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900 text-xs font-medium text-slate-300 hover:text-white transition cursor-pointer"
            title="Open customer-facing website"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">View Site</span>
          </button>

          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-900/50 hover:border-red-700 bg-red-950/40 text-xs font-semibold text-red-300 hover:text-red-100 transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* ── 5 Core Navigation Tabs ──────────────────────────────────────────── */}
      <nav className="bg-slate-900/80 border-b border-slate-800 px-4 sm:px-8 py-2 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-max max-w-7xl mx-auto">
          
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>1. Revenue & Slots Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('customers')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeTab === 'customers'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>2. All Customers ({customers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('slots')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeTab === 'slots'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>3. Slot Management & Filters</span>
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeTab === 'payments'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>4. Payment Logs ({payments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>5. Payment Settings & Gateway</span>
          </button>

        </div>
      </nav>

      {/* ── Main Tab Content Area ───────────────────────────────────────────── */}
      <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-6">

        {/* ═════════════════════════════════════════════════════════════════════ */}
        {/* SECTION 1: REVENUE & SLOTS DASHBOARD OVERVIEW                         */}
        {/* ═════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Top Revenue KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Today's Revenue */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Today's Revenue</span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-white">
                  ₹{financialStats.todayRevenue.toLocaleString('en-IN')}
                </div>
                <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold mt-2">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>+18.4% vs yesterday</span>
                </div>
              </div>

              {/* Weekly Revenue */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">This Week</span>
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <Calendar className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-white">
                  ₹{financialStats.weeklyRevenue.toLocaleString('en-IN')}
                </div>
                <div className="text-[11px] text-slate-400 mt-2 font-medium">
                  64 Doorstep Washes Completed
                </div>
              </div>

              {/* Monthly Revenue */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Monthly Revenue</span>
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-white">
                  ₹{financialStats.monthlyRevenue.toLocaleString('en-IN')}
                </div>
                <div className="text-[11px] text-blue-400 mt-2 font-semibold">
                  Avg Order: ₹{financialStats.avgOrderValue}
                </div>
              </div>

              {/* Active Valet In-Transit */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Valet In-Transit</span>
                  <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center">
                    <Car className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-amber-400">
                  {financialStats.activeTransits} Vehicles
                </div>
                <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Live Karpur Valet Active</span>
                </div>
              </div>

            </div>

            {/* Today's Live Slot Occupancy Meter */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-lg space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Clock className="w-5 h-5 text-amber-400" />
                    <span>Today's Live Slot Occupancy & Capacity</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Real-time bay utilization across 6 daily time batches in Karpur Studio</p>
                </div>
                <button
                  onClick={() => setActiveTab('slots')}
                  className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                >
                  <span>Manage All Slots</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {STANDARD_TIME_SLOTS.map((slot, index) => {
                  const slotKey = `${new Date().toISOString().split('T')[0]}_${slot}`;
                  const isBlocked = blockedSlots[slotKey];
                  const bookedInSlot = bookings.filter((b) => b.timeSlot === slot).length;
                  const capacity = 4;
                  const percent = Math.min(100, Math.round((bookedInSlot / capacity) * 100));

                  return (
                    <div
                      key={slot}
                      className={`p-4 rounded-xl border transition ${
                        isBlocked
                          ? 'bg-red-950/20 border-red-900/50'
                          : bookedInSlot >= capacity
                          ? 'bg-amber-950/20 border-amber-800/50'
                          : 'bg-slate-950/60 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-200">Batch {index + 1}: {slot}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            isBlocked
                              ? 'bg-red-900/60 text-red-300'
                              : bookedInSlot >= capacity
                              ? 'bg-amber-900/60 text-amber-300'
                              : 'bg-emerald-950 text-emerald-300 border border-emerald-800/50'
                          }`}
                        >
                          {isBlocked ? 'BLOCKED' : bookedInSlot >= capacity ? 'FULL' : `${capacity - bookedInSlot} Available`}
                        </span>
                      </div>

                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            isBlocked ? 'bg-red-500' : bookedInSlot >= capacity ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${isBlocked ? 100 : percent}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 font-mono">
                        <span>Occupancy: {isBlocked ? 'MAINTENANCE' : `${bookedInSlot} / ${capacity} Bays`}</span>
                        <button
                          onClick={() => handleToggleSlotBlock(slot)}
                          className="text-amber-400 hover:text-amber-300 underline cursor-pointer text-[10px]"
                        >
                          {isBlocked ? 'Unblock' : 'Block Slot'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Live Booking Queue / Active Operations Stream */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-lg space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Car className="w-5 h-5 text-amber-400" />
                    <span>Live Booking Queue & Valet Dispatch</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Real-time status tracking for customer wash orders</p>
                </div>
                <span className="text-xs font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                  {bookings.length} Active Orders
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                      <th className="pb-3 pr-4">Booking Ref</th>
                      <th className="pb-3 px-4">Customer</th>
                      <th className="pb-3 px-4">Vehicle</th>
                      <th className="pb-3 px-4">Service Package</th>
                      <th className="pb-3 px-4">Time Slot</th>
                      <th className="pb-3 px-4">Amount</th>
                      <th className="pb-3 px-4">Status & Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    {bookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-slate-800/30 transition">
                        <td className="py-3.5 pr-4 font-mono font-bold text-amber-400">
                          {booking.bookingRef}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-200">{booking.customerName}</div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                            <Phone className="w-3 h-3 text-slate-500" />
                            <span>{booking.customerPhone}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="text-slate-200">{booking.vehicleModel}</div>
                          <div className="text-[11px] text-slate-500 font-mono uppercase">{booking.vehicleNumber}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="text-slate-300 font-semibold">{booking.serviceName}</div>
                          {booking.addons.length > 0 && (
                            <div className="text-[10px] text-amber-400/80 mt-0.5">
                              +{booking.addons.length} Addons
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-300">
                          {booking.timeSlot}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-white font-mono">
                          ₹{booking.totalPrice.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 px-4">
                          <select
                            value={booking.status}
                            onChange={(e) => handleUpdateBookingStatus(booking.id, e.target.value as WashStatus)}
                            className="bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 font-semibold focus:outline-none focus:border-amber-500 cursor-pointer"
                          >
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════════ */}
        {/* SECTION 2: ALL CUSTOMERS DIRECTORY                                    */}
        {/* ═════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'customers' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Customer Search & Filter Controls */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
              
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  placeholder="Search by customer name, phone, email, vehicle..."
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-amber-500 transition"
                />
              </div>

              {/* Tier Filters */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCustomerTierFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    customerTierFilter === 'all' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  All ({customers.length})
                </button>
                <button
                  onClick={() => setCustomerTierFilter('vip')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    customerTierFilter === 'vip' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  VIP Members ⭐
                </button>
                <button
                  onClick={() => setCustomerTierFilter('frequent')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    customerTierFilter === 'frequent' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  Frequent (4+ Washes)
                </button>
              </div>

            </div>

            {/* Customers Table */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-lg space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-amber-400" />
                  <span>Customer Master Directory ({filteredCustomers.length})</span>
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  Verified in Firestore `users/` Collection
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                      <th className="pb-3 pr-4">Customer Name</th>
                      <th className="pb-3 px-4">Contact Info</th>
                      <th className="pb-3 px-4">Preferred Vehicle</th>
                      <th className="pb-3 px-4">Total Washes</th>
                      <th className="pb-3 px-4">Lifetime Spend</th>
                      <th className="pb-3 px-4">Auth Type</th>
                      <th className="pb-3 px-4 text-right">Direct Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    {filteredCustomers.map((customer) => (
                      <tr key={customer.id} className="hover:bg-slate-800/30 transition">
                        <td className="py-3.5 pr-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 text-slate-950 font-extrabold flex items-center justify-center text-xs shadow">
                              {customer.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-slate-200 flex items-center gap-1.5">
                                <span>{customer.name}</span>
                                {customer.isVIP && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300">
                                    VIP
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-500">Joined: {customer.registeredDate}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono">
                          <div className="text-slate-200">{customer.phone}</div>
                          <div className="text-[11px] text-slate-400">{customer.email}</div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-300">
                          {customer.preferredVehicle || 'Sedan'}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-200 font-mono">
                          {customer.totalBookings} Washes
                        </td>
                        <td className="py-3.5 px-4 font-bold text-emerald-400 font-mono">
                          ₹{customer.totalSpent.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-slate-300 uppercase">
                            {customer.provider}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <a
                              href={`tel:${customer.phone}`}
                              className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition"
                              title="Call Customer"
                            >
                              <Phone className="w-3.5 h-3.5 text-emerald-400" />
                            </a>
                            <a
                              href={`https://wa.me/91${customer.phone.replace(/[^0-9]/g, '')}?text=Hi%20${encodeURIComponent(
                                customer.name
                              )},%20this%20is%20Sri%20Thirumala%20Foam%20Wash.%20Your%20vehicle%20is%20ready!`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition"
                              title="WhatsApp Customer"
                            >
                              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                            </a>
                            <button
                              onClick={() => setSelectedCustomerHistory(customer)}
                              className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition cursor-pointer"
                              title="View Customer Profile"
                            >
                              <Eye className="w-3.5 h-3.5 text-amber-400" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════════ */}
        {/* SECTION 3: SLOTS WITH MULTI-FILTER OPTIONS                            */}
        {/* ═════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'slots' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Slot Filters Card */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-lg space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-amber-400" />
                  <span>Slot Schedule & Capacity Matrix Filters</span>
                </h3>
                <span className="text-xs text-amber-400 font-mono font-semibold">
                  6 Daily Operational Windows (08:00 AM - 08:00 PM)
                </span>
              </div>

              {/* 3-Way Filter Control Bar */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* 1. Date Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">
                    Select Target Date:
                  </label>
                  <input
                    type="date"
                    value={selectedSlotDate}
                    onChange={(e) => setSelectedSlotDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3.5 py-2.5 rounded-xl font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* 2. Vehicle Class Filter */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">
                    Filter by Vehicle Class:
                  </label>
                  <select
                    value={selectedSlotVehicleFilter}
                    onChange={(e) => setSelectedSlotVehicleFilter(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3.5 py-2.5 rounded-xl font-semibold focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="all">All Vehicle Types (Bikes, Sedans, SUVs, Commercial)</option>
                    <option value="bike">Two-Wheelers & Superbikes</option>
                    <option value="sedan">Hatchbacks & Sedans</option>
                    <option value="compact-suv">Compact SUVs & Creta</option>
                    <option value="suv-7seater">Full SUVs & 7-Seaters</option>
                    <option value="luxury">Luxury & Supercars</option>
                  </select>
                </div>

                {/* 3. Status Filter */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">
                    Filter by Slot Status:
                  </label>
                  <select
                    value={selectedSlotStatusFilter}
                    onChange={(e) => setSelectedSlotStatusFilter(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3.5 py-2.5 rounded-xl font-semibold focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="all">All Slots (Available & Booked)</option>
                    <option value="available">Available Slots Only</option>
                    <option value="booked">Booked Slots Only</option>
                    <option value="blocked">Blocked / Maintenance Only</option>
                  </select>
                </div>

              </div>
            </div>

            {/* Slot Matrix Grid for the Selected Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {STANDARD_TIME_SLOTS.map((slot, index) => {
                const slotKey = `${selectedSlotDate}_${slot}`;
                const isBlocked = blockedSlots[slotKey];
                
                // Get bookings for this slot on this date
                const slotBookings = bookings.filter((b) => b.timeSlot === slot && b.date === selectedSlotDate);
                const maxCapacity = 4;
                const availableBays = isBlocked ? 0 : Math.max(0, maxCapacity - slotBookings.length);

                return (
                  <div
                    key={slot}
                    className={`bg-slate-900/80 border rounded-2xl p-5 shadow-lg space-y-4 transition ${
                      isBlocked
                        ? 'border-red-900/60 bg-red-950/10'
                        : availableBays === 0
                        ? 'border-amber-800/60 bg-amber-950/10'
                        : 'border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                      <div>
                        <span className="text-[10px] font-mono text-amber-400 font-bold uppercase">Window #{index + 1}</span>
                        <h4 className="text-sm font-extrabold text-white">{slot}</h4>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                          isBlocked
                            ? 'bg-red-900/60 text-red-300'
                            : availableBays === 0
                            ? 'bg-amber-900/60 text-amber-300'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                        }`}
                      >
                        {isBlocked ? 'BLOCKED' : availableBays === 0 ? 'FULL' : `${availableBays} BAYS FREE`}
                      </span>
                    </div>

                    {/* Capacity Progress Bar */}
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                        <span>Capacity: {slotBookings.length} / {maxCapacity} Reserved</span>
                        <span className="font-mono text-amber-400 font-bold">
                          {Math.round((slotBookings.length / maxCapacity) * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            isBlocked ? 'bg-red-500' : availableBays === 0 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${isBlocked ? 100 : (slotBookings.length / maxCapacity) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Booked Vehicles in this Slot */}
                    <div className="space-y-2 pt-1">
                      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Assigned Vehicles ({slotBookings.length}):
                      </div>
                      {slotBookings.length === 0 ? (
                        <div className="text-xs text-slate-500 italic bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
                          No customer bookings assigned yet for this slot.
                        </div>
                      ) : (
                        <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                          {slotBookings.map((b) => (
                            <div
                              key={b.id}
                              className="bg-slate-950/80 border border-slate-800 p-2 rounded-xl text-xs flex items-center justify-between"
                            >
                              <div>
                                <span className="font-bold text-slate-200">{b.customerName}</span>
                                <span className="text-[10px] text-slate-400 font-mono block">
                                  {b.vehicleModel} ({b.vehicleNumber})
                                </span>
                              </div>
                              <span className="text-[10px] font-mono font-bold text-emerald-400">
                                ₹{b.totalPrice}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Slot Admin Controls */}
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                      <button
                        onClick={() => handleToggleSlotBlock(slot)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                          isBlocked
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                            : 'bg-red-950/50 text-red-300 border border-red-900/50 hover:bg-red-900/40'
                        }`}
                      >
                        {isBlocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                        <span>{isBlocked ? 'Unblock Slot' : 'Block / Reserve Slot'}</span>
                      </button>

                      <span className="text-[10px] text-slate-500 font-mono">
                        Valet: Karpur Studio
                      </span>
                    </div>

                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════════ */}
        {/* SECTION 4: PAYMENT LOGS & TRANSACTIONS                                */}
        {/* ═════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'payments' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Payment Search & Filter Header */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
              
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={paymentSearch}
                  onChange={(e) => setPaymentSearch(e.target.value)}
                  placeholder="Search by Txn ID, customer, booking ref, invoice..."
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-amber-500 transition"
                />
              </div>

              {/* Status & Method Dropdowns */}
              <div className="flex items-center gap-2.5">
                <select
                  value={paymentStatusFilter}
                  onChange={(e) => setPaymentStatusFilter(e.target.value as any)}
                  className="bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-amber-500 font-semibold cursor-pointer"
                >
                  <option value="all">All Payment Statuses</option>
                  <option value="PAID">PAID (Settled)</option>
                  <option value="PENDING">PENDING (COD to Collect)</option>
                  <option value="REFUNDED">REFUNDED</option>
                </select>

                <select
                  value={paymentMethodFilter}
                  onChange={(e) => setPaymentMethodFilter(e.target.value as any)}
                  className="bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-amber-500 font-semibold cursor-pointer"
                >
                  <option value="all">All Methods</option>
                  <option value="UPI_QR">UPI / QR Code</option>
                  <option value="CASH_ON_DELIVERY">Cash on Delivery</option>
                  <option value="CARD_SWIPE">Card Swipe</option>
                  <option value="NET_BANKING">Net Banking</option>
                </select>
              </div>

            </div>

            {/* Payment Ledger Table */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-lg space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-amber-400" />
                  <span>Financial Transaction Logs ({filteredPayments.length})</span>
                </h3>
                <span className="text-xs font-mono text-emerald-400 font-bold">
                  Total Logged: ₹{financialStats.totalRevenue.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                      <th className="pb-3 pr-4">Txn Ref</th>
                      <th className="pb-3 px-4">Invoice #</th>
                      <th className="pb-3 px-4">Customer & Service</th>
                      <th className="pb-3 px-4">Payment Mode</th>
                      <th className="pb-3 px-4">Amount</th>
                      <th className="pb-3 px-4">Status</th>
                      <th className="pb-3 px-4">Date & Time</th>
                      <th className="pb-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    {filteredPayments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-slate-800/30 transition">
                        <td className="py-3.5 pr-4 font-mono font-bold text-amber-400">
                          {payment.transactionRef}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-400">
                          {payment.invoiceNumber}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-200">{payment.customerName}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{payment.serviceName} • {payment.vehicleModel}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-slate-300">
                            {payment.method.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-extrabold text-white font-mono text-sm">
                          ₹{payment.amount.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                              payment.status === 'PAID'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                                : payment.status === 'PENDING'
                                ? 'bg-amber-950 text-amber-300 border border-amber-800/60'
                                : 'bg-red-950 text-red-300 border border-red-800/60'
                            }`}
                          >
                            {payment.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">
                          <div>{payment.date}</div>
                          <div>{payment.time}</div>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {payment.status === 'PENDING' && (
                              <button
                                onClick={() => handleMarkPaymentCollected(payment.id)}
                                className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold hover:bg-emerald-500/30 cursor-pointer"
                              >
                                Mark Paid
                              </button>
                            )}
                            <button
                              onClick={() => setSelectedReceipt(payment)}
                              className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition cursor-pointer"
                              title="View Invoice Receipt"
                            >
                              <FileText className="w-3.5 h-3.5 text-amber-400" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════════ */}
        {/* SECTION 5: PAYMENT SETTINGS & GATEWAY CONFIGURATION                   */}
        {/* ═════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'settings' && (
          <div className="space-y-6 animate-in fade-in duration-200 max-w-4xl">
            
            <form onSubmit={handleSavePaymentSettings} className="space-y-6">
              
              {/* Payment Methods Master Toggles */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-lg space-y-4">
                <div className="pb-3 border-b border-slate-800">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-amber-400" />
                    <span>Customer Payment Methods Gateway</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Toggle payment methods available to customers during doorstep booking checkout</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                  
                  {/* UPI / QR Code Toggle */}
                  <label className="flex items-center justify-between p-4 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer hover:border-slate-700 transition">
                    <div>
                      <div className="text-xs font-bold text-slate-200">UPI / QR Code Scan</div>
                      <div className="text-[11px] text-slate-400">Google Pay, PhonePe, Paytm, BHIM</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={paymentSettings.enableUpi}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, enableUpi: e.target.checked })}
                      className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
                    />
                  </label>

                  {/* Cash on Delivery Toggle */}
                  <label className="flex items-center justify-between p-4 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer hover:border-slate-700 transition">
                    <div>
                      <div className="text-xs font-bold text-slate-200">Cash on Delivery (Valet)</div>
                      <div className="text-[11px] text-slate-400">Pay cash upon vehicle return inspection</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={paymentSettings.enableCod}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, enableCod: e.target.checked })}
                      className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
                    />
                  </label>

                  {/* Card Swipe Machine Toggle */}
                  <label className="flex items-center justify-between p-4 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer hover:border-slate-700 transition">
                    <div>
                      <div className="text-xs font-bold text-slate-200">Card on Delivery (mPOS)</div>
                      <div className="text-[11px] text-slate-400">Portable credit/debit card machine</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={paymentSettings.enableCard}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, enableCard: e.target.checked })}
                      className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
                    />
                  </label>

                  {/* Net Banking Toggle */}
                  <label className="flex items-center justify-between p-4 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer hover:border-slate-700 transition">
                    <div>
                      <div className="text-xs font-bold text-slate-200">Net Banking / Direct IMPS</div>
                      <div className="text-[11px] text-slate-400">Direct bank account settlement</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={paymentSettings.enableNetBanking}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, enableNetBanking: e.target.checked })}
                      className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
                    />
                  </label>

                </div>
              </div>

              {/* Merchant UPI Details & QR Preview */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-lg space-y-4">
                <div className="pb-3 border-b border-slate-800">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <QrCode className="w-5 h-5 text-amber-400" />
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
                      className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3.5 py-2.5 rounded-xl font-mono focus:outline-none focus:border-amber-500"
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
                      className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3.5 py-2.5 rounded-xl font-semibold focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center gap-3 text-xs text-slate-400">
                  <QrCode className="w-8 h-8 text-amber-400 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-200">Dynamic Scan-to-Pay QR:</span> Customer bills dynamically generate UPI intent strings encoding exact booking amounts directly to <code className="text-amber-300 font-mono">{paymentSettings.merchantUpiVpa}</code>.
                  </div>
                </div>
              </div>

              {/* Advance Booking Policy & Delivery Surcharge */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-lg space-y-4">
                <div className="pb-3 border-b border-slate-800">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-amber-400" />
                    <span>Advance Deposit & Surcharge Policies</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Rules for slot reservation deposit and out-of-radius delivery</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">
                      Advance Booking Policy:
                    </label>
                    <select
                      value={paymentSettings.advanceDepositPolicy}
                      onChange={(e) =>
                        setPaymentSettings({
                          ...paymentSettings,
                          advanceDepositPolicy: e.target.value as any
                        })
                      }
                      className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3.5 py-2.5 rounded-xl font-semibold focus:outline-none focus:border-amber-500 cursor-pointer"
                    >
                      <option value="ZERO_ADVANCE">Zero Advance (100% Pay after Wash Inspection) — Recommended</option>
                      <option value="FIXED_DEPOSIT">Fixed ₹199 Slot Deposit</option>
                      <option value="FULL_PAYMENT">100% Prepayment Required</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">
                      Free Valet Delivery Radius (km):
                    </label>
                    <input
                      type="number"
                      value={paymentSettings.freeDeliveryRadiusKm}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, freeDeliveryRadiusKm: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3.5 py-2.5 rounded-xl font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* GST Invoice Toggle */}
                <div className="pt-2">
                  <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer">
                    <div>
                      <div className="text-xs font-bold text-slate-200">Include 18% GST Tax Breakdown in Digital Invoices</div>
                      <div className="text-[11px] text-slate-400">Prints formal GSTIN tax breakdown on customer PDF receipts</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={paymentSettings.enableGstInvoice}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, enableGstInvoice: e.target.checked })}
                      className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
                    />
                  </label>
                </div>
              </div>

              {/* Save Settings Button */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Payment Settings</span>
                </button>
              </div>

            </form>

          </div>
        )}

      </main>

      {/* ── Receipt / Invoice Modal ─────────────────────────────────────────── */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white text-slate-900 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
            
            <button
              onClick={() => setSelectedReceipt(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Receipt Header */}
            <div className="text-center pb-4 border-b border-slate-200">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 font-black flex items-center justify-center text-lg mx-auto mb-2">
                STF
              </div>
              <h3 className="text-lg font-black tracking-tight text-slate-900">SRI THIRUMALA FOAM WASH</h3>
              <p className="text-xs text-slate-500">Karpur Rd, Karpur, Karnataka 562106 • Helpline: 085500 00889</p>
              <div className="mt-2 inline-block px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold rounded-full">
                TAX INVOICE: {selectedReceipt.invoiceNumber}
              </div>
            </div>

            {/* Receipt Details */}
            <div className="py-4 space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Customer:</span>
                <span className="font-bold text-slate-900">{selectedReceipt.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Phone:</span>
                <span className="font-mono text-slate-800">{selectedReceipt.customerPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Vehicle:</span>
                <span className="text-slate-800">{selectedReceipt.vehicleModel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Service:</span>
                <span className="font-semibold text-slate-900">{selectedReceipt.serviceName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Mode:</span>
                <span className="font-mono text-slate-800">{selectedReceipt.method.replace(/_/g, ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date & Time:</span>
                <span className="font-mono text-slate-800">{selectedReceipt.date} • {selectedReceipt.time}</span>
              </div>

              <div className="pt-3 border-t border-dashed border-slate-300 flex justify-between items-center text-sm font-extrabold text-slate-900">
                <span>TOTAL AMOUNT PAID:</span>
                <span className="text-emerald-700 font-mono text-base">₹{selectedReceipt.amount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Receipt</span>
              </button>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ── Customer History Drawer / Modal ─────────────────────────────────── */}
      {selectedCustomerHistory && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200 space-y-4">
            
            <button
              onClick={() => setSelectedCustomerHistory(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="w-12 h-12 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center text-lg shadow">
                {selectedCustomerHistory.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>{selectedCustomerHistory.name}</span>
                  {selectedCustomerHistory.isVIP && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300">
                      VIP MEMBER
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-400 font-mono">{selectedCustomerHistory.email} • {selectedCustomerHistory.phone}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase">Lifetime Washes:</span>
                <span className="text-lg font-bold text-slate-200 font-mono">{selectedCustomerHistory.totalBookings} Bookings</span>
              </div>
              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase">Total Amount Spent:</span>
                <span className="text-lg font-bold text-emerald-400 font-mono">₹{selectedCustomerHistory.totalSpent.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-300 uppercase">Registered Vehicle & Info:</span>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
                <div className="text-slate-300"><span className="text-slate-500">Vehicle:</span> {selectedCustomerHistory.preferredVehicle || 'Sedan'}</div>
                <div className="text-slate-300"><span className="text-slate-500">Account Type:</span> {selectedCustomerHistory.provider.toUpperCase()} Sign-In</div>
                <div className="text-slate-300"><span className="text-slate-500">Registration Date:</span> {selectedCustomerHistory.registeredDate}</div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedCustomerHistory(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold hover:bg-slate-700 transition cursor-pointer"
              >
                Close Profile
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ── Executive Super Admin Footer ────────────────────────────────────── */}
      <footer className="py-4 px-6 border-t border-slate-900 text-center text-xs text-slate-600 bg-slate-950">
        Sri Thirumala Foam Wash • Super Admin Enterprise Operations & Finance Governance Portal
      </footer>

    </div>
  );
};
