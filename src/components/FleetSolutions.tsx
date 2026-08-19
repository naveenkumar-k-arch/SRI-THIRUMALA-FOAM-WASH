import React, { useState } from 'react';
import { Car, Briefcase, Truck, Bike, Phone, ArrowRight, HelpCircle, Sparkles, CheckCircle2 } from 'lucide-react';
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
    <section id="fleet" className="py-20 sm:py-24 bg-[#030712] relative border-b border-white/10 text-left overflow-hidden">
      
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs sm:text-sm font-black uppercase tracking-[0.25em] text-orange-400 font-['Outfit'] block mb-2 drop-shadow-sm">
            VEHICLES WE WASH
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight font-['Outfit'] leading-tight">
            From Everyday Cars to Premium Vehicles, <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-orange-400 to-amber-300">
              We Help Keep Your Ride Clean, Fresh & Shining.
            </span>
          </h2>
        </div>

        {/* Category Filter Tabs - scrollable on mobile */}
        <div className="flex justify-start sm:justify-center gap-2 sm:gap-3 mb-10 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 flex-nowrap sm:flex-wrap">
          {filterTabs.map((tab) => {
            const isSelected = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id as any)}
                className={`px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 cursor-pointer flex items-center gap-1.5 flex-shrink-0 whitespace-nowrap ${
                  isSelected
                    ? 'bg-red-600 text-white shadow-lg shadow-red-500/30 border border-red-400'
                    : 'bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/10'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-white/10 text-slate-400'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Individual Vehicle Photo Cards Grid - 2 col on mobile */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
          {filteredVehicles.map((veh) => {
            const Icon = veh.icon;
            return (
              <div
                key={veh.id}
                className="group rounded-2xl sm:rounded-3xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-red-400/40 transition-all duration-300 overflow-hidden flex flex-col justify-between shadow-xl"
              >
                <div>
                  {/* Vehicle Image - shorter on mobile */}
                  <div className="relative h-28 sm:h-44 w-full overflow-hidden bg-slate-900">
                    <img
                      src={veh.imageUrl}
                      alt={veh.name}
                      className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-[#030712]/30 to-transparent"></div>

                    {/* Category Label Badge */}
                    <div className="absolute top-2 left-2 sm:top-3.5 sm:left-3.5">
                      <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-amber-300 flex items-center gap-1 shadow-md">
                        <Icon className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-orange-400" />
                        <span className="hidden sm:inline">{veh.categoryLabel}</span>
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-3 sm:p-5">
                    <h3 className="text-sm sm:text-lg font-black text-white font-['Outfit'] group-hover:text-amber-300 transition-colors leading-tight">
                      {veh.name}
                    </h3>
                    <p className="text-[10px] sm:text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">
                      {veh.example}
                    </p>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="px-3 pb-3 sm:p-5 sm:pt-0">
                  <div className="pt-2 sm:pt-3 border-t border-white/10 flex items-center justify-between text-[10px] sm:text-[11px] font-bold text-slate-400">
                    <span className="flex items-center gap-1 text-slate-300">
                      <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-400" />
                      <span>Pickup</span>
                    </span>
                    <span className="text-orange-400">Foam Wash</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Website CTA Banner: "Not sure if we wash your vehicle?" */}
        <div className="mt-16 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-red-950 via-slate-900 to-red-900 border border-white/15 text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-left">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/20 border border-orange-400/30 text-amber-300 flex items-center justify-center flex-shrink-0">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-lg sm:text-xl font-black font-['Outfit']">
                Not sure if we wash your vehicle?
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                Reach out to our team in Karpur, Karnataka for special vehicle inquiries or custom cleaning requirements.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <a
              href="#contact"
              className="flex-1 md:flex-initial px-6 py-3.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <span>Contact Us</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            <a
              href={`tel:${COMPANY_INFO.phone}`}
              className="flex-1 md:flex-initial px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 transition-all flex items-center justify-center gap-1.5"
            >
              <Phone className="w-4 h-4 text-amber-300" />
              <span>Call Us</span>
            </a>
          </div>
        </div>

      </div>
    </section>
  );
};
