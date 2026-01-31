import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  MapPin, 
  Calendar,
  Phone,
  X
} from 'lucide-react';

interface USMapSelectorProps {
  onRequestQuote: () => void;
}

// All service locations organized by state - from Excel data provided by user
const serviceLocationsByState: Record<string, string[]> = {
  'Alabama': ['Birmingham', 'Mobile', 'Montgomery'],
  'Alaska': ['Anchorage', 'Fairbanks', 'Juneau'],
  'Arizona': ['Chandler', 'Gilbert', 'Mesa', 'Phoenix', 'Scottsdale', 'Tempe', 'Tucson'],
  'Arkansas': ['Jackson', 'Little Rock', 'Sherwood'],
  'California': ['Inland Empire', 'Long Beach', 'Los Angeles', 'Orange County', 'Sacramento', 'San Diego', 'San Francisco', 'San Jose', 'San Luis Obispo', 'Santa Barbara', 'Santa Cruz'],
  'Colorado': ['Aspen', 'Breckenridge', 'Colorado Springs', 'Denver', 'Fort Collins', 'Grand Junction'],
  'Connecticut': ['Bridgeport', 'New Haven', 'Stamford'],
  'Delaware': ['Delaware City', 'Montchanin', 'Rockland'],
  'Florida': ['Jacksonville', 'Miami', 'Orlando', 'Tampa'],
  'Georgia': ['Alpharetta', 'Athens', 'Atlanta'],
  'Hawaii': ['Honolulu', 'Kailua', 'Maui'],
  'Idaho': ['Boise', 'Idaho Falls', 'Meridian'],
  'Illinois': ['Chicago', 'Naperville', 'Northlake'],
  'Indiana': ['Evansville', 'Indianapolis', 'Plainfield', 'Shelbyville'],
  'Iowa': ['Cedar Rapids', 'Davenport', 'Des Moines'],
  'Kansas': ['Derby', 'Park City', 'Wichita'],
  'Kentucky': ['Lexington', 'Louisville', 'Versailles'],
  'Louisiana': ['Baton Rouge', 'Harahan', 'Kenner', 'Metairie', 'New Orleans', 'Shreveport'],
  'Maine': ['Bangor', 'Lewiston', 'Portland'],
  'Maryland': ['Annapolis', 'Baltimore', 'Lanham'],
  'Massachusetts': ['Boston', 'Quincy', 'Randolph'],
  'Michigan': ['Ann Arbor', 'Canton', 'Plymouth', 'Westland'],
  'Minnesota': ['Marshall', 'Minneapolis', 'New Brighton', 'St Paul'],
  'Mississippi': ['Jackson', 'Oxford', 'Pearl'],
  'Missouri': ['Hazelwood', 'Kansas City', 'Richmond'],
  'Montana': ['Billings', 'Bozeman', 'Helena'],
  'Nebraska': ['Fremont', 'La Vista', 'Omaha'],
  'Nevada': ['Henderson', 'Las Vegas', 'Reno', 'Tahoe/Stateline'],
  'New Hampshire': ['Manchester', 'Nashua', 'Salem'],
  'New Jersey': ['Milltown', 'Monmouth', 'New Brunswick', 'Princeton', 'Somerset', 'Trenton'],
  'New Mexico': ['Albuquerque', 'Santa Fe', 'Taos'],
  'New York': ['Brooklyn', 'Buffalo', 'Manhattan'],
  'North Carolina': ['Charlotte', 'Greensboro', 'Morrisville'],
  'North Dakota': ['Bismarck', 'Dickinson', 'Minot'],
  'Ohio': ['Columbus', 'Grove City', 'Macedonia', 'Sharonville'],
  'Oklahoma': ['Lawton', 'Oklahoma City', 'Tulsa'],
  'Oregon': ['Bend', 'Eugene', 'Portland', 'Redmond', 'Salem'],
  'Pennsylvania': ['Allentown', 'Kingston', 'Philadelphia', 'Pittsburgh', 'Scranton', 'Warminster'],
  'Rhode Island': ['Cranston', 'Providence', 'Warwick'],
  'South Carolina': ['Charleston', 'Columbia', 'Greenville'],
  'South Dakota': ['Aberdeen', 'Sioux Falls', 'Yankton'],
  'Tennessee': ['Franklin', 'Hendersonville', 'Knoxville', 'Memphis', 'Nashville'],
  'Texas': ['Austin', 'Dallas', 'Houston'],
  'Utah': ['Ogden', 'Provo', 'Salt Lake City'],
  'Vermont': ['Burlington', 'Colchester', 'Essex'],
  'Virginia': ['Norfolk', 'Richmond', 'Virginia Beach'],
  'Washington': ['Bellingham', 'Seattle', 'Tacoma'],
  'West Virginia': ['Charleston', 'Huntington', 'Morgantown'],
  'Wisconsin': ['Brookfield', 'Milwaukee', 'Waukesha'],
  'Wyoming': ['Casper', 'Cheyenne', 'Jackson', 'Laramie']
};

export function USMapSelector({ onRequestQuote }: USMapSelectorProps) {
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  const handleStateClick = (stateName: string) => {
    if (serviceLocationsByState[stateName]) {
      setSelectedState(stateName);
    }
  };

  const handleCitySelect = (city: string) => {
    setSelectedCity(city);
    // Trigger quote form with pre-selected location
    onRequestQuote();
  };

  const getStateColor = (stateName: string) => {
    if (!serviceLocationsByState[stateName]) return '#e5e7eb'; // gray for no service
    if (selectedState === stateName) return '#3b82f6'; // blue for selected
    if (hoveredState === stateName) return '#60a5fa'; // lighter blue for hover
    return '#10b981'; // green for service available
  };

  const totalStates = Object.keys(serviceLocationsByState).length;
  const totalCities = Object.values(serviceLocationsByState).reduce((sum: number, cities: string[]) => sum + cities.length, 0);

  return (
    <div className="space-y-6">
      
      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            Select Your Service Location
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Click on a state to see available cities and schedule service.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">{totalStates}</div>
              <div className="text-sm text-gray-600">States</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{totalCities}</div>
              <div className="text-sm text-gray-600">Cities</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">Mobile</div>
              <div className="text-sm text-gray-600">Service</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* US Map */}
      <Card>
        <CardContent className="p-6">
          <div className="relative w-full" style={{ paddingBottom: '60%' }}>
            <svg 
              viewBox="0 0 1000 600" 
              className="absolute inset-0 w-full h-full"
              style={{ maxWidth: '100%', height: 'auto' }}
            >
              {/* California */}
              <path
                d="M 50 250 L 50 450 L 150 450 L 140 400 L 130 350 L 120 300 L 110 250 Z"
                fill={getStateColor('California')}
                stroke="#374151"
                strokeWidth="1"
                className="cursor-pointer transition-all duration-200 hover:stroke-2"
                onClick={() => handleStateClick('California')}
                onMouseEnter={() => setHoveredState('California')}
                onMouseLeave={() => setHoveredState(null)}
              />
              <text x="100" y="350" textAnchor="middle" className="text-xs font-medium fill-current pointer-events-none">
                CA
              </text>

              {/* Nevada */}
              <path
                d="M 150 250 L 150 450 L 200 450 L 200 250 Z"
                fill={getStateColor('Nevada')}
                stroke="#374151"
                strokeWidth="1"
                className="cursor-pointer transition-all duration-200 hover:stroke-2"
                onClick={() => handleStateClick('Nevada')}
                onMouseEnter={() => setHoveredState('Nevada')}
                onMouseLeave={() => setHoveredState(null)}
              />
              <text x="175" y="350" textAnchor="middle" className="text-xs font-medium fill-current pointer-events-none">
                NV
              </text>

              {/* Arizona */}
              <path
                d="M 150 350 L 150 450 L 250 450 L 250 350 Z"
                fill={getStateColor('Arizona')}
                stroke="#374151"
                strokeWidth="1"
                className="cursor-pointer transition-all duration-200 hover:stroke-2"
                onClick={() => handleStateClick('Arizona')}
                onMouseEnter={() => setHoveredState('Arizona')}
                onMouseLeave={() => setHoveredState(null)}
              />
              <text x="200" y="400" textAnchor="middle" className="text-xs font-medium fill-current pointer-events-none">
                AZ
              </text>

              {/* Utah */}
              <path
                d="M 200 250 L 200 350 L 250 350 L 250 250 Z"
                fill={getStateColor('Utah')}
                stroke="#374151"
                strokeWidth="1"
                className="cursor-pointer transition-all duration-200 hover:stroke-2"
                onClick={() => handleStateClick('Utah')}
                onMouseEnter={() => setHoveredState('Utah')}
                onMouseLeave={() => setHoveredState(null)}
              />
              <text x="225" y="300" textAnchor="middle" className="text-xs font-medium fill-current pointer-events-none">
                UT
              </text>

              {/* Colorado */}
              <path
                d="M 250 250 L 250 350 L 350 350 L 350 250 Z"
                fill={getStateColor('Colorado')}
                stroke="#374151"
                strokeWidth="1"
                className="cursor-pointer transition-all duration-200 hover:stroke-2"
                onClick={() => handleStateClick('Colorado')}
                onMouseEnter={() => setHoveredState('Colorado')}
                onMouseLeave={() => setHoveredState(null)}
              />
              <text x="300" y="300" textAnchor="middle" className="text-xs font-medium fill-current pointer-events-none">
                CO
              </text>

              {/* New Mexico */}
              <path
                d="M 250 350 L 250 450 L 350 450 L 350 350 Z"
                fill={getStateColor('New Mexico')}
                stroke="#374151"
                strokeWidth="1"
                className="cursor-pointer transition-all duration-200 hover:stroke-2"
                onClick={() => handleStateClick('New Mexico')}
                onMouseEnter={() => setHoveredState('New Mexico')}
                onMouseLeave={() => setHoveredState(null)}
              />
              <text x="300" y="400" textAnchor="middle" className="text-xs font-medium fill-current pointer-events-none">
                NM
              </text>

              {/* Texas */}
              <path
                d="M 350 300 L 350 450 L 500 450 L 500 350 L 450 300 Z"
                fill={getStateColor('Texas')}
                stroke="#374151"
                strokeWidth="1"
                className="cursor-pointer transition-all duration-200 hover:stroke-2"
                onClick={() => handleStateClick('Texas')}
                onMouseEnter={() => setHoveredState('Texas')}
                onMouseLeave={() => setHoveredState(null)}
              />
              <text x="425" y="375" textAnchor="middle" className="text-xs font-medium fill-current pointer-events-none">
                TX
              </text>

              {/* Oklahoma */}
              <path
                d="M 350 250 L 350 300 L 500 300 L 500 250 Z"
                fill={getStateColor('Oklahoma')}
                stroke="#374151"
                strokeWidth="1"
                className="cursor-pointer transition-all duration-200 hover:stroke-2"
                onClick={() => handleStateClick('Oklahoma')}
                onMouseEnter={() => setHoveredState('Oklahoma')}
                onMouseLeave={() => setHoveredState(null)}
              />
              <text x="425" y="275" textAnchor="middle" className="text-xs font-medium fill-current pointer-events-none">
                OK
              </text>

              {/* Kansas */}
              <path
                d="M 350 200 L 350 250 L 500 250 L 500 200 Z"
                fill={getStateColor('Kansas')}
                stroke="#374151"
                strokeWidth="1"
                className="cursor-pointer transition-all duration-200 hover:stroke-2"
                onClick={() => handleStateClick('Kansas')}
                onMouseEnter={() => setHoveredState('Kansas')}
                onMouseLeave={() => setHoveredState(null)}
              />
              <text x="425" y="225" textAnchor="middle" className="text-xs font-medium fill-current pointer-events-none">
                KS
              </text>

              {/* Nebraska */}
              <path
                d="M 350 150 L 350 200 L 500 200 L 500 150 Z"
                fill={getStateColor('Nebraska')}
                stroke="#374151"
                strokeWidth="1"
                className="cursor-pointer transition-all duration-200 hover:stroke-2"
                onClick={() => handleStateClick('Nebraska')}
                onMouseEnter={() => setHoveredState('Nebraska')}
                onMouseLeave={() => setHoveredState(null)}
              />
              <text x="425" y="175" textAnchor="middle" className="text-xs font-medium fill-current pointer-events-none">
                NE
              </text>

              {/* Florida */}
              <path
                d="M 700 400 L 700 450 L 850 450 L 880 420 L 850 400 Z"
                fill={getStateColor('Florida')}
                stroke="#374151"
                strokeWidth="1"
                className="cursor-pointer transition-all duration-200 hover:stroke-2"
                onClick={() => handleStateClick('Florida')}
                onMouseEnter={() => setHoveredState('Florida')}
                onMouseLeave={() => setHoveredState(null)}
              />
              <text x="790" y="425" textAnchor="middle" className="text-xs font-medium fill-current pointer-events-none">
                FL
              </text>

              {/* Georgia */}
              <path
                d="M 650 300 L 650 400 L 700 400 L 700 300 Z"
                fill={getStateColor('Georgia')}
                stroke="#374151"
                strokeWidth="1"
                className="cursor-pointer transition-all duration-200 hover:stroke-2"
                onClick={() => handleStateClick('Georgia')}
                onMouseEnter={() => setHoveredState('Georgia')}
                onMouseLeave={() => setHoveredState(null)}
              />
              <text x="675" y="350" textAnchor="middle" className="text-xs font-medium fill-current pointer-events-none">
                GA
              </text>

              {/* Illinois */}
              <path
                d="M 500 200 L 500 300 L 550 300 L 550 200 Z"
                fill={getStateColor('Illinois')}
                stroke="#374151"
                strokeWidth="1"
                className="cursor-pointer transition-all duration-200 hover:stroke-2"
                onClick={() => handleStateClick('Illinois')}
                onMouseEnter={() => setHoveredState('Illinois')}
                onMouseLeave={() => setHoveredState(null)}
              />
              <text x="525" y="250" textAnchor="middle" className="text-xs font-medium fill-current pointer-events-none">
                IL
              </text>

              {/* Indiana */}
              <path
                d="M 550 200 L 550 300 L 580 300 L 580 200 Z"
                fill={getStateColor('Indiana')}
                stroke="#374151"
                strokeWidth="1"
                className="cursor-pointer transition-all duration-200 hover:stroke-2"
                onClick={() => handleStateClick('Indiana')}
                onMouseEnter={() => setHoveredState('Indiana')}
                onMouseLeave={() => setHoveredState(null)}
              />
              <text x="565" y="250" textAnchor="middle" className="text-xs font-medium fill-current pointer-events-none">
                IN
              </text>

              {/* Ohio */}
              <path
                d="M 580 200 L 580 300 L 630 300 L 630 200 Z"
                fill={getStateColor('Ohio')}
                stroke="#374151"
                strokeWidth="1"
                className="cursor-pointer transition-all duration-200 hover:stroke-2"
                onClick={() => handleStateClick('Ohio')}
                onMouseEnter={() => setHoveredState('Ohio')}
                onMouseLeave={() => setHoveredState(null)}
              />
              <text x="605" y="250" textAnchor="middle" className="text-xs font-medium fill-current pointer-events-none">
                OH
              </text>

              {/* Michigan */}
              <path
                d="M 550 150 L 550 200 L 630 200 L 630 150 Z"
                fill={getStateColor('Michigan')}
                stroke="#374151"
                strokeWidth="1"
                className="cursor-pointer transition-all duration-200 hover:stroke-2"
                onClick={() => handleStateClick('Michigan')}
                onMouseEnter={() => setHoveredState('Michigan')}
                onMouseLeave={() => setHoveredState(null)}
              />
              <text x="590" y="175" textAnchor="middle" className="text-xs font-medium fill-current pointer-events-none">
                MI
              </text>

              {/* Pennsylvania */}
              <path
                d="M 650 150 L 650 250 L 750 250 L 750 150 Z"
                fill={getStateColor('Pennsylvania')}
                stroke="#374151"
                strokeWidth="1"
                className="cursor-pointer transition-all duration-200 hover:stroke-2"
                onClick={() => handleStateClick('Pennsylvania')}
                onMouseEnter={() => setHoveredState('Pennsylvania')}
                onMouseLeave={() => setHoveredState(null)}
              />
              <text x="700" y="200" textAnchor="middle" className="text-xs font-medium fill-current pointer-events-none">
                PA
              </text>

              {/* New York */}
              <path
                d="M 700 100 L 700 150 L 800 150 L 800 100 Z"
                fill={getStateColor('New York')}
                stroke="#374151"
                strokeWidth="1"
                className="cursor-pointer transition-all duration-200 hover:stroke-2"
                onClick={() => handleStateClick('New York')}
                onMouseEnter={() => setHoveredState('New York')}
                onMouseLeave={() => setHoveredState(null)}
              />
              <text x="750" y="125" textAnchor="middle" className="text-xs font-medium fill-current pointer-events-none">
                NY
              </text>

              {/* North Carolina */}
              <path
                d="M 650 300 L 650 350 L 750 350 L 750 300 Z"
                fill={getStateColor('North Carolina')}
                stroke="#374151"
                strokeWidth="1"
                className="cursor-pointer transition-all duration-200 hover:stroke-2"
                onClick={() => handleStateClick('North Carolina')}
                onMouseEnter={() => setHoveredState('North Carolina')}
                onMouseLeave={() => setHoveredState(null)}
              />
              <text x="700" y="325" textAnchor="middle" className="text-xs font-medium fill-current pointer-events-none">
                NC
              </text>

              {/* South Carolina */}
              <path
                d="M 650 350 L 650 380 L 720 380 L 720 350 Z"
                fill={getStateColor('South Carolina')}
                stroke="#374151"
                strokeWidth="1"
                className="cursor-pointer transition-all duration-200 hover:stroke-2"
                onClick={() => handleStateClick('South Carolina')}
                onMouseEnter={() => setHoveredState('South Carolina')}
                onMouseLeave={() => setHoveredState(null)}
              />
              <text x="685" y="365" textAnchor="middle" className="text-xs font-medium fill-current pointer-events-none">
                SC
              </text>

              {/* Tennessee */}
              <path
                d="M 500 300 L 500 350 L 650 350 L 650 300 Z"
                fill={getStateColor('Tennessee')}
                stroke="#374151"
                strokeWidth="1"
                className="cursor-pointer transition-all duration-200 hover:stroke-2"
                onClick={() => handleStateClick('Tennessee')}
                onMouseEnter={() => setHoveredState('Tennessee')}
                onMouseLeave={() => setHoveredState(null)}
              />
              <text x="575" y="325" textAnchor="middle" className="text-xs font-medium fill-current pointer-events-none">
                TN
              </text>

              {/* Kentucky */}
              <path
                d="M 550 270 L 550 300 L 650 300 L 650 270 Z"
                fill={getStateColor('Kentucky')}
                stroke="#374151"
                strokeWidth="1"
                className="cursor-pointer transition-all duration-200 hover:stroke-2"
                onClick={() => handleStateClick('Kentucky')}
                onMouseEnter={() => setHoveredState('Kentucky')}
                onMouseLeave={() => setHoveredState(null)}
              />
              <text x="600" y="285" textAnchor="middle" className="text-xs font-medium fill-current pointer-events-none">
                KY
              </text>

              {/* Virginia */}
              <path
                d="M 680 250 L 680 300 L 750 300 L 750 250 Z"
                fill={getStateColor('Virginia')}
                stroke="#374151"
                strokeWidth="1"
                className="cursor-pointer transition-all duration-200 hover:stroke-2"
                onClick={() => handleStateClick('Virginia')}
                onMouseEnter={() => setHoveredState('Virginia')}
                onMouseLeave={() => setHoveredState(null)}
              />
              <text x="715" y="275" textAnchor="middle" className="text-xs font-medium fill-current pointer-events-none">
                VA
              </text>

              {/* West Virginia */}
              <path
                d="M 650 230 L 650 270 L 680 270 L 680 230 Z"
                fill={getStateColor('West Virginia')}
                stroke="#374151"
                strokeWidth="1"
                className="cursor-pointer transition-all duration-200 hover:stroke-2"
                onClick={() => handleStateClick('West Virginia')}
                onMouseEnter={() => setHoveredState('West Virginia')}
                onMouseLeave={() => setHoveredState(null)}
              />
              <text x="665" y="250" textAnchor="middle" className="text-xs font-medium fill-current pointer-events-none">
                WV
              </text>

              {/* Maryland */}
              <path
                d="M 720 200 L 720 230 L 760 230 L 760 200 Z"
                fill={getStateColor('Maryland')}
                stroke="#374151"
                strokeWidth="1"
                className="cursor-pointer transition-all duration-200 hover:stroke-2"
                onClick={() => handleStateClick('Maryland')}
                onMouseEnter={() => setHoveredState('Maryland')}
                onMouseLeave={() => setHoveredState(null)}
              />
              <text x="740" y="215" textAnchor="middle" className="text-xs font-medium fill-current pointer-events-none">
                MD
              </text>

              {/* Delaware */}
              <path
                d="M 760 200 L 760 240 L 780 240 L 780 200 Z"
                fill={getStateColor('Delaware')}
                stroke="#374151"
                strokeWidth="1"
                className="cursor-pointer transition-all duration-200 hover:stroke-2"
                onClick={() => handleStateClick('Delaware')}
                onMouseEnter={() => setHoveredState('Delaware')}
                onMouseLeave={() => setHoveredState(null)}
              />
              <text x="770" y="220" textAnchor="middle" className="text-xs font-medium fill-current pointer-events-none">
                DE
              </text>

              {/* New Jersey */}
              <path
                d="M 750 150 L 750 200 L 780 200 L 780 150 Z"
                fill={getStateColor('New Jersey')}
                stroke="#374151"
                strokeWidth="1"
                className="cursor-pointer transition-all duration-200 hover:stroke-2"
                onClick={() => handleStateClick('New Jersey')}
                onMouseEnter={() => setHoveredState('New Jersey')}
                onMouseLeave={() => setHoveredState(null)}
              />
              <text x="765" y="175" textAnchor="middle" className="text-xs font-medium fill-current pointer-events-none">
                NJ
              </text>

              {/* Connecticut */}
              <path
                d="M 780 130 L 780 150 L 820 150 L 820 130 Z"
                fill={getStateColor('Connecticut')}
                stroke="#374151"
                strokeWidth="1"
                className="cursor-pointer transition-all duration-200 hover:stroke-2"
                onClick={() => handleStateClick('Connecticut')}
                onMouseEnter={() => setHoveredState('Connecticut')}
                onMouseLeave={() => setHoveredState(null)}
              />
              <text x="800" y="140" textAnchor="middle" className="text-xs font-medium fill-current pointer-events-none">
                CT
              </text>

              {/* Rhode Island */}
              <path
                d="M 820 130 L 820 145 L 835 145 L 835 130 Z"
                fill={getStateColor('Rhode Island')}
                stroke="#374151"
                strokeWidth="1"
                className="cursor-pointer transition-all duration-200 hover:stroke-2"
                onClick={() => handleStateClick('Rhode Island')}
                onMouseEnter={() => setHoveredState('Rhode Island')}
                onMouseLeave={() => setHoveredState(null)}
              />
              <text x="827" y="137" textAnchor="middle" className="text-xs font-medium fill-current pointer-events-none">
                RI
              </text>

              {/* Massachusetts */}
              <path
                d="M 800 100 L 800 130 L 850 130 L 850 100 Z"
                fill={getStateColor('Massachusetts')}
                stroke="#374151"
                strokeWidth="1"
                className="cursor-pointer transition-all duration-200 hover:stroke-2"
                onClick={() => handleStateClick('Massachusetts')}
                onMouseEnter={() => setHoveredState('Massachusetts')}
                onMouseLeave={() => setHoveredState(null)}
              />
              <text x="825" y="115" textAnchor="middle" className="text-xs font-medium fill-current pointer-events-none">
                MA
              </text>

              {/* Vermont */}
              <path
                d="M 780 80 L 780 120 L 800 120 L 800 80 Z"
                fill={getStateColor('Vermont')}
                stroke="#374151"
                strokeWidth="1"
                className="cursor-pointer transition-all duration-200 hover:stroke-2"
                onClick={() => handleStateClick('Vermont')}
                onMouseEnter={() => setHoveredState('Vermont')}
                onMouseLeave={() => setHoveredState(null)}
              />
              <text x="790" y="100" textAnchor="middle" className="text-xs font-medium fill-current pointer-events-none">
                VT
              </text>

              {/* New Hampshire */}
              <path
                d="M 800 80 L 800 120 L 820 120 L 820 80 Z"
                fill={getStateColor('New Hampshire')}
                stroke="#374151"
                strokeWidth="1"
                className="cursor-pointer transition-all duration-200 hover:stroke-2"
                onClick={() => handleStateClick('New Hampshire')}
                onMouseEnter={() => setHoveredState('New Hampshire')}
                onMouseLeave={() => setHoveredState(null)}
              />
              <text x="810" y="100" textAnchor="middle" className="text-xs font-medium fill-current pointer-events-none">
                NH
              </text>

              {/* Maine */}
              <path
                d="M 820 60 L 820 120 L 850 120 L 850 60 Z"
                fill={getStateColor('Maine')}
                stroke="#374151"
                strokeWidth="1"
                className="cursor-pointer transition-all duration-200 hover:stroke-2"
                onClick={() => handleStateClick('Maine')}
                onMouseEnter={() => setHoveredState('Maine')}
                onMouseLeave={() => setHoveredState(null)}
              />
              <text x="835" y="90" textAnchor="middle" className="text-xs font-medium fill-current pointer-events-none">
                ME
              </text>

              {/* Alabama */}
              <path
                d="M 550 350 L 550 420 L 600 420 L 600 350 Z"
                fill={getStateColor('Alabama')}
                stroke="#374151"
                strokeWidth="1"
                className="cursor-pointer transition-all duration-200 hover:stroke-2"
                onClick={() => handleStateClick('Alabama')}
                onMouseEnter={() => setHoveredState('Alabama')}
                onMouseLeave={() => setHoveredState(null)}
              />
              <text x="575" y="385" textAnchor="middle" className="text-xs font-medium fill-current pointer-events-none">
                AL
              </text>

              {/* Mississippi */}
              <path
                d="M 500 350 L 500 420 L 550 420 L 550 350 Z"
                fill={getStateColor('Mississippi')}
                stroke="#374151"
                strokeWidth="1"
                className="cursor-pointer transition-all duration-200 hover:stroke-2"
                onClick={() => handleStateClick('Mississippi')}
                onMouseEnter={() => setHoveredState('Mississippi')}
                onMouseLeave={() => setHoveredState(null)}
              />
              <text x="525" y="385" textAnchor="middle" className="text-xs font-medium fill-current pointer-events-none">
                MS
              </text>

              {/* Louisiana */}
              <path
                d="M 450 400 L 450 450 L 550 450 L 550 400 Z"
                fill={getStateColor('Louisiana')}
                stroke="#374151"
                strokeWidth="1"
                className="cursor-pointer transition-all duration-200 hover:stroke-2"
                onClick={() => handleStateClick('Louisiana')}
                onMouseEnter={() => setHoveredState('Louisiana')}
                onMouseLeave={() => setHoveredState(null)}
              />
              <text x="500" y="425" textAnchor="middle" className="text-xs font-medium fill-current pointer-events-none">
                LA
              </text>

              {/* Arkansas */}
              <path
                d="M 450 300 L 450 350 L 500 350 L 500 300 Z"
                fill={getStateColor('Arkansas')}
                stroke="#374151"
                strokeWidth="1"
                className="cursor-pointer transition-all duration-200 hover:stroke-2"
                onClick={() => handleStateClick('Arkansas')}
                onMouseEnter={() => setHoveredState('Arkansas')}
                onMouseLeave={() => setHoveredState(null)}
              />
              <text x="475" y="325" textAnchor="middle" className="text-xs font-medium fill-current pointer-events-none">
                AR
              </text>

              {/* Missouri */}
              <path
                d="M 450 250 L 450 300 L 500 300 L 500 250 Z"
                fill={getStateColor('Missouri')}
                stroke="#374151"
                strokeWidth="1"
                className="cursor-pointer transition-all duration-200 hover:stroke-2"
                onClick={() => handleStateClick('Missouri')}
                onMouseEnter={() => setHoveredState('Missouri')}
                onMouseLeave={() => setHoveredState(null)}
              />
              <text x="475" y="275" textAnchor="middle" className="text-xs font-medium fill-current pointer-events-none">
                MO
              </text>

              {/* Iowa */}
              <path
                d="M 450 200 L 450 250 L 500 250 L 500 200 Z"
                fill={getStateColor('Iowa')}
                stroke="#374151"
                strokeWidth="1"
                className="cursor-pointer transition-all duration-200 hover:stroke-2"
                onClick={() => handleStateClick('Iowa')}
                onMouseEnter={() => setHoveredState('Iowa')}
                onMouseLeave={() => setHoveredState(null)}
              />
              <text x="475" y="225" textAnchor="middle" className="text-xs font-medium fill-current pointer-events-none">
                IA
              </text>

              {/* Minnesota */}
              <path
                d="M 450 120 L 450 200 L 500 200 L 500 120 Z"
                fill={getStateColor('Minnesota')}
                stroke="#374151"
                strokeWidth="1"
                className="cursor-pointer transition-all duration-200 hover:stroke-2"
                onClick={() => handleStateClick('Minnesota')}
                onMouseEnter={() => setHoveredState('Minnesota')}
                onMouseLeave={() => setHoveredState(null)}
              />
              <text x="475" y="160" textAnchor="middle" className="text-xs font-medium fill-current pointer-events-none">
                MN
              </text>

              {/* Wisconsin */}
              <path
                d="M 500 120 L 500 200 L 550 200 L 550 120 Z"
                fill={getStateColor('Wisconsin')}
                stroke="#374151"
                strokeWidth="1"
                className="cursor-pointer transition-all duration-200 hover:stroke-2"
                onClick={() => handleStateClick('Wisconsin')}
                onMouseEnter={() => setHoveredState('Wisconsin')}
                onMouseLeave={() => setHoveredState(null)}
              />
              <text x="525" y="160" textAnchor="middle" className="text-xs font-medium fill-current pointer-events-none">
                WI
              </text>

              {/* North Dakota */}
              <path
                d="M 350 80 L 350 150 L 420 150 L 420 80 Z"
                fill={getStateColor('North Dakota')}
                stroke="#374151"
                strokeWidth="1"
                className="cursor-pointer transition-all duration-200 hover:stroke-2"
                onClick={() => handleStateClick('North Dakota')}
                onMouseEnter={() => setHoveredState('North Dakota')}
                onMouseLeave={() => setHoveredState(null)}
              />
              <text x="385" y="115" textAnchor="middle" className="text-xs font-medium fill-current pointer-events-none">
                ND
              </text>

              {/* South Dakota */}
              <path
                d="M 350 150 L 350 200 L 420 200 L 420 150 Z"
                fill={getStateColor('South Dakota')}
                stroke="#374151"
                strokeWidth="1"
                className="cursor-pointer transition-all duration-200 hover:stroke-2"
                onClick={() => handleStateClick('South Dakota')}
                onMouseEnter={() => setHoveredState('South Dakota')}
                onMouseLeave={() => setHoveredState(null)}
              />
              <text x="385" y="175" textAnchor="middle" className="text-xs font-medium fill-current pointer-events-none">
                SD
              </text>

              {/* Wyoming */}
              <path
                d="M 250 150 L 250 250 L 350 250 L 350 150 Z"
                fill={getStateColor('Wyoming')}
                stroke="#374151"
                strokeWidth="1"
                className="cursor-pointer transition-all duration-200 hover:stroke-2"
                onClick={() => handleStateClick('Wyoming')}
                onMouseEnter={() => setHoveredState('Wyoming')}
                onMouseLeave={() => setHoveredState(null)}
              />
              <text x="300" y="200" textAnchor="middle" className="text-xs font-medium fill-current pointer-events-none">
                WY
              </text>

              {/* Montana */}
              <path
                d="M 200 80 L 200 150 L 350 150 L 350 80 Z"
                fill={getStateColor('Montana')}
                stroke="#374151"
                strokeWidth="1"
                className="cursor-pointer transition-all duration-200 hover:stroke-2"
                onClick={() => handleStateClick('Montana')}
                onMouseEnter={() => setHoveredState('Montana')}
                onMouseLeave={() => setHoveredState(null)}
              />
              <text x="275" y="115" textAnchor="middle" className="text-xs font-medium fill-current pointer-events-none">
                MT
              </text>

              {/* Idaho */}
              <path
                d="M 150 80 L 150 250 L 200 250 L 200 80 Z"
                fill={getStateColor('Idaho')}
                stroke="#374151"
                strokeWidth="1"
                className="cursor-pointer transition-all duration-200 hover:stroke-2"
                onClick={() => handleStateClick('Idaho')}
                onMouseEnter={() => setHoveredState('Idaho')}
                onMouseLeave={() => setHoveredState(null)}
              />
              <text x="175" y="165" textAnchor="middle" className="text-xs font-medium fill-current pointer-events-none">
                ID
              </text>

              {/* Washington */}
              <path
                d="M 50 80 L 50 150 L 150 150 L 150 80 Z"
                fill={getStateColor('Washington')}
                stroke="#374151"
                strokeWidth="1"
                className="cursor-pointer transition-all duration-200 hover:stroke-2"
                onClick={() => handleStateClick('Washington')}
                onMouseEnter={() => setHoveredState('Washington')}
                onMouseLeave={() => setHoveredState(null)}
              />
              <text x="100" y="115" textAnchor="middle" className="text-xs font-medium fill-current pointer-events-none">
                WA
              </text>

              {/* Oregon */}
              <path
                d="M 50 150 L 50 250 L 150 250 L 150 150 Z"
                fill={getStateColor('Oregon')}
                stroke="#374151"
                strokeWidth="1"
                className="cursor-pointer transition-all duration-200 hover:stroke-2"
                onClick={() => handleStateClick('Oregon')}
                onMouseEnter={() => setHoveredState('Oregon')}
                onMouseLeave={() => setHoveredState(null)}
              />
              <text x="100" y="200" textAnchor="middle" className="text-xs font-medium fill-current pointer-events-none">
                OR
              </text>

              {/* Alaska - positioned separately */}
              <path
                d="M 50 480 L 50 530 L 130 530 L 130 480 Z"
                fill={getStateColor('Alaska')}
                stroke="#374151"
                strokeWidth="1"
                className="cursor-pointer transition-all duration-200 hover:stroke-2"
                onClick={() => handleStateClick('Alaska')}
                onMouseEnter={() => setHoveredState('Alaska')}
                onMouseLeave={() => setHoveredState(null)}
              />
              <text x="90" y="505" textAnchor="middle" className="text-xs font-medium fill-current pointer-events-none">
                AK
              </text>

              {/* Hawaii - positioned separately */}
              <path
                d="M 150 480 L 150 530 L 230 530 L 230 480 Z"
                fill={getStateColor('Hawaii')}
                stroke="#374151"
                strokeWidth="1"
                className="cursor-pointer transition-all duration-200 hover:stroke-2"
                onClick={() => handleStateClick('Hawaii')}
                onMouseEnter={() => setHoveredState('Hawaii')}
                onMouseLeave={() => setHoveredState(null)}
              />
              <text x="190" y="505" textAnchor="middle" className="text-xs font-medium fill-current pointer-events-none">
                HI
              </text>
              
              {/* Legend */}
              <g transform="translate(20, 20)">
                <rect x="0" y="0" width="220" height="80" fill="white" fillOpacity="0.95" stroke="#d1d5db" rx="4"/>
                <text x="10" y="18" className="text-sm font-bold fill-current">Service Coverage</text>
                
                <circle cx="20" cy="35" r="5" fill="#10b981"/>
                <text x="35" y="40" className="text-xs fill-current">Service Available</text>
                
                <circle cx="20" cy="52" r="5" fill="#3b82f6"/>
                <text x="35" y="57" className="text-xs fill-current">Selected State</text>
                
                <circle cx="20" cy="69" r="5" fill="#e5e7eb"/>
                <text x="35" y="74" className="text-xs fill-current">No Service</text>
              </g>
            </svg>
          </div>
        </CardContent>
      </Card>

      {/* City Selection Dialog */}
      <Dialog open={!!selectedState} onOpenChange={() => setSelectedState(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                {selectedState} Service Areas
              </span>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setSelectedState(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          {selectedState && (
            <div className="space-y-4">
              <p className="text-gray-600 text-sm">
                Select a city to get a quote and schedule service:
              </p>
              
              <div className="grid grid-cols-1 gap-2 max-h-80 overflow-y-auto">
                {serviceLocationsByState[selectedState]?.map((city, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="justify-between h-auto p-3"
                    onClick={() => handleCitySelect(city)}
                    data-testid={`button-city-${city.replace(/\s+/g, '-').toLowerCase()}`}
                  >
                    <span className="text-left">
                      <div className="font-medium">{city}</div>
                      <div className="text-xs text-gray-500">Mobile service available</div>
                    </span>
                    <Calendar className="w-4 h-4 text-blue-600" />
                  </Button>
                )) || []}
              </div>
              
              <div className="pt-3 border-t space-y-2">
                <Button 
                  className="w-full"
                  onClick={() => {
                    setSelectedState(null);
                    onRequestQuote();
                  }}
                >
                  Get Quote for Any City
                </Button>
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <a href="tel:+1-800-EXPRESS" className="flex items-center justify-center gap-2">
                    <Phone className="w-3 h-3" />
                    Call for Custom Location
                  </a>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}