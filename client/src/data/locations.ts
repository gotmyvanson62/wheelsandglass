// Service location data
export interface ServiceLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  coordinates: { lat: number; lng: number };
  serviceRadius: number;
  isActive: boolean;
}

export const SERVICE_LOCATIONS: ServiceLocation[] = [
  {
    id: "loc-1",
    name: "Main Service Center",
    address: "123 Glass Way",
    city: "Houston",
    state: "TX",
    zip: "77001",
    phone: "(713) 555-0100",
    coordinates: { lat: 29.7604, lng: -95.3698 },
    serviceRadius: 50,
    isActive: true,
  },
  {
    id: "loc-2",
    name: "North Houston",
    address: "456 Auto Glass Blvd",
    city: "The Woodlands",
    state: "TX",
    zip: "77380",
    phone: "(281) 555-0200",
    coordinates: { lat: 30.1658, lng: -95.4613 },
    serviceRadius: 30,
    isActive: true,
  },
];

// Glass types matching the labeled vehicle diagram
// Industry standard labels: Windshield, Front Vent, Front Door, Back Door, Rear Vent, Rear Quarter, Back Glass
export const WINDOW_TYPES = {
  // Primary glass types shown on diagram
  primary: [
    { value: 'windshield', label: 'Windshield', description: 'Front windshield' },
    { value: 'back_glass', label: 'Back Glass', description: 'Rear windshield' },
  ],
  // Door windows
  doors: [
    { value: 'front_door', label: 'Front Door', description: 'Front door window (driver/passenger)' },
    { value: 'back_door', label: 'Back Door', description: 'Rear door window (driver/passenger)' },
  ],
  // Vent windows (small triangular/fixed windows)
  vents: [
    { value: 'front_vent', label: 'Front Vent', description: 'Small front vent window near A-pillar' },
    { value: 'rear_vent', label: 'Rear Vent', description: 'Small rear vent window behind back door' },
  ],
  // Quarter panels (fixed glass)
  quarterPanels: [
    { value: 'rear_quarter', label: 'Rear Quarter', description: 'Fixed rear quarter panel glass' },
  ],
  // Additional glass types
  other: [
    { value: 'sunroof', label: 'Sunroof', description: 'Roof-mounted glass panel' },
    { value: 'moonroof', label: 'Moonroof', description: 'Transparent roof glass panel' },
  ],
};

// Flat list of all window types for form validation
export const ALL_WINDOW_TYPES = [
  ...WINDOW_TYPES.primary,
  ...WINDOW_TYPES.doors,
  ...WINDOW_TYPES.vents,
  ...WINDOW_TYPES.quarterPanels,
  ...WINDOW_TYPES.other,
];

// ==========================================
// DIVISION TYPES - Brand Family
// ==========================================

export type Division = 'glass' | 'wheels';

export const DIVISIONS = [
  {
    value: 'glass' as const,
    label: 'Wheels and Glass',
    tagline: 'Auto glass repair & replacement',
    color: 'blue',
    icon: 'Car'
  },
  {
    value: 'wheels' as const,
    label: 'Auto Wheels Express',
    tagline: 'Wheel & rim restoration',
    color: 'orange',
    icon: 'CircleDot'
  },
];

// ==========================================
// GLASS SERVICE TYPES (Original)
// ==========================================

export const GLASS_SERVICE_TYPES = [
  { value: 'replacement', label: 'Glass Replacement' },
  { value: 'repair', label: 'Chip/Crack Repair' },
  { value: 'calibration', label: 'ADAS Calibration' },
  { value: 'tinting', label: 'Window Tinting' },
];

// ==========================================
// WHEEL SERVICE TYPES (New - Auto Wheels Express)
// ==========================================

export const WHEEL_SERVICE_TYPES = [
  { value: 'curb_rash', label: 'Curb Rash Repair' },
  { value: 'scratch_repair', label: 'Scratch Repair' },
  { value: 'bent_wheel', label: 'Bent Wheel Repair' },
  { value: 'refinish', label: 'Wheel Refinishing' },
  { value: 'powder_coating', label: 'Powder Coating' },
];

// Wheel positions for selection (analogous to window positions)
export const WHEEL_POSITIONS = [
  { value: 'front_left', label: 'Front Left', shortLabel: 'FL' },
  { value: 'front_right', label: 'Front Right', shortLabel: 'FR' },
  { value: 'rear_left', label: 'Rear Left', shortLabel: 'RL' },
  { value: 'rear_right', label: 'Rear Right', shortLabel: 'RR' },
];

// ==========================================
// UNIFIED SERVICE TYPES (backward compatibility)
// ==========================================

// Legacy export - includes all service types
export const SERVICE_TYPES = [
  ...GLASS_SERVICE_TYPES,
  ...WHEEL_SERVICE_TYPES,
];

// Helper to get service types by division
export function getServiceTypesByDivision(division: Division) {
  return division === 'glass' ? GLASS_SERVICE_TYPES : WHEEL_SERVICE_TYPES;
}

export const VEHICLE_YEARS = Array.from({ length: 30 }, (_, i) => {
  const year = new Date().getFullYear() - i + 1;
  return { value: year.toString(), label: year.toString() };
});

export const VEHICLE_MAKES = [
  'Acura', 'Audi', 'BMW', 'Buick', 'Cadillac', 'Chevrolet', 'Chrysler',
  'Dodge', 'Ford', 'GMC', 'Honda', 'Hyundai', 'Infiniti', 'Jeep', 'Kia',
  'Lexus', 'Lincoln', 'Mazda', 'Mercedes-Benz', 'Mitsubishi', 'Nissan',
  'Ram', 'Subaru', 'Tesla', 'Toyota', 'Volkswagen', 'Volvo'
].map(make => ({ value: make.toLowerCase().replace(/\s+/g, '_'), label: make }));

export const locations = SERVICE_LOCATIONS;
export default SERVICE_LOCATIONS;
