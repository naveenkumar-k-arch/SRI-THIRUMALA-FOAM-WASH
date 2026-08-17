import React, { useState } from 'react';
import { Eye, X, Sparkles } from 'lucide-react';

interface GalleryItem {
  id: string;
  category: 'foam' | 'interior' | 'ceramic' | 'fleet';
  title: string;
  sub: string;
  imageUrl: string;
}

export const GallerySection: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'foam' | 'interior' | 'ceramic' | 'fleet'>('all');
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);

  const galleryItems: GalleryItem[] = [
    {
      id: '1',
      category: 'foam',
      title: 'Active Thick Snow Foam Bath',
      sub: 'Sedan Pre-Wash Decontamination',
      imageUrl: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=1000&q=80'
    },
    {
      id: '2',
      category: 'ceramic',
      title: 'Mirror Gloss Ceramic Sealant',
      sub: 'Hydrophobic Water Beading Finish',
      imageUrl: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1000&q=80'
    },
    {
      id: '3',
      category: 'interior',
      title: 'Deep Cabin Extraction & Sanitization',
      sub: 'Dust-Free Dashboard & Interior Care',
      imageUrl: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=1000&q=80'
    },
    {
      id: '4',
      category: 'foam',
      title: 'High-Pressure Wheel Well Detailing',
      sub: 'Brake Dust Dissolving Iron Clean',
      imageUrl: 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?auto=format&fit=crop&w=1000&q=80'
    },
    {
      id: '5',
      category: 'ceramic',
      title: 'Deep Black Wet-Look Paint Polish',
      sub: 'Paint Smoothing & Wax Protection',
      imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1000&q=80'
    },
    {
      id: '6',
      category: 'fleet',
      title: 'Commercial Fleet Multi-Car Care',
      sub: 'Scheduled Executive Transport Detailing',
      imageUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1000&q=80'
    }
  ];

  const filteredItems = activeFilter === 'all' 
    ? galleryItems 
    : galleryItems.filter(item => item.category === activeFilter);

  return (
    <section id="gallery" className="py-20 sm:py-24 bg-[#030712] relative border-b border-white/10 text-left overflow-hidden">
      
      {/* Ambient background glow */}
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <span className="text-xs sm:text-sm font-black uppercase tracking-[0.25em] text-orange-400 font-['Outfit'] block mb-2 drop-shadow-sm">
            REAL WORK SHOWCASE
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight font-['Outfit'] uppercase leading-tight">
            TRANSFORMATION <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-amber-300">GALLERY</span>
          </h2>
          <p className="mt-3 text-slate-300 text-xs sm:text-base font-medium">
            Explore recent clean vehicle transformations delivered in Karpur, Karnataka.
          </p>
        </div>

        {/* Filter Pills - Scrollable on mobile */}
        <div className="flex justify-center flex-wrap gap-2 mb-10 overflow-x-auto pb-2">
          {[
            { id: 'all', label: 'All Projects' },
            { id: 'foam', label: 'Snow Foam Wash' },
            { id: 'interior', label: 'Interior Care' },
            { id: 'ceramic', label: 'Ceramic Shine' },
            { id: 'fleet', label: 'Commercial Care' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as any)}
              className={`px-4 sm:px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap ${
                activeFilter === tab.id
                  ? 'bg-red-600 text-white shadow-lg shadow-red-500/30 border border-red-400'
                  : 'bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] border border-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Gallery Grid - 1 Col on Mobile, 2 on Tablet, 3 on Desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedImage(item)}
              className="group relative h-64 sm:h-72 rounded-3xl overflow-hidden shadow-xl bg-slate-900 cursor-pointer border border-white/10 hover:border-red-400/40 transition-all duration-300"
            >
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-[#030712]/30 to-transparent opacity-90 group-hover:opacity-95 transition-opacity"></div>

              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 text-left text-white">
                <span className="text-[10px] sm:text-[11px] font-bold text-orange-400 uppercase tracking-wider block mb-1">
                  {item.category} detailing
                </span>
                <h3 className="text-base sm:text-lg font-bold font-['Outfit'] group-hover:text-amber-300 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  {item.sub}
                </p>
              </div>

              <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity border border-white/20">
                <Eye className="w-4 h-4 text-amber-300" />
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Image Preview Modal */}
      {selectedImage && (
        <div 
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-50 bg-[#030712]/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-3xl w-full bg-[#120707] rounded-3xl overflow-hidden shadow-2xl border border-white/20"
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black transition-colors cursor-pointer border border-white/20"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="h-[280px] sm:h-[400px]">
              <img 
                src={selectedImage.imageUrl} 
                alt={selectedImage.title} 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-5 sm:p-6 text-left bg-[#120707]">
              <h3 className="text-xl sm:text-2xl font-black text-white font-['Outfit']">
                {selectedImage.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                {selectedImage.sub}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
