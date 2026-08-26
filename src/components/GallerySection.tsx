import React, { useState } from 'react';
import { 
  Eye, 
  X, 
  ShieldCheck, 
  Sparkles, 
  Droplets, 
  Car, 
  Bike, 
  Truck, 
  CheckCircle2, 
  ArrowRight, 
  Phone,
  Layers,
  Award
} from 'lucide-react';
import { COMPANY_INFO } from '../data/carWashData';

interface GalleryItem {
  id: string;
  category: 'all' | 'foam' | 'interior' | 'ceramic' | 'bikes' | 'commercial';
  categoryLabel: string;
  title: string;
  vehicleName: string;
  sub: string;
  imageUrl: string;
  tags: string[];
  treatmentSteps: string[];
  duration: string;
  featured?: boolean;
}

interface GallerySectionProps {
  onOpenBooking?: () => void;
}

export const GallerySection: React.FC<GallerySectionProps> = ({ onOpenBooking }) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'foam' | 'interior' | 'ceramic' | 'bikes' | 'commercial'>('all');
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);

  const galleryItems: GalleryItem[] = [
    {
      id: '1',
      category: 'foam',
      categoryLabel: 'Snow Foam Wash',
      title: 'Active High-Foam Pre-Wash Bath',
      vehicleName: 'Sedan • Honda City ZX',
      sub: 'Thick active snow foam lifting gritty road film without touching the clear coat.',
      imageUrl: '/images/foam/foam-1.png',
      tags: ['Thick Snow Foam', 'pH-Neutral', 'Touchless Soak'],
      treatmentSteps: [
        'High-pressure underbody and wheel arch blast',
        'pH-neutral snow foam dwelling soak (5-7 mins)',
        'Gentle two-bucket microfiber sponge contact wash',
        'De-ionized spot-free water rinse and warm air drying'
      ],
      duration: '40 mins',
      featured: true
    },
    {
      id: '2',
      category: 'ceramic',
      categoryLabel: 'Ceramic & Gloss',
      title: 'Mirror Gloss Ceramic Sealant',
      vehicleName: 'Luxury • BMW 5 Series M-Sport',
      sub: 'Ultra-reflective hydrophobic ceramic coating delivering deep liquid gloss.',
      imageUrl: '/images/foam/foam-2.png',
      tags: ['Hydrophobic Finish', '9H Ceramic Seal', 'Deep Wet Look'],
      treatmentSteps: [
        'Iron fallout remover & clay bar paint decontamination',
        'Single-stage machine swirl removal and jewelling polish',
        'Graphene ceramic liquid sealant application',
        'UV curing for 6-month slick water beading shield'
      ],
      duration: '75 mins',
      featured: true
    },
    {
      id: '3',
      category: 'interior',
      categoryLabel: 'Interior Detailing',
      title: 'Deep Cabin Extraction & Sanitization',
      vehicleName: 'SUV • Hyundai Creta Knight Edition',
      sub: 'Steam vacuuming, leather nourishment, and hospital-grade sanitization.',
      imageUrl: '/images/foam/foam-3.png',
      tags: ['Deep Shampoo', 'Leather Care', 'Odor Elimination'],
      treatmentSteps: [
        'High-power 360° air tornado crevice blowout',
        'Hot water fabric extraction & leather balm conditioning',
        'Anti-bacterial steam cleaning of AC vents & roof liner',
        'Non-greasy UV matte dressing on dashboard & door cards'
      ],
      duration: '60 mins'
    },
    {
      id: '4',
      category: 'foam',
      categoryLabel: 'Snow Foam Wash',
      title: 'High-Pressure Wheel Well & Rim De-ironing',
      vehicleName: 'Sportback • Audi A5 Quattro',
      sub: 'Brake dust dissolving purple reaction clean with tire gloss nourishment.',
      imageUrl: '/images/foam/foam-4.png',
      tags: ['Alloy De-Iron', 'Fender Well Wash', 'Satin Tire Dressing'],
      treatmentSteps: [
        'pH-neutral acid-free wheel cleaner application',
        'Barrel brush & lug nut detailing with boar hair brushes',
        'High-pressure inner fender mud flushing',
        'Hydrophobic silicon-free satin tire gel dressing'
      ],
      duration: '30 mins'
    },
    {
      id: '5',
      category: 'ceramic',
      categoryLabel: 'Ceramic & Gloss',
      title: 'Deep Black Wet-Look Paint Polish',
      vehicleName: 'Sports Coupe • Porsche 911 Carrera',
      sub: 'Precision paint smoothing, gloss enhancement, and Carnauba wax lock.',
      imageUrl: '/images/foam/foam-5.png',
      tags: ['Machine Buffing', 'Brazilian Wax', 'Mirror Clarity'],
      treatmentSteps: [
        'Rotary paint buffing with micro-abrasive finishing compound',
        'Swirl elimination and optical reflection enhancement',
        'Pure Brazilian Grade-1 Carnauba wax hand buffing',
        'Glass hydrophobic rain repellent layer'
      ],
      duration: '90 mins'
    },
    {
      id: '6',
      category: 'bikes',
      categoryLabel: 'Two-Wheelers',
      title: 'Superbike & Cruiser Precision Foam Spa',
      vehicleName: 'Cruiser • Royal Enfield Interceptor 650',
      sub: 'Engine cooling fin foam blast, chain degrease, and chrome polish.',
      imageUrl: '/images/foam/foam-6.png',
      tags: ['Engine Degreasing', 'Chain Clean & Lube', 'Chrome Polish'],
      treatmentSteps: [
        'Electrical socket & air intake water-tight shielding',
        'Heavy-duty chain sludge degrease with wire brush',
        'Thick active snow foam bath for cooling fins & frame',
        'Motul O-Ring chain lube application & chrome buffing'
      ],
      duration: '35 mins'
    },
    {
      id: '7',
      category: 'bikes',
      categoryLabel: 'Two-Wheelers',
      title: 'Sportbike Deep Decontamination & Matte Care',
      vehicleName: 'Sport • Kawasaki Ninja / KTM Duke',
      sub: 'Delicate fairing wash, scratch-free microfiber wipe, and brake cleaning.',
      imageUrl: '/images/foam/foam-7.png',
      tags: ['Matte Finish Safe', 'Brake Cleaner', 'Fairing Detail'],
      treatmentSteps: [
        'Contact-free snow foam pre-wash to soften road grime',
        'Delicate fairing wipe with plush 800 GSM towels',
        'Disc rotor de-grease and brake caliper dust blast',
        'UV protectant spray on matte stickers & switchgear'
      ],
      duration: '30 mins'
    },
    {
      id: '8',
      category: 'commercial',
      categoryLabel: 'SUVs & Commercial',
      title: 'Outstation Travel Fleet Multi-Stage Wash',
      vehicleName: 'MUV • Toyota Innova Crysta Tourer',
      sub: 'Heavy highway bug remover, chassis underwash, and interior freshening.',
      imageUrl: '/images/foam/foam-8.png',
      tags: ['Bug & Tar Removal', 'Chassis Wash', 'Fresh Cabin'],
      treatmentSteps: [
        'Front grille & windshield bug splatter softening',
        '360° Underbody water trolley pressure wash',
        'All 7-seater vacuuming & disinfectant wipe down',
        'Long-lasting natural air freshener mist'
      ],
      duration: '50 mins'
    },
    {
      id: '9',
      category: 'interior',
      categoryLabel: 'Interior Detailing',
      title: 'Luxury Cockpit & Leather Treatment',
      vehicleName: 'Executive • Mercedes-Benz E-Class',
      sub: 'Matte leather conditioning, digital screen streak-free polish, and vents clean.',
      imageUrl: '/images/foam/foam-9.png',
      tags: ['Leather Conditioning', 'Digital Screen Care', 'Deep Vacuum'],
      treatmentSteps: [
        'Soft horsehair brush agitation on perforated leather',
        'pH-neutral leather cream application for supple feel',
        'Dual-screen electronic cleaning with optical safe solution',
        'Deep boot space extraction and spare tire bay clean'
      ],
      duration: '60 mins'
    },
    {
      id: '10',
      category: 'commercial',
      categoryLabel: 'SUVs & Commercial',
      title: '4x4 Off-Road Mud Stripping & Underbody Flush',
      vehicleName: '4x4 SUV • Mahindra Thar / Scorpio-N',
      sub: 'Heavy mud cake dissolving, wheel arch blast, and suspension protection.',
      imageUrl: '/images/foam/foam-1.png',
      tags: ['Mud Stripping', 'Suspension Bay', 'Heavy Pressure'],
      treatmentSteps: [
        'High-volume mud breakdown with alkaline pre-spray',
        '160-bar pressure wash across differential & chassis',
        'Hardtop foam soak and scratch-resistant drying',
        'Suspension linkage & wheel well silicone-free coat'
      ],
      duration: '55 mins'
    },
    {
      id: '11',
      category: 'ceramic',
      categoryLabel: 'Ceramic & Gloss',
      title: 'Metallic Red Gloss Enhancement & Sealant',
      vehicleName: 'Premium Sedan • Volkswagen Virtus GT',
      sub: 'Ultra-vibrant paint pop with 6-month hydrophobic water repelling shield.',
      imageUrl: '/images/foam/foam-2.png',
      tags: ['Paint Clarity', 'Hydrophobic Shield', 'Showroom Pop'],
      treatmentSteps: [
        'Chemical de-ironing & surface clay glide',
        'High-gloss finishing pad polish with DA machine',
        'Synthetic hydrophobic sealant wipe down',
        'Streak-free glass sealant application on all windows'
      ],
      duration: '65 mins'
    },
    {
      id: '12',
      category: 'foam',
      categoryLabel: 'Snow Foam Wash',
      title: 'High-Pressure 180-Bar Spotless Rinse',
      vehicleName: 'Hatchback • Hyundai i20 N-Line',
      sub: 'Filtered soft-water rinse eliminating hard water stains and mineral spots.',
      imageUrl: '/images/foam/foam-3.png',
      tags: ['Soft Water Rinse', 'Zero Water Spots', 'Heated Air Dry'],
      treatmentSteps: [
        'Water softener filtration eliminating TDS mineral residue',
        'Full vehicle high-pressure rinse top to bottom',
        'Blower drying of mirrors, door jambs & badges',
        'Plush microfiber final touchup with quick detailer'
      ],
      duration: '35 mins'
    }
  ];

  const filterTabs = [
    { id: 'all', label: 'All Works', count: galleryItems.length },
    { id: 'foam', label: 'Snow Foam Bath', count: galleryItems.filter(i => i.category === 'foam').length },
    { id: 'interior', label: 'Interior Spa', count: galleryItems.filter(i => i.category === 'interior').length },
    { id: 'ceramic', label: 'Ceramic & Gloss', count: galleryItems.filter(i => i.category === 'ceramic').length },
    { id: 'bikes', label: 'Two-Wheelers', count: galleryItems.filter(i => i.category === 'bikes').length },
    { id: 'commercial', label: 'SUVs & Fleets', count: galleryItems.filter(i => i.category === 'commercial').length }
  ];

  const filteredItems = activeFilter === 'all' 
    ? galleryItems 
    : galleryItems.filter(item => item.category === activeFilter);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'foam':
        return <Droplets className="w-3.5 h-3.5 text-blue-500" />;
      case 'interior':
        return <Layers className="w-3.5 h-3.5 text-amber-500" />;
      case 'ceramic':
        return <Sparkles className="w-3.5 h-3.5 text-red-500" />;
      case 'bikes':
        return <Bike className="w-3.5 h-3.5 text-emerald-500" />;
      case 'commercial':
        return <Truck className="w-3.5 h-3.5 text-purple-500" />;
      default:
        return <Car className="w-3.5 h-3.5 text-red-500" />;
    }
  };

  return (
    <section id="gallery" className="py-16 sm:py-24 bg-white relative border-b border-slate-200 text-left overflow-hidden w-full max-w-full font-sans">
      
      {/* Background Subtle Accent Gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-bold tracking-wide mb-3 shadow-xs">
            <Award className="w-3.5 h-3.5 text-red-600" />
            <span>REAL WORK SHOWCASE & GALLERY</span>
          </div>

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight font-['Outfit'] leading-tight">
            Real Vehicles. Real Results. <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-orange-600 to-amber-500">
              Spotless & Showroom Clean.
            </span>
          </h2>
          
          <p className="mt-3 text-slate-600 text-xs sm:text-base font-normal max-w-2xl mx-auto leading-relaxed">
            Take a closer look at our high-foam bath treatments, mirror ceramic finishes, deep interior cabin sanitization, and bike spa transformations delivered in Karpur.
          </p>
        </div>

        {/* Quality Standards Ribbon */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-10 p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0">
              <Droplets className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] sm:text-xs font-bold text-slate-900">pH-Neutral Foam</p>
              <p className="text-[10px] text-slate-500">Safe for all paint coats</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] sm:text-xs font-bold text-slate-900">Scratch-Free Wash</p>
              <p className="text-[10px] text-slate-500">Plush microfiber towels</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] sm:text-xs font-bold text-slate-900">Ceramic Gloss Finish</p>
              <p className="text-[10px] text-slate-500">Hydrophobic water beading</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] sm:text-xs font-bold text-slate-900">Valet Doorstep Transit</p>
              <p className="text-[10px] text-slate-500">Pick-up & return included</p>
            </div>
          </div>
        </div>

        {/* Category Filter Pills - Horizontal scroll on mobile */}
        <div className="flex justify-start sm:justify-center gap-2 sm:gap-2.5 mb-10 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 flex-nowrap sm:flex-wrap">
          {filterTabs.map((tab) => {
            const isSelected = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id as any)}
                className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 cursor-pointer flex items-center gap-2 flex-shrink-0 whitespace-nowrap shadow-xs ${
                  isSelected
                    ? 'bg-slate-900 text-white border border-slate-900 shadow-md'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedImage(item)}
              className="group relative rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-950 border border-slate-200 hover:border-slate-400 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer"
            >
              {/* Card Image with Hover Zoom */}
              <div className="relative h-56 sm:h-64 w-full overflow-hidden bg-slate-900">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  loading="lazy"
                  className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-700 ease-out"
                />
                
                {/* Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent opacity-90 group-hover:opacity-80 transition-opacity"></div>

                {/* Top Badge: Category with Icon */}
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-900/90 backdrop-blur-md border border-white/20 text-white flex items-center gap-1.5 shadow-md">
                    {getCategoryIcon(item.category)}
                    <span>{item.categoryLabel}</span>
                  </span>
                </div>

                {/* Top Right Quick View Icon */}
                <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all border border-white/30">
                  <Eye className="w-4 h-4 text-white" />
                </div>

                {/* Bottom Tags Floating on Image */}
                <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-1.5">
                  {item.tags.slice(0, 2).map((tag, idx) => (
                    <span 
                      key={idx} 
                      className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-white/15 backdrop-blur-md text-white border border-white/20"
                    >
                      {tag}
                    </span>
                  ))}
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-red-600/80 text-white ml-auto">
                    {item.duration}
                  </span>
                </div>
              </div>

              {/* Card Details Footer */}
              <div className="p-4 sm:p-5 bg-slate-900 text-left flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-xs font-bold text-red-400 font-['Outfit'] uppercase tracking-wider mb-1">
                    {item.vehicleName}
                  </p>
                  <h3 className="text-base sm:text-lg font-bold text-white font-['Outfit'] group-hover:text-amber-300 transition-colors leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1.5 line-clamp-2 leading-relaxed">
                    {item.sub}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold text-slate-300 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>View Treatment Story</span>
                  </span>
                  <ArrowRight className="w-4 h-4 text-red-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Banner: Want your vehicle detailed like this? */}
        <div className="mt-14 p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-left">
            <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-500/30 text-red-400 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base sm:text-xl font-bold font-['Outfit']">
                Want your vehicle to look showroom new?
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Book a doorstep pickup in Karpur or visit our detailing center for high-foam washing.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => {
                if (onOpenBooking) {
                  onOpenBooking();
                } else {
                  window.location.hash = '#booking';
                }
              }}
              className="flex-1 md:flex-initial px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Book a Slot Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href={`tel:${COMPANY_INFO.phone}`}
              className="flex-1 md:flex-initial px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm border border-slate-700 transition-all flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4 text-orange-400" />
              <span>Call Hub</span>
            </a>
          </div>
        </div>

      </div>

      {/* Interactive Lightbox / Modal with Full Treatment Story */}
      {selectedImage && (
        <div 
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full bg-slate-900 text-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-slate-700 max-h-[90vh] flex flex-col"
          >
            {/* Modal Close Button */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-red-600 transition-colors cursor-pointer border border-white/20 shadow-lg"
              title="Close modal"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Scrollable Content */}
            <div className="overflow-y-auto flex-1">
              {/* Image Preview Banner */}
              <div className="relative h-64 sm:h-96 w-full bg-slate-950">
                <img 
                  src={selectedImage.imageUrl} 
                  alt={selectedImage.title} 
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                
                {/* Floating Tags on Modal Image */}
                <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-red-600 text-white shadow-md">
                    {selectedImage.vehicleName}
                  </span>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-slate-200 border border-white/20">
                    ⏱️ Time Taken: {selectedImage.duration}
                  </span>
                </div>
              </div>

              {/* Modal Body Info */}
              <div className="p-5 sm:p-8 text-left space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-orange-400">
                      {selectedImage.categoryLabel}
                    </span>
                  </div>
                  
                  <h3 className="text-xl sm:text-2xl font-bold text-white font-['Outfit']">
                    {selectedImage.title}
                  </h3>
                  
                  <p className="text-sm sm:text-base text-slate-300 mt-2 leading-relaxed">
                    {selectedImage.sub}
                  </p>
                </div>

                {/* Key Tags */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {selectedImage.tags.map((tag, idx) => (
                    <span 
                      key={idx} 
                      className="px-3 py-1 rounded-lg bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>{tag}</span>
                    </span>
                  ))}
                </div>

                {/* Treatment Process Steps */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-3">
                  <h4 className="text-sm font-bold text-white font-['Outfit'] uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Detailed Process Followed</span>
                  </h4>

                  <ul className="space-y-2.5">
                    {selectedImage.treatmentSteps.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300">
                        <span className="w-5 h-5 rounded-full bg-red-500/20 text-red-400 font-bold text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Modal CTA Buttons */}
                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => {
                      setSelectedImage(null);
                      if (onOpenBooking) {
                        onOpenBooking();
                      } else {
                        window.location.hash = '#booking';
                      }
                    }}
                    className="flex-1 py-3 px-6 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Book This Wash Treatment</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <a
                    href={`tel:${COMPANY_INFO.phone}`}
                    className="py-3 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm border border-slate-700 transition-all flex items-center justify-center gap-2 text-center"
                  >
                    <Phone className="w-4 h-4 text-orange-400" />
                    <span>Call for Questions</span>
                  </a>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

    </section>
  );
};
