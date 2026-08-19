import React, { useState } from 'react';
import { Eye, X, ShieldCheck } from 'lucide-react';

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
    <section id="gallery" className="py-16 sm:py-24 bg-slate-50 relative border-b border-slate-200 text-left overflow-hidden w-full max-w-full font-sans">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold tracking-wide mb-2.5">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>REAL WORK SHOWCASE</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-['Outfit'] uppercase leading-tight">
            Transformation <span className="text-red-600">Gallery</span>
          </h2>
          <p className="mt-2 text-slate-600 text-xs sm:text-sm font-normal">
            Explore recent clean vehicle transformations delivered across Karpur & Sarjapur Hub.
          </p>
        </div>

        {/* Filter Pills - Scrollable on mobile */}
        <div className="flex justify-start sm:justify-center flex-nowrap sm:flex-wrap gap-2 mb-10 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
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
              className={`px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap flex-shrink-0 ${
                activeFilter === tab.id
                  ? 'bg-slate-900 text-white shadow-sm border border-slate-900'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedImage(item)}
              className="group relative h-64 sm:h-72 rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm bg-slate-900 cursor-pointer border border-slate-200 hover:border-slate-400 transition-all duration-300"
            >
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent opacity-85 group-hover:opacity-90 transition-opacity"></div>

              <div className="absolute bottom-0 left-0 right-0 p-5 text-left text-white">
                <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider block mb-1">
                  {item.category} detailing
                </span>
                <h3 className="text-base sm:text-lg font-bold font-['Outfit'] group-hover:text-amber-300 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  {item.sub}
                </p>
              </div>

              <div className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity border border-white/30">
                <Eye className="w-4 h-4 text-white" />
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Image Preview Modal */}
      {selectedImage && (
        <div 
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-3xl w-full bg-slate-900 text-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-slate-700"
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black transition-colors cursor-pointer border border-white/20"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="h-[260px] sm:h-[380px]">
              <img 
                src={selectedImage.imageUrl} 
                alt={selectedImage.title} 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-5 sm:p-6 text-left">
              <h3 className="text-lg sm:text-xl font-bold text-white font-['Outfit']">
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
