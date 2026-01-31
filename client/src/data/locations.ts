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

export const WINDOW_TYPES = {
  windshields: [
    { value: 'windshield', label: 'Front Windshield' },
    { value: 'rear_windshield', label: 'Rear Windshield' },
  ],
  sideWindows: [
    { value: 'front_driver', label: 'Front Driver Window' },
    { value: 'front_passenger', label: 'Front Passenger Window' },
    { value: 'rear_driver', label: 'Rear Driver Window' },
    { value: 'rear_passenger', label: 'Rear Passenger Window' },
  ],
  quarterPanels: [
    { value: 'quarter_panel_left', label: 'Left Quarter Panel' },
    { value: 'quarter_panel_right', label: 'Right Quarter Panel' },
  ],
  vents: [
    { value: 'vent_left', label: 'Left Vent Window' },
    { value: 'vent_right', label: 'Right Vent Window' },
  ],
  other: [
    { value: 'sunroof', label: 'Sunroof' },
    { value: 'moonroof', label: 'Moonroof' },
  ],
};

export const SERVICE_TYPES = [
  { value: 'replacement', label: 'Glass Replacement' },
  { value: 'repair', label: 'Chip/Crack Repair' },
  { value: 'calibration', label: 'ADAS Calibration' },
  { value: 'tinting', label: 'Window Tinting' },
];

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
