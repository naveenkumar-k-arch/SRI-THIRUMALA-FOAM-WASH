import type { VehicleOption, WashServiceItem, ServicePackage, ServiceAddon, ReviewItem } from '../types';

export const COMPANY_INFO = {
  name: 'SRI THIRUMALA FOAM WASH',
  shortName: 'Sri Thirumala',
  tagline: 'WE PICK IT UP. WE WASH IT. WE BRING IT BACK.',
  subTagline: 'YOUR CAR. OUR CARE.',
  phone: '+918550000889',
  displayPhone: '085500 00889',
  whatsapp: '918550000889',
  email: 'srithirumalafoamwash@gmail.com',
  address: 'Karpur Rd, Karpur, Karnataka 562106',
  plusCode: 'PPF9+2M Karpur, Karnataka',
  googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=12.7225,77.7191',
  hubCoordinates: { lat: 12.7225, lng: 77.7191 },
  timing: 'Everyday: 7:00 AM – 8:30 PM (Doorstep Pickup & Delivery)',
  location: 'Karpur, Karnataka 562106'
};

export const VEHICLE_OPTIONS: VehicleOption[] = [
  {
    id: 'bike',
    name: 'Bike / Scooter',
    example: 'Activa, Pulsar, Royal Enfield, Duke, EV Scooter',
    icon: 'bike',
    multiplier: 0.65
  },
  {
    id: 'auto',
    name: 'Auto / 3-Wheeler',
    example: 'Bajaj RE, Piaggio Ape, Electric Auto',
    icon: 'car',
    multiplier: 0.8
  },
  {
    id: 'hatchback',
    name: 'Hatchback',
    example: 'Swift, i20, Polo, Baleno, Tiago, WagonR',
    icon: 'car',
    multiplier: 1.0
  },
  {
    id: 'sedan',
    name: 'Sedan',
    example: 'City, Verna, Ciaz, Slavia, Virtus, Dzire',
    icon: 'car',
    multiplier: 1.15
  },
  {
    id: 'suv',
    name: 'Compact SUV',
    example: 'Creta, Seltos, Brezza, Nexon, Thar, Sonet',
    icon: 'car',
    multiplier: 1.3
  },
  {
    id: 'luxury_suv',
    name: 'Full SUV / 7-Seater',
    example: 'Fortuner, XUV700, Safari, Innova, Scorpio, Ertiga',
    icon: 'truck',
    multiplier: 1.5
  },
  {
    id: 'commercial',
    name: 'Commercial / Van',
    example: 'Tata Ace, Bolero Camper, Eeco, Traveller',
    icon: 'truck',
    multiplier: 1.6
  },
  {
    id: 'luxury',
    name: 'Luxury / Super',
    example: 'BMW, Mercedes-Benz, Audi, Jaguar, Porsche',
    icon: 'sparkles',
    multiplier: 1.8
  },
  {
    id: 'custom',
    name: 'Any Other Vehicle',
    example: 'Specify your custom vehicle model & type',
    icon: 'car',
    multiplier: 1.0
  }
];

export const MODULAR_SERVICES: WashServiceItem[] = [
  {
    id: 'water_wash',
    name: 'High-Pressure Water Wash',
    category: 'exterior',
    price: 199,
    durationMinutes: 25,
    description: 'High-pressure underbody and exterior mud & grit removal rinse',
    iconName: 'droplet',
    popular: true
  },
  {
    id: 'foam_wash',
    name: 'Snow Foam Wash',
    category: 'exterior',
    price: 299,
    durationMinutes: 30,
    description: 'Thick pH-neutral snow foam blanket with gentle microfiber scrubbing',
    iconName: 'sparkles',
    popular: true
  },
  {
    id: 'vacuum_clean',
    name: 'Deep Cabin & Trunk Vacuum',
    category: 'interior',
    price: 249,
    durationMinutes: 25,
    description: 'High-power suction vacuum for seats, footwells, carpets, mats & boot',
    iconName: 'wind',
    popular: true
  },
  {
    id: 'engine_clean',
    name: 'Engine Bay Steam Clean',
    category: 'engine',
    price: 349,
    durationMinutes: 25,
    description: 'Steam degreasing with non-conductive anti-static protective dressing',
    iconName: 'zap'
  },
  {
    id: 'underbody_wash',
    name: 'Underbody Chassis Pressure Wash',
    category: 'exterior',
    price: 249,
    durationMinutes: 20,
    description: 'Full underneath chassis cleaning with anti-corrosion protection rinse',
    iconName: 'shield'
  },
  {
    id: 'interior_sanitization',
    name: 'AC Vents Sanitization & Mist',
    category: 'interior',
    price: 299,
    durationMinutes: 20,
    description: 'Bacterial disinfectant for AC ducts and refreshing cabin fragrance mist',
    iconName: 'sun'
  },
  {
    id: 'ceramic_gloss',
    name: 'Ceramic Hydrophobic Wax Coat',
    category: 'protective',
    price: 499,
    durationMinutes: 35,
    description: 'Hand-applied hydrophobic polymer wax with high-gloss mirror shine',
    iconName: 'shield-check',
    popular: true
  },
  {
    id: 'leather_polish',
    name: 'Dashboard & Leather Balm',
    category: 'interior',
    price: 249,
    durationMinutes: 20,
    description: 'UV protectant conditioner for dashboard, door trims and leather seats',
    iconName: 'layers'
  },
  {
    id: 'glass_rainx',
    name: 'Windshield De-Fog & Rain-X',
    category: 'exterior',
    price: 149,
    durationMinutes: 15,
    description: 'Crystal streak-free glass clean and water-repelling hydrophobic layer',
    iconName: 'eye'
  },
  {
    id: 'anti_rodent',
    name: 'Anti-Rodent Engine Spray',
    category: 'protective',
    price: 249,
    durationMinutes: 15,
    description: 'Bitter taste coating that protects electrical wire harness from rats',
    iconName: 'alert-circle'
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
    serviceIds: ['water_wash', 'foam_wash', 'underbody_wash', 'glass_rainx'],
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
    serviceIds: ['water_wash', 'foam_wash', 'vacuum_clean', 'interior_sanitization', 'leather_polish', 'underbody_wash', 'glass_rainx'],
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
    serviceIds: ['water_wash', 'foam_wash', 'vacuum_clean', 'interior_sanitization', 'leather_polish', 'ceramic_gloss', 'engine_clean', 'underbody_wash', 'glass_rainx'],
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
    serviceIds: ['water_wash', 'foam_wash', 'vacuum_clean', 'engine_clean', 'underbody_wash', 'interior_sanitization', 'ceramic_gloss', 'leather_polish', 'glass_rainx', 'anti_rodent'],
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
    price: 349,
    iconName: 'zap'
  },
  {
    id: 'leather_balm',
    name: 'Rich Leather Conditioning',
    description: 'Nourishes dry leather, prevents cracking & adds silky touch',
    price: 249,
    iconName: 'shield'
  },
  {
    id: 'headlight_restore',
    name: 'Headlight Oxidation Polish',
    description: 'Removes yellow haze and restores optical clarity',
    price: 299,
    iconName: 'sun'
  },
  {
    id: 'anti_rat',
    name: 'Anti-Rodent Engine Spray',
    description: 'Bitter compound coating repels rats from chewing wire harness',
    price: 249,
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
