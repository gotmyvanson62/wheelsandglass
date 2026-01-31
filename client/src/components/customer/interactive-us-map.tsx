import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MapPin, 
  Calendar,
  Phone,
  X,
  Building2,
  Loader2
} from 'lucide-react';

interface InteractiveUSMapProps {
  onRequestQuote: () => void;
}

// All service locations organized by state - ordered South to North
const serviceLocationsByState: Record<string, string[]> = {
  'Alabama': ['Mobile', 'Montgomery', 'Birmingham'],
  'Alaska': ['Juneau', 'Anchorage', 'Fairbanks'],
  'Arizona': ['Tucson', 'Phoenix', 'Scottsdale', 'Tempe', 'Mesa', 'Chandler', 'Gilbert'],
  'Arkansas': ['Little Rock', 'Sherwood', 'Jackson'],
  'California': ['San Diego', 'Long Beach', 'Los Angeles', 'Orange County', 'Inland Empire', 'Santa Barbara', 'San Luis Obispo', 'San Jose', 'Santa Cruz', 'San Francisco', 'Sacramento'],
  'Colorado': ['Colorado Springs', 'Denver', 'Breckenridge', 'Grand Junction', 'Fort Collins', 'Aspen'],
  'Connecticut': ['Stamford', 'Bridgeport', 'New Haven'],
  'Delaware': ['Delaware City', 'Rockland', 'Montchanin'],
  'Florida': ['Miami', 'Tampa', 'Orlando', 'Jacksonville'],
  'Georgia': ['Atlanta', 'Athens', 'Alpharetta'],
  'Hawaii': ['Maui', 'Honolulu', 'Kailua'],
  'Idaho': ['Boise', 'Meridian', 'Idaho Falls'],
  'Illinois': ['Northlake', 'Naperville', 'Chicago'],
  'Indiana': ['Evansville', 'Plainfield', 'Indianapolis', 'Shelbyville'],
  'Iowa': ['Davenport', 'Cedar Rapids', 'Des Moines'],
  'Kansas': ['Wichita', 'Derby', 'Park City'],
  'Kentucky': ['Louisville', 'Versailles', 'Lexington'],
  'Louisiana': ['New Orleans', 'Metairie', 'Kenner', 'Harahan', 'Baton Rouge', 'Shreveport'],
  'Maine': ['Portland', 'Lewiston', 'Bangor'],
  'Maryland': ['Annapolis', 'Baltimore', 'Lanham'],
  'Massachusetts': ['Boston', 'Quincy', 'Randolph'],
  'Michigan': ['Ann Arbor', 'Canton', 'Plymouth', 'Westland'],
  'Minnesota': ['Minneapolis', 'St Paul', 'New Brighton', 'Marshall'],
  'Mississippi': ['Jackson', 'Pearl', 'Oxford'],
  'Missouri': ['Kansas City', 'Richmond', 'Hazelwood'],
  'Montana': ['Billings', 'Bozeman', 'Helena'],
  'Nebraska': ['Omaha', 'La Vista', 'Fremont'],
  'Nevada': ['Las Vegas', 'Henderson', 'Reno', 'Tahoe/Stateline'],
  'New Hampshire': ['Salem', 'Nashua', 'Manchester'],
  'New Jersey': ['Trenton', 'Princeton', 'New Brunswick', 'Somerset', 'Milltown', 'Monmouth'],
  'New Mexico': ['Albuquerque', 'Santa Fe', 'Taos'],
  'New York': ['Manhattan', 'Brooklyn', 'Buffalo'],
  'North Carolina': ['Charlotte', 'Greensboro', 'Morrisville'],
  'North Dakota': ['Dickinson', 'Bismarck', 'Minot'],
  'Ohio': ['Sharonville', 'Columbus', 'Grove City', 'Macedonia'],
  'Oklahoma': ['Lawton', 'Oklahoma City', 'Tulsa'],
  'Oregon': ['Eugene', 'Salem', 'Portland', 'Bend', 'Redmond'],
  'Pennsylvania': ['Philadelphia', 'Warminster', 'Allentown', 'Kingston', 'Scranton', 'Pittsburgh'],
  'Rhode Island': ['Warwick', 'Providence', 'Cranston'],
  'South Carolina': ['Charleston', 'Columbia', 'Greenville'],
  'South Dakota': ['Yankton', 'Sioux Falls', 'Aberdeen'],
  'Tennessee': ['Memphis', 'Nashville', 'Franklin', 'Hendersonville', 'Knoxville'],
  'Texas': ['Houston', 'Austin', 'Dallas'],
  'Utah': ['Provo', 'Salt Lake City', 'Ogden'],
  'Vermont': ['Essex', 'Colchester', 'Burlington'],
  'Virginia': ['Norfolk', 'Virginia Beach', 'Richmond'],
  'Washington': ['Tacoma', 'Seattle', 'Bellingham'],
  'West Virginia': ['Charleston', 'Huntington', 'Morgantown'],
  'Wisconsin': ['Milwaukee', 'Waukesha', 'Brookfield'],
  'Wyoming': ['Cheyenne', 'Laramie', 'Casper', 'Jackson']
};

// FIPS to state name and abbreviation mapping
const fipsToName: Record<string, string> = {
  "01": "Alabama", "02": "Alaska", "04": "Arizona", "05": "Arkansas", "06": "California", 
  "08": "Colorado", "09": "Connecticut", "10": "Delaware", "11": "District of Columbia", 
  "12": "Florida", "13": "Georgia", "15": "Hawaii", "16": "Idaho", "17": "Illinois", 
  "18": "Indiana", "19": "Iowa", "20": "Kansas", "21": "Kentucky", "22": "Louisiana", 
  "23": "Maine", "24": "Maryland", "25": "Massachusetts", "26": "Michigan", "27": "Minnesota", 
  "28": "Mississippi", "29": "Missouri", "30": "Montana", "31": "Nebraska", "32": "Nevada", 
  "33": "New Hampshire", "34": "New Jersey", "35": "New Mexico", "36": "New York", 
  "37": "North Carolina", "38": "North Dakota", "39": "Ohio", "40": "Oklahoma", 
  "41": "Oregon", "42": "Pennsylvania", "44": "Rhode Island", "45": "South Carolina", 
  "46": "South Dakota", "47": "Tennessee", "48": "Texas", "49": "Utah", "50": "Vermont", 
  "51": "Virginia", "53": "Washington", "54": "West Virginia", "55": "Wisconsin", "56": "Wyoming"
};

interface CensusPlace {
  name: string;
  pop: number;
  state: string;
  place: string;
}

export function InteractiveUSMap({ onRequestQuote }: InteractiveUSMapProps) {
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedStateName, setSelectedStateName] = useState<string>('');
  const [censusCities, setCensusCities] = useState<CensusPlace[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string>('');
  const mapRef = useRef<HTMLDivElement>(null);
  const [d3Loaded, setD3Loaded] = useState(false);

  // Load D3 and TopoJSON libraries
  useEffect(() => {
    const loadLibraries = async () => {
      if (typeof window !== 'undefined' && !window.d3) {
        const script1 = document.createElement('script');
        script1.src = 'https://unpkg.com/d3@7';
        script1.onload = () => {
          const script2 = document.createElement('script');
          script2.src = 'https://unpkg.com/topojson-client@3';
          script2.onload = () => setD3Loaded(true);
          document.head.appendChild(script2);
        };
        document.head.appendChild(script1);
      } else if (window.d3) {
        setD3Loaded(true);
      }
    };
    loadLibraries();
  }, []);

  // Initialize map once D3 is loaded
  useEffect(() => {
    if (!d3Loaded || !mapRef.current) return;

    const initializeMap = async () => {
      const mapContainer = mapRef.current;
      if (!mapContainer) return;

      // Clear any existing content
      mapContainer.innerHTML = '';

      const width = mapContainer.clientWidth;
      const height = 400;

      const svg = window.d3.select(mapContainer)
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .attr('viewBox', [0, 0, width, height]);

      const g = svg.append('g');

      // Set up projection
      const projection = window.d3.geoAlbersUsa()
        .fitSize([width, height], { type: 'Sphere' });
      
      const path = window.d3.geoPath(projection);

      try {
        // Load US states data
        const us = await fetch('https://unpkg.com/us-atlas@3/states-10m.json')
          .then(r => r.json());
        
        const states = window.topojson.feature(us, us.objects.states);
        const statesMesh = window.topojson.mesh(us, us.objects.states, (a, b) => a !== b);

        // Draw states
        g.selectAll('.state')
          .data(states.features)
          .enter()
          .append('path')
          .attr('class', 'state')
          .attr('d', path)
          .attr('fill', (d) => {
            const stateName = fipsToName[d.id];
            return serviceLocationsByState[stateName] ? '#10b981' : '#e5e7eb';
          })
          .attr('stroke', '#374151')
          .attr('stroke-width', 1)
          .style('cursor', 'pointer')
          .on('mouseover', function(event, d) {
            const stateName = fipsToName[d.id];
            if (serviceLocationsByState[stateName]) {
              window.d3.select(this).attr('fill', '#60a5fa');
            }
          })
          .on('mouseout', function(event, d) {
            const stateName = fipsToName[d.id];
            if (selectedState !== d.id) {
              window.d3.select(this).attr('fill', 
                serviceLocationsByState[stateName] ? '#10b981' : '#e5e7eb'
              );
            }
          })
          .on('click', (event, d) => {
            const stateName = fipsToName[d.id];
            if (serviceLocationsByState[stateName]) {
              handleStateClick(d.id, stateName);
            }
          });

        // Draw state borders
        g.append('path')
          .datum(statesMesh)
          .attr('fill', 'none')
          .attr('stroke', '#666')
          .attr('stroke-width', 0.5)
          .attr('d', path);

      } catch (error) {
        console.error('Error loading map data:', error);
      }
    };

    initializeMap();
  }, [d3Loaded, selectedState]);

  const handleStateClick = async (stateFips: string, stateName: string) => {
    setSelectedState(stateFips);
    setSelectedStateName(stateName);
    setLoadingCities(true);
    setCensusCities([]);
    setSelectedCity('');

    try {
      // Fetch cities from public API
      const url = `https://api.census.gov/data/2023/pep/population?get=NAME,POP&for=place:*&in=state:${stateFips}`;
      const response = await fetch(url);
      const rows = await response.json();
      
      const [header, ...data] = rows;
      const places = data.map(r => ({
        name: r[0],
        pop: Number(r[1]),
        state: r[2],
        place: r[3]
      }))
      .filter(p => !Number.isNaN(p.pop))
      .sort((a, b) => b.pop - a.pop)
      .slice(0, 50); // Limit to top 50 cities

      setCensusCities(places);
    } catch (error) {
      console.error('Error fetching cities:', error);
      setCensusCities([]);
    } finally {
      setLoadingCities(false);
    }
  };

  const handleCitySelect = (cityName: string) => {
    setSelectedCity(cityName);
    setSelectedState(null);
    onRequestQuote();
  };

  const totalStates = Object.keys(serviceLocationsByState).length;
  const totalCities = Object.values(serviceLocationsByState).reduce((sum, cities) => sum + cities.length, 0);

  return (
    <div className="space-y-6">
      
      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            Interactive US Service Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Click on any state below to see available cities and schedule service.
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

      {/* Interactive US Map with real state outlines */}
      <Card>
        <CardContent className="p-6">
          <div 
            ref={mapRef} 
            className="w-full h-96 border rounded-lg bg-gray-50"
            style={{ minHeight: '400px' }}
          >
            {!d3Loaded && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-500" />
                  <p className="text-gray-600">Loading interactive map...</p>
                </div>
              </div>
            )}
          </div>
          
          {d3Loaded && (
            <div className="mt-4 text-sm text-gray-600 text-center">
              <p>Click on any green state to see available cities and schedule service.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* State Grid View for better usability */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            All Service States
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {Object.keys(serviceLocationsByState).sort().map((state) => (
              <Button
                key={state}
                variant="outline"
                className="h-auto p-3 flex flex-col items-start justify-between hover:bg-blue-50 hover:border-blue-300"
                onClick={() => handleStateClick(state)}
              >
                <div className="font-medium text-sm">{state}</div>
                <div className="text-xs text-gray-500">
                  {serviceLocationsByState[state].length} cities
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* City Selection Dialog */}
      <Dialog open={!!selectedState} onOpenChange={() => setSelectedState(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              {selectedStateName} Cities
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-gray-600 text-sm">
              Select a city to get a quote and schedule service:
            </p>
            
            {/* Our Service Areas */}
            {serviceLocationsByState[selectedStateName] && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 gap-2 max-h-80 overflow-y-auto">
                  {serviceLocationsByState[selectedStateName].map((city, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="justify-between h-auto p-3"
                      onClick={() => handleCitySelect(city)}
                      data-testid={`button-city-${city.replace(/\s+/g, '-').toLowerCase()}`}
                    >
                      <span className="text-left">
                        <div className="font-medium">{city}</div>
                        <div className="text-xs text-gray-500">Express Auto Glass service area</div>
                      </span>
                      <Calendar className="w-4 h-4 text-blue-600" />
                    </Button>
                  ))}
                </div>
              </div>
            )}
            
            <div className="pt-3 border-t space-y-2">
              <Button 
                className="w-full"
                onClick={() => {
                  setSelectedState(null);
                  onRequestQuote();
                }}
              >
                Get Quote for Any Location
              </Button>
              <Button variant="outline" size="sm" className="w-full" asChild>
                <a href="tel:+1-800-EXPRESS" className="flex items-center justify-center gap-2">
                  <Phone className="w-3 h-3" />
                  Call for Service
                </a>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}