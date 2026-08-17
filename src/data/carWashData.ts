import type { VehicleOption, ServicePackage, ServiceAddon, ReviewItem } from '../types';

export const COMPANY_INFO = {
  name: 'SRI THIRUMALA FOAM WASH',
  shortName: 'Sri Thirumala',
  tagline: 'WE PICK IT UP. WE WASH IT. WE BRING IT BACK.',
  subTagline: 'YOUR CAR. OUR CARE.',
  phone: '+91 98765 43210',
  displayPhone: '+91 98765 43210',
  whatsapp: '919876543210',
  email: 'care@srithirumalafoamwash.com',
  address: 'Sri Thirumala Foam Wash, Main Road, Karpur, Karnataka',
  timing: 'Everyday: 7:30 AM – 8:30 PM (Pickup & Delivery Available)',
  location: 'Karpur, Karnataka'
};

export const VEHICLE_OPTIONS: VehicleOption[] = [
  {
    id: 'hatchback',
    name: 'Hatchback',
    example: 'Swift, i20, Polo, Baleno, Tiago',
    icon: 'car',
    multiplier: 1.0
  },
  {
    id: 'sedan',
    name: 'Sedan',
    example: 'City, Verna, Ciaz, Slavia, Virtus',
    icon: 'car',
    multiplier: 1.15
  },
  {
    id: 'suv',
    name: 'Compact SUV',
    example: 'Creta, Seltos, Brezza, Nexon, Thar',
    icon: 'car',
    multiplier: 1.3
  },
  {
    id: 'luxury_suv',
    name: 'Full SUV / 7-Seater',
    example: 'Fortuner, XUV700, Safari, Innova, Scorpio',
    icon: 'truck',
    multiplier: 1.5
  },
  {
    id: 'luxury',
    name: 'Luxury / Super',
    example: 'BMW, Mercedes-Benz, Audi, Jaguar, Porsche',
    icon: 'sparkles',
    multiplier: 1.8
  }
];

export const SERVICE_PACKAGES: ServicePackage[] = [
  {
    id: 'express_foam',
    name: 'Express Foam Wash',
    tagline: 'Quick exterior snow foam & high-pressure underbody rinse',
    basePrice: 499,
    duration: '45 mins',
    popular: false,
    recommendedFor: 'Weekly maintenance & quick dust reset',
    features: [
      'Touchless High-Pressure Water Rinse',
      'Thick pH-Neutral Snow Foam Blanket',
      'Microfiber Gentle Hand Scrub',
      'Alloy Wheels & Wheel Well Cleaning',
      'Tire Dressing & High-Gloss Dressing',
      'Exterior Glass Streak-Free Wipe',
      'Door Jams & Trunk Channel Blow Dry'
    ]
  },
  {
    id: 'deep_interior_foam',
    name: 'Deep Interior + Foam Wash',
    tagline: 'Complete exterior foam wash plus full cabin vacuum & sanitization',
    basePrice: 999,
    duration: '90 mins',
    popular: true,
    recommendedFor: 'Comprehensive monthly deep clean & family cars',
    features: [
      'Everything in Express Foam Wash',
      'Full Cabin & Trunk High-Power Vacuum',
      'Dashboard & Trim Conditioning with UV Protectant',
      'AC Vents Disinfection & Dust Extraction',
      'Floor Mats Pressure Washed & Sanitized',
      'Interior Glass & Rearview Mirror De-fogging',
      'Fabric / Leather Surface Wipedown',
      'Aromatherapy Cabin Deodorizing Mist'
    ]
  },
  {
    id: 'signature_ceramic',
    name: 'Signature Ceramic Gloss Wash',
    tagline: 'Paint decontamination, clay bar treatment & hydrophobic ceramic boost',
    basePrice: 1699,
    duration: '2.5 hours',
    popular: false,
    recommendedFor: 'Deep gloss enhancement & water-repelling protection',
    features: [
      'Everything in Deep Interior + Foam Wash',
      'Chemical Iron & Tar Decontamination',
      'Fine Grade Clay Bar Paint Smoothing',
      'Ceramic Hydrophobic Paint Sealant Coat',
      'Rain-X Windshield Water-Repellent Treatment',
      'Plastic Trim Color Revival Dressing',
      'Engine Bay Surface Steam Wipe & Dressing',
      '3-Month Hydrophobic Water Beading Protection'
    ]
  },
  {
    id: 'showroom_restoration',
    name: 'Complete Showroom Restoration',
    tagline: 'The ultimate inside-out deep detail & single-stage machine wax polish',
    basePrice: 2899,
    duration: '4 hours',
    popular: false,
    recommendedFor: 'Occasions, weddings, resale prep & luxury detailing',
    features: [
      'Everything in Signature Ceramic Gloss',
      'Single-Stage Machine DA Glaze & Paint Polish',
      'Deep Upholstery Wet-Extraction Shampoo',
      'Leather Deep Clean & Rich Conditioning Balm',
      'Underbody Anti-Corrosion Spray Rinse',
      'Exhaust Tip Chrome Polishing',
      'Ozone Anti-Bacterial Cabin Sanitization',
      '6-Month Ultra-Gloss Hydrophobic Sealant'
    ]
  }
];

export const SERVICE_ADDONS: ServiceAddon[] = [
  {
    id: 'engine_bay',
    name: 'Engine Bay Steam Detailing',
    description: 'Safe grease removal and non-conductive plastic dressing',
    price: 399,
    iconName: 'zap'
  },
  {
    id: 'leather_balm',
    name: 'Rich Leather Conditioning',
    description: 'Nourishes dry leather, prevents cracking & adds silky touch',
    price: 499,
    iconName: 'shield'
  },
  {
    id: 'headlight_restore',
    name: 'Headlight Oxidation Polish',
    description: 'Removes yellow haze and restores optical clarity',
    price: 349,
    iconName: 'sun'
  },
  {
    id: 'anti_rat',
    name: 'Anti-Rodent Engine Spray',
    description: 'Bitter compound coating repels rats from chewing wire harness',
    price: 299,
    iconName: 'alert-circle'
  }
];

export const REVIEWS: ReviewItem[] = [
  {
    id: 'rev_1',
    name: 'Rajesh Varma',
    vehicle: 'Hyundai Creta',
    service: 'Signature Ceramic Gloss Wash',
    rating: 5,
    comment: 'The doorstep pickup is a game-changer! They collected my car from my location and brought it back looking clean and shining. Paint is glass-smooth!',
    date: '2 days ago',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'rev_2',
    name: 'Priya Sundaram',
    vehicle: 'Honda City',
    service: 'Deep Interior + Foam Wash',
    rating: 5,
    comment: 'With daily family runs, my car interior needed deep attention. Sri Thirumala team completely cleaned everything. Interior smells super fresh!',
    date: '5 days ago',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'rev_3',
    name: 'K. Srinivasa Rao',
    vehicle: 'BMW 3 Series',
    service: 'Complete Showroom Restoration',
    rating: 5,
    comment: 'Their snow foam technique and microfiber care are swirl-free. The ceramic gloss finish looks great. Highly recommended!',
    date: '1 week ago',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'rev_4',
    name: 'Anand Kumar',
    vehicle: 'Tata Safari',
    service: 'Express Foam Wash',
    rating: 5,
    comment: 'Super fast turnaround and polite valet driver. The wheel wells and foam cleaning were spotless!',
    date: '2 weeks ago',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
  }
];
