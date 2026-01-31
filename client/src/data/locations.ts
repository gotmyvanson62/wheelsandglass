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
  // ===== CALIFORNIA =====
  { id: "ca-san-diego", name: "San Diego", address: "Mobile Service", city: "San Diego", state: "CA", zip: "92101", phone: "(760) 715-3400", coordinates: { lat: 32.7157, lng: -117.1611 }, serviceRadius: 50, isActive: true },
  { id: "ca-los-angeles", name: "Los Angeles", address: "Mobile Service", city: "Los Angeles", state: "CA", zip: "90001", phone: "(760) 715-3400", coordinates: { lat: 34.0522, lng: -118.2437 }, serviceRadius: 60, isActive: true },
  { id: "ca-san-francisco", name: "San Francisco", address: "Mobile Service", city: "San Francisco", state: "CA", zip: "94102", phone: "(760) 715-3400", coordinates: { lat: 37.7749, lng: -122.4194 }, serviceRadius: 40, isActive: true },
  { id: "ca-sacramento", name: "Sacramento", address: "Mobile Service", city: "Sacramento", state: "CA", zip: "95814", phone: "(760) 715-3400", coordinates: { lat: 38.5816, lng: -121.4944 }, serviceRadius: 50, isActive: true },
  { id: "ca-fresno", name: "Fresno", address: "Mobile Service", city: "Fresno", state: "CA", zip: "93721", phone: "(760) 715-3400", coordinates: { lat: 36.7378, lng: -119.7871 }, serviceRadius: 50, isActive: true },
  { id: "ca-riverside", name: "Riverside", address: "Mobile Service", city: "Riverside", state: "CA", zip: "92501", phone: "(760) 715-3400", coordinates: { lat: 33.9533, lng: -117.3962 }, serviceRadius: 40, isActive: true },
  { id: "ca-oakland", name: "Oakland", address: "Mobile Service", city: "Oakland", state: "CA", zip: "94612", phone: "(760) 715-3400", coordinates: { lat: 37.8044, lng: -122.2712 }, serviceRadius: 35, isActive: true },
  { id: "ca-san-jose", name: "San Jose", address: "Mobile Service", city: "San Jose", state: "CA", zip: "95113", phone: "(760) 715-3400", coordinates: { lat: 37.3382, lng: -121.8863 }, serviceRadius: 40, isActive: true },
  { id: "ca-irvine", name: "Irvine", address: "Mobile Service", city: "Irvine", state: "CA", zip: "92618", phone: "(760) 715-3400", coordinates: { lat: 33.6846, lng: -117.8265 }, serviceRadius: 35, isActive: true },
  { id: "ca-long-beach", name: "Long Beach", address: "Mobile Service", city: "Long Beach", state: "CA", zip: "90802", phone: "(760) 715-3400", coordinates: { lat: 33.7701, lng: -118.1937 }, serviceRadius: 35, isActive: true },

  // ===== TEXAS =====
  { id: "tx-houston", name: "Houston", address: "Mobile Service", city: "Houston", state: "TX", zip: "77001", phone: "(760) 715-3400", coordinates: { lat: 29.7604, lng: -95.3698 }, serviceRadius: 60, isActive: true },
  { id: "tx-dallas", name: "Dallas", address: "Mobile Service", city: "Dallas", state: "TX", zip: "75201", phone: "(760) 715-3400", coordinates: { lat: 32.7767, lng: -96.7970 }, serviceRadius: 50, isActive: true },
  { id: "tx-san-antonio", name: "San Antonio", address: "Mobile Service", city: "San Antonio", state: "TX", zip: "78205", phone: "(760) 715-3400", coordinates: { lat: 29.4241, lng: -98.4936 }, serviceRadius: 50, isActive: true },
  { id: "tx-austin", name: "Austin", address: "Mobile Service", city: "Austin", state: "TX", zip: "78701", phone: "(760) 715-3400", coordinates: { lat: 30.2672, lng: -97.7431 }, serviceRadius: 50, isActive: true },
  { id: "tx-fort-worth", name: "Fort Worth", address: "Mobile Service", city: "Fort Worth", state: "TX", zip: "76102", phone: "(760) 715-3400", coordinates: { lat: 32.7555, lng: -97.3308 }, serviceRadius: 45, isActive: true },
  { id: "tx-el-paso", name: "El Paso", address: "Mobile Service", city: "El Paso", state: "TX", zip: "79901", phone: "(760) 715-3400", coordinates: { lat: 31.7619, lng: -106.4850 }, serviceRadius: 50, isActive: true },
  { id: "tx-the-woodlands", name: "The Woodlands", address: "Mobile Service", city: "The Woodlands", state: "TX", zip: "77380", phone: "(760) 715-3400", coordinates: { lat: 30.1658, lng: -95.4613 }, serviceRadius: 30, isActive: true },

  // ===== FLORIDA =====
  { id: "fl-miami", name: "Miami", address: "Mobile Service", city: "Miami", state: "FL", zip: "33101", phone: "(760) 715-3400", coordinates: { lat: 25.7617, lng: -80.1918 }, serviceRadius: 50, isActive: true },
  { id: "fl-tampa", name: "Tampa", address: "Mobile Service", city: "Tampa", state: "FL", zip: "33602", phone: "(760) 715-3400", coordinates: { lat: 27.9506, lng: -82.4572 }, serviceRadius: 50, isActive: true },
  { id: "fl-orlando", name: "Orlando", address: "Mobile Service", city: "Orlando", state: "FL", zip: "32801", phone: "(760) 715-3400", coordinates: { lat: 28.5383, lng: -81.3792 }, serviceRadius: 50, isActive: true },
  { id: "fl-jacksonville", name: "Jacksonville", address: "Mobile Service", city: "Jacksonville", state: "FL", zip: "32202", phone: "(760) 715-3400", coordinates: { lat: 30.3322, lng: -81.6557 }, serviceRadius: 50, isActive: true },
  { id: "fl-fort-lauderdale", name: "Fort Lauderdale", address: "Mobile Service", city: "Fort Lauderdale", state: "FL", zip: "33301", phone: "(760) 715-3400", coordinates: { lat: 26.1224, lng: -80.1373 }, serviceRadius: 40, isActive: true },

  // ===== ARIZONA =====
  { id: "az-phoenix", name: "Phoenix", address: "Mobile Service", city: "Phoenix", state: "AZ", zip: "85001", phone: "(760) 715-3400", coordinates: { lat: 33.4484, lng: -112.0740 }, serviceRadius: 60, isActive: true },
  { id: "az-tucson", name: "Tucson", address: "Mobile Service", city: "Tucson", state: "AZ", zip: "85701", phone: "(760) 715-3400", coordinates: { lat: 32.2226, lng: -110.9747 }, serviceRadius: 50, isActive: true },
  { id: "az-mesa", name: "Mesa", address: "Mobile Service", city: "Mesa", state: "AZ", zip: "85201", phone: "(760) 715-3400", coordinates: { lat: 33.4152, lng: -111.8315 }, serviceRadius: 40, isActive: true },
  { id: "az-scottsdale", name: "Scottsdale", address: "Mobile Service", city: "Scottsdale", state: "AZ", zip: "85251", phone: "(760) 715-3400", coordinates: { lat: 33.4942, lng: -111.9261 }, serviceRadius: 35, isActive: true },

  // ===== NEVADA =====
  { id: "nv-las-vegas", name: "Las Vegas", address: "Mobile Service", city: "Las Vegas", state: "NV", zip: "89101", phone: "(760) 715-3400", coordinates: { lat: 36.1699, lng: -115.1398 }, serviceRadius: 50, isActive: true },
  { id: "nv-reno", name: "Reno", address: "Mobile Service", city: "Reno", state: "NV", zip: "89501", phone: "(760) 715-3400", coordinates: { lat: 39.5296, lng: -119.8138 }, serviceRadius: 50, isActive: true },
  { id: "nv-henderson", name: "Henderson", address: "Mobile Service", city: "Henderson", state: "NV", zip: "89002", phone: "(760) 715-3400", coordinates: { lat: 36.0395, lng: -114.9817 }, serviceRadius: 35, isActive: true },

  // ===== COLORADO =====
  { id: "co-denver", name: "Denver", address: "Mobile Service", city: "Denver", state: "CO", zip: "80202", phone: "(760) 715-3400", coordinates: { lat: 39.7392, lng: -104.9903 }, serviceRadius: 50, isActive: true },
  { id: "co-colorado-springs", name: "Colorado Springs", address: "Mobile Service", city: "Colorado Springs", state: "CO", zip: "80903", phone: "(760) 715-3400", coordinates: { lat: 38.8339, lng: -104.8214 }, serviceRadius: 45, isActive: true },
  { id: "co-aurora", name: "Aurora", address: "Mobile Service", city: "Aurora", state: "CO", zip: "80012", phone: "(760) 715-3400", coordinates: { lat: 39.7294, lng: -104.8319 }, serviceRadius: 35, isActive: true },

  // ===== NEW YORK =====
  { id: "ny-new-york", name: "New York City", address: "Mobile Service", city: "New York", state: "NY", zip: "10001", phone: "(760) 715-3400", coordinates: { lat: 40.7128, lng: -74.0060 }, serviceRadius: 30, isActive: true },
  { id: "ny-buffalo", name: "Buffalo", address: "Mobile Service", city: "Buffalo", state: "NY", zip: "14202", phone: "(760) 715-3400", coordinates: { lat: 42.8864, lng: -78.8784 }, serviceRadius: 45, isActive: true },
  { id: "ny-rochester", name: "Rochester", address: "Mobile Service", city: "Rochester", state: "NY", zip: "14604", phone: "(760) 715-3400", coordinates: { lat: 43.1566, lng: -77.6088 }, serviceRadius: 40, isActive: true },
  { id: "ny-long-island", name: "Long Island", address: "Mobile Service", city: "Long Island", state: "NY", zip: "11501", phone: "(760) 715-3400", coordinates: { lat: 40.7891, lng: -73.1350 }, serviceRadius: 40, isActive: true },

  // ===== ILLINOIS =====
  { id: "il-chicago", name: "Chicago", address: "Mobile Service", city: "Chicago", state: "IL", zip: "60601", phone: "(760) 715-3400", coordinates: { lat: 41.8781, lng: -87.6298 }, serviceRadius: 50, isActive: true },
  { id: "il-aurora", name: "Aurora", address: "Mobile Service", city: "Aurora", state: "IL", zip: "60505", phone: "(760) 715-3400", coordinates: { lat: 41.7606, lng: -88.3201 }, serviceRadius: 35, isActive: true },
  { id: "il-naperville", name: "Naperville", address: "Mobile Service", city: "Naperville", state: "IL", zip: "60540", phone: "(760) 715-3400", coordinates: { lat: 41.7508, lng: -88.1535 }, serviceRadius: 35, isActive: true },

  // ===== GEORGIA =====
  { id: "ga-atlanta", name: "Atlanta", address: "Mobile Service", city: "Atlanta", state: "GA", zip: "30303", phone: "(760) 715-3400", coordinates: { lat: 33.7490, lng: -84.3880 }, serviceRadius: 50, isActive: true },
  { id: "ga-savannah", name: "Savannah", address: "Mobile Service", city: "Savannah", state: "GA", zip: "31401", phone: "(760) 715-3400", coordinates: { lat: 32.0809, lng: -81.0912 }, serviceRadius: 45, isActive: true },
  { id: "ga-augusta", name: "Augusta", address: "Mobile Service", city: "Augusta", state: "GA", zip: "30901", phone: "(760) 715-3400", coordinates: { lat: 33.4735, lng: -81.9748 }, serviceRadius: 40, isActive: true },

  // ===== NORTH CAROLINA =====
  { id: "nc-charlotte", name: "Charlotte", address: "Mobile Service", city: "Charlotte", state: "NC", zip: "28202", phone: "(760) 715-3400", coordinates: { lat: 35.2271, lng: -80.8431 }, serviceRadius: 50, isActive: true },
  { id: "nc-raleigh", name: "Raleigh", address: "Mobile Service", city: "Raleigh", state: "NC", zip: "27601", phone: "(760) 715-3400", coordinates: { lat: 35.7796, lng: -78.6382 }, serviceRadius: 45, isActive: true },
  { id: "nc-greensboro", name: "Greensboro", address: "Mobile Service", city: "Greensboro", state: "NC", zip: "27401", phone: "(760) 715-3400", coordinates: { lat: 36.0726, lng: -79.7920 }, serviceRadius: 40, isActive: true },

  // ===== PENNSYLVANIA =====
  { id: "pa-philadelphia", name: "Philadelphia", address: "Mobile Service", city: "Philadelphia", state: "PA", zip: "19102", phone: "(760) 715-3400", coordinates: { lat: 39.9526, lng: -75.1652 }, serviceRadius: 45, isActive: true },
  { id: "pa-pittsburgh", name: "Pittsburgh", address: "Mobile Service", city: "Pittsburgh", state: "PA", zip: "15222", phone: "(760) 715-3400", coordinates: { lat: 40.4406, lng: -79.9959 }, serviceRadius: 45, isActive: true },

  // ===== OHIO =====
  { id: "oh-columbus", name: "Columbus", address: "Mobile Service", city: "Columbus", state: "OH", zip: "43215", phone: "(760) 715-3400", coordinates: { lat: 39.9612, lng: -82.9988 }, serviceRadius: 50, isActive: true },
  { id: "oh-cleveland", name: "Cleveland", address: "Mobile Service", city: "Cleveland", state: "OH", zip: "44113", phone: "(760) 715-3400", coordinates: { lat: 41.4993, lng: -81.6944 }, serviceRadius: 45, isActive: true },
  { id: "oh-cincinnati", name: "Cincinnati", address: "Mobile Service", city: "Cincinnati", state: "OH", zip: "45202", phone: "(760) 715-3400", coordinates: { lat: 39.1031, lng: -84.5120 }, serviceRadius: 45, isActive: true },

  // ===== MICHIGAN =====
  { id: "mi-detroit", name: "Detroit", address: "Mobile Service", city: "Detroit", state: "MI", zip: "48226", phone: "(760) 715-3400", coordinates: { lat: 42.3314, lng: -83.0458 }, serviceRadius: 50, isActive: true },
  { id: "mi-grand-rapids", name: "Grand Rapids", address: "Mobile Service", city: "Grand Rapids", state: "MI", zip: "49503", phone: "(760) 715-3400", coordinates: { lat: 42.9634, lng: -85.6681 }, serviceRadius: 45, isActive: true },

  // ===== NEW JERSEY =====
  { id: "nj-newark", name: "Newark", address: "Mobile Service", city: "Newark", state: "NJ", zip: "07102", phone: "(760) 715-3400", coordinates: { lat: 40.7357, lng: -74.1724 }, serviceRadius: 35, isActive: true },
  { id: "nj-jersey-city", name: "Jersey City", address: "Mobile Service", city: "Jersey City", state: "NJ", zip: "07302", phone: "(760) 715-3400", coordinates: { lat: 40.7178, lng: -74.0431 }, serviceRadius: 30, isActive: true },

  // ===== WASHINGTON =====
  { id: "wa-seattle", name: "Seattle", address: "Mobile Service", city: "Seattle", state: "WA", zip: "98101", phone: "(760) 715-3400", coordinates: { lat: 47.6062, lng: -122.3321 }, serviceRadius: 50, isActive: true },
  { id: "wa-tacoma", name: "Tacoma", address: "Mobile Service", city: "Tacoma", state: "WA", zip: "98402", phone: "(760) 715-3400", coordinates: { lat: 47.2529, lng: -122.4443 }, serviceRadius: 40, isActive: true },
  { id: "wa-spokane", name: "Spokane", address: "Mobile Service", city: "Spokane", state: "WA", zip: "99201", phone: "(760) 715-3400", coordinates: { lat: 47.6588, lng: -117.4260 }, serviceRadius: 50, isActive: true },

  // ===== OREGON =====
  { id: "or-portland", name: "Portland", address: "Mobile Service", city: "Portland", state: "OR", zip: "97201", phone: "(760) 715-3400", coordinates: { lat: 45.5152, lng: -122.6784 }, serviceRadius: 50, isActive: true },
  { id: "or-eugene", name: "Eugene", address: "Mobile Service", city: "Eugene", state: "OR", zip: "97401", phone: "(760) 715-3400", coordinates: { lat: 44.0521, lng: -123.0868 }, serviceRadius: 45, isActive: true },

  // ===== TENNESSEE =====
  { id: "tn-nashville", name: "Nashville", address: "Mobile Service", city: "Nashville", state: "TN", zip: "37203", phone: "(760) 715-3400", coordinates: { lat: 36.1627, lng: -86.7816 }, serviceRadius: 50, isActive: true },
  { id: "tn-memphis", name: "Memphis", address: "Mobile Service", city: "Memphis", state: "TN", zip: "38103", phone: "(760) 715-3400", coordinates: { lat: 35.1495, lng: -90.0490 }, serviceRadius: 50, isActive: true },
  { id: "tn-knoxville", name: "Knoxville", address: "Mobile Service", city: "Knoxville", state: "TN", zip: "37902", phone: "(760) 715-3400", coordinates: { lat: 35.9606, lng: -83.9207 }, serviceRadius: 45, isActive: true },

  // ===== MASSACHUSETTS =====
  { id: "ma-boston", name: "Boston", address: "Mobile Service", city: "Boston", state: "MA", zip: "02108", phone: "(760) 715-3400", coordinates: { lat: 42.3601, lng: -71.0589 }, serviceRadius: 40, isActive: true },
  { id: "ma-worcester", name: "Worcester", address: "Mobile Service", city: "Worcester", state: "MA", zip: "01608", phone: "(760) 715-3400", coordinates: { lat: 42.2626, lng: -71.8023 }, serviceRadius: 40, isActive: true },

  // ===== MARYLAND =====
  { id: "md-baltimore", name: "Baltimore", address: "Mobile Service", city: "Baltimore", state: "MD", zip: "21201", phone: "(760) 715-3400", coordinates: { lat: 39.2904, lng: -76.6122 }, serviceRadius: 45, isActive: true },

  // ===== INDIANA =====
  { id: "in-indianapolis", name: "Indianapolis", address: "Mobile Service", city: "Indianapolis", state: "IN", zip: "46204", phone: "(760) 715-3400", coordinates: { lat: 39.7684, lng: -86.1581 }, serviceRadius: 50, isActive: true },
  { id: "in-fort-wayne", name: "Fort Wayne", address: "Mobile Service", city: "Fort Wayne", state: "IN", zip: "46802", phone: "(760) 715-3400", coordinates: { lat: 41.0793, lng: -85.1394 }, serviceRadius: 45, isActive: true },

  // ===== MISSOURI =====
  { id: "mo-kansas-city", name: "Kansas City", address: "Mobile Service", city: "Kansas City", state: "MO", zip: "64106", phone: "(760) 715-3400", coordinates: { lat: 39.0997, lng: -94.5786 }, serviceRadius: 50, isActive: true },
  { id: "mo-st-louis", name: "St. Louis", address: "Mobile Service", city: "St. Louis", state: "MO", zip: "63101", phone: "(760) 715-3400", coordinates: { lat: 38.6270, lng: -90.1994 }, serviceRadius: 50, isActive: true },

  // ===== MINNESOTA =====
  { id: "mn-minneapolis", name: "Minneapolis", address: "Mobile Service", city: "Minneapolis", state: "MN", zip: "55401", phone: "(760) 715-3400", coordinates: { lat: 44.9778, lng: -93.2650 }, serviceRadius: 50, isActive: true },
  { id: "mn-st-paul", name: "St. Paul", address: "Mobile Service", city: "St. Paul", state: "MN", zip: "55101", phone: "(760) 715-3400", coordinates: { lat: 44.9537, lng: -93.0900 }, serviceRadius: 40, isActive: true },

  // ===== WISCONSIN =====
  { id: "wi-milwaukee", name: "Milwaukee", address: "Mobile Service", city: "Milwaukee", state: "WI", zip: "53202", phone: "(760) 715-3400", coordinates: { lat: 43.0389, lng: -87.9065 }, serviceRadius: 45, isActive: true },
  { id: "wi-madison", name: "Madison", address: "Mobile Service", city: "Madison", state: "WI", zip: "53703", phone: "(760) 715-3400", coordinates: { lat: 43.0731, lng: -89.4012 }, serviceRadius: 45, isActive: true },

  // ===== SOUTH CAROLINA =====
  { id: "sc-charleston", name: "Charleston", address: "Mobile Service", city: "Charleston", state: "SC", zip: "29401", phone: "(760) 715-3400", coordinates: { lat: 32.7765, lng: -79.9311 }, serviceRadius: 45, isActive: true },
  { id: "sc-columbia", name: "Columbia", address: "Mobile Service", city: "Columbia", state: "SC", zip: "29201", phone: "(760) 715-3400", coordinates: { lat: 34.0007, lng: -81.0348 }, serviceRadius: 45, isActive: true },

  // ===== LOUISIANA =====
  { id: "la-new-orleans", name: "New Orleans", address: "Mobile Service", city: "New Orleans", state: "LA", zip: "70112", phone: "(760) 715-3400", coordinates: { lat: 29.9511, lng: -90.0715 }, serviceRadius: 50, isActive: true },
  { id: "la-baton-rouge", name: "Baton Rouge", address: "Mobile Service", city: "Baton Rouge", state: "LA", zip: "70801", phone: "(760) 715-3400", coordinates: { lat: 30.4515, lng: -91.1871 }, serviceRadius: 45, isActive: true },

  // ===== ALABAMA =====
  { id: "al-birmingham", name: "Birmingham", address: "Mobile Service", city: "Birmingham", state: "AL", zip: "35203", phone: "(760) 715-3400", coordinates: { lat: 33.5186, lng: -86.8104 }, serviceRadius: 50, isActive: true },
  { id: "al-huntsville", name: "Huntsville", address: "Mobile Service", city: "Huntsville", state: "AL", zip: "35801", phone: "(760) 715-3400", coordinates: { lat: 34.7304, lng: -86.5861 }, serviceRadius: 45, isActive: true },

  // ===== KENTUCKY =====
  { id: "ky-louisville", name: "Louisville", address: "Mobile Service", city: "Louisville", state: "KY", zip: "40202", phone: "(760) 715-3400", coordinates: { lat: 38.2527, lng: -85.7585 }, serviceRadius: 50, isActive: true },
  { id: "ky-lexington", name: "Lexington", address: "Mobile Service", city: "Lexington", state: "KY", zip: "40507", phone: "(760) 715-3400", coordinates: { lat: 38.0406, lng: -84.5037 }, serviceRadius: 45, isActive: true },

  // ===== OKLAHOMA =====
  { id: "ok-oklahoma-city", name: "Oklahoma City", address: "Mobile Service", city: "Oklahoma City", state: "OK", zip: "73102", phone: "(760) 715-3400", coordinates: { lat: 35.4676, lng: -97.5164 }, serviceRadius: 50, isActive: true },
  { id: "ok-tulsa", name: "Tulsa", address: "Mobile Service", city: "Tulsa", state: "OK", zip: "74103", phone: "(760) 715-3400", coordinates: { lat: 36.1540, lng: -95.9928 }, serviceRadius: 50, isActive: true },

  // ===== UTAH =====
  { id: "ut-salt-lake-city", name: "Salt Lake City", address: "Mobile Service", city: "Salt Lake City", state: "UT", zip: "84101", phone: "(760) 715-3400", coordinates: { lat: 40.7608, lng: -111.8910 }, serviceRadius: 50, isActive: true },
  { id: "ut-provo", name: "Provo", address: "Mobile Service", city: "Provo", state: "UT", zip: "84601", phone: "(760) 715-3400", coordinates: { lat: 40.2338, lng: -111.6585 }, serviceRadius: 40, isActive: true },

  // ===== NEW MEXICO =====
  { id: "nm-albuquerque", name: "Albuquerque", address: "Mobile Service", city: "Albuquerque", state: "NM", zip: "87102", phone: "(760) 715-3400", coordinates: { lat: 35.0844, lng: -106.6504 }, serviceRadius: 60, isActive: true },
  { id: "nm-santa-fe", name: "Santa Fe", address: "Mobile Service", city: "Santa Fe", state: "NM", zip: "87501", phone: "(760) 715-3400", coordinates: { lat: 35.6870, lng: -105.9378 }, serviceRadius: 50, isActive: true },

  // ===== CONNECTICUT =====
  { id: "ct-hartford", name: "Hartford", address: "Mobile Service", city: "Hartford", state: "CT", zip: "06103", phone: "(760) 715-3400", coordinates: { lat: 41.7658, lng: -72.6734 }, serviceRadius: 40, isActive: true },
  { id: "ct-new-haven", name: "New Haven", address: "Mobile Service", city: "New Haven", state: "CT", zip: "06510", phone: "(760) 715-3400", coordinates: { lat: 41.3083, lng: -72.9279 }, serviceRadius: 40, isActive: true },

  // ===== HAWAII =====
  { id: "hi-honolulu", name: "Honolulu", address: "Mobile Service", city: "Honolulu", state: "HI", zip: "96813", phone: "(760) 715-3400", coordinates: { lat: 21.3069, lng: -157.8583 }, serviceRadius: 40, isActive: true },

  // ===== VIRGINIA =====
  { id: "va-virginia-beach", name: "Virginia Beach", address: "Mobile Service", city: "Virginia Beach", state: "VA", zip: "23451", phone: "(760) 715-3400", coordinates: { lat: 36.8529, lng: -75.9780 }, serviceRadius: 45, isActive: true },
  { id: "va-richmond", name: "Richmond", address: "Mobile Service", city: "Richmond", state: "VA", zip: "23219", phone: "(760) 715-3400", coordinates: { lat: 37.5407, lng: -77.4360 }, serviceRadius: 45, isActive: true },
  { id: "va-norfolk", name: "Norfolk", address: "Mobile Service", city: "Norfolk", state: "VA", zip: "23510", phone: "(760) 715-3400", coordinates: { lat: 36.8508, lng: -76.2859 }, serviceRadius: 40, isActive: true },

  // ===== IOWA =====
  { id: "ia-des-moines", name: "Des Moines", address: "Mobile Service", city: "Des Moines", state: "IA", zip: "50309", phone: "(760) 715-3400", coordinates: { lat: 41.5868, lng: -93.6250 }, serviceRadius: 50, isActive: true },
  { id: "ia-cedar-rapids", name: "Cedar Rapids", address: "Mobile Service", city: "Cedar Rapids", state: "IA", zip: "52401", phone: "(760) 715-3400", coordinates: { lat: 41.9779, lng: -91.6656 }, serviceRadius: 45, isActive: true },

  // ===== NEBRASKA =====
  { id: "ne-omaha", name: "Omaha", address: "Mobile Service", city: "Omaha", state: "NE", zip: "68102", phone: "(760) 715-3400", coordinates: { lat: 41.2565, lng: -95.9345 }, serviceRadius: 50, isActive: true },
  { id: "ne-lincoln", name: "Lincoln", address: "Mobile Service", city: "Lincoln", state: "NE", zip: "68508", phone: "(760) 715-3400", coordinates: { lat: 40.8258, lng: -96.6852 }, serviceRadius: 45, isActive: true },

  // ===== KANSAS =====
  { id: "ks-wichita", name: "Wichita", address: "Mobile Service", city: "Wichita", state: "KS", zip: "67202", phone: "(760) 715-3400", coordinates: { lat: 37.6872, lng: -97.3301 }, serviceRadius: 50, isActive: true },
  { id: "ks-overland-park", name: "Overland Park", address: "Mobile Service", city: "Overland Park", state: "KS", zip: "66210", phone: "(760) 715-3400", coordinates: { lat: 38.9822, lng: -94.6708 }, serviceRadius: 40, isActive: true },

  // ===== ARKANSAS =====
  { id: "ar-little-rock", name: "Little Rock", address: "Mobile Service", city: "Little Rock", state: "AR", zip: "72201", phone: "(760) 715-3400", coordinates: { lat: 34.7465, lng: -92.2896 }, serviceRadius: 50, isActive: true },

  // ===== MISSISSIPPI =====
  { id: "ms-jackson", name: "Jackson", address: "Mobile Service", city: "Jackson", state: "MS", zip: "39201", phone: "(760) 715-3400", coordinates: { lat: 32.2988, lng: -90.1848 }, serviceRadius: 50, isActive: true },

  // ===== IDAHO =====
  { id: "id-boise", name: "Boise", address: "Mobile Service", city: "Boise", state: "ID", zip: "83702", phone: "(760) 715-3400", coordinates: { lat: 43.6150, lng: -116.2023 }, serviceRadius: 50, isActive: true },

  // ===== MONTANA =====
  { id: "mt-billings", name: "Billings", address: "Mobile Service", city: "Billings", state: "MT", zip: "59101", phone: "(760) 715-3400", coordinates: { lat: 45.7833, lng: -108.5007 }, serviceRadius: 60, isActive: true },

  // ===== NORTH DAKOTA =====
  { id: "nd-fargo", name: "Fargo", address: "Mobile Service", city: "Fargo", state: "ND", zip: "58102", phone: "(760) 715-3400", coordinates: { lat: 46.8772, lng: -96.7898 }, serviceRadius: 60, isActive: true },

  // ===== SOUTH DAKOTA =====
  { id: "sd-sioux-falls", name: "Sioux Falls", address: "Mobile Service", city: "Sioux Falls", state: "SD", zip: "57104", phone: "(760) 715-3400", coordinates: { lat: 43.5446, lng: -96.7311 }, serviceRadius: 60, isActive: true },

  // ===== WYOMING =====
  { id: "wy-cheyenne", name: "Cheyenne", address: "Mobile Service", city: "Cheyenne", state: "WY", zip: "82001", phone: "(760) 715-3400", coordinates: { lat: 41.1400, lng: -104.8202 }, serviceRadius: 60, isActive: true },

  // ===== WEST VIRGINIA =====
  { id: "wv-charleston", name: "Charleston", address: "Mobile Service", city: "Charleston", state: "WV", zip: "25301", phone: "(760) 715-3400", coordinates: { lat: 38.3498, lng: -81.6326 }, serviceRadius: 50, isActive: true },

  // ===== MAINE =====
  { id: "me-portland", name: "Portland", address: "Mobile Service", city: "Portland", state: "ME", zip: "04101", phone: "(760) 715-3400", coordinates: { lat: 43.6591, lng: -70.2568 }, serviceRadius: 50, isActive: true },

  // ===== NEW HAMPSHIRE =====
  { id: "nh-manchester", name: "Manchester", address: "Mobile Service", city: "Manchester", state: "NH", zip: "03101", phone: "(760) 715-3400", coordinates: { lat: 42.9956, lng: -71.4548 }, serviceRadius: 45, isActive: true },

  // ===== VERMONT =====
  { id: "vt-burlington", name: "Burlington", address: "Mobile Service", city: "Burlington", state: "VT", zip: "05401", phone: "(760) 715-3400", coordinates: { lat: 44.4759, lng: -73.2121 }, serviceRadius: 50, isActive: true },

  // ===== RHODE ISLAND =====
  { id: "ri-providence", name: "Providence", address: "Mobile Service", city: "Providence", state: "RI", zip: "02903", phone: "(760) 715-3400", coordinates: { lat: 41.8240, lng: -71.4128 }, serviceRadius: 35, isActive: true },

  // ===== DELAWARE =====
  { id: "de-wilmington", name: "Wilmington", address: "Mobile Service", city: "Wilmington", state: "DE", zip: "19801", phone: "(760) 715-3400", coordinates: { lat: 39.7391, lng: -75.5398 }, serviceRadius: 40, isActive: true },

  // ===== ALASKA =====
  { id: "ak-anchorage", name: "Anchorage", address: "Mobile Service", city: "Anchorage", state: "AK", zip: "99501", phone: "(760) 715-3400", coordinates: { lat: 61.2181, lng: -149.9003 }, serviceRadius: 60, isActive: true },
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
