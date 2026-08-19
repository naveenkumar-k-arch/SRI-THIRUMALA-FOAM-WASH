import React, { useState } from 'react';
import { Car, Briefcase, Truck, Bike, Phone, ArrowRight, HelpCircle, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';
import { COMPANY_INFO } from '../data/carWashData';

interface VehicleItem {
  id: string;
  name: string;
  category: 'cars' | 'commercial' | 'other' | 'two_wheelers';
  categoryLabel: string;
  example: string;
  imageUrl: string;
  icon: any;
}

export const FleetSolutions: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'cars' | 'commercial' | 'other' | 'two_wheelers'>('all');

  const allVehicles: VehicleItem[] = [
    // 1. CARS
    {
      id: 'hatchback',
      name: 'Hatchback',
      category: 'cars',
      categoryLabel: 'Cars',
      example: 'Swift, i20, Baleno, Polo, Tiago',
      imageUrl: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=700&q=80',
      icon: Car
    },
    {
      id: 'sedan',
      name: 'Sedan',
      category: 'cars',
      categoryLabel: 'Cars',
      example: 'City, Verna, Ciaz, Slavia, Virtus',
      imageUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=700&q=80',
      icon: Car
    },
    {
      id: 'suv',
      name: 'SUV',
      category: 'cars',
      categoryLabel: 'Cars',
      example: 'Creta, Seltos, Brezza, Thar, Harrier',
      imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=700&q=80',
      icon: Car
    },
    {
      id: 'muv',
      name: 'MUV',
      category: 'cars',
      categoryLabel: 'Cars',
      example: 'Innova, Ertiga, Carens, Triber, XL6',
      imageUrl: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=700&q=80',
      icon: Car
    },
    {
      id: 'luxury',
      name: 'Luxury / Premium Cars',
      category: 'cars',
      categoryLabel: 'Cars',
      example: 'BMW, Mercedes-Benz, Audi, Jaguar, Porsche',
      imageUrl: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=700&q=80',
      icon: Sparkles
    },

    // 2. COMMERCIAL CARS
    {
      id: 'taxi_cab',
      name: 'Taxi / Cab',
      category: 'commercial',
      categoryLabel: 'Commercial Cars',
      example: 'City cabs, airport taxis, app fleets',
      imageUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=700&q=80',
      icon: Briefcase
    },
    {
      id: 'travel_cars',
      name: 'Travel Cars',
      category: 'commercial',
      categoryLabel: 'Commercial Cars',
      example: 'Outstation tourist cars & tourer fleets',
      imageUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=700&q=80',
      icon: Briefcase
    },
    {
      id: 'rental_cars',
      name: 'Rental Cars',
      category: 'commercial',
      categoryLabel: 'Commercial Cars',
      example: 'Self-drive rentals & corporate leasing',
      imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=700&q=80',
      icon: Briefcase
    },

    // 3. OTHER VEHICLES
    {
      id: 'vans',
      name: 'Vans',
      category: 'other',
      categoryLabel: 'Other Vehicles',
      example: 'Passenger vans, Omni, Eeco, Traveller',
      imageUrl: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=700&q=80',
      icon: Truck
    },
    {
      id: 'small_commercial',
      name: 'Small Commercial Vehicles',
      category: 'other',
      categoryLabel: 'Other Vehicles',
      example: 'Pickup trucks, utility vehicles, Ace',
      imageUrl: 'https://images.unsplash.com/photo-1559297434-fae8a1916a79?auto=format&fit=crop&w=700&q=80',
      icon: Truck
    },

    // 4. TWO-WHEELERS
    {
      id: 'motorcycles',
      name: 'Motorcycles',
      category: 'two_wheelers',
      categoryLabel: 'Two-Wheelers',
      example: 'Street bikes, cruisers, sport bikes, Royal Enfield',
      imageUrl: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=700&q=80',
      icon: Bike
    },
    {
      id: 'scooters',
      name: 'Scooters',
      category: 'two_wheelers',
      categoryLabel: 'Two-Wheelers',
      example: 'Activa, Jupiter, Access, EV scooters',
      imageUrl: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=700&q=80',
      icon: Bike
    }
  ];

  const filteredVehicles = activeFilter === 'all'
    ? allVehicles
    : allVehicles.filter(v => v.category === activeFilter);

  const filterTabs = [
    { id: 'all', label: 'All Vehicles', count: allVehicles.length },
    { id: 'cars', label: 'Cars', count: 5 },
    { id: 'commercial', label: 'Commercial Cars', count: 3 },
    { id: 'other', label: 'Other Vehicles', count: 2 },
    { id: 'two_wheelers', label: 'Two-Wheelers', count: 2 }
  ];

  return (
    <section id="fleet" className="py-16 sm:py-24 bg-white relative border-b border-slate-200 text-left overflow-hidden w-full max-w-full font-sans">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold tracking-wide mb-2.5">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>VEHICLES WE WASH</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-['Outfit'] leading-tight">
            From Everyday Cars to Premium Luxury, <br className="hidden sm:inline" />
            <span className="text-red-600">We Keep Your Ride Spotless & Protected.</span>
          </h2>
          <p className="mt-2 text-slate-600 text-xs sm:text-sm font-normal">
            Custom high-foam washing and deep detailing available for all classes of vehicles.
          </p>
        </div>

        {/* Category Filter Tabs - scrollable on mobile */}
        <div className="flex justify-start sm:justify-center gap-2 sm:gap-2.5 mb-10 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 flex-nowrap sm:flex-wrap">
          {filterTabs.map((tab) => {
            const isSelected = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id as any)}
                className={`px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 cursor-pointer flex items-center gap-2 flex-shrink-0 whitespace-nowrap ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-sm border border-slate-900'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Individual Vehicle Photo Cards Grid with 3D Depth */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5 perspective-container">
          {filteredVehicles.map((veh) => {
            const Icon = veh.icon;
            return (
              <div
                key={veh.id}
                className="group rounded-2xl bg-white border border-slate-200 card-3d overflow-hidden flex flex-col justify-between cursor-default"
              >
                <div>
                  {/* Vehicle Image */}
                  <div className="relative h-28 sm:h-44 w-full overflow-hidden bg-slate-100">
                    <img
                      src={veh.imageUrl}
                      alt={veh.name}
                      className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent"></div>

                    {/* Category Label Badge */}
                    <div className="absolute top-2 left-2 sm:top-3 sm:left-3 depth-pop">
                      <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-white/95 backdrop-blur-md border border-slate-200 text-slate-900 flex items-center gap-1 shadow-xs">
                        <Icon className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-red-600" />
                        <span className="hidden sm:inline">{veh.categoryLabel}</span>
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-3 sm:p-4">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 font-['Outfit'] group-hover:text-red-600 transition-colors leading-tight">
                      {veh.name}
                    </h3>
                    <p className="text-[10px] sm:text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
                      {veh.example}
                    </p>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="px-3 pb-3 sm:px-4 sm:pb-4 pt-0">
                  <div className="pt-2 sm:pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] sm:text-[11px] font-semibold text-slate-500">
                    <span className="flex items-center gap-1 text-slate-700">
                      <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600" />
                      <span>Valet Transit</span>
                    </span>
                    <span className="text-red-600 font-bold">Snow Foam</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Website CTA Banner: "Not sure if we wash your vehicle?" */}
        <div className="mt-14 p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-left">
            <div className="w-11 h-11 rounded-2xl bg-red-600/20 border border-red-500/30 text-red-400 flex items-center justify-center flex-shrink-0">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-bold font-['Outfit']">
                Have a special vehicle or custom fleet?
              </h4>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Contact our detailing team in Karpur for custom commercial pricing and special treatments.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <a
              href="#contact"
              className="flex-1 md:flex-initial px-5 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-1.5"
            >
              <span>Contact Team</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            <a
              href={`tel:${COMPANY_INFO.phone}`}
              className="flex-1 md:flex-initial px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm border border-slate-700 transition-all flex items-center justify-center gap-1.5"
            >
              <Phone className="w-4 h-4 text-slate-300" />
              <span>Call Hub</span>
            </a>
          </div>
        </div>

      </div>
    </section>
  );
};
