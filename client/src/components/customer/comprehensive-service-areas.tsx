import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MapPin, 
  Search,
  Clock,
  CheckCircle2,
  Phone,
  Calendar,
  Navigation,
  Building2
} from 'lucide-react';

interface ComprehensiveServiceAreasProps {
  onRequestQuote: () => void;
}

// All actual service locations from the quote form - complete list
const allServiceLocations = [
  // California
  'California | San Diego',
  'California | Orange County',
  'California | Long Beach',
  'California | Los Angeles',
  'California | Inland Empire',
  'California | Santa Barbara',
  'California | San Luis Obispo',
  'California | Santa Cruz',
  'California | San Jose',
  'California | San Francisco',
  'California | Sacramento',
  // Alabama
  'Alabama | Mobile',
  'Alabama | Montgomery',
  'Alabama | Birmingham',
  // Arizona
  'Arizona | Phoenix',
  'Arizona | Scottsdale',
  'Arizona | Tempe',
  'Arizona | Mesa',
  'Arizona | Chandler',
  'Arizona | Gilbert',
  // Arkansas
  'Arkansas | Little Rock',
  'Arkansas | Sherwood',
  'Arkansas | Jackson',
  // Colorado
  'Colorado | Denver',
  'Colorado | Breckenridge',
  'Colorado | Colorado Springs',
  'Colorado | Grand Junction',
  'Colorado | Aspen',
  'Colorado | Fort Collins',
  // Connecticut
  'Connecticut | New Haven',
  'Connecticut | Bridgeport',
  'Connecticut | Stamford',
  // Delaware
  'Delaware | Delaware City',
  'Delaware | Rockland',
  'Delaware | Montchanin',
  // Florida
  'Florida | Miami',
  'Florida | Orlando',
  'Florida | Tampa',
  'Florida | Jacksonville',
  // Georgia
  'Georgia | Atlanta',
  'Georgia | Athens',
  'Georgia | Alpharetta',
  // Idaho
  'Idaho | Boise',
  'Idaho | Idaho Falls',
  'Idaho | Meridian',
  // Illinois
  'Illinois | Chicago',
  'Illinois | Naperville',
  'Illinois | Northlake',
  // Indiana
  'Indiana | Indianapolis',
  'Indiana | Evansville',
  'Indiana | Plainfield',
  'Indiana | Shelbyville',
  // Iowa
  'Iowa | Cedar Rapids',
  'Iowa | Davenport',
  'Iowa | Des Moines',
  // Kansas
  'Kansas | Wichita',
  'Kansas | Derby',
  'Kansas | Park City',
  // Kentucky
  'Kentucky | Lexington',
  'Kentucky | Louisville',
  'Kentucky | Versailles',
  // Louisiana
  'Louisiana | New Orleans',
  'Louisiana | Kenner',
  'Louisiana | Harahan',
  'Louisiana | Metairie',
  'Louisiana | Shreveport',
  'Louisiana | Baton Rouge',
  // Maine
  'Maine | Bangor',
  'Maine | Lewiston',
  'Maine | Portland',
  // Maryland
  'Maryland | Baltimore',
  'Maryland | Lanham',
  'Maryland | Annapolis',
  // Massachusetts
  'Massachusetts | Boston',
  'Massachusetts | Quincy',
  'Massachusetts | Randolph',
  // Michigan
  'Michigan | Ann Arbor',
  'Michigan | Plymouth',
  'Michigan | Westland',
  'Michigan | Canton',
  // Minnesota
  'Minnesota | St Paul',
  'Minnesota | Minneapolis',
  'Minnesota | Marshall',
  'Minnesota | New Brighton',
  // Mississippi
  'Mississippi | Jackson',
  'Mississippi | Oxford',
  'Mississippi | Pearl',
  // Missouri
  'Missouri | Kansas City',
  'Missouri | Richmond',
  'Missouri | Hazelwood',
  // Montana
  'Montana | Helena',
  'Montana | Bozeman',
  'Montana | Billings',
  // Nebraska
  'Nebraska | Fremont',
  'Nebraska | La Vista',
  'Nebraska | Omaha',
  // Nevada
  'Nevada | Las Vegas',
  'Nevada | Henderson',
  'Nevada | Reno',
  'Nevada | Tahoe/Stateline',
  // New Hampshire
  'New Hampshire | Manchester',
  'New Hampshire | Nashua',
  'New Hampshire | Salem',
  // New Jersey
  'New Jersey | New Brunswick',
  'New Jersey | Trenton',
  'New Jersey | Monmouth',
  'New Jersey | Milltown',
  'New Jersey | Princeton',
  'New Jersey | Somerset',
  // New Mexico
  'New Mexico | Taos',
  'New Mexico | Santa Fe',
  'New Mexico | Albuquerque',
  // New York
  'New York | Manhattan',
  'New York | Buffalo',
  'New York | Brooklyn',
  // North Carolina
  'North Carolina | Charlotte',
  'North Carolina | Greensboro',
  'North Carolina | Morrisville',
  // North Dakota
  'North Dakota | Bismarck',
  'North Dakota | Minot',
  'North Dakota | Dickinson',
  // Ohio
  'Ohio | Columbus',
  'Ohio | Grove City',
  'Ohio | Macedonia',
  'Ohio | Sharonville',
  // Oklahoma
  'Oklahoma | Lawton',
  'Oklahoma | Oklahoma City',
  'Oklahoma | Tulsa',
  // Oregon
  'Oregon | Portland',
  'Oregon | Redmond',
  'Oregon | Eugene',
  'Oregon | Salem',
  'Oregon | Bend',
  // Pennsylvania
  'Pennsylvania | Pittsburgh',
  'Pennsylvania | Scranton',
  'Pennsylvania | Warminster',
  'Pennsylvania | Philadelphia',
  'Pennsylvania | Kingston',
  'Pennsylvania | Allentown',
  // Rhode Island
  'Rhode Island | Providence',
  'Rhode Island | Warwick',
  'Rhode Island | Cranston',
  // South Carolina
  'South Carolina | Charleston',
  'South Carolina | Columbia',
  'South Carolina | Greenville',
  // South Dakota
  'South Dakota | Sioux Falls',
  'South Dakota | Aberdeen',
  'South Dakota | Yankton',
  // Tennessee
  'Tennessee | Nashville',
  'Tennessee | Memphis',
  'Tennessee | Knoxville',
  'Tennessee | Hendersonville',
  'Tennessee | Franklin',
  // Texas
  'Texas | Austin',
  'Texas | Dallas',
  'Texas | Houston',
  // Utah
  'Utah | Ogden',
  'Utah | Salt Lake City',
  'Utah | Provo',
  // Vermont
  'Vermont | Burlington',
  'Vermont | Colchester',
  'Vermont | Essex',
  // Virginia
  'Virginia | Norfolk',
  'Virginia | Richmond',
  'Virginia | Virginia Beach',
  // Washington
  'Washington | Tacoma',
  'Washington | Seattle',
  'Washington | Bellingham',
  // West Virginia
  'West Virginia | Charleston',
  'West Virginia | Huntington',
  'West Virginia | Morgantown',
  // Wisconsin
  'Wisconsin | Waukesha',
  'Wisconsin | Brookfield',
  'Wisconsin | Milwaukee',
  // Wyoming
  'Wyoming | Cheyenne',
  'Wyoming | Laramie',
  'Wyoming | Jackson',
  'Wyoming | Casper'
];

export function ComprehensiveServiceAreas({ onRequestQuote }: ComprehensiveServiceAreasProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState<string>('');
  const [zipCodeSearch, setZipCodeSearch] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

  // Parse and organize service locations by state
  const servicesByState = useMemo(() => {
    const stateMap: Record<string, string[]> = {};
    
    allServiceLocations.forEach(location => {
      const [state, city] = location.split(' | ');
      if (!stateMap[state]) {
        stateMap[state] = [];
      }
      stateMap[state].push(city);
    });

    // Sort states and cities
    const sortedStates = Object.keys(stateMap).sort();
    const result: Record<string, string[]> = {};
    
    sortedStates.forEach(state => {
      result[state] = stateMap[state].sort();
    });
    
    return result;
  }, []);

  // Filter locations based on search term and selected state
  const filteredLocations = useMemo(() => {
    let filtered = allServiceLocations;

    if (selectedState) {
      filtered = filtered.filter(location => location.startsWith(selectedState + ' | '));
    }

    if (searchTerm) {
      filtered = filtered.filter(location => 
        location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [searchTerm, selectedState]);

  // Basic zip code to major area mapping for demonstration
  const checkZipCodeCoverage = (zipCode: string) => {
    const zip5 = zipCode.substring(0, 5);
    
    // California zip codes
    if (zip5.match(/^9[0-6]/)) {
      if (zip5.match(/^92[0-1]/)) return 'California | San Diego';
      if (zip5.match(/^9[0-1]/)) return 'California | Los Angeles';
      if (zip5.match(/^92[6-9]/)) return 'California | Orange County';
      if (zip5.match(/^94/)) return 'California | San Francisco';
      if (zip5.match(/^95/)) return 'California | Sacramento';
      return 'California | San Diego'; // Default for CA
    }
    
    // Texas
    if (zip5.match(/^7[5-9]/)) {
      if (zip5.match(/^78/)) return 'Texas | Austin';
      if (zip5.match(/^75/)) return 'Texas | Dallas';
      if (zip5.match(/^77/)) return 'Texas | Houston';
      return 'Texas | Dallas'; // Default for TX
    }
    
    // Florida
    if (zip5.match(/^3[2-4]/)) {
      if (zip5.match(/^33/)) return 'Florida | Miami';
      if (zip5.match(/^32/)) return 'Florida | Orlando';
      if (zip5.match(/^33[6-7]/)) return 'Florida | Tampa';
      return 'Florida | Orlando'; // Default for FL
    }
    
    // New York
    if (zip5.match(/^1[0-1]/)) {
      if (zip5.match(/^100/)) return 'New York | Manhattan';
      if (zip5.match(/^112/)) return 'New York | Brooklyn';
      return 'New York | Manhattan'; // Default for NY
    }
    
    // Illinois
    if (zip5.match(/^60/)) {
      return 'Illinois | Chicago';
    }
    
    // Arizona
    if (zip5.match(/^85/)) {
      return 'Arizona | Phoenix';
    }
    
    return null;
  };

  const handleZipCodeSearch = () => {
    if (zipCodeSearch.length >= 5) {
      const detectedLocation = checkZipCodeCoverage(zipCodeSearch);
      if (detectedLocation && allServiceLocations.includes(detectedLocation)) {
        setSelectedLocation(detectedLocation);
      } else {
        setSelectedLocation(null);
      }
    }
  };

  const handleScheduleService = (location: string) => {
    setSelectedLocation(location);
    // Trigger quote form with location pre-selected
    onRequestQuote();
  };

  const states = Object.keys(servicesByState);
  const totalCities = allServiceLocations.length;

  return (
    <div className="space-y-6">
      
      {/* Search and Filter Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Search by City or State</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search cities or states..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="input-search-areas"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label>Filter by State</Label>
          <Select value={selectedState} onValueChange={setSelectedState}>
            <SelectTrigger data-testid="select-state-filter">
              <SelectValue placeholder="All states" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All states</SelectItem>
              {states.map(state => (
                <SelectItem key={state} value={state}>
                  {state} ({servicesByState[state].length} cities)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Check Zip Code</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Enter zip code"
              value={zipCodeSearch}
              onChange={(e) => setZipCodeSearch(e.target.value)}
              maxLength={5}
              data-testid="input-zip-search"
            />
            <Button 
              onClick={handleZipCodeSearch}
              disabled={zipCodeSearch.length < 5}
              size="sm"
              data-testid="button-check-zip"
            >
              Check
            </Button>
          </div>
        </div>
      </div>

      {/* Zip Code Result */}
      {zipCodeSearch.length >= 5 && (
        <Card>
          <CardContent className="pt-6">
            {selectedLocation ? (
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">Service Available!</p>
                    <p className="text-sm text-green-600">We service {selectedLocation}</p>
                  </div>
                </div>
                <Button size="sm" onClick={() => handleScheduleService(selectedLocation)}>
                  Get Quote
                </Button>
              </div>
            ) : (
              <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="font-medium text-orange-800">Area Not Listed</p>
                    <p className="text-sm text-orange-600">Call us to check if we can service zip code {zipCodeSearch}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Service Areas Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {states.map(state => (
          <Card key={state} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  {state}
                </span>
                <Badge variant="secondary">
                  {servicesByState[state].length} cities
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="max-h-48 overflow-y-auto space-y-1">
                {servicesByState[state]
                  .filter(city => !searchTerm || city.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((city, index) => {
                    const fullLocation = `${state} | ${city}`;
                    return (
                      <div 
                        key={index}
                        className="flex items-center justify-between p-2 hover:bg-gray-50 rounded group cursor-pointer"
                        onClick={() => handleScheduleService(fullLocation)}
                      >
                        <span className="text-sm text-gray-700">{city}</span>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          data-testid={`button-quote-${city.replace(/\s+/g, '-').toLowerCase()}`}
                        >
                          <Calendar className="w-3 h-3 mr-1" />
                          Quote
                        </Button>
                      </div>
                    );
                  })}
              </div>
              
              {servicesByState[state].length > 8 && (
                <div className="pt-2 border-t">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => setSelectedState(state)}
                  >
                    View All {servicesByState[state].length} Cities
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Stats */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{states.length}</div>
              <div className="text-sm text-gray-600">States Covered</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{totalCities}</div>
              <div className="text-sm text-gray-600">Cities Served</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">24/7</div>
              <div className="text-sm text-gray-600">Emergency Service</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">Mobile</div>
              <div className="text-sm text-gray-600">Service Available</div>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-gray-600 mb-4">
              Don't see your area? We're always expanding our coverage.
            </p>
            <div className="flex justify-center gap-3">
              <Button onClick={() => onRequestQuote()}>
                Request Quote Anywhere
              </Button>
              <Button variant="outline" asChild>
                <a href="tel:+1-800-EXPRESS" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Call to Check Coverage
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}