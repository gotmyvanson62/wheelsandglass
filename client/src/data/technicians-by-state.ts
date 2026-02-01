// Coverage map geographic data - All 50 US States + DC
// NOTE: Technician data should be loaded from the backend API
// This file contains only geographic coverage information
// All technician counts are 0 - real counts come from enrollment

export interface TechnicianInfo {
  name: string;
  specialty: string;
  status: 'available' | 'busy' | 'offline';
  phone?: string;
}

export interface CityData {
  name: string;
  coordinates: [number, number];
  technicians: number;
  coverage: 'full' | 'partial' | 'limited';
  zipCodes?: string[];
  avgResponseTime?: string;
  services?: string[];
  technicianList: TechnicianInfo[];
}

export interface StateData {
  name: string;
  abbr: string;
  coverage: 'full' | 'partial' | 'limited' | 'expanding';
  stats: {
    cities: number;
    technicians: number;
    zipCodes: number;
    avgResponseTime: string;
  };
  cities: CityData[];
  center: [number, number];
}

// All 50 US States + DC - Geographic coverage data
// Technician counts set to 0 (load from backend API via enrollment)
export const statesData: Record<string, StateData> = {
  // ALABAMA
  AL: {
    name: 'Alabama',
    abbr: 'AL',
    coverage: 'expanding',
    stats: { cities: 4, technicians: 0, zipCodes: 580, avgResponseTime: 'Contact for availability' },
    center: [-86.9023, 32.3182],
    cities: [
      { name: 'Birmingham', coordinates: [-86.8025, 33.5207], technicians: 0, coverage: 'partial', zipCodes: ['35201-35299'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
      { name: 'Montgomery', coordinates: [-86.2999, 32.3668], technicians: 0, coverage: 'partial', zipCodes: ['36101-36199'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
      { name: 'Huntsville', coordinates: [-86.5861, 34.7304], technicians: 0, coverage: 'partial', zipCodes: ['35801-35899'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
      { name: 'Mobile', coordinates: [-88.0399, 30.6954], technicians: 0, coverage: 'partial', zipCodes: ['36601-36699'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
    ],
  },

  // ALASKA
  AK: {
    name: 'Alaska',
    abbr: 'AK',
    coverage: 'limited',
    stats: { cities: 2, technicians: 0, zipCodes: 260, avgResponseTime: 'Contact for availability' },
    center: [-154.4931, 63.3850],
    cities: [
      { name: 'Anchorage', coordinates: [-149.9003, 61.2181], technicians: 0, coverage: 'partial', zipCodes: ['99501-99599'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
      { name: 'Fairbanks', coordinates: [-147.7164, 64.8378], technicians: 0, coverage: 'limited', zipCodes: ['99701-99799'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement'], technicianList: [] },
    ],
  },

  // ARIZONA
  AZ: {
    name: 'Arizona',
    abbr: 'AZ',
    coverage: 'full',
    stats: { cities: 5, technicians: 0, zipCodes: 1800, avgResponseTime: 'Contact for availability' },
    center: [-111.0937, 34.0489],
    cities: [
      { name: 'Phoenix', coordinates: [-112.0740, 33.4484], technicians: 0, coverage: 'full', zipCodes: ['85001-85099'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair', 'ADAS Calibration', 'Side Windows'], technicianList: [] },
      { name: 'Tucson', coordinates: [-110.9747, 32.2226], technicians: 0, coverage: 'full', zipCodes: ['85701-85799'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair', 'Side Windows'], technicianList: [] },
      { name: 'Mesa', coordinates: [-111.8315, 33.4152], technicians: 0, coverage: 'full', zipCodes: ['85201-85299'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
      { name: 'Scottsdale', coordinates: [-111.9261, 33.4942], technicians: 0, coverage: 'full', zipCodes: ['85250-85299'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair', 'ADAS Calibration'], technicianList: [] },
      { name: 'Tempe', coordinates: [-111.9400, 33.4255], technicians: 0, coverage: 'full', zipCodes: ['85280-85289'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
    ],
  },

  // ARKANSAS
  AR: {
    name: 'Arkansas',
    abbr: 'AR',
    coverage: 'expanding',
    stats: { cities: 3, technicians: 0, zipCodes: 450, avgResponseTime: 'Contact for availability' },
    center: [-92.3731, 34.9697],
    cities: [
      { name: 'Little Rock', coordinates: [-92.2896, 34.7465], technicians: 0, coverage: 'partial', zipCodes: ['72201-72299'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
      { name: 'Fort Smith', coordinates: [-94.3985, 35.3859], technicians: 0, coverage: 'partial', zipCodes: ['72901-72999'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
      { name: 'Fayetteville', coordinates: [-94.1574, 36.0626], technicians: 0, coverage: 'partial', zipCodes: ['72701-72799'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
    ],
  },

  // CALIFORNIA
  CA: {
    name: 'California',
    abbr: 'CA',
    coverage: 'full',
    stats: { cities: 12, technicians: 0, zipCodes: 4200, avgResponseTime: 'Contact for availability' },
    center: [-119.4179, 36.7783],
    cities: [
      { name: 'Los Angeles', coordinates: [-118.2437, 34.0522], technicians: 0, coverage: 'full', zipCodes: ['90001-90089', '90201-90280', '91001-91899'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair', 'ADAS Calibration', 'Side Windows', 'Rear Glass'], technicianList: [] },
      { name: 'San Diego', coordinates: [-117.1611, 32.7157], technicians: 0, coverage: 'full', zipCodes: ['92101-92199'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair', 'ADAS Calibration', 'Side Windows', 'Rear Glass'], technicianList: [] },
      { name: 'San Francisco', coordinates: [-122.4194, 37.7749], technicians: 0, coverage: 'full', zipCodes: ['94102-94188'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair', 'ADAS Calibration'], technicianList: [] },
      { name: 'San Jose', coordinates: [-121.8863, 37.3382], technicians: 0, coverage: 'full', zipCodes: ['95101-95196'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair', 'Side Windows'], technicianList: [] },
      { name: 'Sacramento', coordinates: [-121.4944, 38.5816], technicians: 0, coverage: 'full', zipCodes: ['95811-95899'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair', 'ADAS Calibration'], technicianList: [] },
      { name: 'Fresno', coordinates: [-119.7871, 36.7378], technicians: 0, coverage: 'full', zipCodes: ['93650-93799'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
      { name: 'Long Beach', coordinates: [-118.1937, 33.7701], technicians: 0, coverage: 'full', zipCodes: ['90801-90899'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair', 'Side Windows'], technicianList: [] },
      { name: 'Oakland', coordinates: [-122.2711, 37.8044], technicians: 0, coverage: 'full', zipCodes: ['94601-94699'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
      { name: 'Bakersfield', coordinates: [-119.0187, 35.3733], technicians: 0, coverage: 'partial', zipCodes: ['93301-93399'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
      { name: 'Anaheim', coordinates: [-117.9145, 33.8366], technicians: 0, coverage: 'full', zipCodes: ['92801-92899'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair', 'ADAS Calibration'], technicianList: [] },
      { name: 'Riverside', coordinates: [-117.3961, 33.9806], technicians: 0, coverage: 'full', zipCodes: ['92501-92599'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
      { name: 'Irvine', coordinates: [-117.8265, 33.6846], technicians: 0, coverage: 'full', zipCodes: ['92602-92699'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair', 'ADAS Calibration'], technicianList: [] },
    ],
  },

  // COLORADO
  CO: {
    name: 'Colorado',
    abbr: 'CO',
    coverage: 'full',
    stats: { cities: 5, technicians: 0, zipCodes: 1200, avgResponseTime: 'Contact for availability' },
    center: [-105.7821, 39.5501],
    cities: [
      { name: 'Denver', coordinates: [-104.9903, 39.7392], technicians: 0, coverage: 'full', zipCodes: ['80201-80299'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair', 'ADAS Calibration', 'Side Windows'], technicianList: [] },
      { name: 'Colorado Springs', coordinates: [-104.8214, 38.8339], technicians: 0, coverage: 'full', zipCodes: ['80901-80951'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
      { name: 'Aurora', coordinates: [-104.8319, 39.7294], technicians: 0, coverage: 'full', zipCodes: ['80010-80019'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
      { name: 'Fort Collins', coordinates: [-105.0844, 40.5853], technicians: 0, coverage: 'partial', zipCodes: ['80521-80599'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
      { name: 'Boulder', coordinates: [-105.2705, 40.0150], technicians: 0, coverage: 'partial', zipCodes: ['80301-80399'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
    ],
  },

  // CONNECTICUT
  CT: {
    name: 'Connecticut',
    abbr: 'CT',
    coverage: 'partial',
    stats: { cities: 4, technicians: 0, zipCodes: 350, avgResponseTime: 'Contact for availability' },
    center: [-72.7554, 41.6032],
    cities: [
      { name: 'Hartford', coordinates: [-72.6851, 41.7658], technicians: 0, coverage: 'partial', zipCodes: ['06101-06199'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
      { name: 'New Haven', coordinates: [-72.9279, 41.3083], technicians: 0, coverage: 'partial', zipCodes: ['06501-06599'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
      { name: 'Stamford', coordinates: [-73.5387, 41.0534], technicians: 0, coverage: 'partial', zipCodes: ['06901-06999'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
      { name: 'Bridgeport', coordinates: [-73.1952, 41.1865], technicians: 0, coverage: 'partial', zipCodes: ['06601-06699'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
    ],
  },

  // DELAWARE
  DE: {
    name: 'Delaware',
    abbr: 'DE',
    coverage: 'partial',
    stats: { cities: 2, technicians: 0, zipCodes: 70, avgResponseTime: 'Contact for availability' },
    center: [-75.5277, 39.1582],
    cities: [
      { name: 'Wilmington', coordinates: [-75.5398, 39.7391], technicians: 0, coverage: 'partial', zipCodes: ['19801-19899'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
      { name: 'Dover', coordinates: [-75.5243, 39.1582], technicians: 0, coverage: 'partial', zipCodes: ['19901-19999'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
    ],
  },

  // DISTRICT OF COLUMBIA
  DC: {
    name: 'District of Columbia',
    abbr: 'DC',
    coverage: 'full',
    stats: { cities: 1, technicians: 0, zipCodes: 180, avgResponseTime: 'Contact for availability' },
    center: [-77.0369, 38.9072],
    cities: [
      { name: 'Washington', coordinates: [-77.0369, 38.9072], technicians: 0, coverage: 'full', zipCodes: ['20001-20099', '20201-20599'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair', 'ADAS Calibration', 'Side Windows'], technicianList: [] },
    ],
  },

  // FLORIDA
  FL: {
    name: 'Florida',
    abbr: 'FL',
    coverage: 'full',
    stats: { cities: 10, technicians: 0, zipCodes: 2800, avgResponseTime: 'Contact for availability' },
    center: [-81.5158, 27.6648],
    cities: [
      { name: 'Miami', coordinates: [-80.1918, 25.7617], technicians: 0, coverage: 'full', zipCodes: ['33101-33199'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair', 'ADAS Calibration', 'Side Windows', 'Rear Glass'], technicianList: [] },
      { name: 'Orlando', coordinates: [-81.3792, 28.5383], technicians: 0, coverage: 'full', zipCodes: ['32801-32899'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair', 'Side Windows'], technicianList: [] },
      { name: 'Tampa', coordinates: [-82.4572, 27.9506], technicians: 0, coverage: 'full', zipCodes: ['33601-33699'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair', 'ADAS Calibration'], technicianList: [] },
      { name: 'Jacksonville', coordinates: [-81.6557, 30.3322], technicians: 0, coverage: 'full', zipCodes: ['32201-32299'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair', 'Side Windows'], technicianList: [] },
      { name: 'Fort Lauderdale', coordinates: [-80.1373, 26.1224], technicians: 0, coverage: 'full', zipCodes: ['33301-33399'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair', 'ADAS Calibration'], technicianList: [] },
      { name: 'St. Petersburg', coordinates: [-82.6403, 27.7676], technicians: 0, coverage: 'full', zipCodes: ['33701-33799'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
      { name: 'West Palm Beach', coordinates: [-80.0534, 26.7153], technicians: 0, coverage: 'full', zipCodes: ['33401-33499'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
      { name: 'Tallahassee', coordinates: [-84.2807, 30.4383], technicians: 0, coverage: 'partial', zipCodes: ['32301-32399'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
      { name: 'Fort Myers', coordinates: [-81.8723, 26.6406], technicians: 0, coverage: 'partial', zipCodes: ['33901-33999'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
      { name: 'Sarasota', coordinates: [-82.5308, 27.3364], technicians: 0, coverage: 'partial', zipCodes: ['34230-34299'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
    ],
  },

  // GEORGIA
  GA: {
    name: 'Georgia',
    abbr: 'GA',
    coverage: 'full',
    stats: { cities: 5, technicians: 0, zipCodes: 800, avgResponseTime: 'Contact for availability' },
    center: [-82.9071, 32.1656],
    cities: [
      { name: 'Atlanta', coordinates: [-84.3880, 33.7490], technicians: 0, coverage: 'full', zipCodes: ['30301-30399'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair', 'ADAS Calibration', 'Side Windows'], technicianList: [] },
      { name: 'Augusta', coordinates: [-81.9748, 33.4735], technicians: 0, coverage: 'partial', zipCodes: ['30901-30999'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
      { name: 'Savannah', coordinates: [-81.0998, 32.0809], technicians: 0, coverage: 'partial', zipCodes: ['31401-31499'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
      { name: 'Columbus', coordinates: [-84.9877, 32.4610], technicians: 0, coverage: 'partial', zipCodes: ['31901-31999'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
      { name: 'Macon', coordinates: [-83.6324, 32.8407], technicians: 0, coverage: 'partial', zipCodes: ['31201-31299'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
    ],
  },

  // HAWAII
  HI: {
    name: 'Hawaii',
    abbr: 'HI',
    coverage: 'limited',
    stats: { cities: 2, technicians: 0, zipCodes: 95, avgResponseTime: 'Contact for availability' },
    center: [-155.5828, 19.8968],
    cities: [
      { name: 'Honolulu', coordinates: [-157.8583, 21.3069], technicians: 0, coverage: 'partial', zipCodes: ['96801-96899'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
      { name: 'Hilo', coordinates: [-155.0900, 19.7297], technicians: 0, coverage: 'limited', zipCodes: ['96720-96799'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement'], technicianList: [] },
    ],
  },

  // IDAHO
  ID: {
    name: 'Idaho',
    abbr: 'ID',
    coverage: 'expanding',
    stats: { cities: 2, technicians: 0, zipCodes: 200, avgResponseTime: 'Contact for availability' },
    center: [-114.7420, 44.0682],
    cities: [
      { name: 'Boise', coordinates: [-116.2146, 43.6150], technicians: 0, coverage: 'partial', zipCodes: ['83701-83799'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
      { name: 'Idaho Falls', coordinates: [-112.0391, 43.4666], technicians: 0, coverage: 'limited', zipCodes: ['83401-83499'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
    ],
  },

  // ILLINOIS
  IL: {
    name: 'Illinois',
    abbr: 'IL',
    coverage: 'full',
    stats: { cities: 5, technicians: 0, zipCodes: 1500, avgResponseTime: 'Contact for availability' },
    center: [-89.3985, 40.6331],
    cities: [
      { name: 'Chicago', coordinates: [-87.6298, 41.8781], technicians: 0, coverage: 'full', zipCodes: ['60601-60699'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair', 'ADAS Calibration', 'Side Windows'], technicianList: [] },
      { name: 'Aurora', coordinates: [-88.3201, 41.7606], technicians: 0, coverage: 'full', zipCodes: ['60502-60599'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
      { name: 'Naperville', coordinates: [-88.1535, 41.7508], technicians: 0, coverage: 'full', zipCodes: ['60540-60599'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
      { name: 'Rockford', coordinates: [-89.0940, 42.2711], technicians: 0, coverage: 'partial', zipCodes: ['61101-61199'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
      { name: 'Springfield', coordinates: [-89.6501, 39.7817], technicians: 0, coverage: 'partial', zipCodes: ['62701-62799'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
    ],
  },

  // INDIANA
  IN: {
    name: 'Indiana',
    abbr: 'IN',
    coverage: 'partial',
    stats: { cities: 4, technicians: 0, zipCodes: 600, avgResponseTime: 'Contact for availability' },
    center: [-86.1349, 40.2672],
    cities: [
      { name: 'Indianapolis', coordinates: [-86.1581, 39.7684], technicians: 0, coverage: 'full', zipCodes: ['46201-46299'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair', 'ADAS Calibration'], technicianList: [] },
      { name: 'Fort Wayne', coordinates: [-85.1394, 41.0793], technicians: 0, coverage: 'partial', zipCodes: ['46801-46899'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
      { name: 'Evansville', coordinates: [-87.5711, 37.9716], technicians: 0, coverage: 'partial', zipCodes: ['47701-47799'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
      { name: 'South Bend', coordinates: [-86.2520, 41.6764], technicians: 0, coverage: 'partial', zipCodes: ['46601-46699'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
    ],
  },

  // IOWA
  IA: {
    name: 'Iowa',
    abbr: 'IA',
    coverage: 'expanding',
    stats: { cities: 3, technicians: 0, zipCodes: 450, avgResponseTime: 'Contact for availability' },
    center: [-93.0977, 41.8780],
    cities: [
      { name: 'Des Moines', coordinates: [-93.6091, 41.5868], technicians: 0, coverage: 'partial', zipCodes: ['50301-50399'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
      { name: 'Cedar Rapids', coordinates: [-91.6656, 41.9779], technicians: 0, coverage: 'partial', zipCodes: ['52401-52499'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
      { name: 'Davenport', coordinates: [-90.5776, 41.5236], technicians: 0, coverage: 'partial', zipCodes: ['52801-52899'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
    ],
  },

  // KANSAS
  KS: {
    name: 'Kansas',
    abbr: 'KS',
    coverage: 'expanding',
    stats: { cities: 3, technicians: 0, zipCodes: 400, avgResponseTime: 'Contact for availability' },
    center: [-98.4842, 39.0119],
    cities: [
      { name: 'Wichita', coordinates: [-97.3375, 37.6872], technicians: 0, coverage: 'partial', zipCodes: ['67201-67299'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
      { name: 'Overland Park', coordinates: [-94.6708, 38.9822], technicians: 0, coverage: 'partial', zipCodes: ['66201-66299'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
      { name: 'Kansas City', coordinates: [-94.6275, 39.1141], technicians: 0, coverage: 'partial', zipCodes: ['66101-66199'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
    ],
  },

  // KENTUCKY
  KY: {
    name: 'Kentucky',
    abbr: 'KY',
    coverage: 'expanding',
    stats: { cities: 3, technicians: 0, zipCodes: 500, avgResponseTime: 'Contact for availability' },
    center: [-84.2700, 37.8393],
    cities: [
      { name: 'Louisville', coordinates: [-85.7585, 38.2527], technicians: 0, coverage: 'partial', zipCodes: ['40201-40299'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
      { name: 'Lexington', coordinates: [-84.5037, 38.0406], technicians: 0, coverage: 'partial', zipCodes: ['40501-40599'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
      { name: 'Bowling Green', coordinates: [-86.4436, 36.9685], technicians: 0, coverage: 'partial', zipCodes: ['42101-42199'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
    ],
  },

  // LOUISIANA
  LA: {
    name: 'Louisiana',
    abbr: 'LA',
    coverage: 'partial',
    stats: { cities: 4, technicians: 0, zipCodes: 550, avgResponseTime: 'Contact for availability' },
    center: [-91.9623, 30.9843],
    cities: [
      { name: 'New Orleans', coordinates: [-90.0715, 29.9511], technicians: 0, coverage: 'partial', zipCodes: ['70112-70199'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair', 'Side Windows'], technicianList: [] },
      { name: 'Baton Rouge', coordinates: [-91.1871, 30.4515], technicians: 0, coverage: 'partial', zipCodes: ['70801-70899'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
      { name: 'Shreveport', coordinates: [-93.7502, 32.5252], technicians: 0, coverage: 'partial', zipCodes: ['71101-71199'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
      { name: 'Lafayette', coordinates: [-92.0198, 30.2241], technicians: 0, coverage: 'partial', zipCodes: ['70501-70599'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
    ],
  },

  // MAINE
  ME: {
    name: 'Maine',
    abbr: 'ME',
    coverage: 'limited',
    stats: { cities: 2, technicians: 0, zipCodes: 200, avgResponseTime: 'Contact for availability' },
    center: [-69.4455, 45.2538],
    cities: [
      { name: 'Portland', coordinates: [-70.2553, 43.6591], technicians: 0, coverage: 'partial', zipCodes: ['04101-04199'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
      { name: 'Bangor', coordinates: [-68.7712, 44.8016], technicians: 0, coverage: 'limited', zipCodes: ['04401-04499'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement'], technicianList: [] },
    ],
  },

  // MARYLAND
  MD: {
    name: 'Maryland',
    abbr: 'MD',
    coverage: 'partial',
    stats: { cities: 3, technicians: 0, zipCodes: 500, avgResponseTime: 'Contact for availability' },
    center: [-76.6413, 39.0458],
    cities: [
      { name: 'Baltimore', coordinates: [-76.6122, 39.2904], technicians: 0, coverage: 'partial', zipCodes: ['21201-21299'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair', 'ADAS Calibration'], technicianList: [] },
      { name: 'Columbia', coordinates: [-76.8394, 39.2040], technicians: 0, coverage: 'partial', zipCodes: ['21044-21046'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
      { name: 'Silver Spring', coordinates: [-77.0261, 38.9907], technicians: 0, coverage: 'partial', zipCodes: ['20901-20999'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
    ],
  },

  // MASSACHUSETTS
  MA: {
    name: 'Massachusetts',
    abbr: 'MA',
    coverage: 'partial',
    stats: { cities: 4, technicians: 0, zipCodes: 600, avgResponseTime: 'Contact for availability' },
    center: [-71.3824, 42.4072],
    cities: [
      { name: 'Boston', coordinates: [-71.0589, 42.3601], technicians: 0, coverage: 'full', zipCodes: ['02101-02199'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair', 'ADAS Calibration'], technicianList: [] },
      { name: 'Worcester', coordinates: [-71.8023, 42.2626], technicians: 0, coverage: 'partial', zipCodes: ['01601-01699'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
      { name: 'Springfield', coordinates: [-72.5898, 42.1015], technicians: 0, coverage: 'partial', zipCodes: ['01101-01199'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
      { name: 'Cambridge', coordinates: [-71.1097, 42.3736], technicians: 0, coverage: 'partial', zipCodes: ['02138-02142'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
    ],
  },

  // MICHIGAN
  MI: {
    name: 'Michigan',
    abbr: 'MI',
    coverage: 'partial',
    stats: { cities: 4, technicians: 0, zipCodes: 900, avgResponseTime: 'Contact for availability' },
    center: [-85.6024, 44.3148],
    cities: [
      { name: 'Detroit', coordinates: [-83.0458, 42.3314], technicians: 0, coverage: 'full', zipCodes: ['48201-48299'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair', 'ADAS Calibration'], technicianList: [] },
      { name: 'Grand Rapids', coordinates: [-85.6681, 42.9634], technicians: 0, coverage: 'partial', zipCodes: ['49501-49599'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
      { name: 'Ann Arbor', coordinates: [-83.7430, 42.2808], technicians: 0, coverage: 'partial', zipCodes: ['48101-48199'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
      { name: 'Lansing', coordinates: [-84.5555, 42.7325], technicians: 0, coverage: 'partial', zipCodes: ['48901-48999'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
    ],
  },

  // MINNESOTA
  MN: {
    name: 'Minnesota',
    abbr: 'MN',
    coverage: 'partial',
    stats: { cities: 3, technicians: 0, zipCodes: 600, avgResponseTime: 'Contact for availability' },
    center: [-94.6859, 46.7296],
    cities: [
      { name: 'Minneapolis', coordinates: [-93.2650, 44.9778], technicians: 0, coverage: 'full', zipCodes: ['55401-55499'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair', 'ADAS Calibration'], technicianList: [] },
      { name: 'St. Paul', coordinates: [-93.0900, 44.9537], technicians: 0, coverage: 'full', zipCodes: ['55101-55199'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
      { name: 'Rochester', coordinates: [-92.4802, 44.0234], technicians: 0, coverage: 'partial', zipCodes: ['55901-55999'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
    ],
  },

  // MISSISSIPPI
  MS: {
    name: 'Mississippi',
    abbr: 'MS',
    coverage: 'expanding',
    stats: { cities: 3, technicians: 0, zipCodes: 400, avgResponseTime: 'Contact for availability' },
    center: [-89.3985, 32.3547],
    cities: [
      { name: 'Jackson', coordinates: [-90.1848, 32.2988], technicians: 0, coverage: 'partial', zipCodes: ['39201-39299'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
      { name: 'Gulfport', coordinates: [-89.0928, 30.3674], technicians: 0, coverage: 'partial', zipCodes: ['39501-39599'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
      { name: 'Biloxi', coordinates: [-88.8853, 30.3960], technicians: 0, coverage: 'partial', zipCodes: ['39530-39535'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
    ],
  },

  // MISSOURI
  MO: {
    name: 'Missouri',
    abbr: 'MO',
    coverage: 'partial',
    stats: { cities: 4, technicians: 0, zipCodes: 700, avgResponseTime: 'Contact for availability' },
    center: [-91.8318, 37.9643],
    cities: [
      { name: 'Kansas City', coordinates: [-94.5786, 39.0997], technicians: 0, coverage: 'full', zipCodes: ['64101-64199'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair', 'ADAS Calibration'], technicianList: [] },
      { name: 'St. Louis', coordinates: [-90.1994, 38.6270], technicians: 0, coverage: 'full', zipCodes: ['63101-63199'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair', 'ADAS Calibration'], technicianList: [] },
      { name: 'Springfield', coordinates: [-93.2923, 37.2090], technicians: 0, coverage: 'partial', zipCodes: ['65801-65899'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
      { name: 'Columbia', coordinates: [-92.3341, 38.9517], technicians: 0, coverage: 'partial', zipCodes: ['65201-65299'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
    ],
  },

  // MONTANA
  MT: {
    name: 'Montana',
    abbr: 'MT',
    coverage: 'limited',
    stats: { cities: 2, technicians: 0, zipCodes: 180, avgResponseTime: 'Contact for availability' },
    center: [-110.3626, 46.8797],
    cities: [
      { name: 'Billings', coordinates: [-108.5007, 45.7833], technicians: 0, coverage: 'limited', zipCodes: ['59101-59199'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
      { name: 'Missoula', coordinates: [-114.0103, 46.8721], technicians: 0, coverage: 'limited', zipCodes: ['59801-59899'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement'], technicianList: [] },
    ],
  },

  // NEBRASKA
  NE: {
    name: 'Nebraska',
    abbr: 'NE',
    coverage: 'expanding',
    stats: { cities: 2, technicians: 0, zipCodes: 300, avgResponseTime: 'Contact for availability' },
    center: [-99.9018, 41.4925],
    cities: [
      { name: 'Omaha', coordinates: [-95.9345, 41.2565], technicians: 0, coverage: 'partial', zipCodes: ['68101-68199'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
      { name: 'Lincoln', coordinates: [-96.6852, 40.8258], technicians: 0, coverage: 'partial', zipCodes: ['68501-68599'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
    ],
  },

  // NEVADA
  NV: {
    name: 'Nevada',
    abbr: 'NV',
    coverage: 'full',
    stats: { cities: 3, technicians: 0, zipCodes: 600, avgResponseTime: 'Contact for availability' },
    center: [-116.4194, 38.8026],
    cities: [
      { name: 'Las Vegas', coordinates: [-115.1398, 36.1699], technicians: 0, coverage: 'full', zipCodes: ['89101-89199'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair', 'ADAS Calibration', 'Side Windows'], technicianList: [] },
      { name: 'Reno', coordinates: [-119.8138, 39.5296], technicians: 0, coverage: 'full', zipCodes: ['89501-89599'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
      { name: 'Henderson', coordinates: [-114.9817, 36.0395], technicians: 0, coverage: 'full', zipCodes: ['89002-89099'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
    ],
  },

  // NEW HAMPSHIRE
  NH: {
    name: 'New Hampshire',
    abbr: 'NH',
    coverage: 'limited',
    stats: { cities: 2, technicians: 0, zipCodes: 150, avgResponseTime: 'Contact for availability' },
    center: [-71.5724, 43.1939],
    cities: [
      { name: 'Manchester', coordinates: [-71.4548, 42.9956], technicians: 0, coverage: 'partial', zipCodes: ['03101-03199'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
      { name: 'Nashua', coordinates: [-71.4676, 42.7654], technicians: 0, coverage: 'partial', zipCodes: ['03060-03064'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
    ],
  },

  // NEW JERSEY
  NJ: {
    name: 'New Jersey',
    abbr: 'NJ',
    coverage: 'partial',
    stats: { cities: 5, technicians: 0, zipCodes: 600, avgResponseTime: 'Contact for availability' },
    center: [-74.4057, 40.0583],
    cities: [
      { name: 'Newark', coordinates: [-74.1724, 40.7357], technicians: 0, coverage: 'full', zipCodes: ['07101-07199'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair', 'Side Windows'], technicianList: [] },
      { name: 'Jersey City', coordinates: [-74.0431, 40.7178], technicians: 0, coverage: 'full', zipCodes: ['07301-07399'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
      { name: 'Paterson', coordinates: [-74.1724, 40.9168], technicians: 0, coverage: 'partial', zipCodes: ['07501-07599'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
      { name: 'Edison', coordinates: [-74.4121, 40.5187], technicians: 0, coverage: 'partial', zipCodes: ['08817-08820'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
      { name: 'Trenton', coordinates: [-74.7429, 40.2206], technicians: 0, coverage: 'partial', zipCodes: ['08601-08699'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
    ],
  },

  // NEW MEXICO
  NM: {
    name: 'New Mexico',
    abbr: 'NM',
    coverage: 'expanding',
    stats: { cities: 3, technicians: 0, zipCodes: 350, avgResponseTime: 'Contact for availability' },
    center: [-105.8701, 34.5199],
    cities: [
      { name: 'Albuquerque', coordinates: [-106.6504, 35.0844], technicians: 0, coverage: 'partial', zipCodes: ['87101-87199'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair', 'ADAS Calibration'], technicianList: [] },
      { name: 'Santa Fe', coordinates: [-105.9378, 35.6870], technicians: 0, coverage: 'partial', zipCodes: ['87501-87599'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
      { name: 'Las Cruces', coordinates: [-106.7637, 32.3199], technicians: 0, coverage: 'limited', zipCodes: ['88001-88099'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
    ],
  },

  // NEW YORK
  NY: {
    name: 'New York',
    abbr: 'NY',
    coverage: 'full',
    stats: { cities: 6, technicians: 0, zipCodes: 2000, avgResponseTime: 'Contact for availability' },
    center: [-75.4999, 43.2994],
    cities: [
      { name: 'New York City', coordinates: [-74.0060, 40.7128], technicians: 0, coverage: 'full', zipCodes: ['10001-10299'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair', 'ADAS Calibration', 'Side Windows', 'Rear Glass'], technicianList: [] },
      { name: 'Buffalo', coordinates: [-78.8784, 42.8864], technicians: 0, coverage: 'partial', zipCodes: ['14201-14299'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
      { name: 'Rochester', coordinates: [-77.6109, 43.1566], technicians: 0, coverage: 'partial', zipCodes: ['14601-14699'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
      { name: 'Albany', coordinates: [-73.7562, 42.6526], technicians: 0, coverage: 'partial', zipCodes: ['12201-12299'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
      { name: 'Syracuse', coordinates: [-76.1474, 43.0481], technicians: 0, coverage: 'partial', zipCodes: ['13201-13299'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
      { name: 'Yonkers', coordinates: [-73.8987, 40.9312], technicians: 0, coverage: 'partial', zipCodes: ['10701-10799'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
    ],
  },

  // NORTH CAROLINA
  NC: {
    name: 'North Carolina',
    abbr: 'NC',
    coverage: 'partial',
    stats: { cities: 5, technicians: 0, zipCodes: 900, avgResponseTime: 'Contact for availability' },
    center: [-79.0193, 35.7596],
    cities: [
      { name: 'Charlotte', coordinates: [-80.8431, 35.2271], technicians: 0, coverage: 'full', zipCodes: ['28201-28299'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair', 'ADAS Calibration', 'Side Windows'], technicianList: [] },
      { name: 'Raleigh', coordinates: [-78.6382, 35.7796], technicians: 0, coverage: 'full', zipCodes: ['27601-27699'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair', 'ADAS Calibration'], technicianList: [] },
      { name: 'Greensboro', coordinates: [-79.7920, 36.0726], technicians: 0, coverage: 'partial', zipCodes: ['27401-27499'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
      { name: 'Durham', coordinates: [-78.8986, 35.9940], technicians: 0, coverage: 'partial', zipCodes: ['27701-27799'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
      { name: 'Winston-Salem', coordinates: [-80.2442, 36.0999], technicians: 0, coverage: 'partial', zipCodes: ['27101-27199'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
    ],
  },

  // NORTH DAKOTA
  ND: {
    name: 'North Dakota',
    abbr: 'ND',
    coverage: 'limited',
    stats: { cities: 2, technicians: 0, zipCodes: 150, avgResponseTime: 'Contact for availability' },
    center: [-101.0020, 47.5515],
    cities: [
      { name: 'Fargo', coordinates: [-96.7898, 46.8772], technicians: 0, coverage: 'partial', zipCodes: ['58101-58199'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
      { name: 'Bismarck', coordinates: [-100.7837, 46.8083], technicians: 0, coverage: 'limited', zipCodes: ['58501-58599'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement'], technicianList: [] },
    ],
  },

  // OHIO
  OH: {
    name: 'Ohio',
    abbr: 'OH',
    coverage: 'partial',
    stats: { cities: 5, technicians: 0, zipCodes: 1000, avgResponseTime: 'Contact for availability' },
    center: [-82.9071, 40.4173],
    cities: [
      { name: 'Columbus', coordinates: [-82.9988, 39.9612], technicians: 0, coverage: 'full', zipCodes: ['43201-43299'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair', 'ADAS Calibration', 'Side Windows'], technicianList: [] },
      { name: 'Cleveland', coordinates: [-81.6944, 41.4993], technicians: 0, coverage: 'full', zipCodes: ['44101-44199'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair', 'ADAS Calibration'], technicianList: [] },
      { name: 'Cincinnati', coordinates: [-84.5120, 39.1031], technicians: 0, coverage: 'full', zipCodes: ['45201-45299'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair', 'ADAS Calibration'], technicianList: [] },
      { name: 'Toledo', coordinates: [-83.5379, 41.6528], technicians: 0, coverage: 'partial', zipCodes: ['43601-43699'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
      { name: 'Akron', coordinates: [-81.5190, 41.0814], technicians: 0, coverage: 'partial', zipCodes: ['44301-44399'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
    ],
  },

  // OKLAHOMA
  OK: {
    name: 'Oklahoma',
    abbr: 'OK',
    coverage: 'expanding',
    stats: { cities: 3, technicians: 0, zipCodes: 450, avgResponseTime: 'Contact for availability' },
    center: [-97.5164, 35.0078],
    cities: [
      { name: 'Oklahoma City', coordinates: [-97.5164, 35.4676], technicians: 0, coverage: 'partial', zipCodes: ['73101-73199'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair', 'ADAS Calibration'], technicianList: [] },
      { name: 'Tulsa', coordinates: [-95.9928, 36.1540], technicians: 0, coverage: 'partial', zipCodes: ['74101-74199'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
      { name: 'Norman', coordinates: [-97.4395, 35.2226], technicians: 0, coverage: 'partial', zipCodes: ['73069-73099'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
    ],
  },

  // OREGON
  OR: {
    name: 'Oregon',
    abbr: 'OR',
    coverage: 'full',
    stats: { cities: 4, technicians: 0, zipCodes: 800, avgResponseTime: 'Contact for availability' },
    center: [-120.5542, 43.8041],
    cities: [
      { name: 'Portland', coordinates: [-122.6765, 45.5152], technicians: 0, coverage: 'full', zipCodes: ['97201-97299'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair', 'ADAS Calibration', 'Side Windows'], technicianList: [] },
      { name: 'Salem', coordinates: [-123.0351, 44.9429], technicians: 0, coverage: 'partial', zipCodes: ['97301-97399'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
      { name: 'Eugene', coordinates: [-123.0868, 44.0521], technicians: 0, coverage: 'partial', zipCodes: ['97401-97499'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
      { name: 'Bend', coordinates: [-121.3153, 44.0582], technicians: 0, coverage: 'partial', zipCodes: ['97701-97799'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
    ],
  },

  // PENNSYLVANIA
  PA: {
    name: 'Pennsylvania',
    abbr: 'PA',
    coverage: 'partial',
    stats: { cities: 5, technicians: 0, zipCodes: 1200, avgResponseTime: 'Contact for availability' },
    center: [-77.1945, 41.2033],
    cities: [
      { name: 'Philadelphia', coordinates: [-75.1652, 39.9526], technicians: 0, coverage: 'full', zipCodes: ['19101-19199'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair', 'ADAS Calibration', 'Side Windows'], technicianList: [] },
      { name: 'Pittsburgh', coordinates: [-79.9959, 40.4406], technicians: 0, coverage: 'full', zipCodes: ['15201-15299'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair', 'ADAS Calibration'], technicianList: [] },
      { name: 'Allentown', coordinates: [-75.4902, 40.6084], technicians: 0, coverage: 'partial', zipCodes: ['18101-18199'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
      { name: 'Erie', coordinates: [-80.0852, 42.1292], technicians: 0, coverage: 'partial', zipCodes: ['16501-16599'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
      { name: 'Harrisburg', coordinates: [-76.8867, 40.2732], technicians: 0, coverage: 'partial', zipCodes: ['17101-17199'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
    ],
  },

  // RHODE ISLAND
  RI: {
    name: 'Rhode Island',
    abbr: 'RI',
    coverage: 'partial',
    stats: { cities: 2, technicians: 0, zipCodes: 70, avgResponseTime: 'Contact for availability' },
    center: [-71.4774, 41.5801],
    cities: [
      { name: 'Providence', coordinates: [-71.4128, 41.8240], technicians: 0, coverage: 'partial', zipCodes: ['02901-02999'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
      { name: 'Warwick', coordinates: [-71.4162, 41.7001], technicians: 0, coverage: 'partial', zipCodes: ['02886-02889'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
    ],
  },

  // SOUTH CAROLINA
  SC: {
    name: 'South Carolina',
    abbr: 'SC',
    coverage: 'expanding',
    stats: { cities: 4, technicians: 0, zipCodes: 500, avgResponseTime: 'Contact for availability' },
    center: [-81.1637, 33.8361],
    cities: [
      { name: 'Charleston', coordinates: [-79.9311, 32.7765], technicians: 0, coverage: 'partial', zipCodes: ['29401-29499'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
      { name: 'Columbia', coordinates: [-81.0348, 34.0007], technicians: 0, coverage: 'partial', zipCodes: ['29201-29299'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
      { name: 'Greenville', coordinates: [-82.3940, 34.8526], technicians: 0, coverage: 'partial', zipCodes: ['29601-29699'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
      { name: 'Myrtle Beach', coordinates: [-78.8867, 33.6891], technicians: 0, coverage: 'partial', zipCodes: ['29577-29588'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
    ],
  },

  // SOUTH DAKOTA
  SD: {
    name: 'South Dakota',
    abbr: 'SD',
    coverage: 'limited',
    stats: { cities: 2, technicians: 0, zipCodes: 120, avgResponseTime: 'Contact for availability' },
    center: [-99.9018, 43.9695],
    cities: [
      { name: 'Sioux Falls', coordinates: [-96.7311, 43.5460], technicians: 0, coverage: 'partial', zipCodes: ['57101-57199'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
      { name: 'Rapid City', coordinates: [-103.2310, 44.0805], technicians: 0, coverage: 'limited', zipCodes: ['57701-57799'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement'], technicianList: [] },
    ],
  },

  // TENNESSEE
  TN: {
    name: 'Tennessee',
    abbr: 'TN',
    coverage: 'partial',
    stats: { cities: 5, technicians: 0, zipCodes: 700, avgResponseTime: 'Contact for availability' },
    center: [-86.5804, 35.5175],
    cities: [
      { name: 'Nashville', coordinates: [-86.7816, 36.1627], technicians: 0, coverage: 'full', zipCodes: ['37201-37299'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair', 'ADAS Calibration', 'Side Windows'], technicianList: [] },
      { name: 'Memphis', coordinates: [-90.0490, 35.1495], technicians: 0, coverage: 'full', zipCodes: ['38101-38199'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair', 'Side Windows'], technicianList: [] },
      { name: 'Knoxville', coordinates: [-83.9207, 35.9606], technicians: 0, coverage: 'partial', zipCodes: ['37901-37999'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
      { name: 'Chattanooga', coordinates: [-85.3097, 35.0456], technicians: 0, coverage: 'partial', zipCodes: ['37401-37499'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
      { name: 'Clarksville', coordinates: [-87.3595, 36.5298], technicians: 0, coverage: 'partial', zipCodes: ['37040-37044'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
    ],
  },

  // TEXAS
  TX: {
    name: 'Texas',
    abbr: 'TX',
    coverage: 'full',
    stats: { cities: 10, technicians: 0, zipCodes: 3500, avgResponseTime: 'Contact for availability' },
    center: [-99.9018, 31.9686],
    cities: [
      { name: 'Houston', coordinates: [-95.3698, 29.7604], technicians: 0, coverage: 'full', zipCodes: ['77001-77099'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair', 'ADAS Calibration', 'Side Windows', 'Rear Glass'], technicianList: [] },
      { name: 'Dallas', coordinates: [-96.7970, 32.7767], technicians: 0, coverage: 'full', zipCodes: ['75201-75398'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair', 'ADAS Calibration', 'Side Windows'], technicianList: [] },
      { name: 'San Antonio', coordinates: [-98.4936, 29.4241], technicians: 0, coverage: 'full', zipCodes: ['78201-78299'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair', 'ADAS Calibration', 'Side Windows'], technicianList: [] },
      { name: 'Austin', coordinates: [-97.7431, 30.2672], technicians: 0, coverage: 'full', zipCodes: ['78701-78799'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair', 'ADAS Calibration'], technicianList: [] },
      { name: 'Fort Worth', coordinates: [-97.3308, 32.7555], technicians: 0, coverage: 'full', zipCodes: ['76101-76199'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair', 'Side Windows'], technicianList: [] },
      { name: 'El Paso', coordinates: [-106.4850, 31.7619], technicians: 0, coverage: 'partial', zipCodes: ['79901-79999'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
      { name: 'Arlington', coordinates: [-97.1081, 32.7357], technicians: 0, coverage: 'full', zipCodes: ['76001-76099'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
      { name: 'Corpus Christi', coordinates: [-97.3964, 27.8006], technicians: 0, coverage: 'partial', zipCodes: ['78401-78499'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
      { name: 'Plano', coordinates: [-96.6989, 33.0198], technicians: 0, coverage: 'full', zipCodes: ['75023-75099'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair', 'ADAS Calibration'], technicianList: [] },
      { name: 'Lubbock', coordinates: [-101.8552, 33.5779], technicians: 0, coverage: 'partial', zipCodes: ['79401-79499'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
    ],
  },

  // UTAH
  UT: {
    name: 'Utah',
    abbr: 'UT',
    coverage: 'expanding',
    stats: { cities: 3, technicians: 0, zipCodes: 400, avgResponseTime: 'Contact for availability' },
    center: [-111.0937, 39.3200],
    cities: [
      { name: 'Salt Lake City', coordinates: [-111.8910, 40.7608], technicians: 0, coverage: 'partial', zipCodes: ['84101-84199'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair', 'ADAS Calibration'], technicianList: [] },
      { name: 'Provo', coordinates: [-111.6585, 40.2338], technicians: 0, coverage: 'partial', zipCodes: ['84601-84699'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
      { name: 'West Valley City', coordinates: [-112.0011, 40.6916], technicians: 0, coverage: 'partial', zipCodes: ['84119-84128'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
    ],
  },

  // VERMONT
  VT: {
    name: 'Vermont',
    abbr: 'VT',
    coverage: 'limited',
    stats: { cities: 2, technicians: 0, zipCodes: 100, avgResponseTime: 'Contact for availability' },
    center: [-72.5778, 44.5588],
    cities: [
      { name: 'Burlington', coordinates: [-73.2121, 44.4759], technicians: 0, coverage: 'partial', zipCodes: ['05401-05499'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
      { name: 'Montpelier', coordinates: [-72.5754, 44.2601], technicians: 0, coverage: 'limited', zipCodes: ['05601-05699'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement'], technicianList: [] },
    ],
  },

  // VIRGINIA
  VA: {
    name: 'Virginia',
    abbr: 'VA',
    coverage: 'partial',
    stats: { cities: 5, technicians: 0, zipCodes: 900, avgResponseTime: 'Contact for availability' },
    center: [-78.6569, 37.4316],
    cities: [
      { name: 'Virginia Beach', coordinates: [-75.9780, 36.8529], technicians: 0, coverage: 'full', zipCodes: ['23451-23499'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair', 'ADAS Calibration'], technicianList: [] },
      { name: 'Norfolk', coordinates: [-76.2859, 36.8508], technicians: 0, coverage: 'full', zipCodes: ['23501-23599'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
      { name: 'Richmond', coordinates: [-77.4360, 37.5407], technicians: 0, coverage: 'full', zipCodes: ['23218-23299'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair', 'ADAS Calibration'], technicianList: [] },
      { name: 'Arlington', coordinates: [-77.0910, 38.8816], technicians: 0, coverage: 'full', zipCodes: ['22201-22299'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
      { name: 'Newport News', coordinates: [-76.4730, 37.0871], technicians: 0, coverage: 'partial', zipCodes: ['23601-23699'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
    ],
  },

  // WASHINGTON
  WA: {
    name: 'Washington',
    abbr: 'WA',
    coverage: 'full',
    stats: { cities: 5, technicians: 0, zipCodes: 1400, avgResponseTime: 'Contact for availability' },
    center: [-120.7401, 47.7511],
    cities: [
      { name: 'Seattle', coordinates: [-122.3321, 47.6062], technicians: 0, coverage: 'full', zipCodes: ['98101-98199'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair', 'ADAS Calibration', 'Side Windows', 'Rear Glass'], technicianList: [] },
      { name: 'Spokane', coordinates: [-117.4260, 47.6588], technicians: 0, coverage: 'full', zipCodes: ['99201-99299'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
      { name: 'Tacoma', coordinates: [-122.4443, 47.2529], technicians: 0, coverage: 'full', zipCodes: ['98401-98499'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair', 'Side Windows'], technicianList: [] },
      { name: 'Vancouver', coordinates: [-122.6615, 45.6387], technicians: 0, coverage: 'partial', zipCodes: ['98660-98699'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
      { name: 'Bellevue', coordinates: [-122.2015, 47.6101], technicians: 0, coverage: 'full', zipCodes: ['98004-98009'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair', 'ADAS Calibration'], technicianList: [] },
    ],
  },

  // WEST VIRGINIA
  WV: {
    name: 'West Virginia',
    abbr: 'WV',
    coverage: 'limited',
    stats: { cities: 2, technicians: 0, zipCodes: 200, avgResponseTime: 'Contact for availability' },
    center: [-80.4549, 38.5976],
    cities: [
      { name: 'Charleston', coordinates: [-81.6326, 38.3498], technicians: 0, coverage: 'partial', zipCodes: ['25301-25399'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
      { name: 'Huntington', coordinates: [-82.4452, 38.4192], technicians: 0, coverage: 'limited', zipCodes: ['25701-25799'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement'], technicianList: [] },
    ],
  },

  // WISCONSIN
  WI: {
    name: 'Wisconsin',
    abbr: 'WI',
    coverage: 'partial',
    stats: { cities: 4, technicians: 0, zipCodes: 600, avgResponseTime: 'Contact for availability' },
    center: [-89.6165, 43.7844],
    cities: [
      { name: 'Milwaukee', coordinates: [-87.9065, 43.0389], technicians: 0, coverage: 'full', zipCodes: ['53201-53299'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair', 'ADAS Calibration'], technicianList: [] },
      { name: 'Madison', coordinates: [-89.4012, 43.0731], technicians: 0, coverage: 'partial', zipCodes: ['53701-53799'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
      { name: 'Green Bay', coordinates: [-88.0199, 44.5133], technicians: 0, coverage: 'partial', zipCodes: ['54301-54399'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
      { name: 'Kenosha', coordinates: [-87.8212, 42.5847], technicians: 0, coverage: 'partial', zipCodes: ['53140-53144'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
    ],
  },

  // WYOMING
  WY: {
    name: 'Wyoming',
    abbr: 'WY',
    coverage: 'limited',
    stats: { cities: 2, technicians: 0, zipCodes: 100, avgResponseTime: 'Contact for availability' },
    center: [-107.2903, 43.0760],
    cities: [
      { name: 'Cheyenne', coordinates: [-104.8202, 41.1400], technicians: 0, coverage: 'limited', zipCodes: ['82001-82099'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement', 'Chip Repair'], technicianList: [] },
      { name: 'Casper', coordinates: [-106.3132, 42.8666], technicians: 0, coverage: 'limited', zipCodes: ['82601-82699'], avgResponseTime: 'Contact for availability', services: ['Windshield Replacement'], technicianList: [] },
    ],
  },
};
