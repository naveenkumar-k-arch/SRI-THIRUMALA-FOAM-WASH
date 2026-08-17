import React, { useState } from 'react';
import { X, Building2, CheckCircle2 } from 'lucide-react';

interface FleetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FleetModal: React.FC<FleetModalProps> = ({ isOpen, onClose }) => {
  const [companyName, setCompanyName] = useState('');
  const [fleetSize, setFleetSize] = useState('5 - 15 vehicles');
  const [businessType, setBusinessType] = useState('Taxi / Cab Service');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSent, setIsSent] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSent(true);
    setTimeout(() => {
      setIsSent(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-left animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-600 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-['Outfit']">
                Fleet & B2B Wash Inquiry
              </h3>
              <p className="text-xs text-slate-300">
                Custom billing & recurring fleet maintenance
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isSent ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 font-['Outfit']">
                Inquiry Received!
              </h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Our Fleet Account Manager will call you within 30 minutes with customized corporate rate slabs.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Company / Organization Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Skyline Cabs / Horizon Tours"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-red-500 outline-none text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Fleet Size *
                  </label>
                  <select
                    value={fleetSize}
                    onChange={(e) => setFleetSize(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-red-500 outline-none text-sm bg-white"
                  >
                    <option value="2 - 5 vehicles">2 - 5 vehicles</option>
                    <option value="5 - 15 vehicles">5 - 15 vehicles</option>
                    <option value="15 - 50 vehicles">15 - 50 vehicles</option>
                    <option value="50+ vehicles">50+ vehicles</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Business Type *
                  </label>
                  <select
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-red-500 outline-none text-sm bg-white"
                  >
                    <option value="Taxi / Cab Service">Taxi / Cab Service</option>
                    <option value="Car Rental Company">Car Rental Company</option>
                    <option value="Hotel / Resort Shuttle">Hotel / Resort Shuttle</option>
                    <option value="Used Car Dealership">Used Car Dealership</option>
                    <option value="Corporate Fleet">Corporate Fleet</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Contact Person Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Your name"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-red-500 outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Phone / Mobile *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-red-500 outline-none text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-red-600 text-white font-bold text-sm shadow-md transition-all cursor-pointer mt-2"
              >
                Submit Fleet Proposal Request
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
